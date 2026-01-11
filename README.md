# Workout Tracker

A mobile-optimized web application for tracking personal workouts, designed primarily for iPhone browser usage.

## Features

- **Pre-Workout Checklist**: Configurable reminder of items to bring
- **Workout Types**: Pull, Push, Legs, Swim, Run (Gym), Run (Outdoor)
- **Exercise Planning**: Equipment-based and cardio exercises with smart pre-population
- **Real-time Tracking**: Mark exercises done and adjust values during workout
- **Workout Summary**: Detailed post-workout statistics
- **Analytics**: Historical data, progress tracking, and motivational alerts
- **Settings**: Customizable checklist configuration

## Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

## Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

## Running Locally

Start the server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
workout-tracker/
├── server.js           # Express backend server
├── package.json        # Dependencies and scripts
├── data/              # Data storage directory (auto-created)
│   └── workouts.json  # Workout data file
└── public/            # Frontend files
    ├── index.html     # Main HTML file
    ├── styles.css     # Styles
    └── app.js         # Frontend JavaScript
```

## Deployment Options

### Option 1: Railway.app (Recommended)

1. Create account at [Railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect Node.js and deploy
5. Your app will be live with a public URL

### Option 2: Render.com

1. Create account at [Render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Click "Create Web Service"

### Option 3: Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-workout-tracker`
4. Deploy:
```bash
git push heroku main
```

### Option 4: DigitalOcean App Platform

1. Create account at [DigitalOcean](https://www.digitalocean.com)
2. Go to App Platform
3. Create new app from GitHub
4. Configure Node.js app with auto-detection
5. Deploy

### Option 5: Vercel

1. Install Vercel CLI: `npm install -g vercel`
2. Run: `vercel`
3. Follow prompts to deploy

## Environment Variables

No environment variables required for basic setup. The server uses:
- `PORT`: Server port (default: 3000)

## Data Storage

Workout data is stored in a JSON file at `data/workouts.json`. For production use, consider migrating to a proper database (MongoDB, PostgreSQL, etc.).

## API Endpoints

- `GET /api/data` - Get all data (workouts + checklist config)
- `GET /api/workouts` - Get workout history
- `POST /api/workouts` - Save new workout
- `PUT /api/checklist` - Update checklist configuration
- `GET /api/health` - Health check endpoint

## Browser Support

Optimized for:
- iOS Safari (primary target)
- Chrome Mobile
- Other modern mobile browsers

## License

ISC
