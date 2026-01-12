import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

// JSON body parser
app.use(express.json());

// Path to data storage file - use /home on Azure for persistence
const DATA_DIR = process.env.HOME 
  ? path.join(process.env.HOME, 'data')
  : __dirname;
const DATA_FILE = path.join(DATA_DIR, 'data.json');

// Ensure data.json exists
function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '{}', 'utf-8');
  }
}

// Read all data
function readData() {
  ensureDataFile();
  try {
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

// Write all data
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// GET /api/storage/:key - Get a value by key
app.get('/api/storage/:key', (req, res) => {
  const { key } = req.params;
  const data = readData();
  if (key in data) {
    res.json({ value: data[key] });
  } else {
    res.status(404).json({ error: 'Key not found' });
  }
});

// PUT /api/storage/:key - Set a value by key
app.put('/api/storage/:key', (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  const data = readData();
  data[key] = value;
  writeData(data);
  res.json({ success: true });
});

// DELETE /api/storage/:key - Remove a value by key
app.delete('/api/storage/:key', (req, res) => {
  const { key } = req.params;
  const data = readData();
  delete data[key];
  writeData(data);
  res.json({ success: true });
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle all routes by serving index.html (for client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
