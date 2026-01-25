import axios from 'axios';
import * as cheerio from 'cheerio';

async function doFetchDevfolio() {
    return await axios.get('https://devfolio.co/hackathons', { timeout: 10000 });
}

export async function fetchDevfolioHackathons() {
    console.log("Fetching Devfolio hackathons...");
    let data;

    try {
        const response = await doFetchDevfolio();
        data = response.data;
    } catch (error) {
        console.warn("⚠️ Devfolio fetch failed. Retrying (1/1)...");
        try {
            const response = await doFetchDevfolio();
            data = response.data;
        } catch (retryError) {
            console.error("❌ Devfolio fetch failed after retry:", retryError.message);
            return [];
        }
    }

    try {
        const $ = cheerio.load(data);

        const hackathons = [];

        $('a').each((i, el) => {
            const href = $(el).attr('href');
            const title = $(el).text().trim();

            if (href && href.includes('.devfolio.co') && !href.includes('www.devfolio.co') && title) {
                // Avoid redundant links or duplicates in the same list
                const isDuplicate = hackathons.some(h => h.url === href);
                if (!isDuplicate && hackathons.length < 5) {
                    hackathons.push({
                        title: title,
                        url: href,
                        platform: "Devfolio"
                    });
                }
            }
        });

        console.log(`Fetched ${hackathons.length} hackathons from Devfolio.`);
        return hackathons;
    } catch (error) {
        console.error("Error fetching Devfolio hackathons:", error.message);
        return [];
    }
}
