import fs from 'fs';
import path from 'path';

function replaceFetchCalls(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceFetchCalls(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('fetch("/api')) {
        content = content.replace(/fetch\("\/api/g, 'fetch((import.meta.env.VITE_API_URL || "") + "/api');
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

replaceFetchCalls('./src');
