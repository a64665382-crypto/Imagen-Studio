import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// --- Simple in-memory auth for "secure custom backend" ---
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-123";
const users = new Map<string, any>(); // email -> { id, email, passwordHash, verified, role, credits, plan, signupBonusGranted }
const pendingVerifications = new Map<string, { code: string, expires: number }>(); // email -> { code, expires }
const payments = new Map<string, any>(); // payment_id -> { ...payment_details }
const creditHistoryList: any[] = [];
let appSettings: {
  newUserSignupCredits: number;
  paymentUpi: string;
  creditCost720p: number;
  creditCost1080p: number;
  apiKey?: string;
  useUrl?: boolean;
  apiUrl?: string;
  apiConnected?: boolean;
} = { 
  newUserSignupCredits: 50, 
  paymentUpi: "a64665382@okaxis",
  creditCost720p: 5,
  creditCost1080p: 10,
  apiKey: "",
  useUrl: false,
  apiUrl: "",
  apiConnected: false
};

const plans = new Map<string, any>([
  ["base", {
    id: "base",
    name: "Base",
    type: "base",
    originalPrice: 0,
    offerPrice: null,
    offerStartAt: null,
    offerEndAt: null,
    credits: 200,
    description: "Free plan",
    creditFrequency: "monthly",
    validityDays: 30,
    dailyUpdateCredits: 0,
    defaultForNewUsers: true,
    trialEnabled: false,
    trialDurationDays: 0,
    trialPrice: 0,
    trialCredits: 0,
    trialCreditFrequency: "daily",
    freeTaskEnabled: false,
    freeTaskUrl: "",
    freeTaskHeading: "Subscribe to our YouTube Channel"
  }],
  ["best", {
    id: "best",
    name: "Basic Plan",
    type: "best",
    originalPrice: 100,
    offerPrice: null,
    offerStartAt: null,
    offerEndAt: null,
    credits: 200,
    description: "The best starting plan for quick high-quality renders.",
    creditFrequency: "monthly",
    validityDays: 30,
    dailyUpdateCredits: 0,
    trialEnabled: false,
    trialDurationDays: 3,
    trialPrice: 49,
    trialCredits: 50,
    trialCreditFrequency: "daily",
    freeTaskEnabled: false,
    freeTaskUrl: "",
    freeTaskHeading: "Subscribe to our YouTube Channel"
  }],
  ["pro", {
    id: "pro",
    name: "Pro Plan",
    type: "pro",
    originalPrice: 199,
    offerPrice: null,
    offerStartAt: null,
    offerEndAt: null,
    credits: 10000,
    description: "Perfect for active content creators needing high volumes.",
    creditFrequency: "monthly",
    validityDays: 30,
    dailyUpdateCredits: 0,
    trialEnabled: false,
    trialDurationDays: 7,
    trialPrice: 99,
    trialCredits: 1000,
    trialCreditFrequency: "weekly",
    freeTaskEnabled: false,
    freeTaskUrl: "",
    freeTaskHeading: "Subscribe to our YouTube Channel"
  }],
  ["ultra_premium", {
    id: "ultra_premium",
    name: "Ultra Premium Plan",
    type: "ultra_premium",
    originalPrice: 599,
    offerPrice: null,
    offerStartAt: null,
    offerEndAt: null,
    credits: 100005,
    description: "Unlimited power for high-intensity commercial assets.",
    creditFrequency: "yearly",
    validityDays: 30,
    dailyUpdateCredits: 0,
    trialEnabled: false,
    trialDurationDays: 14,
    trialPrice: 199,
    trialCredits: 10000,
    trialCreditFrequency: "monthly",
    freeTaskEnabled: false,
    freeTaskUrl: "",
    freeTaskHeading: "Subscribe to our YouTube Channel"
  }]
]);

function getActivePrice(plan: any): number {
  let price = Number(plan.originalPrice) || 0;
  if (plan.offerPrice !== null && plan.offerPrice !== undefined && plan.offerPrice !== "") {
    if (isOfferActive(plan)) {
      const off = Number(plan.offerPrice) || 0;
      if (off < price) {
        price = off;
      }
    }
  }
  return price;
}

