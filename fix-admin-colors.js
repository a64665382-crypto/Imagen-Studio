import fs from 'fs';
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

content = content.replace(/"bg-gold-primary text-gold-primary border border-gold-primary"/g, '"bg-gold-primary text-bg-primary border border-gold-primary"');
content = content.replace(/bg-gold-primary border border-gold-primary text-gold-primary/g, "bg-gold-primary border border-gold-primary text-bg-primary");
content = content.replace(/hover:bg-gold-primary rounded-lg/g, "hover:bg-gold-primary/90 rounded-lg");

fs.writeFileSync('src/components/AdminDashboard.tsx', content, 'utf8');
