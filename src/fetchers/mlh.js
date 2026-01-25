import axios from 'axios';

export default async function fetchMLHHackathons() {
    try {
        const response = await axios.get('https://mlh.io/seasons/2026/events.json');

        const events = response.data || [];
        console.log(`Fetched ${events.length} hackathons from MLH.`);

        return events.map(event => ({
            title: event.name,
            url: event.url,
            platform: "MLH"
        }));
    } catch (error) {
        console.error("❌ MLH fetch failed:", error.message);
        return [];
    }
}
