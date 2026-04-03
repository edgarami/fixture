const fs = require('fs');
const path = require('path');

const matchesPath = path.join(__dirname, 'backend', 'data', 'matches.json');
let matches = JSON.parse(fs.readFileSync(matchesPath, 'utf8'));

const replacements = {
    'UEFA 1': { name: 'Bosnia y Herz.', code: 'ba' },
    'UEFA 2': { name: 'Suecia', code: 'se' },
    'UEFA 3': { name: 'Turquía', code: 'tr' },
    'UEFA 4': { name: 'Chequia', code: 'cz' },
    'Internacional 1': { name: 'RD Congo', code: 'cd' },
    'Internacional 2': { name: 'Iraq', code: 'iq' }
};

// Also handle the duplicate "Internacional 1" if it appears in different groups
// In matches.json: 
// Group J has "Austria" and "Jordania" but matches.json might have placeholders elsewhere.

matches = matches.map(m => {
    let updated = { ...m };
    
    if (replacements[m.team1]) {
        updated.team1 = replacements[m.team1].name;
        updated.team1Flag = `https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.3.2/flags/4x3/${replacements[m.team1].code}.svg`;
    }
    if (replacements[m.team2]) {
        updated.team2 = replacements[m.team2].name;
        updated.team2Flag = `https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.3.2/flags/4x3/${replacements[m.team2].code}.svg`;
    }
    
    return updated;
});

fs.writeFileSync(matchesPath, JSON.stringify(matches, null, 2));
console.log('Matches updated successfully with real teams and flags.');
