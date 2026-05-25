import fs from 'fs';
let content = fs.readFileSync('src/components/Plans.tsx', 'utf8');

const replacement = `
                <div className="mt-4 flex flex-col gap-1.5">
                  <div className="inline-flex w-fit items-center gap-1.5 px-2 py-1 bg-bg-elevated border border-border-gold rounded-lg text-[11px] font-semibold text-text-secondary">
                    ⚡ {p.credits.toLocaleString()} Credits One-Time
                  </div>
                  {p.dailyUpdateCredits > 0 && (
                     <div className="inline-flex w-fit items-center gap-1.5 px-2 py-1 bg-gold-primary/10 border border-gold-primary/30 rounded-lg text-[11px] font-semibold text-gold-primary">
                       ✨ {p.dailyUpdateCredits.toLocaleString()} Credits / Day
                     </div>
                  )}
                  {p.validityDays > 0 && p.type !== "base" && (
                     <div className="inline-flex w-fit items-center gap-1.5 px-2 py-1 bg-bg-elevated border border-border-gold rounded-lg text-[10px] font-medium text-text-muted">
                       ⏳ Valid for {p.validityDays} days
                     </div>
                  )}
                </div>
                <p className="text-xs text-text-secondary mt-4 leading-relaxed">
`;

content = content.replace(
  /<div className="mt-4 inline-flex items-center gap-1.5 px-2 py-1 bg-bg-elevated border border-border-gold rounded-lg text-\[11px\] font-semibold text-text-secondary">\s*⚡ \{p.credits.toLocaleString\(\)\} Credits One-Time\s*<\/div>\s*<p className="text-xs text-text-secondary mt-4 leading-relaxed">/s,
  replacement
);

fs.writeFileSync('src/components/Plans.tsx', content, 'utf8');
console.log('Done Plans.tsx');
