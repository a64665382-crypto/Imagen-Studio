import React, { useState, useEffect } from "react";
import { LogOut, Users, FileText, CheckCircle, XCircle, LayoutDashboard, Database, ArrowLeft, Plus, Trash2, Key } from "lucide-react";

interface AdminDashboardProps {
  onLogout: () => void;
  onBackToWorkspace: () => void;
}

export default function AdminDashboard({ onLogout, onBackToWorkspace }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "plans" | "payments" | "api">("overview");
  const [data, setData] = useState<any>({ users: [], plans: [], payments: [], appSettings: {} });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
  const [inlineCredits, setInlineCredits] = useState<{ [userId: string]: string }>({});
  const [updatingCreditsId, setUpdatingCreditsId] = useState<string | null>(null);
  const [userFilter, setUserFilter] = useState<"all" | "new_signups">("all");
  const [apiForm, setApiForm] = useState({ apiKey: "", useUrl: false, apiUrl: "" });
  const [apiConnected, setApiConnected] = useState(false);

  useEffect(() => {
    if (data.appSettings) {
      setApiForm({
        apiKey: data.appSettings.apiKey || "",
        useUrl: data.appSettings.useUrl || false,
        apiUrl: data.appSettings.apiUrl || ""
      });
      setApiConnected(!!data.appSettings.apiConnected);
    }
  }, [data.appSettings]);

  const saveCreditsInline = async (userId: string, email: string) => {
    const rawVal = inlineCredits[userId];
    if (rawVal === undefined || rawVal === "") return;
    const creditsNum = Math.floor(Number(rawVal));
    if (isNaN(creditsNum) || creditsNum < 0) {
      alert("Please enter a valid credit number (must be >= 0).");
      return;
    }

    const token = localStorage.getItem("whisk_auth_token");
    if (!token) return;

    setUpdatingCreditsId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          absoluteCredits: creditsNum,
          creditReason: `Admin inline adjustment for user ${email}`
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || "Failed to update credits.");
      } else {
        setInlineCredits(prev => {
          const next = { ...prev };
          delete next[userId];
          return next;
        });
        fetchData();
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setUpdatingCreditsId(null);
    }
  };
  const [editForm, setEditForm] = useState<any>({
    name: "",
    originalPrice: 0,
    offerPrice: "",
    offerStartAt: "",
    offerEndAt: "",
    credits: 0,
    description: ""
  });
  const [modalError, setModalError] = useState("");

  // Manual User adjustment states
  const [selectedUserForAdjustment, setSelectedUserForAdjustment] = useState<any | null>(null);
  const [adjustForm, setAdjustForm] = useState<any>({
    creditsToAdd: "",
    creditReason: "",
    newPlanId: "",
    grantPlanCredits: false
  });
  const [adjustError, setAdjustError] = useState("");
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);

  const startAdjustingUser = (user: any) => {
    setSelectedUserForAdjustment(user);
    setAdjustForm({
      creditsToAdd: "",
      creditReason: "Admin manual credit grant",
      newPlanId: user.plan || "base",
      grantPlanCredits: false
    });
    setAdjustError("");
    setAdjustSubmitting(false);
  };

  const handleSaveUserAdjustments = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdjustError("");
    const token = localStorage.getItem("whisk_auth_token");
    if (!token) return;

    const credsToAdd = adjustForm.creditsToAdd !== "" ? Number(adjustForm.creditsToAdd) : 0;
    if (isNaN(credsToAdd) || credsToAdd < 0 || !Number.isInteger(credsToAdd)) {
      setAdjustError("Credits to add must be a positive integer.");
      return;
    }

    setAdjustSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUserForAdjustment.id}/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          creditsToAdd: credsToAdd,
          newPlanId: adjustForm.newPlanId,
          grantPlanCredits: adjustForm.grantPlanCredits,
          creditReason: adjustForm.creditReason
        })
      });

      const resData = await res.json();
      if (!res.ok) {
        setAdjustError(resData.error || "Failed to save adjustments.");
      } else {
        setSelectedUserForAdjustment(null);
        fetchData();
      }
    } catch(err) {
      setAdjustError("Network error.");
    } finally {
      setAdjustSubmitting(false);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("whisk_auth_token");
    if (!token) return;

    try {
      const [uRes, pRes, payRes] = await Promise.all([
        fetch("/api/admin/users", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("/api/admin/plans", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("/api/admin/payments", { headers: { "Authorization": `Bearer ${token}` } })
      ]);

      const [uData, pData, payData] = await Promise.all([uRes.json(), pRes.json(), payRes.json()]);
      setData({
        users: uData.users || [],
        plans: pData.plans || [],
        payments: payData.payments || [],
        appSettings: uData.appSettings || {}
      });
      setErrorMsg("");
    } catch(err) {
      setErrorMsg("Failed to load admin data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const startAddingPlan = () => {
    setEditingPlan({ id: "new", type: "new", name: "New Plan" });
    setEditForm({
      name: "",
      type: "", // unique identifier
      originalPrice: 0,
      offerPrice: "",
      offerStartAt: "",
      offerEndAt: "",
      offerActive: false,
      credits: 0,
      description: "",
      creditFrequency: "monthly",
      validityDays: 30,
      dailyUpdateCredits: 0,
      defaultForNewUsers: false,
      trialEnabled: false,
      trialDurationDays: 0,
      trialPrice: 0,
      trialCredits: 0,
      trialCreditFrequency: "daily",
      freeTaskEnabled: false,
      freeTaskUrl: "",
      freeTaskHeading: "Subscribe to our YouTube Channel",
      showFirstAsPopup: false
    });
    setModalError("");
  };

  const startEditingPlan = (plan: any) => {
    setEditingPlan(plan);
    setEditForm({
      name: plan.name || "",
      type: plan.type || plan.id || "",
      originalPrice: plan.originalPrice || 0,
      offerPrice: plan.offerPrice !== null && plan.offerPrice !== undefined ? String(plan.offerPrice) : "",
      offerStartAt: plan.offerStartAt || "",
      offerEndAt: plan.offerEndAt || "",
      offerActive: !!plan.offerActive,
      credits: plan.credits || 0,
      description: plan.description || "",
      creditFrequency: plan.creditFrequency || "monthly",
      validityDays: plan.validityDays !== undefined ? plan.validityDays : 30,
      dailyUpdateCredits: plan.dailyUpdateCredits || 0,
      defaultForNewUsers: plan.defaultForNewUsers || false,
      trialEnabled: plan.trialEnabled || false,
      trialDurationDays: plan.trialDurationDays || 0,
      trialPrice: plan.trialPrice || 0,
      trialCredits: plan.trialCredits || 0,
      trialCreditFrequency: plan.trialCreditFrequency || "daily",
      freeTaskEnabled: plan.freeTaskEnabled || false,
      freeTaskUrl: plan.freeTaskUrl || "",
      freeTaskHeading: plan.freeTaskHeading || "Subscribe to our YouTube Channel",
      showFirstAsPopup: plan.showFirstAsPopup || false
    });
    setModalError("");
  };

  const handleDeletePlan = async (id: string) => {
    const token = localStorage.getItem("whisk_auth_token");
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/plans/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setDeletingPlanId(null);
        fetchData();
      } else {
        const errorData = await res.json();
        setErrorMsg(errorData.error || "Failed to delete plan.");
      }
    } catch (e) {
      setErrorMsg("Network error.");
    }
  };

  const handleSavePlanUpdates = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    const token = localStorage.getItem("whisk_auth_token");
    if (!token) return;

    // validation
    if (editingPlan.id === "new" && !editForm.type) {
      setModalError("Plan Type ID is required for a new plan.");
      return;
    }
    const orig = Number(editForm.originalPrice);
    if (isNaN(orig) || orig < 0) {
      setModalError("Original price must be 0 or greater.");
      return;
    }

    const creds = Number(editForm.credits);
    if (isNaN(creds) || creds < 0) {
      setModalError("Credits must be a non-negative whole number.");
      return;
    }

    let offPrice: number | null = null;
    if (editForm.offerPrice !== "") {
      const offVal = Number(editForm.offerPrice);
      if (isNaN(offVal) || offVal < 0) {
        setModalError("Offer price must be a non-negative number.");
        return;
      }
      if (offVal > orig) {
        setModalError("Offer price cannot exceed original price.");
        return;
      }
      offPrice = offVal;
    }

    if (editForm.offerStartAt && editForm.offerEndAt) {
      const start = new Date(editForm.offerStartAt).getTime();
      const end = new Date(editForm.offerEndAt).getTime();
      if (isNaN(start) || isNaN(end)) {
        setModalError("Offer dates must be valid format.");
        return;
      }
      if (end <= start) {
        setModalError("Offer end date/time must be later than offer start date/time.");
        return;
      }
    }

    const isNew = editingPlan.id === "new";
    const endpoint = isNew ? `/api/admin/plans` : `/api/admin/plans/${editingPlan.id}`;
    const method = isNew ? "POST" : "PUT";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          name: editForm.name,
          type: editForm.type,
          originalPrice: orig,
          offerPrice: offPrice,
          offerStartAt: editForm.offerStartAt || null,
          offerEndAt: editForm.offerEndAt || null,
          offerActive: editForm.offerActive,
          credits: creds,
          description: editForm.description,
          creditFrequency: editForm.creditFrequency,
          validityDays: Number(editForm.validityDays),
          dailyUpdateCredits: Number(editForm.dailyUpdateCredits),
          defaultForNewUsers: editForm.defaultForNewUsers,
          trialEnabled: editForm.trialEnabled,
          trialDurationDays: Number(editForm.trialDurationDays),
          trialPrice: Number(editForm.trialPrice),
          trialCredits: Number(editForm.trialCredits),
          trialCreditFrequency: editForm.trialCreditFrequency,
          freeTaskEnabled: editForm.freeTaskEnabled,
          freeTaskUrl: editForm.freeTaskUrl,
          freeTaskHeading: editForm.freeTaskHeading,
          showFirstAsPopup: editForm.showFirstAsPopup
        })
      });
      const resData = await res.json();
      if (!res.ok) {
        setModalError(resData.error || "Failed to save plan.");
      } else {
        setEditingPlan(null);
        fetchData();
      }
    } catch(err) {
      setModalError("Error saving updates.");
    }
  };

  const handleUpdateSignupCredits = async () => {
    const token = localStorage.getItem("whisk_auth_token");
    const credits = parseInt(prompt("Enter new signup bonus credits (cannot be negative):", data.appSettings.newUserSignupCredits) || String(data.appSettings.newUserSignupCredits));
    if (isNaN(credits) || credits < 0) {
      alert("Invalid selection. Signup credits must be a valid non-negative whole number.");
      return;
    }
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ newUserSignupCredits: credits })
    });
    fetchData();
  };

  const handleUpdateImageCost = async (key: string, currentVal: number) => {
    const token = localStorage.getItem("whisk_auth_token");
    let label = '1080p';
    if (key === 'creditCost720p') label = '720p';
    const val = parseInt(prompt(`Enter new cost for ${label} (cannot be negative):`, String(currentVal)) || String(currentVal));
    if (isNaN(val) || val < 0) {
      alert("Invalid selection. Cost must be a valid non-negative whole number.");
      return;
    }
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ [key]: val })
    });
    fetchData();
  };

  const handleUpdatePaymentUpi = async () => {
    const token = localStorage.getItem("whisk_auth_token");
    const upi = prompt("Enter new Payment UPI ID:", data.appSettings.paymentUpi || "a64665382@okaxis");
    if (upi === null) return;
    const trimmed = upi.trim();
    if (!trimmed) {
      alert("Invalid selection. UPI ID cannot be empty.");
      return;
    }
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ paymentUpi: trimmed })
    });
    fetchData();
  };

  const handleUpdateApiSettings = async (updates: any) => {
    const token = localStorage.getItem("whisk_auth_token");
    if (!token) return;
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(updates)
    });
    fetchData();
  };

  const handleTogglePlanOffer = async (planId: string, currentActive: boolean) => {
    const token = localStorage.getItem("whisk_auth_token");
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/plans/${planId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ offerActive: !currentActive })
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.error || "Failed to toggle offer.");
      } else {
        fetchData();
      }
    } catch (err) {
      alert("Network error.");
    }
  };

  const handleProcessPayment = async (paymentId: string, action: "approve" | "reject") => {
    const token = localStorage.getItem("whisk_auth_token");
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/${action}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
      } else {
        const errData = await res.json();
        alert(errData.error || `Failed to ${action} payment.`);
      }
    } catch(e) {
      alert("Failed to process payment.");
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "plans", label: "Plans", icon: Database },
    { id: "payments", label: "Payments", icon: FileText },
    { id: "api", label: "API Integration", icon: Key }
  ] as const;

  return (
    <div className="h-screen w-screen bg-bg-primary text-text-main flex flex-col font-sans select-none antialiased animate-slide-up-fade">
      <header className="w-full bg-bg-secondary/80 flex border-b border-border-gold backdrop-blur-md border-b border-border-gold px-6 py-4 flex items-center justify-between shrink-0 relative z-10 shadow-sm">
        <div className="flex items-center gap-4 text-white">
          <button 
            onClick={onBackToWorkspace}
            className="p-1.5 hover:bg-bg-elevated/50 rounded text-text-muted hover:text-white transition flex items-center justify-center cursor-pointer"
            title="Back to Workspace"
          >
             <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-bg-elevated/50"></div>
          <Users className="w-5 h-5 text-gold-primary fill-current" />
          <h1 className="font-black text-sm tracking-widest uppercase text-white shadow-sm">Admin Control Panel</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-950/30 hover:bg-red-900/50 text-red-500 font-bold text-[10px] tracking-wider uppercase rounded-xl border border-red-500/30 transition-all cursor-pointer whitespace-nowrap"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout Admin</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex relative z-0">
        {/* Sidebar */}
        <div className="w-64 bg-bg-elevated border-r border-border-gold p-4 shrink-0 flex flex-col gap-2 shadow-xl shadow-black/20">
           {tabs.map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition uppercase tracking-wide cursor-pointer ${
                 activeTab === tab.id 
                  ? "bg-gold-primary text-white shadow-[0_0_10px_rgba(255,215,0,0.6)] btn-luxury animate-glow-pulse" 
                  : "text-text-muted hover:bg-bg-elevated hover:text-gold-primary"
               }`}
             >
               <tab.icon className="w-4 h-4" />
               {tab.label}
             </button>
           ))}
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-6xl mx-auto">
            {errorMsg && (
              <div className="p-4 mb-6 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold text-xs">{errorMsg}</div>
            )}
            {isLoading && <p className="text-text-secondary font-bold text-sm">Loading Panel...</p>}

            {!isLoading && activeTab === "overview" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div className="p-6 card-luxury p-6">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Total Users</p>
                    <p className="text-3xl font-black text-white">{data.users.length}</p>
                 </div>
                 <div className="p-6 card-luxury p-6">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Pending Payments</p>
                    <p className="text-3xl font-black text-gold-primary">{data.payments.filter((p: any) => p.status === "Pending Verification").length}</p>
                 </div>
                 <div className="p-6 card-luxury p-6">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Signup Credits</p>
                    <p className="text-xl font-black text-white mb-2">{data.appSettings?.newUserSignupCredits} Credits</p>
                    <button onClick={handleUpdateSignupCredits} className="px-3 py-1 bg-bg-elevated text-text-main rounded text-[10px] font-bold hover:border-gold-primary transition">
                      EDIT
                    </button>
                 </div>
                 <div className="p-6 card-luxury p-6">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">720p Cost</p>
                    <p className="text-xl font-black text-white mb-2">{data.appSettings?.creditCost720p || 5} Cr</p>
                    <button onClick={() => handleUpdateImageCost("creditCost720p", data.appSettings?.creditCost720p || 5)} className="px-3 py-1 bg-bg-elevated text-text-main rounded text-[10px] font-bold hover:border-gold-primary transition">
                      EDIT
                    </button>
                 </div>
                 <div className="p-6 card-luxury p-6">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">1080p Cost</p>
                    <p className="text-xl font-black text-white mb-2">{data.appSettings?.creditCost1080p || 10} Cr</p>
                    <button onClick={() => handleUpdateImageCost("creditCost1080p", data.appSettings?.creditCost1080p || 10)} className="px-3 py-1 bg-bg-elevated text-text-main rounded text-[10px] font-bold hover:border-gold-primary transition">
                      EDIT
                    </button>
                 </div>
                 <div className="p-6 card-luxury p-6">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Payment UPI</p>
                    <p className="text-sm font-bold text-gold-primary mb-2 truncate" title={data.appSettings?.paymentUpi || "a64665382@okaxis"}>
                      {data.appSettings?.paymentUpi || "a64665382@okaxis"}
                    </p>
                    <button onClick={handleUpdatePaymentUpi} className="px-3 py-1 bg-bg-elevated text-text-main rounded text-[10px] font-bold hover:border-gold-primary transition">
                      EDIT
                    </button>
                 </div>
              </div>
            )}

            {!isLoading && activeTab === "users" && (
              <div className="space-y-4">
                <div className="flex gap-2 pb-2 border-b border-border-gold/30">
                  <button
                    onClick={() => setUserFilter("all")}
                    className={`px-4 py-2 text-xs font-black rounded-lg uppercase tracking-wider transition ${
                      userFilter === "all" ? "card-luxury text-gold-primary border border-border-gold" : "bg-bg-elevated text-text-main hover:border-gold-primary transition"
                    }`}
                  >
                    All Users ({data.users.length})
                  </button>
                  <button
                    onClick={() => setUserFilter("new_signups")}
                    className={`px-4 py-2 text-xs font-black rounded-lg uppercase tracking-wider transition flex items-center gap-1.5 ${
                      userFilter === "new_signups" ? "bg-gold-primary text-bg-primary" : "bg-gold-primary/10 text-gold-primary hover:bg-gold-primary/20"
                    }`}
                  >
                    New Sign-ups ({data.users.filter((u: any) => u.plan === "base").length})
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
                  </button>
                </div>

                <div className="card-luxury rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-border-gold/30 bg-bg-elevated text-gold-primary">
                        <th className="py-4 px-6 text-[10px] font-black tracking-widest uppercase text-text-muted">Email</th>
                        <th className="py-4 px-6 text-[10px] font-black tracking-widest uppercase text-text-muted">Role</th>
                        <th className="py-4 px-6 text-[10px] font-black tracking-widest uppercase text-text-muted">Credits (Adjustable Inline)</th>
                        <th className="py-4 px-6 text-[10px] font-black tracking-widest uppercase text-text-muted">Plan</th>
                        <th className="py-4 px-6 text-[10px] font-black tracking-widest uppercase text-text-muted text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.users
                        .filter((u: any) => userFilter === "all" || u.plan === "base")
                        .map((u: any) => {
                          const inlineVal = inlineCredits[u.id] !== undefined ? inlineCredits[u.id] : u.credits;
                          return (
                            <tr key={u.id} className="border-b border-slate-50 hover:bg-bg-elevated text-gold-primary/50">
                              <td className="py-4 px-6 text-sm font-medium text-text-main">
                                <div className="flex items-center gap-2">
                                  <span>{u.email}</span>
                                  {u.plan === "base" && (
                                    <span className="bg-gold-primary/10 text-gold-primary text-[8px] font-extrabold tracking-wider px-2 py-0.5 rounded-full border border-border-gold uppercase">
                                      New Sign-up
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-6 text-xs text-text-secondary">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.role === "admin" ? "bg-gold-primary text-bg-primary border border-gold-primary" : "bg-bg-elevated text-white border border-border-gold px-2 py-1"}`}>
                                  {u.role || "No Role"}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-sm font-bold text-white">
                                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="number"
                                    min="0"
                                    value={inlineVal}
                                    onChange={(e) => setInlineCredits(prev => ({ ...prev, [u.id]: e.target.value }))}
                                    className="w-20 px-2 py-1 text-xs font-bold border border-border-gold rounded-lg text-center bg-bg-elevated text-gold-primary focus:bg-bg-elevated focus: focus:border-gold-primary"
                                  />
                                  <button
                                    onClick={() => saveCreditsInline(u.id, u.email)}
                                    disabled={updatingCreditsId === u.id || inlineCredits[u.id] === undefined}
                                    className="px-2.5 py-1 bg-bg-elevated border border-transparent text-white hover:bg-bg-elevated/80 font-bold active:scale-95 disabled:scale-100 disabled:opacity-30 rounded-lg text-[10px] transition"
                                  >
                                    {updatingCreditsId === u.id ? "..." : "Save"}
                                  </button>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-xs font-bold text-white uppercase">
                                {data.plans.find((p: any) => p.id === u.plan)?.name || u.plan || "No Plan"}
                              </td>
                              <td className="py-4 px-6 text-xs text-right">
                                <button
                                  onClick={() => startAdjustingUser(u)}
                                  className="px-2.5 py-1 bg-gold-primary border border-gold-primary text-bg-primary font-bold hover:bg-gold-primary/90 rounded-lg transition"
                                >
                                  Adjust Plan & Credits
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {!isLoading && activeTab === "plans" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {/* Create New Plan Card */}
                 <div 
                   onClick={startAddingPlan}
                   className="card-luxury border-dashed hover:border-gold-primary border-border-gold/50 p-6 rounded-2xl hover:bg-bg-elevated hover:border-slate-300 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center min-h-[300px] text-text-muted hover:text-text-main space-y-3 group"
                 >
                   <div className="w-16 h-16 rounded-full bg-bg-elevated shadow flex items-center justify-center group-hover:scale-110 transition-transform">
                     <Plus className="w-8 h-8 text-gold-primary" />
                   </div>
                   <span className="font-bold text-sm">Create New Plan</span>
                 </div>
                 {data.plans.map((p: any) => (
                     <div key={p.id} className="card-luxury p-6 rounded-2xl shadow-sm relative group">
                       <div className="absolute top-4 right-4 z-10 flex gap-2">
                         {deletingPlanId === p.id ? (
                           <>
                             <button
                               onClick={() => handleDeletePlan(p.id)}
                               className="px-2 py-1 rounded bg-red-500 text-white text-[10px] font-bold shadow cursor-pointer hover:bg-red-600 transition"
                             >
                               Confirm
                             </button>
                             <button
                               onClick={() => setDeletingPlanId(null)}
                               className="px-2 py-1 rounded bg-bg-elevated text-text-main text-[10px] font-bold shadow cursor-pointer hover:bg-bg-elevated border-gold-primary transition transition"
                             >
                               Cancel
                             </button>
                           </>
                         ) : (
                           <button
                             onClick={(e) => { e.stopPropagation(); setDeletingPlanId(p.id); }}
                             className="p-1.5 rounded bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 shadow-sm cursor-pointer"
                             title="Delete Plan"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                         )}
                       </div>
                       <span className="text-[9px] font-bold bg-bg-elevated px-2 py-0.5 rounded text-text-secondary uppercase tracking-wider float-right">{p.type}</span>
                       <h3 className="font-extrabold text-white text-lg pr-8">{p.name}</h3>
                       <button
                         onClick={() => startEditingPlan(p)}
                         className="text-xs text-gold-primary hover:text-gold-primary font-bold mb-2 uppercase tracking-wide cursor-pointer text-left block"
                       >
                         Edit Config
                       </button>
                     <p className="text-text-secondary text-xs mt-1 min-h-[32px]">{p.description}</p>
                     
                     <div className="mt-4 flex flex-col gap-1.5 text-xs bg-bg-elevated text-gold-primary p-3 rounded-xl border border-slate-150">
                        <div className="flex justify-between font-medium">
                          <span>Original Price:</span> 
                          <span>{p.type === 'base' ? 'Free (₹0)' : `₹${p.originalPrice}`}</span>
                        </div>
                        {p.type !== 'base' && (
                          <>
                            <div className="flex justify-between font-medium">
                              <span>Configured Offer Price:</span> 
                              <span className="text-amber-700 font-bold">{p.offerPrice ? '₹'+p.offerPrice : 'None'}</span>
                            </div>
                            <div className="flex justify-between text-xs text-text-secondary border-t border-dashed border-border-gold/50 pt-1.5 mt-1.5">
                              <span>Offer Status:</span>
                              <span className={`font-bold ${p.isOfferActive ? 'text-green-600' : 'text-text-muted'}`}>
                                {p.isOfferActive ? 'Active' : 'Not Active / Expired'}
                                {p.offerPrice && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTogglePlanOffer(p.id, !!p.isOfferActive);
                                    }}
                                    className={`ml-2 px-2 py-0.5 rounded text-[9px] font-black uppercase transition cursor-pointer select-none inline-block ${
                                      p.isOfferActive
                                        ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                                        : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                                    }`}
                                  >
                                    {p.isOfferActive ? "Disable" : "Activate Now"}
                                  </button>
                                )}
                              </span>
                            </div>
                            {p.offerStartAt && (
                              <div className="text-[10px] text-text-muted">
                                Start: {new Date(p.offerStartAt).toLocaleString()}
                              </div>
                            )}
                            {p.offerEndAt && (
                              <div className="text-[10px] text-text-muted">
                                End: {new Date(p.offerEndAt).toLocaleString()}
                              </div>
                            )}
                          </>
                        )}
                        <div className="flex justify-between font-bold text-white border-t border-slate-250 pt-1.5 mt-1.5">
                          <span>Credits {p.type === 'base' ? 'Monthly' : 'Included'}:</span> 
                          <span>{(p.credits || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-text-secondary font-semibold">
                          <span>Delivery Frequency:</span>
                          <span className="uppercase">{p.creditFrequency || "monthly"}</span>
                        </div>
                        {p.validityDays > 0 && p.type !== 'base' && (
                          <div className="flex justify-between text-[11px] text-text-secondary font-semibold">
                            <span>Plan Validity:</span>
                            <span>{p.validityDays} Days</span>
                          </div>
                        )}
                        {p.dailyUpdateCredits > 0 && (
                          <div className="flex justify-between text-[11px] text-gold-primary font-bold">
                            <span>Daily Auto-Update Credits:</span>
                            <span>{p.dailyUpdateCredits.toLocaleString()}</span>
                          </div>
                        )}
                        {p.trialEnabled && (
                          <div className="p-2 bg-amber-100/50 border border-border-gold mt-1.5 rounded-lg text-[10px] text-amber-950 font-bold space-y-0.5">
                            <span className="block uppercase text-[9px] tracking-wide text-amber-800">🎁 Trial Setup Configured</span>
                            <div className="flex justify-between">
                              <span>Trial Price:</span>
                              <span>₹{p.trialPrice}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Trial Duration:</span>
                              <span>{p.trialDurationDays} Days</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Trial Credits:</span>
                              <span>{(p.trialCredits || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Trial Frequency:</span>
                              <span className="uppercase">{p.trialCreditFrequency || "daily"}</span>
                            </div>
                          </div>
                        )}
                        {p.freeTaskEnabled && (
                          <div className="p-2 bg-red-50 border border-red-100 mt-1.5 rounded-lg text-[10px] text-red-950 font-bold space-y-0.5 animate-in fade-in">
                            <span className="block uppercase text-[9px] tracking-wide text-red-600">📺 Free Subscription Task</span>
                            <div className="flex justify-between">
                              <span>Heading:</span>
                              <span className="truncate max-w-[120px] font-medium" title={p.freeTaskHeading}>{p.freeTaskHeading}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>YouTube Link:</span>
                              <a href={p.freeTaskUrl} target="_blank" rel="noreferrer" className="text-gold-primary underline truncate max-w-[120px] font-medium" title={p.freeTaskUrl}>Link</a>
                            </div>
                          </div>
                        )}
                     </div>
                     <button onClick={() => startEditingPlan(p)} className="w-full mt-4 py-2 border border-border-gold/50 rounded-xl bg-bg-elevated hover:bg-bg-elevated text-gold-primary text-xs font-bold text-text-main cursor-pointer">
                       Edit configuration
                     </button>
                   </div>
                 ))}
              </div>
            )}

            {!isLoading && activeTab === "api" && (
              <div className="card-luxury rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-lg">API Integration</h2>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${apiConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {apiConnected ? "Connected" : "Not Connected"}
                    </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-text-secondary uppercase">API Key</label>
                    <input 
                      type="password"
                      value={apiForm.apiKey}
                      onChange={(e) => setApiForm({...apiForm, apiKey: e.target.value})}
                      className="w-full border rounded-lg p-2 mt-1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={apiForm.useUrl} onChange={(e) => setApiForm({...apiForm, useUrl: e.target.checked})} />
                    <label className="text-xs font-bold text-text-main">Use URL</label>
                  </div>
                  {apiForm.useUrl && (
                    <div>
                      <label className="text-xs font-bold text-text-secondary uppercase">URL</label>
                      <input type="text" value={apiForm.apiUrl} onChange={(e) => setApiForm({...apiForm, apiUrl: e.target.value})} className="w-full border rounded-lg p-2 mt-1" />
                    </div>
                  )}
                  <button onClick={() => handleUpdateApiSettings({ ...apiForm, testConnection: true })} className="bg-gold-primary text-white rounded-lg px-4 py-2 text-xs font-bold">Connect</button>
                </div>
              </div>
            )}


            {!isLoading && activeTab === "payments" && (
              <div className="card-luxury rounded-2xl overflow-hidden shadow-sm">
                 <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border-gold/30 bg-bg-elevated text-gold-primary">
                      <th className="py-4 px-6 text-[10px] font-black tracking-widest uppercase text-text-muted">User Details</th>
                      <th className="py-4 px-6 text-[10px] font-black tracking-widest uppercase text-text-muted">Reference Details</th>
                      <th className="py-4 px-6 text-[10px] font-black tracking-widest uppercase text-text-muted">Plan & Credits Snapshot</th>
                      <th className="py-4 px-6 text-[10px] font-black tracking-widest uppercase text-text-muted">Amount & Offer</th>
                      <th className="py-4 px-6 text-[10px] font-black tracking-widest uppercase text-text-muted">Status</th>
                      <th className="py-4 px-6 text-[10px] font-black tracking-widest uppercase text-text-muted right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.payments.length === 0 && (
                      <tr><td colSpan={6} className="py-8 text-center text-text-secondary text-sm">No payment requests</td></tr>
                    )}
                    {data.payments.map((p: any) => (
                      <tr key={p.paymentId} className="border-b border-slate-50 hover:bg-bg-elevated text-gold-primary/50">
                        <td className="py-4 px-6 text-sm text-text-main">
                          <p className="font-bold text-white">{p.fullName}</p>
                          <p className="text-xs">{p.userEmail}</p>
                        </td>
                        <td className="py-4 px-6 text-sm text-text-main">
                          <p className="text-xs"><span className="text-text-muted">UPI:</span> {p.upiId}</p>
                          <p className="text-xs"><span className="text-text-muted">UTR:</span> <span className="font-mono bg-bg-elevated px-1 rounded">{p.utrNumber}</span></p>
                          <p className="text-[10px] text-text-muted mt-1">{p.submittedAt ? new Date(p.submittedAt).toLocaleString() : "N/A"}</p>
                        </td>
                        <td className="py-4 px-6 text-sm text-text-main">
                          <p className="font-bold">{p.selectedPlanNameSnapshot}</p>
                          <p className="text-xs text-text-secondary">{(p.creditsSnapshot || 0).toLocaleString()} Credits</p>
                        </td>
                        <td className="py-4 px-6 text-xs text-text-main">
                          <p className="font-mono font-bold text-white">₹{p.payableAmountSnapshot}</p>
                          <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded mt-0.5 font-bold ${p.offerAppliedSnapshot ? 'bg-gold-primary/20 text-gold-primary' : 'bg-bg-elevated text-text-secondary'}`}>
                            {p.offerAppliedSnapshot ? "Offer Applied" : "Standard Price"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-xs">
                          <span className={`px-2 py-1 flex items-center gap-1 w-max rounded-full font-bold ${
                            p.status === "Approved" ? "bg-green-100 text-green-700" :
                            p.status === "Rejected" ? "bg-red-100 text-red-700" :
                            "bg-orange-100 text-orange-700"
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 pr-6">
                           {p.status === "Pending Verification" ? (
                             <div className="flex gap-2 w-max">
                               <button onClick={() => handleProcessPayment(p.paymentId, "approve")} className="p-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg cursor-pointer" title="Approve & Grant Credits">
                                 <CheckCircle className="w-5 h-5" />
                               </button>
                               <button onClick={() => handleProcessPayment(p.paymentId, "reject")} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg cursor-pointer" title="Reject Request">
                                 <XCircle className="w-5 h-5" />
                               </button>
                             </div>
                           ) : (
                             <span className="text-xs text-text-muted font-medium font-semibold">Processed</span>
                           )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Elegant Edit Plan Modal Overlay */}
      {editingPlan && (
        <div className="fixed inset-0 bg-bg-primary/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel rounded-3xl border border-border-gold shadow-2xl shadow-gold-primary/10 border border-border-gold/50 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <form onSubmit={handleSavePlanUpdates} className="flex flex-col max-h-[90vh]">
              <div className="p-5 border-b border-border-gold/30 flex items-center justify-between bg-bg-elevated text-gold-primary">
                <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">
                  Edit Plan: {editingPlan.name}
                </h3>
                <button 
                  type="button" 
                  onClick={() => setEditingPlan(null)} 
                  className="p-1 hover:border-gold-primary transition rounded-full text-text-secondary cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-4">
                {modalError && (
                  <p className="text-xs text-red-500 font-bold bg-red-50 p-2.5 rounded border border-red-100">{modalError}</p>
                )}

                <div>
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wide block">Plan Name</label>
                  <input 
                    type="text" 
                    value={editForm.name} 
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    required
                    className="w-full mt-1 border border-border-gold/50 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-slate-900 " 
                  />
                </div>

                {editingPlan.id === "new" && (
                  <div>
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wide block">Plan Type ID</label>
                    <input 
                      type="text" 
                      value={editForm.type} 
                      onChange={e => setEditForm({ ...editForm, type: e.target.value })}
                      required
                      placeholder="e.g. premium_tier"
                      className="w-full mt-1 border border-border-gold/50 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-slate-900  lowercase" 
                    />
                  </div>
                )}
                
                <div className="flex items-center gap-2 mt-4 p-3 bg-bg-elevated rounded-xl border border-border-gold/50">
                  <input type="checkbox" id="defaultPlanSetting" checked={editForm.defaultForNewUsers} onChange={e => setEditForm({...editForm, defaultForNewUsers: e.target.checked})} className="w-4 h-4 text-gold-primary rounded bg-bg-elevated border-border-gold" />
                  <label htmlFor="defaultPlanSetting" className="text-xs font-bold text-text-main cursor-pointer">Set as Free Plan for New Users</label>
                </div>
                <div className="flex items-center gap-2 mt-4 p-3 bg-bg-elevated rounded-xl border border-border-gold/50">
                  <input type="checkbox" id="showFirstAsPopupSetting" checked={editForm.showFirstAsPopup} onChange={e => setEditForm({...editForm, showFirstAsPopup: e.target.checked})} className="w-4 h-4 text-gold-primary rounded bg-bg-elevated border-border-gold" />
                  <label htmlFor="showFirstAsPopupSetting" className="text-xs font-bold text-text-main cursor-pointer">Show as First Pop-up on Signup</label>
                </div>

                {editingPlan.type !== "base" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wide block">Original Price (₹)</label>
                      <input 
                        type="number" 
                        value={editForm.originalPrice} 
                        onChange={e => setEditForm({ ...editForm, originalPrice: Number(e.target.value) })}
                        required
                        min="0"
                        className="w-full mt-1 border border-border-gold/50 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-slate-900  animate-none" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wide block">Offer Price (₹) <span className="text-text-muted font-medium">(optional)</span></label>
                      <input 
                        type="number" 
                        value={editForm.offerPrice} 
                        onChange={e => setEditForm({ ...editForm, offerPrice: e.target.value })}
                        placeholder="None"
                        min="0"
                        className="w-full mt-1 border border-border-gold/50 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-slate-900  animate-none" 
                      />
                    </div>
                  </div>
                )}

                {editingPlan.type !== "base" && editForm.offerPrice !== "" && (
                  <div className="grid grid-cols-2 gap-4 bg-amber-50 p-3 rounded-xl border border-amber-100">
                    <div className="col-span-2 flex flex-col gap-2 mb-1">
                      <div className="flex items-center gap-1.5 bg-amber-150/40 p-2 rounded-lg border border-border-gold">
                        <input
                          type="checkbox"
                          id="offerActive_modal"
                          checked={!!editForm.offerActive}
                          onChange={e => setEditForm({ ...editForm, offerActive: e.target.checked })}
                          className="rounded text-gold-primary focus:ring-gold-primary cursor-pointer"
                        />
                        <label htmlFor="offerActive_modal" className="text-[10px] font-extrabold text-amber-950 uppercase tracking-wider cursor-pointer">
                          Directly Activate Offer Now (No Fixed Expiry)
                        </label>
                      </div>
                      <span className="text-[9px] font-bold text-amber-800 uppercase tracking-wider">
                        Or Set Promotion Date Range (Target Local Time)
                      </span>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-amber-950 block">Offer Start</label>
                      <input 
                        type="datetime-local" 
                        value={editForm.offerStartAt} 
                        onChange={e => setEditForm({ ...editForm, offerStartAt: e.target.value })}
                        required={editForm.offerPrice !== "" && !editForm.offerActive}
                        className="w-full mt-1 border border-border-gold rounded-xl px-2 py-1.5 text-xs  bg-bg-elevated text-text-main" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-amber-950 block">Offer End</label>
                      <input 
                        type="datetime-local" 
                        value={editForm.offerEndAt} 
                        onChange={e => setEditForm({ ...editForm, offerEndAt: e.target.value })}
                        required={editForm.offerPrice !== "" && !editForm.offerActive}
                        className="w-full mt-1 border border-border-gold rounded-xl px-2 py-1.5 text-xs  bg-bg-elevated text-text-main" 
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wide block">
                    {editingPlan.type === "base" ? "Monthly Credits Allotment" : "Credits Included"}
                  </label>
                  <input 
                    type="number" 
                    value={editForm.credits} 
                    onChange={e => setEditForm({ ...editForm, credits: Number(e.target.value) })}
                    required
                    min="0"
                    className="w-full mt-1 border border-border-gold/50 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-slate-900 " 
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wide block">Regular Plan Credit Delivery Frequency</label>
                  <select
                    value={editForm.creditFrequency}
                    onChange={e => setEditForm({ ...editForm, creditFrequency: e.target.value })}
                    className="w-full mt-1 border border-border-gold/50 bg-bg-elevated rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-slate-900  font-semibold text-text-main"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

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

                {editingPlan.type !== "base" && (
                  <div className="bg-amber-50/50 border border-border-gold/60 p-4 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="form-trial-enabled"
                        checked={editForm.trialEnabled}
                        onChange={e => setEditForm({ ...editForm, trialEnabled: e.target.checked })}
                        className="rounded text-gold-primary focus:ring-gold-primary cursor-pointer"
                      />
                      <label htmlFor="form-trial-enabled" className="text-[10px] font-black tracking-wider text-amber-950 uppercase select-none cursor-pointer">
                        Enable Trial Setup Phase
                      </label>
                    </div>

                    {editForm.trialEnabled && (
                      <div className="space-y-3 pt-2 border-t border-amber-100/50 animate-in fade-in duration-200">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] font-bold text-amber-900 uppercase">Trial Price (₹)</label>
                            <input 
                              type="number" 
                              min="0"
                              value={editForm.trialPrice}
                              onChange={e => setEditForm({ ...editForm, trialPrice: Number(e.target.value) })}
                              className="w-full mt-1 border border-border-gold bg-bg-elevated rounded-xl px-2.5 py-1.5 text-xs  focus:ring-1 focus:ring-gold-primary"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-amber-900 uppercase">Trial Duration (Days)</label>
                            <input 
                              type="number" 
                              min="1"
                              value={editForm.trialDurationDays}
                              onChange={e => setEditForm({ ...editForm, trialDurationDays: Number(e.target.value) })}
                              className="w-full mt-1 border border-border-gold bg-bg-elevated rounded-xl px-2.5 py-1.5 text-xs  focus:ring-1 focus:ring-gold-primary"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] font-bold text-amber-900 uppercase">Trial Credits</label>
                            <input 
                              type="number" 
                              min="0"
                              value={editForm.trialCredits}
                              onChange={e => setEditForm({ ...editForm, trialCredits: Number(e.target.value) })}
                              className="w-full mt-1 border border-border-gold bg-bg-elevated rounded-xl px-2.5 py-1.5 text-xs  focus:ring-1 focus:ring-gold-primary"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-amber-900 uppercase">Trial Delivery Frequency</label>
                            <select
                              value={editForm.trialCreditFrequency}
                              onChange={e => setEditForm({ ...editForm, trialCreditFrequency: e.target.value })}
                              className="w-full mt-1 border border-border-gold bg-bg-elevated rounded-xl px-2.5 py-1.5 text-xs  focus:ring-1 focus:ring-gold-primary text-text-main font-semibold"
                            >
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                              <option value="yearly">Yearly</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 📺 NEW Free YouTube Subscription Task configuration option */}
                <div className="bg-red-50/50 border border-red-500/50/60 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="form-free-task-enabled"
                      checked={editForm.freeTaskEnabled || false}
                      onChange={e => setEditForm({ ...editForm, freeTaskEnabled: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500 cursor-pointer"
                    />
                    <label htmlFor="form-free-task-enabled" className="text-[10px] font-black tracking-wider text-red-950 uppercase select-none cursor-pointer flex items-center gap-1">
                      🎁 Offer this plan for FREE via Task
                    </label>
                  </div>

                  {editForm.freeTaskEnabled && (
                    <div className="space-y-3 pt-2 border-t border-red-100/50 animate-in fade-in duration-200">
                      <div>
                        <label className="text-[9px] font-bold text-red-900 uppercase">Task Button Heading / Instructions</label>
                        <input 
                          type="text" 
                          value={editForm.freeTaskHeading || ""}
                          onChange={e => setEditForm({ ...editForm, freeTaskHeading: e.target.value })}
                          placeholder="e.g., Subscribe to YouTube Channel"
                          required={editForm.freeTaskEnabled}
                          className="w-full mt-1 border border-red-500/50 bg-bg-elevated rounded-xl px-2.5 py-1.5 text-xs  focus:ring-1 focus:ring-red-500"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-red-900 uppercase">YouTube Channel URL / Redirect Link</label>
                        <input 
                          type="url" 
                          value={editForm.freeTaskUrl || ""}
                          onChange={e => setEditForm({ ...editForm, freeTaskUrl: e.target.value })}
                          placeholder="https://youtube.com/channel/..."
                          required={editForm.freeTaskEnabled}
                          className="w-full mt-1 border border-red-500/50 bg-bg-elevated rounded-xl px-2.5 py-1.5 text-xs  focus:ring-1 focus:ring-red-500"
                        />
                        <span className="text-[8px] text-red-800 font-medium block mt-1">Users will be directed here first before being permitted to claim the plan for free.</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wide block">Description</label>
                  <textarea 
                    value={editForm.description} 
                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                    required
                    className="w-full mt-1 border border-border-gold/50 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-slate-900  resize-none" 
                  />
                </div>
              </div>

              <div className="p-4 border-t border-border-gold/30 bg-bg-elevated text-gold-primary flex justify-end gap-3 shrink-0">
                <button 
                  type="button" 
                  onClick={() => setEditingPlan(null)} 
                  className="px-4 py-2 border border-border-gold/50 text-text-main rounded-xl text-xs font-bold hover:bg-bg-elevated cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 card-luxury text-gold-primary border border-border-gold rounded-xl text-xs font-bold hover:bg-bg-elevated/50 cursor-pointer"
                >
                  Publish / Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual User adjustment Modal */}
      {selectedUserForAdjustment && (
        <div className="fixed inset-0 bg-bg-primary/50 backdrop-blur-xs flex items-center justify-center p-4 z-55">
          <div className="bg-bg-elevated rounded-2xl w-full max-w-md shadow-2xl border border-border-gold/30 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4.5 border-b border-border-gold/30 flex items-center justify-between shrink-0 bg-bg-elevated text-gold-primary">
              <h3 className="font-extrabold text-sm text-white uppercase tracking-tight">
                Adjust Plan & Credits
              </h3>
              <button 
                onClick={() => setSelectedUserForAdjustment(null)}
                className="p-1 rounded-full text-text-muted hover:text-white hover:bg-bg-elevated transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveUserAdjustments} className="flex flex-col overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
                {adjustError && (
                  <p className="text-xs text-rose-600 font-bold bg-rose-50 p-2.5 rounded border border-rose-100">
                    {adjustError}
                  </p>
                )}

                <div>
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wide block">
                    Target User
                  </label>
                  <input 
                    type="text" 
                    value={selectedUserForAdjustment.email} 
                    readOnly 
                    className="w-full mt-1 border border-border-gold/50 bg-bg-elevated text-gold-primary text-text-secondary rounded-xl px-3 py-2 text-xs  cursor-not-allowed" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wide block">
                      Add Credits
                    </label>
                    <input 
                      type="number" 
                      min="0"
                      step="1"
                      placeholder="e.g. 100"
                      value={adjustForm.creditsToAdd} 
                      onChange={e => setAdjustForm({ ...adjustForm, creditsToAdd: e.target.value })}
                      className="w-full mt-1 border border-border-gold/50 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-slate-900 " 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wide block">
                      New Plan
                    </label>
                    <select
                      value={adjustForm.newPlanId}
                      onChange={e => setAdjustForm({ ...adjustForm, newPlanId: e.target.value })}
                      className="w-full mt-1 border border-border-gold/50 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-slate-900  bg-bg-elevated font-semibold text-text-main"
                    >
                      {data.plans.map((p: any) => (
                        <option key={p.id} value={p.id}>
                          {p.name} {p.id === 'base' ? '(Free)' : `(₹${p.originalPrice})`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {adjustForm.creditsToAdd !== "" && Number(adjustForm.creditsToAdd) > 0 && (
                  <div>
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wide block">
                      Credits Reason / Description
                    </label>
                    <input 
                      type="text" 
                      required
                      value={adjustForm.creditReason} 
                      onChange={e => setAdjustForm({ ...adjustForm, creditReason: e.target.value })}
                      placeholder="Reason for manual credit injection"
                      className="w-full mt-1 border border-border-gold/50 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-slate-900 " 
                    />
                  </div>
                )}

                {adjustForm.newPlanId !== selectedUserForAdjustment.plan && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gold-primary/50 border border-gold-primary">
                    <input 
                      type="checkbox" 
                      id="checkbox-grant-plan-credits"
                      checked={adjustForm.grantPlanCredits}
                      onChange={e => setAdjustForm({ ...adjustForm, grantPlanCredits: e.target.checked })}
                      className="mt-0.5 rounded text-gold-primary focus:ring-gold-primary"
                    />
                    <label htmlFor="checkbox-grant-plan-credits" className="text-xs text-text-main font-medium select-none cursor-pointer">
                      Grant Plan's Default Credits along with the plan change.
                    </label>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-border-gold/30 bg-bg-elevated text-gold-primary flex justify-end gap-3 shrink-0">
                <button 
                  type="button" 
                  onClick={() => setSelectedUserForAdjustment(null)} 
                  className="px-4 py-2 border border-border-gold/50 text-text-main rounded-xl text-xs font-bold hover:bg-bg-elevated cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={adjustSubmitting}
                  className="px-5 py-2 card-luxury text-gold-primary border border-border-gold rounded-xl text-xs font-bold hover:bg-bg-elevated/50 cursor-pointer disabled:opacity-50"
                >
                  {adjustSubmitting ? "Saving..." : "Apply Adjustments"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
