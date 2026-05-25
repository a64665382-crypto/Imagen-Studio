import fs from 'fs';
let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

content = content.replace(/Plus, Lock, Lock,/g, 'Plus, Lock,');
content = content.replace(/Lock,\s*([A-Za-z]+,.*)Lock/g, 'Lock, $1'); // just in case
content = content.replace(/Star, Lock/g, 'Star');

fs.writeFileSync('src/components/Sidebar.tsx', content, 'utf8');
console.log('Fixed duplicate lock in Sidebar');
