import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

// Remove duplicate validityDays and dailyUpdateCredits
// Specifically, after trialCreditFrequency
content = content.replace(
  /trialCreditFrequency: "([a-z]+)",\s*validityDays: 30,\s*dailyUpdateCredits: 0,/g,
  'trialCreditFrequency: "$1",'
);

fs.writeFileSync('server.ts', content, 'utf8');
console.log('Done duplicates');
