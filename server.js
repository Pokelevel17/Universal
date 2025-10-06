import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// Fetch games from a GitHub repo dynamically
const GITHUB_REPO_URL = 'https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_GITHUB_REPO/main/games.json';

let games = [];

// Function to update games list every 5 minutes
async function updateGames() {
    try {
        const res = await fetch(GITHUB_REPO_URL);
        games = await res.json();
        console.log('Games list updated.');
    } catch (err) {
        console.error('Failed to fetch games:', err);
    }
}
updateGames();
setInterval(updateGames, 300000); // every 5 minutes

// API endpoint to get games
app.get('/api/games', (req, res) => res.json(games));

// Proxy endpoint for blocked games
app.get('/proxy', (req, res, next) => {
    const target = req.query.url;
    if (!target) return res.status(400).send('Missing URL');
    createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite: { '^/proxy': '' },
        secure: false
    })(req, res, next);
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