function isOfferActive(plan: any): boolean {
  if (plan.offerPrice !== null && plan.offerPrice !== undefined && plan.offerPrice !== "") {
    if (plan.offerActive === true) {
      return true;
    }
    const now = Date.now();
    const start = plan.offerStartAt ? new Date(plan.offerStartAt).getTime() : null;
    const end = plan.offerEndAt ? new Date(plan.offerEndAt).getTime() : null;
    
    const isStarted = start ? now >= start : true;
    const isEnded = end ? now > end : false;
    
    return isStarted && !isEnded;
  }
  return false;
}

// Initialize Admin User
try {
  const adminEmail = "a64665382@gmail.com";
  const hash = bcrypt.hashSync("Admin@7790", 10);
  if (!users.has(adminEmail)) {
    users.set(adminEmail, {
      id: "admin-1",
      email: adminEmail,
      passwordHash: hash,
      verified: true,
      role: "admin",
      credits: 1000000,
      plan: "ultra_premium",
      signupBonusGranted: true
    });
  }
} catch(e) {}

// Authenticate Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err: any, tokenUser: any) => {
    if (err) return res.sendStatus(403);
    const user = users.get(tokenUser.email);
    if (!user) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ error: "Access denied." });
  }
};

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing email or password." });
    
    const emailStr = email.trim().toLowerCase();
    
    if (users.has(emailStr)) {
      return res.status(400).json({ error: "An account already exists with this email. Please login." });
    }

    // Hash password 
    const hash = await bcrypt.hash(password, 10);
    
    // Create unverified user
    users.set(emailStr, {
      id: Math.random().toString(36).substring(7),
      email: emailStr,
      passwordHash: hash,
      verified: false,
      role: "user",
      credits: 0,
      plan: "base",
      signupBonusGranted: false
    });

    // Generate random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes
    
    pendingVerifications.set(emailStr, { code, expires });
    
    // Returning the code inline as requested (for on-screen display)
    res.json({ success: true, email: emailStr, verificationCode: code });
  } catch(e) {
    res.status(500).json({ error: "Server error during signup" });
  }
});

app.post("/api/auth/verify", (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: "Missing data." });

  const record = pendingVerifications.get(email);
  if (!record) return res.status(400).json({ error: "No pending verification found." });
  
  if (Date.now() > record.expires) {
    pendingVerifications.delete(email);
    return res.status(400).json({ error: "Verification code expired. Please generate a new code." });
  }
  
  if (record.code !== code) {
    return res.status(400).json({ error: "Invalid verification code." });
  }
  
  // success
  const user = users.get(email);
  if (user) {
    user.verified = true;
    if (!user.signupBonusGranted) {
      let defaultPlan = "base";
      for (const p of plans.values()) {
        if (p.defaultForNewUsers) { defaultPlan = p.id; }
      }
      user.plan = defaultPlan;
      user.credits += appSettings.newUserSignupCredits;
      user.signupBonusGranted = true;
      user.lastBaseCreditsMonth = new Date().toISOString().slice(0, 7); // lock base credits monthly allocation for register month
      const basePlanConfig = plans.get(defaultPlan);
      // Give them initial credits of the default plan too
      if (basePlanConfig && basePlanConfig.credits) {
         user.credits += basePlanConfig.credits;
      }
      creditHistoryList.push({
        id: `txn-${Date.now()}`,
        userId: email,
        amount: appSettings.newUserSignupCredits,
        type: "signup_bonus",
        description: "New user signup bonus",
        date: new Date().toISOString()
      });
    }
  }
  pendingVerifications.delete(email);
  
  // Login
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, token, role: user ? user.role : "user" });
});

app.post("/api/auth/generate-new-code", (req, res) => {
  const { email } = req.body;
  if (!email || !users.has(email)) return res.status(400).json({ error: "User not found." });
  
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 5 * 60 * 1000;
  pendingVerifications.set(email, { code, expires });
  
  res.json({ success: true, email, verificationCode: code });
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing credentials." });
    
    const emailStr = email.trim().toLowerCase();
    const user = users.get(emailStr);
    
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password." });
    }
    if (!user.verified) {
      // resend verification maybe? For now just say error.
      return res.status(403).json({ error: "Account not verified." }); 
    }
    
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ error: "Invalid email or password." });
    
    const token = jwt.sign({ email: emailStr }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, role: user.role });
  } catch(e) {
    res.status(500).json({ error: "Server error during login" });
  }
});

