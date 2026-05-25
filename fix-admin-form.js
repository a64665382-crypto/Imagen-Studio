import fs from 'fs';
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// 1. Update initial forms
content = content.replace(
  'creditFrequency: "monthly",',
  'creditFrequency: "monthly",\n      validityDays: 30,\n      dailyUpdateCredits: 0,'
);

content = content.replace(
  'creditFrequency: plan.creditFrequency || "monthly",',
  'creditFrequency: plan.creditFrequency || "monthly",\n      validityDays: plan.validityDays !== undefined ? plan.validityDays : 30,\n      dailyUpdateCredits: plan.dailyUpdateCredits || 0,'
);

content = content.replace(
  'creditFrequency: editForm.creditFrequency,',
  'creditFrequency: editForm.creditFrequency,\n          validityDays: Number(editForm.validityDays),\n          dailyUpdateCredits: Number(editForm.dailyUpdateCredits),'
);

// 2. Add form UI below creditFrequency (or description)
const newFields = `
                <div>
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wide block">Plan Validity (Days)</label>
                  <p className="text-[9px] text-text-muted mb-1">Duration the plan is active after purchase (e.g., 30 for 1 month, 365 for 1 year).</p>
                  <input 
                    type="number" 
                    value={editForm.validityDays} 
                    onChange={e => setEditForm({ ...editForm, validityDays: e.target.value })}
                    required
                    min="1"
                    className="admin-input w-full mt-1 border border-border-gold/50 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-slate-900" 
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wide block">Daily Update Credits</label>
                  <p className="text-[9px] text-text-muted mb-1">Credits automatically awarded to the user every day while the plan is active.</p>
                  <input 
                    type="number" 
                    value={editForm.dailyUpdateCredits} 
                    onChange={e => setEditForm({ ...editForm, dailyUpdateCredits: e.target.value })}
                    min="0"
                    className="admin-input w-full mt-1 border border-border-gold/50 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-slate-900" 
                  />
                </div>
`;

content = content.replace(
  '(<select \n                    value={editForm.creditFrequency}',
  newFields + '\n                $1' // won't match exactly because of newlines, let's use a simpler match
);

content = content.replace(
  /<div className="w-full h-px bg-border-gold\/30 my-2"><\/div>\s*<h4 className="font-extrabold text-xs text-white uppercase tracking-wider">Free Task Config<\/h4>/s,
  newFields + '\n\n                <div className="w-full h-px bg-border-gold/30 my-2"></div>\n                <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">Free Task Config</h4>'
);

fs.writeFileSync('src/components/AdminDashboard.tsx', content, 'utf8');
console.log('Done');
