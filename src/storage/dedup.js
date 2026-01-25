import fs from 'fs';
import path from 'path';

const STORAGE_FILE = path.join(process.cwd(), 'src/storage/seenHackathons.json');

function loadSeenHackathons() {
    try {
        if (!fs.existsSync(STORAGE_FILE)) {
            fs.writeFileSync(STORAGE_FILE, '[]');
            return [];
        }
        const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error loading seen hackathons:", error);
        return [];
    }
}

function saveSeenHackathons(hackathons) {
    try {
        fs.writeFileSync(STORAGE_FILE, JSON.stringify(hackathons, null, 2));
        console.log(`Saved ${hackathons.length} seen hackathons.`);
    } catch (error) {
        console.error("Error saving seen hackathons:", error);
    }
}

export function isNewHackathon(url) {
    const seen = loadSeenHackathons();
    // Support both legacy strings and new objects
    const seenUrls = seen.map(item => (typeof item === 'string' ? item : item.url));
    return !seenUrls.includes(url);
}

export function markHackathonAsSeen(hackathon) {
    // hackathon can be a string (legacy/url) or object
    const url = typeof hackathon === 'string' ? hackathon : hackathon.url;

    if (isNewHackathon(url)) {
        const seen = loadSeenHackathons();
        seen.push(hackathon);
        saveSeenHackathons(seen);
    }
}

export function getLatestHackathons(limit) {
    const seen = loadSeenHackathons();
    // Normalize string entries to mock objects (LEGACY DATA SUPPORT)
    const normalized = seen.map(item => {
        if (typeof item === 'string') {
            return {
                title: "Untitled Hackathon",
                url: item,
                platform: item.includes("devfolio") ? "Devfolio" :
                    item.includes("unstop") ? "Unstop" : "Unknown Platform"
            };
        }
        // Normalize even if it is an object (in case of missing fields in legacy json objects)
        return {
            title: item.title || item.name || "Untitled Hackathon",
            url: item.url || item.link,
            platform: item.platform || "Unknown",
            image: item.image
        };
    });

    // Return the last N items (reversed to show newest first)
    return normalized.slice(-limit).reverse();
}
