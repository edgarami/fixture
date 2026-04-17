const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.SPORTS_API_KEY || ''; // Placeholder for API Key
const DATA_DIR = path.join(__dirname, 'data');
const MATCHES_FILE = path.join(DATA_DIR, 'matches.json');

/**
 * Service to handle external Sports API logic
 */
const apiService = {
    /**
     * Sync fixtures from external API to local storage
     */
    async syncFixtures() {
        if (!API_KEY) {
            console.log('[API SERVICE] No API Key provided. Using local/mock data.');
            return;
        }

        try {
            console.log('[API SERVICE] Syncing World Cup 2026 fixtures...');

            // Example implementation for WC2026 API (or similar)
            const response = await axios.get('https://api.wc2026api.com/v1/fixtures', {
                headers: { 'Authorization': `Bearer ${API_KEY}` }
            });

            if (response.data && Array.isArray(response.data.fixtures)) {
                const matches = response.data.fixtures.map(f => ({
                    id: f.id.toString(),
                    time: f.date, // ISO string
                    team1: f.home_team.name,
                    team2: f.away_team.name,
                    score1: f.home_score,
                    score2: f.away_score,
                    venue: f.venue.name,
                    isFinished: f.status === 'FINISHED' || f.status === 'LIVE' ? (f.status === 'FINISHED') : false,
                    group: f.group_name
                }));

                fs.writeFileSync(MATCHES_FILE, JSON.stringify(matches, null, 2));
                console.log(`[API SERVICE] Successfully synced ${matches.length} matches.`);
                return matches;
            }
        } catch (error) {
            console.error('[API SERVICE] Error syncing fixtures:', error.message);
            throw error;
        }
    },

    /**
     * Get latest match data (cached or fresh)
     */
    getMatches() {
        if (!fs.existsSync(MATCHES_FILE)) return [];
        return JSON.parse(fs.readFileSync(MATCHES_FILE));
    }
};

module.exports = apiService;