// Track temporary API Quota Exceeded cool-down status
let quotaExceededUntil = 0;

// Initialize GoogleGenAI client lazily to avoid crashing on launch if key is missing initially
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// REST API Endpoints
// Healthcheck
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Public plans listing
app.get("/api/plans", (req, res) => {
  const processedPlans = Array.from(plans.values()).map(p => ({
    ...p,
    activePrice: getActivePrice(p),
    isOfferActive: isOfferActive(p)
  }));
  res.json({ plans: processedPlans });
});

// User profile & plans
app.get("/api/user/me", authenticateToken, (req: any, res: any) => {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  if (req.user.plan === "base" && req.user.lastBaseCreditsMonth !== currentMonth) {
    const basePlanConfig = plans.get("base");
    req.user.credits += basePlanConfig.credits;
    req.user.lastBaseCreditsMonth = currentMonth;
    creditHistoryList.push({
      id: `txn-${Date.now()}`,
      userId: req.user.email,
      amount: basePlanConfig.credits,
      type: "monthly_base_credits",
      description: "Monthly Base Plan Credits",
      date: new Date().toISOString()
    });
  }

  
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
          id: `txn-${Date.now()}`,
          userId: req.user.email,
          amount: totalAward,
          type: "daily_recurring_credits",
          description: `Daily Plan Credits (${daysPassed} days)`,
          date: now.toISOString()
        });
      }
    }
  }

  // Inject or default subscription metadata fields
  if (req.user.plan && req.user.plan !== "base") {
    if (!req.user.subscriptionStartDate) {
      req.user.subscriptionStartDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    }
    if (!req.user.subscriptionExpires) {
      req.user.subscriptionExpires = new Date(Date.now() + ((plans.get(req.user.plan)?.validityDays || 30) - 2) * 24 * 60 * 60 * 1000).toISOString();
    }
    if (req.user.subscriptionCost === undefined) {
      const planConfig = plans.get(req.user.plan);
      req.user.subscriptionCost = planConfig ? (planConfig.price || 49) : 49;
    }
  } else {
    // base plan
    if (!req.user.subscriptionStartDate) {
      req.user.subscriptionStartDate = new Date().toISOString();
    }
    req.user.subscriptionExpires = "Lifetime";
    req.user.subscriptionCost = 0;
  }

  const { passwordHash, ...safeUser } = req.user;
  
  const processedPlans = Array.from(plans.values()).map(p => ({
    ...p,
    activePrice: getActivePrice(p),
    isOfferActive: isOfferActive(p)
  }));
  
  res.json({ user: safeUser, plans: processedPlans, appSettings });
});

// Admin Users API
app.get("/api/admin/users", authenticateToken, requireAdmin, (req: any, res: any) => {
  const safeUsers = Array.from(users.values()).map(u => {
    const { passwordHash, ...rest } = u;
    return rest;
  });
  res.json({ users: safeUsers, appSettings });
});

