import fs from 'fs';
import path from 'path';

const distPath = path.resolve('dist');
const exportPath = path.resolve('website-html-export');

// Create directories
fs.mkdirSync(exportPath, { recursive: true });
fs.mkdirSync(path.join(exportPath, 'assets', 'images'), { recursive: true });
fs.mkdirSync(path.join(exportPath, 'assets', 'icons'), { recursive: true });
fs.mkdirSync(path.join(exportPath, 'assets', 'fonts'), { recursive: true });

// Read dist assets
const distAssets = fs.readdirSync(path.join(distPath, 'assets'));
let jsFile = '';
let cssFile = '';

for (const file of distAssets) {
  if (file.endsWith('.js')) jsFile = file;
  if (file.endsWith('.css')) cssFile = file;
}

// Copy and rename JS and CSS
if (jsFile) {
  fs.copyFileSync(
    path.join(distPath, 'assets', jsFile),
    path.join(exportPath, 'script.js')
  );
}

if (cssFile) {
  fs.copyFileSync(
    path.join(distPath, 'assets', cssFile),
    path.join(exportPath, 'style.css')
  );
}

// Modify index.html to point to the new names
let htmlContent = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');
if (jsFile) {
  htmlContent = htmlContent.replace(`/assets/${jsFile}`, `./script.js`);
}
if (cssFile) {
  htmlContent = htmlContent.replace(`/assets/${cssFile}`, `./style.css`);
}

// Ensure paths are completely relative (not root-relative)
htmlContent = htmlContent.replace(/="\//g, '="./');

fs.writeFileSync(path.join(exportPath, 'index.html'), htmlContent, 'utf-8');

// Write README.txt
const readmePath = path.join(exportPath, 'README.txt');
fs.writeFileSync(readmePath, `Imagen Studio - Website HTML Export
====================================

This package contains the fully generated static files for your application.
- index.html: The entry point to your web application.
- style.css: The compiled Tailwind CSS styling.
- script.js: The compiled functional components and application logic.

Usage:
------
You can serve these files using any static file server.
Note: If your application requires backend APIs (e.g., /api/generate) to work properly, 
you will need to serve this static front-end alongside your configured backend service, 
or open it as an integrated project.

Enjoy your workspace!
`);

console.log('Export package built successfully at /website-html-export');
