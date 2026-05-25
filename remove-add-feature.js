import fs from 'fs';

let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

// 1. Remove the locked click handler and state
content = content.replace(/const \[lockedMsg, setLockedMsg\] = useState<string \| null>\(null\);/g, '');
content = content.replace(/const handleLockedClick =.*?2500\);\n  };/s, '');

// 2. Remove the locked tiles (the absolute inset-0 z-30 divs)
const lockTileRegex = /<div\s+onClick=\{\(\) => handleLockedClick\('[a-z]+'\)\}\s+className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950\/40 backdrop-blur-\[1\.5px\] rounded-2xl cursor-pointer"\s*>\s*<div className="flex flex-col items-center justify-center bg-slate-900\/90 border border-slate-700\/50 px-4 py-3 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 active:scale-95">\s*<Lock className="w-5 h-5 text-slate-400 mb-1" \/>\s*<span className=\{`text-\[9px\] font-black tracking-widest uppercase mt-0\.5 whitespace-nowrap \$\{lockedMsg === '[a-z]+' \? 'text-amber-400' : 'text-slate-400'\}`\}>\s*\{lockedMsg === '[a-z]+' \? 'This feature available soon' : 'Locked'\}\s*<\/span>\s*<\/div>\s*<\/div>/g;

content = content.replace(lockTileRegex, '');

// 3. Remove the "Micro add-new tile" button block (appears 3 times)
const microTileRegex = /\{\/\* Micro add-new tile \*\/\}\s*<button\s+onClick=\{\(e\) => \{ e\.stopPropagation\(\); triggerInput\("[a-z]+"\); \}\}\s+className="rounded-xl border border-dashed border-slate-800 bg-slate-900\/50 hover:bg-slate-900\/80 flex flex-col items-center justify-center aspect-square transition"\s*>\s*<Plus className="w-4 h-4 text-slate-400" \/>\s*<span className="text-\[8px\] font-bold text-slate-400 mt-0\.5">Add<\/span>\s*<\/button>/g;

content = content.replace(microTileRegex, '');

fs.writeFileSync('src/components/Sidebar.tsx', content, 'utf8');
console.log("Replaced successfully!");
