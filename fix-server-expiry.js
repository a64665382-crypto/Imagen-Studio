import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

// fix the free task duration
content = content.replace(
  /targetUser\.subscriptionExpires = new Date\(Date\.now\(\) \+ 30 \* 24 \* 60 \* 60 \* 1000\)\.toISOString\(\);/g,
  'targetUser.subscriptionExpires = new Date(Date.now() + (plan.validityDays || 30) * 24 * 60 * 60 * 1000).toISOString();'
);

// fix the fallback duration
content = content.replace(
  /req\.user\.subscriptionExpires = new Date\(Date\.now\(\) \+ 28 \* 24 \* 60 \* 60 \* 1000\)\.toISOString\(\);/g,
  'req.user.subscriptionExpires = new Date(Date.now() + ((plans.get(req.user.plan)?.validityDays || 30) - 2) * 24 * 60 * 60 * 1000).toISOString();'
);

fs.writeFileSync('server.ts', content, 'utf8');
console.log('Fixed expiry dates');
