import fs from 'fs';
let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

content = content.replace(/Star,  }/g, 'Star }');

fs.writeFileSync('src/components/Sidebar.tsx', content, 'utf8');
