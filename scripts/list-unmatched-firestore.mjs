import { loadLocalEnv } from './load-local-env.mjs';
import { getFirestore } from './firebase-admin-init.mjs';
import { loadTeamMap, teamsPairMatch } from './team-name-utils.mjs';

loadLocalEnv();
const teamMap = loadTeamMap();
const db = getFirestore();

const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const COMPETITION = process.env.FOOTBALL_COMPETITION_CODE || 'WC';
const res = await fetch(
    `https://api.football-data.org/v4/competitions/${COMPETITION}/matches`,
    { headers: { 'X-Auth-Token': API_KEY } },
);
const apiMatches = (await res.json()).matches || [];
const localSnap = await db.collection('matches').get();
const localMatches = localSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

function isPlaceholderTeam(name) {
    const n = String(name).toLowerCase();
    return n.includes('ganador') || n.includes('perdedor') || n.includes('º grupo');
}

let apiUnmatched = 0;
for (const api of apiMatches) {
    const home = api.homeTeam?.name || '';
    const away = api.awayTeam?.name || '';
    const local = localMatches.find((m) => {
        if (m.footballDataId === api.id) return true;
        const hoursDiff =
            Math.abs(new Date(api.utcDate).getTime() - new Date(m.time).getTime()) /
            (1000 * 60 * 60);
        if (hoursDiff > 72) return false;
        if (isPlaceholderTeam(m.team1) || isPlaceholderTeam(m.team2)) return false;
        return teamsPairMatch(home, away, m.team1, m.team2, teamMap);
    });
    if (!local) {
        apiUnmatched++;
        console.log('API sin pareja:', api.id, api.utcDate?.slice(0, 10), home, 'vs', away);
    }
}
console.log('API sin pareja total:', apiUnmatched);

for (const m of localMatches) {
    if (!isPlaceholderTeam(m.team1) && !isPlaceholderTeam(m.team2) && !m.footballDataId) {
        const hasApi = apiMatches.some((api) => {
            const home = api.homeTeam?.name || '';
            const away = api.awayTeam?.name || '';
            const hoursDiff =
                Math.abs(new Date(api.utcDate).getTime() - new Date(m.time).getTime()) /
                (1000 * 60 * 60);
            if (hoursDiff > 72) return false;
            return teamsPairMatch(home, away, m.team1, m.team2, teamMap);
        });
        if (!hasApi) {
            console.log('Local sin API:', m.id, m.time?.slice(0, 10), m.team1, 'vs', m.team2);
        }
    }
}
