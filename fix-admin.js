import fs from 'fs';
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// The main overview cards
content = content.replace(/bg-white rounded-2xl shadow-sm border border-slate-200/g, 'card-luxury p-6');

// Button in overview
content = content.replace(/bg-slate-100/g, 'bg-bg-elevated');
content = content.replace(/hover:bg-slate-200/g, 'hover:border-gold-primary transition');

// Users tab buttons
content = content.replace(/bg-slate-900 text-white/g, 'card-luxury text-gold-primary border border-border-gold');

// Check other modals
content = content.replace(/bg-white text-slate-800/g, 'bg-bg-elevated text-text-main');
content = content.replace(/bg-white border-slate-300/g, 'bg-bg-elevated border-border-gold');
content = content.replace(/bg-white border-slate-200/g, 'bg-bg-elevated border-border-gold');
content = content.replace(/bg-white rounded-3xl/g, 'glass-panel rounded-3xl border border-border-gold shadow-2xl shadow-gold-primary/10');
content = content.replace(/bg-white/g, 'bg-bg-elevated');
content = content.replace(/border-slate-200/g, 'border-border-gold/50');
content = content.replace(/border-slate-100/g, 'border-border-gold/30');
content = content.replace(/border-slate-350/g, 'border-border-gold');
content = content.replace(/text-slate-200/g, 'text-text-main');

// In modals headers might have a light background
content = content.replace(/border-b border-bg-elevated\/30/g, 'border-b border-border-gold/30');

// Fix red focus to match luxury error state if any
content = content.replace(/border-red-200/g, 'border-red-500/50');
content = content.replace(/border-amber-200/g, 'border-border-gold');

// Ensure inputs use the admin-input class or keep background transparent to it
content = content.replace(/outline-none bg-bg-elevated text-slate-800/g, 'admin-input text-text-main');
content = content.replace(/outline-none/g, ''); 

fs.writeFileSync('src/components/AdminDashboard.tsx', content, 'utf8');
console.log('Fixed admin styles.');