app.post("/api/admin/users/:userId/adjust", authenticateToken, requireAdmin, (req: any, res: any) => {
  const { userId } = req.params;
  const { creditsToAdd, newPlanId, grantPlanCredits, creditReason, absoluteCredits } = req.body;

  const targetUser = Array.from(users.values()).find(u => u.id === userId);
  if (!targetUser) {
    return res.status(404).json({ error: "User not found." });
  }

  // Handle absolute credits replacement
  if (absoluteCredits !== undefined && absoluteCredits !== null && absoluteCredits !== "") {
    const creds = Number(absoluteCredits);
    if (isNaN(creds) || creds < 0 || !Number.isInteger(creds)) {
      return res.status(400).json({ error: "Absolute credits must be a non-negative integer." });
    }
    const diff = creds - targetUser.credits;
    targetUser.credits = creds;

    creditHistoryList.push({
      id: `txn-manual-set-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: targetUser.email,
      amount: diff,
      type: "admin_manual_set",
      description: creditReason || `Admin manual credit adjustment set to ${creds}`,
      date: new Date().toISOString()
    });
  } else if (creditsToAdd !== undefined && creditsToAdd !== null && creditsToAdd !== 0) {
    // Handle credits addition
    const creds = Number(creditsToAdd);
    if (isNaN(creds) || creds < 0 || !Number.isInteger(creds)) {
      return res.status(400).json({ error: "Credits to add must be a positive integer." });
    }
    targetUser.credits += creds;

    creditHistoryList.push({
      id: `txn-manual-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: targetUser.email,
      amount: creds,
      type: "admin_manual_grant",
      description: creditReason || "Admin manual credit grant",
      date: new Date().toISOString()
    });
  }

  // Handle plan assignment
  if (newPlanId !== undefined && newPlanId !== null && newPlanId !== "") {
    const plan = plans.get(newPlanId);
    if (!plan) {
      return res.status(400).json({ error: "Invalid plan ID." });
    }

    targetUser.plan = newPlanId;

    if (grantPlanCredits) {
      targetUser.credits += plan.credits;
      creditHistoryList.push({
        id: `txn-plan-grant-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        userId: targetUser.email,
        amount: plan.credits,
        type: "admin_plan_grant",
        description: `Plan assigned: ${plan.name} (granted default credits: ${plan.credits})`,
        date: new Date().toISOString()
      });
    } else {
      creditHistoryList.push({
        id: `txn-plan-change-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        userId: targetUser.email,
        amount: 0,
        type: "admin_plan_change",
        description: `Plan assigned: ${plan.name} (no credit changes)`,
        date: new Date().toISOString()
      });
    }
  }

  users.set(targetUser.email, targetUser);

  res.json({
    success: true,
    user: {
      id: targetUser.id,
      email: targetUser.email,
      role: targetUser.role,
      credits: targetUser.credits,
      plan: targetUser.plan
    }
  });
});

// Admin Plans API
app.get("/api/admin/plans", authenticateToken, requireAdmin, (req: any, res: any) => {
  const processedPlans = Array.from(plans.values()).map(p => ({
    ...p,
    activePrice: getActivePrice(p),
    isOfferActive: isOfferActive(p)
  }));
  res.json({ plans: processedPlans });
});

app.post("/api/admin/plans", authenticateToken, requireAdmin, (req: any, res: any) => {
  const data = req.body;
  if (!data.name || !data.type) {
    return res.status(400).json({ error: "Plan name and type are required." });
  }
  const id = data.type; // using type as id for simplicity
  if (plans.has(id)) {
    return res.status(400).json({ error: "A plan with this type ID already exists." });
  }

  const originalPrice = Number(data.originalPrice) || 0;
  const credits = Number(data.credits) || 0;

  let offerPrice = null;
  if (data.offerPrice !== undefined && data.offerPrice !== null && data.offerPrice !== "") {
    offerPrice = Number(data.offerPrice);
    if (isNaN(offerPrice) || offerPrice < 0) {
      return res.status(400).json({ error: "Offer price must be 0 or greater." });
    }
    if (offerPrice > originalPrice) {
      return res.status(400).json({ error: "Offer price must not be greater than original price." });
    }
  }

  let offerStartAt = null;
  let offerEndAt = null;
  if (data.offerStartAt && data.offerEndAt) {
    const start = new Date(data.offerStartAt).getTime();
    const end = new Date(data.offerEndAt).getTime();
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ error: "Offer dates must be valid format." });
    }
    offerStartAt = data.offerStartAt;
    offerEndAt = data.offerEndAt;
  }

  const newPlan = {
    id,
    name: data.name,
    type: id,
    originalPrice,
    offerPrice,
    offerStartAt,
    offerEndAt,
    credits,
    description: data.description || "",
    creditFrequency: data.creditFrequency || "monthly",
    validityDays: Number(data.validityDays) || 30,
    dailyUpdateCredits: Number(data.dailyUpdateCredits) || 0,
    defaultForNewUsers: !!data.defaultForNewUsers,
    trialEnabled: !!data.trialEnabled,
    trialDurationDays: Number(data.trialDurationDays) || 0,
    trialPrice: Number(data.trialPrice) || 0,
    trialCredits: Number(data.trialCredits) || 0,
    trialCreditFrequency: data.trialCreditFrequency || "daily",
    freeTaskEnabled: !!data.freeTaskEnabled,
    freeTaskUrl: data.freeTaskUrl || "",
    freeTaskHeading: data.freeTaskHeading || "Subscribe to our YouTube Channel"
  };

  plans.set(id, newPlan);
  res.json({ success: true, plan: newPlan });
});

