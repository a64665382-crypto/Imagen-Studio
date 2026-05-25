import fs from 'fs';
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// Also inject 'text-white bg-bg-elevated' into any input/textarea that is missing explicit text-color
content = content.replace(
  /<input([^>]*?)className="([^"]*?)"/g,
  (match, p1, p2) => {
    if (!p2.includes('text-')) {
      return `<input${p1}className="${p2} text-white bg-bg-elevated"`;
    }
    return match;
  }
);

content = content.replace(
  /<textarea([^>]*?)className="([^"]*?)"/g,
  (match, p1, p2) => {
    if (!p2.includes('text-')) {
      return `<textarea${p1}className="${p2} text-white bg-bg-elevated"`;
    }
    return match;
  }
);

fs.writeFileSync('src/components/AdminDashboard.tsx', content, 'utf8');
