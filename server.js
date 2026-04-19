import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

// JSON body parser - increase limit for health data uploads
app.use(express.json({ limit: '10mb' }));

// --- Storage abstraction ---

// Azure Blob Storage backend
function createBlobStorage(connectionString, containerName, blobName) {
  // Lazy import to avoid requiring the SDK when not using blob storage
  let containerClient = null;

  async function getContainer() {
    if (containerClient) return containerClient;
    const { BlobServiceClient } = await import('@azure/storage-blob');
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists();
    return containerClient;
  }

  return {
    async read() {
      try {
        const container = await getContainer();
        const blobClient = container.getBlockBlobClient(blobName);
        const response = await blobClient.download(0);
        const body = await streamToString(response.readableStreamBody);
        return JSON.parse(body);
      } catch (e) {
        if (e.statusCode === 404) return null;
        throw e;
      }
    },

    async write(data) {
      const container = await getContainer();
      const blobClient = container.getBlockBlobClient(blobName);
      const content = JSON.stringify(data, null, 2);
      await blobClient.upload(content, content.length, {
        blobHTTPHeaders: { blobContentType: 'application/json' },
        overwrite: true,
      });
    },
  };
}

function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    stream.on('error', reject);
  });
}

// File-based storage backend (local dev)
function createFileStorage(dataFile, dataDir) {
  function ensureDataFile() {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(dataFile)) {
      fs.writeFileSync(dataFile, '{}', 'utf-8');
    }
  }

  return {
    async read() {
      ensureDataFile();
      try {
        const content = fs.readFileSync(dataFile, 'utf-8');
        return JSON.parse(content);
      } catch {
        return {};
      }
    },

    async write(data) {
      ensureDataFile();
      fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf-8');
    },
  };
}

// --- Initialize storage ---

const BLOB_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const BLOB_CONTAINER = process.env.AZURE_STORAGE_CONTAINER || 'workout-tracker';
const BLOB_NAME = process.env.AZURE_STORAGE_BLOB || 'data.json';

const isAzure = process.env.WEBSITE_INSTANCE_ID || process.env.WEBSITE_SITE_NAME;
const DATA_DIR = isAzure ? '/home/data' : path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'data.json');

let storage;

if (BLOB_CONNECTION_STRING) {
  console.log(`Using Azure Blob Storage: ${BLOB_CONTAINER}/${BLOB_NAME}`);
  storage = createBlobStorage(BLOB_CONNECTION_STRING, BLOB_CONTAINER, BLOB_NAME);
} else {
  console.log(`Using file storage: ${DATA_FILE}`);
  storage = createFileStorage(DATA_FILE, DATA_DIR);
}

// Migrate data from local file to blob on first startup
async function migrateIfNeeded() {
  if (!BLOB_CONNECTION_STRING) return;

  const blobData = await storage.read();
  if (blobData && Object.keys(blobData).length > 0) {
    console.log('Blob already has data, skipping migration.');
    return;
  }

  // Check if local file exists with data
  if (!fs.existsSync(DATA_FILE)) {
    console.log('No local data file found, nothing to migrate.');
    return;
  }

  try {
    const localContent = fs.readFileSync(DATA_FILE, 'utf-8');
    const localData = JSON.parse(localContent);
    if (Object.keys(localData).length === 0) {
      console.log('Local data file is empty, nothing to migrate.');
      return;
    }

    console.log(`Migrating ${Object.keys(localData).length} keys from local file to Blob Storage...`);
    await storage.write(localData);
    console.log('Migration complete.');
  } catch (e) {
    console.error('Migration failed:', e);
  }
}

// In-memory cache to avoid reading blob on every request
let dataCache = null;

async function readData() {
  if (dataCache) return dataCache;
  dataCache = (await storage.read()) || {};
  return dataCache;
}

async function writeData(data) {
  dataCache = data;
  await storage.write(data);
}

// --- API routes ---

// GET /api/storage/:key - Get a value by key
app.get('/api/storage/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const data = await readData();
    if (key in data) {
      res.json({ value: data[key] });
    } else {
      res.status(404).json({ error: 'Key not found' });
    }
  } catch (e) {
    console.error('GET error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/storage/:key - Set a value by key
app.put('/api/storage/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const data = await readData();
    data[key] = value;
    await writeData(data);
    res.json({ success: true });
  } catch (e) {
    console.error('PUT error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/storage/:key - Remove a value by key
app.delete('/api/storage/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const data = await readData();
    delete data[key];
    await writeData(data);
    res.json({ success: true });
  } catch (e) {
    console.error('DELETE error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Health data API ---

// POST /api/health - Receive health data from iOS Shortcuts
app.post('/api/health', async (req, res) => {
  try {
    const { metrics } = req.body;
    if (!metrics || !Array.isArray(metrics)) {
      return res.status(400).json({ error: 'Invalid payload: expected { metrics: [...] }' });
    }

    const data = await readData();
    if (!data['health-data']) {
      data['health-data'] = [];
    }

    // Each metric: { type: "steps"|"heartRate"|"activeEnergy"|..., value: number, unit: string, date: ISO string }
    // Deduplicate by type+date
    const existing = data['health-data'];
    const existingKeys = new Set(existing.map(m => `${m.type}:${m.date}`));

    let added = 0;
    for (const metric of metrics) {
      const key = `${metric.type}:${metric.date}`;
      if (!existingKeys.has(key)) {
        existing.push(metric);
        existingKeys.add(key);
        added++;
      }
    }

    // Keep only last 90 days of data
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    data['health-data'] = existing.filter(m => new Date(m.date) >= cutoff);

    await writeData(data);
    res.json({ success: true, added, total: data['health-data'].length });
  } catch (e) {
    console.error('POST /api/health error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/health - Get health data, optionally filtered by type and date range
app.get('/api/health', async (req, res) => {
  try {
    const data = await readData();
    let healthData = data['health-data'] || [];

    const { type, days } = req.query;
    if (type) {
      healthData = healthData.filter(m => m.type === type);
    }
    if (days) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - parseInt(days));
      healthData = healthData.filter(m => new Date(m.date) >= cutoff);
    }

    // Sort by date descending
    healthData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json({ metrics: healthData });
  } catch (e) {
    console.error('GET /api/health error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle all routes by serving index.html (for client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server after migration check
migrateIfNeeded()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((e) => {
    console.error('Startup failed:', e);
    // Start anyway with file fallback
    app.listen(port, () => {
      console.log(`Server running on port ${port} (migration failed)`);
    });
  });
