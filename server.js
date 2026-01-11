const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'workouts.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Ensure data directory exists
async function ensureDataDir() {
    const dataDir = path.join(__dirname, 'data');
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir, { recursive: true });
    }
}

// Load data from file
async function loadData() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist, return default data
        return {
            workoutHistory: [],
            checklistConfig: ['Water bottle', 'Towel', 'Gym shoes', 'Phone & earbuds']
        };
    }
}

// Save data to file
async function saveData(data) {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// API Routes

// Get all data
app.get('/api/data', async (req, res) => {
    try {
        const data = await loadData();
        res.json(data);
    } catch (error) {
        console.error('Error loading data:', error);
        res.status(500).json({ error: 'Failed to load data' });
    }
});

// Save workout
app.post('/api/workouts', async (req, res) => {
    try {
        const data = await loadData();
        const workout = req.body;
        data.workoutHistory.push(workout);
        await saveData(data);
        res.json({ success: true, workout });
    } catch (error) {
        console.error('Error saving workout:', error);
        res.status(500).json({ error: 'Failed to save workout' });
    }
});

// Update checklist config
app.put('/api/checklist', async (req, res) => {
    try {
        const data = await loadData();
        data.checklistConfig = req.body.checklistConfig;
        await saveData(data);
        res.json({ success: true, checklistConfig: data.checklistConfig });
    } catch (error) {
        console.error('Error updating checklist:', error);
        res.status(500).json({ error: 'Failed to update checklist' });
    }
});

// Get workout history
app.get('/api/workouts', async (req, res) => {
    try {
        const data = await loadData();
        res.json(data.workoutHistory);
    } catch (error) {
        console.error('Error loading workouts:', error);
        res.status(500).json({ error: 'Failed to load workouts' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize and start server
async function startServer() {
    await ensureDataDir();
    app.listen(PORT, () => {
        console.log(`🏋️  Workout Tracker server running on port ${PORT}`);
        console.log(`📱 Access the app at: http://localhost:${PORT}`);
    });
}

startServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
