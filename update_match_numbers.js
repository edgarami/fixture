const fs = require('fs');
const path = require('path');

const matchesPath = path.join(__dirname, 'backend', 'data', 'matches.json');
const matches = JSON.parse(fs.readFileSync(matchesPath, 'utf8'));

// Sort all matches chronologically by time
matches.sort((a, b) => new Date(a.time) - new Date(b.time));

const startDate = new Date('2026-06-11T00:00:00Z');

let matchCounter = 1;

matches.forEach(m => {
  const matchDate = new Date(m.time);
  if (matchDate >= startDate) {
    m.matchNumber = matchCounter++;
  } else {
    delete m.matchNumber;
  }
});

fs.writeFileSync(matchesPath, JSON.stringify(matches, null, 2), 'utf8');
console.log(`Updated ${matchCounter - 1} matches total with sequential numbers.`);