app.delete("/api/admin/plans/:id", authenticateToken, requireAdmin, (req: any, res: any) => {
  const { id } = req.params;
  if (!plans.has(id)) return res.status(404).json({ error: "Plan not found." });
  
  plans.delete(id);
  res.json({ success: true });
});

app.put("/api/admin/plans/:id", authenticateToken, requireAdmin, (req: any, res: any) => {
  const { id } = req.params;
  const updates = req.body;
  if (!plans.has(id)) return res.status(404).json({ error: "Plan not found." });
  const plan = plans.get(id);
  
  // Validation
  if (updates.originalPrice !== undefined) {
    const orig = Number(updates.originalPrice);
    if (isNaN(orig) || orig < 0) return res.status(400).json({ error: "Original price must be 0 or greater." });
  }
  if (updates.credits !== undefined) {
    const creds = Number(updates.credits);
    if (isNaN(creds) || creds < 0) return res.status(400).json({ error: "Credits must be a non-negative whole number." });
  }
  if (updates.offerPrice !== undefined && updates.offerPrice !== null && updates.offerPrice !== "") {
    const off = Number(updates.offerPrice);
    if (isNaN(off) || off < 0) {
      return res.status(400).json({ error: "Offer price must be 0 or greater." });
    }
    const originalPrice = updates.originalPrice !== undefined ? Number(updates.originalPrice) : plan.originalPrice;
    if (off > originalPrice) {
      return res.status(400).json({ error: "Offer price must not be greater than original price." });
    }
  }
  if (updates.offerStartAt !== undefined && updates.offerStartAt && updates.offerEndAt !== undefined && updates.offerEndAt) {
    const start = new Date(updates.offerStartAt).getTime();
    const end = new Date(updates.offerEndAt).getTime();
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ error: "Offer dates must be valid format." });
    }
    if (end <= start) {
      return res.status(400).json({ error: "Offer end date/time must be later than offer start date/time." });
    }
  }

  if (updates.name !== undefined) plan.name = updates.name;
  if (updates.originalPrice !== undefined) plan.originalPrice = Number(updates.originalPrice);
  if (updates.description !== undefined) plan.description = updates.description;
  if (updates.credits !== undefined) plan.credits = Number(updates.credits);
  
  if (updates.defaultForNewUsers !== undefined) {
    if (updates.defaultForNewUsers) {
      // Clear flag from other plans if only one can be default
      for (const p of plans.values()) p.defaultForNewUsers = false;
    }
    plan.defaultForNewUsers = Boolean(updates.defaultForNewUsers);
  }
  
  if (updates.offerPrice !== undefined) {
    plan.offerPrice = (updates.offerPrice === null || updates.offerPrice === "") ? null : Number(updates.offerPrice);
  }
  if (updates.offerActive !== undefined) {
    plan.offerActive = Boolean(updates.offerActive);
    if (plan.offerActive) {
      plan.offerStartAt = updates.offerStartAt || plan.offerStartAt || new Date().toISOString();
      plan.offerEndAt = null;
    } else {
      plan.offerEndAt = updates.offerEndAt || new Date().toISOString();
    }
  } else {
    if (updates.offerStartAt !== undefined) {
      plan.offerStartAt = updates.offerStartAt || null;
    }
    if (updates.offerEndAt !== undefined) {
      plan.offerEndAt = updates.offerEndAt || null;
    }
  }

  // Supporting regular and trial configurations
  if (updates.validityDays !== undefined) {
    plan.validityDays = Number(updates.validityDays) || 30;
  }
  if (updates.dailyUpdateCredits !== undefined) {
    plan.dailyUpdateCredits = Number(updates.dailyUpdateCredits) || 0;
  }
  if (updates.creditFrequency !== undefined) {
    plan.creditFrequency = updates.creditFrequency || "monthly";
  }
  if (updates.trialEnabled !== undefined) {
    plan.trialEnabled = Boolean(updates.trialEnabled);
  }
  if (updates.trialDurationDays !== undefined) {
    plan.trialDurationDays = Number(updates.trialDurationDays) || 0;
  }
  if (updates.trialPrice !== undefined) {
    plan.trialPrice = Number(updates.trialPrice) || 0;
  }
  if (updates.trialCredits !== undefined) {
    plan.trialCredits = Number(updates.trialCredits) || 0;
  }
  if (updates.trialCreditFrequency !== undefined) {
    plan.trialCreditFrequency = updates.trialCreditFrequency || "daily";
  }

  // Supporting Free YouTube Task configuration
  if (updates.freeTaskEnabled !== undefined) {
    plan.freeTaskEnabled = Boolean(updates.freeTaskEnabled);
  }
  if (updates.freeTaskUrl !== undefined) {
    plan.freeTaskUrl = String(updates.freeTaskUrl);
  }
  if (updates.freeTaskHeading !== undefined) {
    plan.freeTaskHeading = String(updates.freeTaskHeading);
  }
  
  res.json({ success: true, plan });
});

