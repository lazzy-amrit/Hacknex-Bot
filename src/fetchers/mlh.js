import axios from 'axios';
import { normalizeHackathon } from '../utils/normalizeHackathon.js';

export default async function fetchMLHHackathons() {
    try {
        const response = await axios.get('https://mlh.io/seasons/2026/events.json');

        const events = response.data || [];
        console.log(`Fetched ${events.length} hackathons from MLH.`);

        return events.map(event => normalizeHackathon("MLH", {
            title: event.name,
            url: event.url,
            startsAt: event.start_date,
            endsAt: event.end_date,
            location: event.location
        }));
    } catch (error) {
        console.error("❌ MLH fetch failed:", error.message);
        return [];
    }
}
