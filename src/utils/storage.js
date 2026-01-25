import fs from 'fs';
import path from 'path';

const DATA_DIR = 'data';
const STORAGE_FILE = path.join(DATA_DIR, 'posted.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Generate a unique ID for an event
export function generateEventId(event) {
    // Sanitizing strings to ensure consistent IDs
    const safeTitle = (event.title || '').trim().replace(/\s+/g, '_');
    const safeDate = (event.startDate || '').trim();
    return `${event.platform}-${safeTitle}-${safeDate}`;
}

// Load all posted event IDs
export function loadPostedEvents() {
    if (!fs.existsSync(STORAGE_FILE)) {
        return [];
    }
    try {
        const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error loading posted events:", err);
        return [];
    }
}

// Save a new event ID to storage
export function savePostedEvent(id) {
    try {
        const posted = loadPostedEvents();
        if (!posted.includes(id)) {
            posted.push(id);
            fs.writeFileSync(STORAGE_FILE, JSON.stringify(posted, null, 2));
        }
    } catch (err) {
        console.error("Error saving posted event:", err);
    }
}
