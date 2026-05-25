import fs from 'fs';
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// Replace bg-slate-900/40 with bg-bg-primary/50
content = content.replace(/bg-slate-900\/40/g, 'bg-bg-primary/50');
// Replace bg-slate-800 with bg-bg-elevated
content = content.replace(/bg-slate-800/g, 'bg-bg-elevated/50');
content = content.replace(/bg-slate-900/g, 'bg-bg-elevated');
content = content.replace(/hover:bg-slate-900/g, 'hover:bg-bg-elevated');
content = content.replace(/hover:bg-slate-850/g, 'hover:bg-bg-elevated/80');
content = content.replace(/bg-slate-200/g, 'bg-bg-elevated');
content = content.replace(/hover:bg-slate-300/g, 'hover:bg-bg-elevated border-gold-primary transition');
content = content.replace(/bg-slate-150/g, 'bg-bg-elevated');
content = content.replace(/text-slate-800/g, 'text-text-main');
content = content.replace(/text-slate-950/g, 'text-bg-primary');
content = content.replace(/text-\[\#FFD600\]/g, 'text-gold-primary');
content = content.replace(/bg-fuchsia-500/g, 'bg-gold-primary');
content = content.replace(/bg-amber-100 text-amber-900/g, 'bg-gold-primary/10 text-gold-primary');
content = content.replace(/hover:bg-amber-200/g, 'hover:bg-gold-primary/20');
content = content.replace(/bg-amber-100 text-amber-800/g, 'bg-gold-primary/20 text-gold-primary');

// Look for unstyled inputs in forms that have become transparent or weird
// The user says "The color of the items may be the cause of them not being visible"
// For inputs, we must use the `admin-input` class as per the user's initial rule.
// We'll just replace `<input type="text" className="` with `<input type="text" className="admin-input `
content = content.replace(/<input\s+type="text"\s+className="/g, '<input type="text" className="admin-input ');
content = content.replace(/<input\s+type="number"\s+className="/g, '<input type="number" className="admin-input ');
content = content.replace(/<textarea\s+([^>]*?)className="/g, '<textarea $1className="admin-input ');
content = content.replace(/<select\s+className="/g, '<select className="admin-input ');

fs.writeFileSync('src/components/AdminDashboard.tsx', content, 'utf8');
console.log('Fixed more admin styles.');
