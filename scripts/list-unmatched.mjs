/**
 * Lista partidos API sin pareja local (para ampliar team-name-map.json).
 * Uso: node scripts/list-unmatched.mjs
 */
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { loadLocalEnv } from './load-local-env.mjs';
import { loadTeamMap, teamsPairMatch } from './team-name-utils.mjs';

loadLocalEnv();

const __dirname = dirname(fileURLToPath(import.meta.url));
const teamMap = loadTeamMap();
const localMatches = JSON.parse(
    readFileSync(join(__dirname, '..', 'public', 'assets', 'matches.json'), 'utf8'),
);

const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const COMPETITION = process.env.FOOTBALL_COMPETITION_CODE || 'WC';

function findLocal(api, locals) {
    const home = api.homeTeam?.name || api.homeTeam?.shortName || '';
    const away = api.awayTeam?.name || api.awayTeam?.shortName || '';
    return locals.find((m) => {
        const hoursDiff =
            Math.abs(new Date(api.utcDate).getTime() - new Date(m.time).getTime()) /
            (1000 * 60 * 60);
        if (hoursDiff > 72) {
            return false;
        }
        return teamsPairMatch(home, away, m.team1, m.team2, teamMap);
    });
}

const res = await fetch(
    `https://api.football-data.org/v4/competitions/${COMPETITION}/matches`,
    { headers: { 'X-Auth-Token': API_KEY } },
);
const apiMatches = (await res.json()).matches || [];

const unmatched = [];
for (const api of apiMatches) {
    if (!findLocal(api, localMatches)) {
        unmatched.push({
            date: api.utcDate?.slice(0, 16),
            home: api.homeTeam?.name,
            away: api.awayTeam?.name,
        });
    }
}

console.log(JSON.stringify(unmatched, null, 2));
console.error(`\nTotal sin pareja: ${unmatched.length} / ${apiMatches.length}`);
