import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function normalize(name) {
    return String(name)
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/** Claves del JSON se normalizan (méxico → mexico) para que el lookup funcione. */
export function loadTeamMap() {
    const raw = JSON.parse(
        readFileSync(join(__dirname, 'team-name-map.json'), 'utf8'),
    );
    const map = {};
    for (const [key, aliases] of Object.entries(raw)) {
        map[normalize(key)] = aliases;
    }
    return map;
}

export function apiNameMatchesLocal(apiName, localName, teamMap) {
    const apiN = normalize(apiName);
    const localN = normalize(localName);
    if (apiN === localN || apiN.includes(localN) || localN.includes(apiN)) {
        return true;
    }
    const aliases = teamMap[localN] || [];
    return aliases.some((alias) => {
        const a = normalize(alias);
        return apiN === a || apiN.includes(a) || a.includes(apiN);
    });
}

export function teamsPairMatch(apiHome, apiAway, team1, team2, teamMap) {
    const direct =
        apiNameMatchesLocal(apiHome, team1, teamMap) &&
        apiNameMatchesLocal(apiAway, team2, teamMap);
    const swapped =
        apiNameMatchesLocal(apiHome, team2, teamMap) &&
        apiNameMatchesLocal(apiAway, team1, teamMap);
    return direct || swapped;
}
