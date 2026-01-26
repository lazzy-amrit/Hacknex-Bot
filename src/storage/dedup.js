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

export function isNewHackathon(id) {
    const seen = loadSeenHackathons();
    // Check if any item has the same ID
    return !seen.some(item => {
        if (typeof item === 'string') return false; // Ignore legacy strings
        return item.id === id;
    });
}

export function markHackathonAsSeen(hackathon) {
    // Expects normalized hackathon object with .id
    if (hackathon && hackathon.id && isNewHackathon(hackathon.id)) {
        const seen = loadSeenHackathons();
        seen.push(hackathon);
        saveSeenHackathons(seen);
    }
}

export function getLatestHackathons(limit) {
    const seen = loadSeenHackathons();

    // Filter out legacy strings if any, or normalize them on the fly if strictly needed.
    // For now, we return valid objects.
    const valid = seen.filter(item => typeof item !== 'string' && item.title);

    // Return the last N items (reversed to show newest first)
    return valid.slice(-limit).reverse();
}

export function getSeenHackathonsCount() {
    return loadSeenHackathons().length;
}
