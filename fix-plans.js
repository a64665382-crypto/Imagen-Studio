import fs from 'fs';
let content = fs.readFileSync('src/components/Plans.tsx', 'utf8');

content = content.replace(/hover:bg-slate-200/g, 'hover:bg-bg-elevated');
content = content.replace(/hover:text-slate-800/g, 'hover:text-gold-primary');
content = content.replace(/text-slate-800/g, 'text-text-main');
content = content.replace(/bg-bg-primary text-text-main shadow-sm border border-border-gold/g, 'bg-bg-elevated text-gold-primary shadow-[0_0_10px_rgba(255,215,0,0.2)] border border-border-gold');
content = content.replace(/text-slate-550/g, '');
content = content.replace(/hover:bg-slate-800/g, 'hover:scale-105 transition-transform');
content = content.replace(/text-slate-600/g, 'text-text-main');
content = content.replace(/text-slate-400/g, 'text-text-muted');
content = content.replace(/bg-slate-100/g, 'bg-bg-elevated');

fs.writeFileSync('src/components/Plans.tsx', content, 'utf8');
console.log('Fixed styles in Plans.tsx');
