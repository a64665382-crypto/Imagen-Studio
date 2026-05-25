import fs from 'fs';

let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

// 1. Add state variable and icon import if needed.
if (!content.includes('lockedMsg')) {
  content = content.replace(
    'const [activePresetMenu, setActivePresetMenu] = useState<"subject" | "scene" | "style" | null>(null);',
    `const [activePresetMenu, setActivePresetMenu] = useState<"subject" | "scene" | "style" | null>(null);\n  const [lockedMsg, setLockedMsg] = useState<string | null>(null);\n\n  const handleLockedClick = (section: string) => {\n    setLockedMsg(section);\n    setTimeout(() => setLockedMsg(null), 2500);\n  };`
  );
}

// 2. Wrap Scene section internals with lock
// First we match <section ...> for Scene
const sceneRegex = /({\/\* SECTION 2: SCENE \*\/}\s*<section className="[^"]*relative[^"]*">\s*)/;
const lockScene = `<div 
            onClick={() => handleLockedClick('scene')}
            className="absolute inset-0 z-30 flex items-center justify-center bg-bg-primary/50 backdrop-blur-[1.5px] rounded-2xl cursor-pointer"
          >
            <div className="flex flex-col items-center justify-center bg-bg-elevated/90 border border-border-gold/50 px-5 py-3.5 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 active:scale-95">
              <Lock className="w-5 h-5 text-gold-primary mb-1.5" />
              <span className={\`text-[9px] font-black tracking-widest uppercase mt-0.5 whitespace-nowrap \${lockedMsg === 'scene' ? 'text-gold-primary' : 'text-text-muted'}\`}>
                {lockedMsg === 'scene' ? 'This feature available soon' : 'Locked'}
              </span>
            </div>
          </div>\n          `;

content = content.replace(sceneRegex, "$1" + lockScene);

// 3. Wrap Style section internals with lock
const styleRegex = /({\/\* SECTION 3: STYLE \*\/}\s*<section className="[^"]*relative[^"]*">\s*)/;
const lockStyle = `<div 
            onClick={() => handleLockedClick('style')}
            className="absolute inset-0 z-30 flex items-center justify-center bg-bg-primary/50 backdrop-blur-[1.5px] rounded-2xl cursor-pointer"
          >
            <div className="flex flex-col items-center justify-center bg-bg-elevated/90 border border-border-gold/50 px-5 py-3.5 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 active:scale-95">
              <Lock className="w-5 h-5 text-gold-primary mb-1.5" />
              <span className={\`text-[9px] font-black tracking-widest uppercase mt-0.5 whitespace-nowrap \${lockedMsg === 'style' ? 'text-gold-primary' : 'text-text-muted'}\`}>
                {lockedMsg === 'style' ? 'This feature available soon' : 'Locked'}
              </span>
            </div>
          </div>\n          `;

// Ensure Lock icon is imported
if (!content.includes('Lock,')) {
    content = content.replace('X, MapPin,', 'X, MapPin, Lock,');
    if (!content.includes('Lock,')) {
        content = content.replace('Plus,', 'Plus, Lock,');
    }
}

content = content.replace(styleRegex, "$1" + lockStyle);

fs.writeFileSync('src/components/Sidebar.tsx', content, 'utf8');
console.log('Added locks to Scene and Style sections');
