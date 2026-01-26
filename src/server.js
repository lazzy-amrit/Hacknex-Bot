import express from 'express';
import cors from 'cors';
import { getLatestHackathons } from './storage/dedup.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow all origins (read-only API)
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send({ status: "online", message: "Hacknex API is running 🚀" });
});

app.get('/api/platforms', (req, res) => {
    res.json(["Devfolio", "Unstop", "MLH"]);
});

app.get('/api/hackathons', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const platform = req.query.platform ? req.query.platform.toLowerCase() : null;

        // Get data from storage
        let hackathons = getLatestHackathons(100); // Fetch a larger batch to filter from

        // Filter by platform if requested
        if (platform) {
            hackathons = hackathons.filter(h => h.platform.toLowerCase() === platform);
        }

        // Apply limit
        const result = hackathons.slice(0, limit);

        res.json({
            count: result.length,
            limit: limit,
            platform: platform || "all",
            data: result
        });
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export function startServer() {
    app.listen(PORT, () => {
        console.log(`🌐 API server running on port ${PORT}`);
    });
}