// User Claim Free Plan via YouTube Subscription Task
app.post("/api/plans/:id/claim-free", authenticateToken, (req: any, res: any) => {
  const { id } = req.params;
  const plan = plans.get(id);
  if (!plan) {
    return res.status(404).json({ error: "Plan not found." });
  }
  if (!plan.freeTaskEnabled || !plan.freeTaskUrl) {
    return res.status(400).json({ error: "Free subscription task is not active for this plan." });
  }

  const targetUser = req.user;
  if (!targetUser) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  targetUser.completedFreeTasks = targetUser.completedFreeTasks || [];
  if (targetUser.completedFreeTasks.includes(id)) {
    return res.status(400).json({ error: "You have already claimed this plan for free!" });
  }

  // Assign the plan of the user
  targetUser.plan = id;
  // Award the plan's baseline credits successfully
  targetUser.credits += plan.credits;
  // Audit-trail tracking the claimed free task
  targetUser.completedFreeTasks = targetUser.completedFreeTasks || [];
  targetUser.completedFreeTasks.push(id);

  // Set explicit subscription date details
  targetUser.subscriptionStartDate = new Date().toISOString();
  targetUser.subscriptionExpires = new Date(Date.now() + (plan.validityDays || 30) * 24 * 60 * 60 * 1000).toISOString();
  targetUser.subscriptionCost = 0; // Claimed free of charge

  creditHistoryList.push({
    id: `txn-${Date.now()}`,
    userId: targetUser.email,
    amount: plan.credits,
    type: "free_task_reward",
    description: `Claimed Free Plan (${plan.name}) via social task: ${plan.freeTaskHeading}`,
    date: new Date().toISOString()
  });

  res.json({
    success: true,
    user: {
      id: targetUser.id,
      email: targetUser.email,
      role: targetUser.role,
      credits: targetUser.credits,
      plan: targetUser.plan,
      completedFreeTasks: targetUser.completedFreeTasks,
      subscriptionStartDate: targetUser.subscriptionStartDate,
      subscriptionExpires: targetUser.subscriptionExpires,
      subscriptionCost: targetUser.subscriptionCost
    }
  });
});

// Admin Settings
app.put("/api/admin/settings", authenticateToken, requireAdmin, (req: any, res: any) => {
  const { newUserSignupCredits, paymentUpi, apiKey, useUrl, apiUrl, testConnection, creditCost720p, creditCost1080p } = req.body;
  if (newUserSignupCredits !== undefined) {
    const creds = Number(newUserSignupCredits);
    if (isNaN(creds) || creds < 0) {
      return res.status(400).json({ error: "New user signup credits cannot be negative." });
    }
    appSettings.newUserSignupCredits = Math.floor(creds);
  }
  if (creditCost720p !== undefined && !isNaN(Number(creditCost720p))) {
    appSettings.creditCost720p = Math.floor(Number(creditCost720p));
  }
  if (creditCost1080p !== undefined && !isNaN(Number(creditCost1080p))) {
    appSettings.creditCost1080p = Math.floor(Number(creditCost1080p));
  }
  if (paymentUpi !== undefined && paymentUpi !== null) {
    appSettings.paymentUpi = String(paymentUpi).trim();
  }
  if (apiKey !== undefined) {
    appSettings.apiKey = apiKey;
    appSettings.useUrl = Boolean(useUrl);
    appSettings.apiUrl = apiUrl;
    
    // Mock connection test
    if (testConnection) {
        if (!apiKey) {
            appSettings.apiConnected = false;
        } else if (useUrl && !apiUrl) {
            appSettings.apiConnected = false;
        } else {
            appSettings.apiConnected = true;
        }
    }
  }
  res.json({ success: true, appSettings });
});

