import axios from 'axios';

export default async function fetchUnstopHackathons() {
    try {
        const response = await axios.get(
            'https://unstop.com/api/public/opportunity/search',
            {
                params: {
                    opportunity: 'hackathons',
                    page: 1,
                    per_page: 5
                },
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json'
                }
            }
        );

        const hackathons = response.data?.data?.data || [];

        console.log("🔥 Unstop raw data:", hackathons.length);

        return hackathons.map(hackathon => ({
            title: hackathon.title,
            url: hackathon.public_url
                ? `https://unstop.com/${hackathon.public_url}`
                : 'https://unstop.com/hackathons',
            platform: "Unstop",
            image: hackathon.banner_url || hackathon.cover_image || hackathon.logoUrl2
        }));

    } catch (error) {
        console.error("❌ Unstop fetch failed:", error.message);
        return [];
    }
}
