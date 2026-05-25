import fs from 'fs';
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// Change role rendering slightly
content = content.replace(
  '{u.role}',
  '{u.role || "No Role"}'
);

// Change plan rendering
content = content.replace(
  '{data.plans.find((p: any) => p.id === u.plan)?.name || u.plan}',
  '{data.plans.find((p: any) => p.id === u.plan)?.name || u.plan || "No Plan"}'
);

// Explicit visibility
content = content.replace(
  /"bg-bg-elevated text-text-main"/g,
  '"bg-bg-elevated text-white border border-border-gold px-2 py-1"'
);
content = content.replace(
  /className="py-4 px-6 text-xs font-bold text-text-secondary uppercase"/g,
  'className="py-4 px-6 text-xs font-bold text-white uppercase"'
);

fs.writeFileSync('src/components/AdminDashboard.tsx', content, 'utf8');