// Dynamic QR redirect endpoint for payment
app.get("/payment-qr.png", (req, res) => {
  const upi = appSettings.paymentUpi || "a64665382@okaxis";
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(`upi://pay?pa=${upi}&pn=Imagen Studio&cu=INR`)}`;
  res.redirect(url);
});

// Payments flow
app.post("/api/payments", authenticateToken, (req: any, res: any) => {
  const { planId, utrNumber, isTrial } = req.body;
  if (!utrNumber || !planId) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const plan = plans.get(planId);
  if (!plan) return res.status(400).json({ error: "Invalid plan selected." });
  
  let finalPrice = getActivePrice(plan);
  let finalCredits = plan.credits;
  let nameSnapshot = plan.name;
  let isTrialApplied = false;

  if (isTrial && plan.trialEnabled) {
    finalPrice = plan.trialPrice;
    finalCredits = plan.trialCredits;
    nameSnapshot = `${plan.name} (Trial Phase)`;
    isTrialApplied = true;
  }

  const paymentId = `pay-${Date.now()}`;
  payments.set(paymentId, {
    paymentId,
    userId: req.user.id,
    userEmail: req.user.email,
    utrNumber,
    selectedPlanId: planId,
    selectedPlanNameSnapshot: nameSnapshot,
    payableAmountSnapshot: finalPrice,
    creditsSnapshot: finalCredits,
    offerAppliedSnapshot: !isTrialApplied && isOfferActive(plan),
    isTrial: isTrialApplied,
    status: "Pending Verification",
    submittedAt: new Date().toISOString()
  });

  res.json({ success: true, paymentId });
});

app.get("/api/payments/me", authenticateToken, (req: any, res: any) => {
  const myPayments = Array.from(payments.values()).filter(p => p.userId === req.user.id);
  res.json({ payments: myPayments });
});

// Admin Payments Management
app.get("/api/admin/payments", authenticateToken, requireAdmin, (req: any, res: any) => {
  res.json({ payments: Array.from(payments.values()) });
});

app.post("/api/admin/payments/:paymentId/approve", authenticateToken, requireAdmin, (req: any, res: any) => {
  const { paymentId } = req.params;
  const payment = payments.get(paymentId);
  if (!payment) return res.status(404).json({ error: "Payment not found." });
  if (payment.status !== "Pending Verification") return res.status(400).json({ error: "Payment already processed." });
  
  payment.status = "Approved";
  payment.reviewedAt = new Date().toISOString();
  payment.reviewedBy = req.user.email;
  
  const targetUser = Array.from(users.values()).find(u => u.id === payment.userId);
  if (targetUser) {
    targetUser.credits += payment.creditsSnapshot;
    targetUser.plan = payment.selectedPlanId;

    // Record subscription details
    targetUser.subscriptionStartDate = new Date().toISOString();
    const durationDays = payment.isTrial ? (plans.get(payment.selectedPlanId)?.trialDurationDays || 7) : (plans.get(payment.selectedPlanId)?.validityDays || 30);
    targetUser.subscriptionExpires = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
    targetUser.subscriptionCost = payment.payableAmountSnapshot;

    creditHistoryList.push({
      id: `txn-${Date.now()}`,
      userId: targetUser.email,
      amount: payment.creditsSnapshot,
      type: "approved_plan_purchase",
      description: `Plan activated: ${payment.selectedPlanNameSnapshot}`,
      date: new Date().toISOString(),
      paymentId
    });
  }

  res.json({ success: true, payment });
});

app.post("/api/admin/payments/:paymentId/reject", authenticateToken, requireAdmin, (req: any, res: any) => {
  const { paymentId } = req.params;
  const payment = payments.get(paymentId);
  if (!payment) return res.status(404).json({ error: "Payment not found." });
  if (payment.status !== "Pending Verification") return res.status(400).json({ error: "Payment already processed." });
  
  payment.status = "Rejected";
  payment.reviewedAt = new Date().toISOString();
  payment.reviewedBy = req.user.email;
  
  res.json({ success: true, payment });
});

// Generate Cost endpoint (verify and deduct)
app.post("/api/generations/start", authenticateToken, (req: any, res: any) => {
  const { quality } = req.body;
  let cost = appSettings.creditCost720p;
  if (quality === "1080p") cost = appSettings.creditCost1080p;

  if (req.user.credits < cost) {
    return res.status(400).json({ error: "Insufficient credits. Please choose a plan to continue.", cost, currentCredits: req.user.credits });
  }
  
  res.json({ success: true, cost });
});

app.post("/api/generations/complete", authenticateToken, (req: any, res: any) => {
  const { quality } = req.body;
  let cost = appSettings.creditCost720p;
  if (quality === "1080p") cost = appSettings.creditCost1080p;
  
  if (req.user.credits >= cost) {
    req.user.credits -= cost;
    creditHistoryList.push({
      id: `txn-${Date.now()}`,
      userId: req.user.email,
      amount: -cost,
      type: `image_generation_${quality}`,
      description: `Image generated - ${quality}`,
      date: new Date().toISOString()
    });
    res.json({ success: true, cost, remainingCredits: req.user.credits });
  } else {
    // Edge case if somehow they generated concurrently and ran out
    res.status(400).json({ error: "Insufficient credits for this generation." });
  }
});



app.get("/api/models", async (req, res) => {
  try {
    const rs = await fetch("https://ai.api.nvidia.com/v1/models", {
      headers: { Authorization: "Bearer " + process.env.NVIDIA_API_KEY }
    });
    const text = await rs.text();
    res.send(text);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Setup Flux generation route only. Removed old provider/fallback logic as requested.
app.post("/api/generate-image", authenticateToken, async (req: any, res: any) => {
  try {
    const { prompt, width = 1024, height = 1024, references = [] } = req.body;
    
    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "NVIDIA API key not configured." });
    }
    
    // Flux generation endpoint
    let nvidiaUrl = "https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell";
    
    // We must pass appropriate width/height (only some values are supported).
    let selectedWidth = 1024;
    let selectedHeight = 1024;
    
    const ratio = width / height;
    if (ratio >= 1.7) { // ~16:9
        selectedWidth = 1344;
        selectedHeight = 768;
    } else if (ratio <= 0.6) { // ~9:16
        selectedWidth = 768;
        selectedHeight = 1344;
    } else if (ratio > 1.2) { // ~4:3
        selectedWidth = 1024;
        selectedHeight = 768;
    } else if (ratio < 0.9) { // ~3:4
        selectedWidth = 768;
        selectedHeight = 1024;
    } else { // ~1:1
        selectedWidth = 1024;
        selectedHeight = 1024;
    }

    const payload: any = {
        prompt: prompt,
        width: selectedWidth,
        height: selectedHeight
        // Flux doesn't like passing image references. We won't include them to prevent errors.
    };
    
    const nvidiaResponse = await fetch(nvidiaUrl, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (nvidiaResponse.ok) {
        const data: any = await nvidiaResponse.json();
        // Assuming base64 format for image output from Flux model
        const b64 = data?.artifacts?.[0]?.base64 || data?.image?.b64_json || data?.b64_json || data?.data?.[0]?.b64_json;
        if (b64) {
            const buf = Buffer.from(b64, "base64");
            res.setHeader("Content-Type", "image/png");
            return res.send(buf);
        } else {
            return res.status(500).json({ error: "No image data returned from NVIDIA API." });
        }
    } else {
        const status = nvidiaResponse.status;
        const errText = await nvidiaResponse.text();
        console.error("NVIDIA API error response:", errText);
        
        if (status === 401 || status === 403) {
            return res.status(500).json({ error: "NVIDIA image service authentication failed. Please verify the API configuration." });
        } else if (status === 400 || status === 422) {
            return res.status(500).json({ error: "This ratio or quality is not supported by the current NVIDIA model." });
        } else {
            return res.status(500).json({ error: "NVIDIA image generation failed. Please retry." });
        }
    }
    
    return res.status(500).json({ error: "NVIDIA image generation failed. Please retry." });
    
  } catch (error) {
    console.error("Generation proxy error:", error);
    res.status(500).json({ error: "Image generation failed. Please retry." });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware loaded.");
  } else {
    // Serve production static assets from dist
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();