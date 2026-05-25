import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

// Replace standard initializations to include the new keys
content = content.replace(
  /trialCreditFrequency: "daily",/g,
  'trialCreditFrequency: "daily",\n    validityDays: 30,\n    dailyUpdateCredits: 0,'
);

// We need to match the actual initializers in `plans` definition.
// They use `creditFrequency` as well.
// We'll replace all occurences of `creditFrequency: "(monthly|yearly|weekly|daily)",` with `... \n    validityDays: 30,\n    dailyUpdateCredits: 0,`
// Let's use a dynamic replace.

content = content.replace(
  /creditFrequency: "(monthly|yearly|weekly|daily)",/g,
  'creditFrequency: "$1",\n    validityDays: 30,\n    dailyUpdateCredits: 0,'
);

// Update POST /api/admin/plans
content = content.replace(
  /creditFrequency: data\.creditFrequency \|\| "monthly",/g,
  'creditFrequency: data.creditFrequency || "monthly",\n    validityDays: Number(data.validityDays) || 30,\n    dailyUpdateCredits: Number(data.dailyUpdateCredits) || 0,'
);

// Update PUT /api/admin/plans/:id
content = content.replace(
  /if \(updates\.creditFrequency !== undefined\) \{/g,
  'if (updates.validityDays !== undefined) {\n    plan.validityDays = Number(updates.validityDays) || 30;\n  }\n  if (updates.dailyUpdateCredits !== undefined) {\n    plan.dailyUpdateCredits = Number(updates.dailyUpdateCredits) || 0;\n  }\n  if (updates.creditFrequency !== undefined) {'
);

// Update /api/admin/payments/:paymentId/approve
// const durationDays = payment.isTrial ? (plans.get(payment.selectedPlanId)?.trialDurationDays || 7) : 30;
content = content.replace(
  /const durationDays = payment\.isTrial \? \(plans\.get\(payment\.selectedPlanId\)\?\.trialDurationDays \|\| 7\) : 30;/g,
  'const durationDays = payment.isTrial ? (plans.get(payment.selectedPlanId)?.trialDurationDays || 7) : (plans.get(payment.selectedPlanId)?.validityDays || 30);'
);

// Daily check logic in /api/user/me
// Just before `// Inject or default subscription metadata fields`
const dailyCheckLogic = `
  // Daily credit update logic
  if (req.user.plan && req.user.plan !== "base") {
    const planConfig = plans.get(req.user.plan);
    if (planConfig && planConfig.dailyUpdateCredits > 0) {
      const lastRefresh = req.user.lastDailyCreditRefresh ? new Date(req.user.lastDailyCreditRefresh) : new Date(req.user.subscriptionStartDate || Date.now());
      const now = new Date();
      // Start of day comparison usually is better, but this handles 24h spans
      const daysPassed = Math.floor((now.getTime() - lastRefresh.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysPassed >= 1 && req.user.subscriptionExpires && new Date(req.user.subscriptionExpires).getTime() > now.getTime()) {
        const totalAward = daysPassed * planConfig.dailyUpdateCredits;
        req.user.credits += totalAward;
        req.user.lastDailyCreditRefresh = now.toISOString();
        creditHistoryList.push({
          id: \`txn-\${Date.now()}\`,
          userId: req.user.email,
          amount: totalAward,
          type: "daily_recurring_credits",
          description: \`Daily Plan Credits (\${daysPassed} days)\`,
          date: now.toISOString()
        });
      }
    }
  }

  // Inject or default subscription metadata fields`;

content = content.replace(/\/\/ Inject or default subscription metadata fields/g, dailyCheckLogic);


fs.writeFileSync('server.ts', content, 'utf8');
console.log('Done');
