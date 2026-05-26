import React, { useState, useEffect } from "react";
import { Check, X, Shield, Sparkles } from "lucide-react";

interface PlansProps {
  userProfile: any;
  onPlanPurchased: () => void;
  onAuthRedirect?: () => void;
}

export default function Plans({ userProfile, onPlanPurchased, onAuthRedirect }: PlansProps) {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [trialChoice, setTrialChoice] = useState(false);

  // Payment Form States
  const [utrNumber, setUtrNumber] = useState("");
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"qr" | "free_task">("qr");
  const [visitedChannel, setVisitedChannel] = useState(false);

  const resetForm = () => {
    setSelectedPlan(null);
    setTrialChoice(false);
    setPaymentSuccess(false);
    setUtrNumber("");
    setErrorMsg("");
    setVisitedChannel(false);
    setPaymentMethod("qr");
  };

  useEffect(() => {
    if (selectedPlan) {
      if (selectedPlan.freeTaskEnabled) {
        setPaymentMethod("free_task");
      } else {
        setPaymentMethod("qr");
      }
    }
  }, [selectedPlan]);

  useEffect(() => {
    fetchPlans();
  }, [userProfile]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("whisk_auth_token");
      const url = token 
        ? `${import.meta.env.VITE_API_URL || ""}/api/user/me` 
        : `${import.meta.env.VITE_API_URL || ""}/api/plans`;
      const headers: any = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(url, { headers });
      const data = await res.json();
      if (res.ok) {
        // Exclude Base plan from the user-facing plans list
        const filteredPlans = (data.plans || []).filter((p: any) => p.id !== "base");
        setPlans(filteredPlans);
      }
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber.trim()) {
      setErrorMsg("Please enter UTR number.");
      return;
    }

    setPaymentSubmitting(true);
    setErrorMsg("");
    
    try {
      const token = localStorage.getItem("whisk_auth_token");
      const res = await fetch((import.meta.env.VITE_API_URL || "") + "/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          utrNumber: utrNumber.trim(),
          isTrial: trialChoice
        })
      });

      const data = await res.json();
      if (res.ok) {
        setPaymentSuccess(true);
      } else {
        setErrorMsg(data.error || "Payment submission failed.");
      }
    } catch(err) {
      setErrorMsg("Network error.");
    } finally {
      setPaymentSubmitting(false);
    }
  };

  if (loading) return <div className="text-center p-12 text-text-muted font-bold text-sm">Loading plans...</div>;

  return (
    <div className="w-full">
      <div className="text-center mb-8 md:mb-12">
        <span className="text-[10px] uppercase font-mono tracking-widest text-gold-primary btn-luxury px-3 py-1.5 rounded-full font-bold">
          Membership Tiers
        </span>
        <h2 className="font-sans font-extrabold text-2xl md:text-3xl text-text-main tracking-tight mt-3">
          Purchase Credits & Plans
        </h2>
        {userProfile ? (
          <p className="text-xs max-w-sm mx-auto mt-2 text-text-muted font-medium font-sans">
            Your current plan: <span className="font-bold text-text-main uppercase">{userProfile?.plan || "Base"}</span> 
            &nbsp;| Balance: <span className="font-bold text-text-main">{userProfile?.credits || 0} Credits</span>
          </p>
        ) : (
          <p className="text-xs max-w-sm mx-auto mt-2 text-gold-primary font-bold font-sans">
            Become a premium compose designer to unlock high-definition exports!
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((p) => {
          const isCurrent = userProfile ? userProfile?.plan === p.id : false;
          const hasOfferActive = p.isOfferActive && p.offerPrice !== null;
          
          return (
            <div key={p.id} className={`glass-panel p-6 flex flex-col justify-between ${p.id === 'pro' ? 'border-2 border-gold-primary shadow-[0_0_20px_var(--color-glow-gold)]' : 'border border-border-gold'}`}>
              {p.id === 'pro' && (
                <span className="absolute -top-3.5 right-6 bg-gold-primary text-bg-primary font-black tracking-wider text-[8px] uppercase py-1 px-3 rounded-full">
                  Recommended
                </span>
              )}
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-medium text-text-main mt-1">{p.name}</h3>
                  {hasOfferActive && (
                    <span className="text-[9px] font-bold tracking-wide bg-gold-primary/20 text-gold-champagne uppercase px-2 py-0.5 rounded-xl border border-border-gold">
                      Offer Active
                    </span>
                  )}
                </div>
                
                <p className="text-xl font-bold text-text-main mt-4">
                  {p.activePrice === 0 ? "Free" : `₹${p.activePrice}`}
                  {p.originalPrice > p.activePrice && (
                    <span className="text-xs text-text-muted line-through ml-2 font-medium">₹{p.originalPrice}</span>
                  )}
                </p>
                
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

                  {p.description}
                </p>
                {p.trialEnabled ? (
                  <div className="mt-3.5 p-2 rounded-xl bg-gold-primary/10 border border-gold-primary/20 text-[10px] text-gold-champagne font-bold flex items-center gap-1.5 justify-center">
                    🎁 Trial: ₹{p.trialPrice} for {p.trialCredits.toLocaleString()} Credits ({p.trialDurationDays} Days)
                  </div>
                ) : (
                  <div className="mt-3.5 p-2 rounded-xl bg-bg-elevated text-[10px] text-text-muted font-bold flex items-center gap-1.5 justify-center">
                    ⏰ Allotment: {p.creditFrequency || "Monthly"}
                  </div>
                )}
                {p.freeTaskEnabled && (
                  <div className="mt-3 p-2 px-3 rounded-xl bg-rose-950/30 border border-rose-500/20 text-[10px] text-rose-200 font-bold flex flex-col gap-0.5 items-center justify-center text-center">
                    <div>📺 Unlock Free Special Offer!</div>
                    <div className="font-normal text-[9px] text-rose-300">Subscribe on YouTube to claim.</div>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setSelectedPlan(p)}
                disabled={isCurrent || (p.originalPrice === 0 && userProfile)}
                className={`w-full py-2.5 mt-8 border text-xs font-bold rounded-xl transition cursor-pointer ${
                  isCurrent 
                    ? "border-border-gold bg-bg-elevated text-text-muted cursor-not-allowed"
                    : p.originalPrice === 0
                      ? "border-border-gold bg-bg-elevated text-text-muted cursor-not-allowed"
                      : p.freeTaskEnabled
                        ? "bg-rose-950/50 border-rose-500/30 hover:bg-rose-900/50 text-rose-200"
                        : p.id === 'pro'
                          ? "bg-gold-primary hover:bg-gold-soft text-bg-primary border-transparent"
                          : "border-border-gold bg-bg-primary hover:bg-bg-elevated text-text-main"
                }`}
              >
                {isCurrent ? "Current Plan" : p.originalPrice === 0 ? "Free Base" : p.freeTaskEnabled ? "Claim Free Task" : "Select Plan"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Payment Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 btn-luxury/40 backdrop-blur-sm">
          <div className="bg-bg-primary rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border-gold flex items-center justify-between bg-bg-elevated">
              <h3 className="font-extrabold text-text-main text-sm">
                {selectedPlan.freeTaskEnabled ? `Activate ${selectedPlan.name}` : `Purchase ${selectedPlan.name}`}
              </h3>
              <button onClick={resetForm} className="p-1 hover:bg-bg-elevated rounded-full text-text-muted cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {userProfile && selectedPlan.freeTaskEnabled && (
              <div className="flex border-b border-border-gold bg-bg-elevated p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('free_task')}
                  className={`flex-1 py-1.5 text-center text-[10px] uppercase tracking-wide font-black rounded-lg transition ${
                    paymentMethod === 'free_task'
                      ? "bg-bg-primary text-rose-700 shadow-sm border border-border-gold"
                      : "text-text-muted hover:text-gold-primary"
                  }`}
                >
                  📺 Free Task
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('qr')}
                  className={`flex-1 py-1.5 text-center text-[10px] uppercase tracking-wide font-black rounded-lg transition ${
                    paymentMethod === 'qr'
                      ? "bg-bg-elevated text-gold-primary shadow-[0_0_10px_rgba(255,215,0,0.2)] border border-border-gold"
                      : "text-text-muted hover:text-gold-primary"
                  }`}
                >
                  💳 Scan QR Code
                </button>
              </div>
            )}
            
            <div className="p-6">
              {!userProfile ? (
                // Guest Auth Prompt
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg border border-amber-150">
                    🔑
                  </div>
                  <h4 className="font-sans font-extrabold text-sm text-text-main uppercase tracking-wide">Sign Up or Login Required</h4>
                  <p className="text-xs  text-text-muted mt-2 font-medium leading-relaxed max-w-xs mx-auto">
                    You must sign up or enter your login credentials first to proceed with the purchase of <span className="font-bold text-text-main">{selectedPlan.name}</span>.
                  </p>
                  <div className="mt-8 flex flex-col gap-2">
                    <button 
                      onClick={() => {
                        resetForm();
                        if (onAuthRedirect) onAuthRedirect();
                      }}
                      className="w-full py-3 btn-luxury hover:scale-105 transition-transform text-bg-primary font-bold text-xs tracking-wider uppercase rounded-xl transition cursor-pointer"
                    >
                      Login / Sign Up Now
                    </button>
                    <button 
                      onClick={resetForm}
                      className="w-full py-3 border border-border-gold hover:bg-bg-elevated text-text-main font-bold text-xs tracking-wider uppercase rounded-xl transition cursor-pointer"
                    >
                      Browse Plans
                    </button>
                  </div>
                </div>
              ) : paymentSuccess ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Check className="w-8 h-8" />
                  </div>
                  <h4 className="font-extrabold text-lg text-text-main">
                    {paymentMethod === 'free_task' ? "Task Verified!" : "Payment Submitted!"}
                  </h4>
                  <p className="text-xs text-text-muted mt-2">
                    {paymentMethod === 'free_task' 
                      ? `Congratulations! ${selectedPlan.name} has been activated for free.`
                      : "Payment submitted for verification. Your plan will be activated after admin approval."}
                  </p>
                  <button onClick={resetForm} className="mt-6 px-6 py-2 btn-luxury text-bg-primary rounded-full text-xs font-bold cursor-pointer">
                    Close
                  </button>
                </div>
              ) : paymentMethod === 'free_task' ? (
                /* YouTube Claim Subscription Free Task Area */
                <div className="space-y-4 py-1">
                  <div className="text-center p-3 text-rose-950 bg-rose-50 border border-rose-100 rounded-2xl">
                    <span className="text-[8px] font-black uppercase tracking-widest bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full">
                      🔥 Free Special Offer
                    </span>
                    <h4 className="font-extrabold mt-2 text-[11px] uppercase tracking-wide">
                      {selectedPlan.freeTaskHeading}
                    </h4>
                    <p className="text-[10px] text-text-muted font-semibold leading-relaxed mt-1">
                      Perform this short visual task to claim your premium <span className="font-bold text-text-main uppercase">{selectedPlan.name}</span> membership for absolutely free.
                    </p>
                  </div>

                  {errorMsg && (
                    <p className="text-xs text-red-500 font-bold bg-red-50 p-2.5 rounded border border-red-100">{errorMsg}</p>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-bg-elevated border border-border-gold">
                      <div className="w-5 h-5 rounded-full bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</div>
                      <div className="flex-1 space-y-1.5">
                        <p className="text-xs font-bold text-text-main">Visit & subscribe on YouTube</p>
                        <button
                          type="button"
                          onClick={() => {
                            window.open(selectedPlan.freeTaskUrl, "_blank", "noopener,noreferrer");
                            setVisitedChannel(true);
                          }}
                          className="w-full py-2 bg-red-600 hover:bg-red-700 text-bg-primary font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer"
                        >
                          ▶️ Visit & Subscribe Now
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-bg-elevated border border-border-gold">
                      <div className="w-5 h-5 rounded-full bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</div>
                      <div className="flex-1 space-y-1.5">
                        <p className="text-xs font-bold text-text-main">Claim your Reward</p>
                        <button
                          type="button"
                          disabled={!visitedChannel || paymentSubmitting}
                          onClick={async () => {
                            setPaymentSubmitting(true);
                            setErrorMsg("");
                            try {
                              const token = localStorage.getItem("whisk_auth_token");
                              const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/plans/${selectedPlan.id}/claim-free`, {
                                method: 'POST',
                                headers: {
                                  'Authorization': `Bearer ${token}`
                                }
                              });
                              const resData = await res.json();
                              if (res.ok) {
                                setPaymentSuccess(true);
                                if (onPlanPurchased) {
                                  onPlanPurchased();
                                }
                              } else {
                                setErrorMsg(resData.error || "Claim error. Please try again.");
                              }
                            } catch(err) {
                              setErrorMsg("Network error.");
                            } finally {
                              setPaymentSubmitting(false);
                            }
                          }}
                          className={`w-full py-2 btn-luxury text-bg-primary font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                          {paymentSubmitting ? "Claiming..." : "🎁 Claim Plan Free"}
                        </button>
                        {!visitedChannel && (
                          <span className="text-[8px] text-text-muted font-semibold block text-center mt-1">
                            (Unlocks once you tap Step 1 to subscribe)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePurchaseSubmit} className="space-y-4">
                  <div className="text-center mb-6">
                     <div className="inline-flex overflow-hidden rounded-2xl mb-3 shadow-md border border-border-gold bg-bg-primary p-2">
                       <img src="/payment-qr.png" alt="Payment QR Code" className="w-40 h-40 object-cover" />
                     </div>
                     <p className="text-xs font-extrabold text-text-secondary">Scan QR Code to pay</p>
                  </div>

                  {errorMsg && (
                    <p className="text-xs text-red-500 font-bold bg-red-50 p-2.5 rounded border border-red-100">{errorMsg}</p>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">User Email <span className="text-text-muted font-medium">(Read Only)</span></label>
                      <input 
                        type="text" 
                        value={userProfile?.email || ""} 
                        readOnly
                        className="w-full bg-bg-elevated border border-border-gold text-text-muted rounded-xl px-3 py-2 text-xs mt-1 cursor-not-allowed outline-none" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Selected Plan</label>
                        <input 
                          type="text" 
                          value={trialChoice ? `${selectedPlan.name} (Trial)` : selectedPlan.name} 
                          readOnly
                          className="w-full bg-bg-elevated border border-border-gold text-text-muted rounded-xl px-3 py-2 text-xs mt-1 cursor-not-allowed outline-none font-bold" 
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Amount Paid</label>
                        <input 
                          type="text" 
                          value={`₹${trialChoice ? selectedPlan.trialPrice : selectedPlan.activePrice}`} 
                          readOnly
                          className="w-full bg-gold-primary/10 border border-gold-primary/30 text-gold-primary font-black rounded-xl px-3 py-2 text-xs mt-1 cursor-not-allowed outline-none" 
                        />
                      </div>
                    </div>
                    {selectedPlan.trialEnabled && (
                      <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex items-start gap-2.5">
                        <input 
                          type="checkbox"
                          id="buy-trial-checkbox"
                          checked={trialChoice}
                          onChange={(e) => setTrialChoice(e.target.checked)}
                          className="mt-0.5 rounded text-gold-primary focus:ring-indigo-500 cursor-pointer"
                        />
                        <label htmlFor="buy-trial-checkbox" className="text-xs text-text-secondary font-semibold cursor-pointer">
                          Activate Trial Phase Instead? 
                          <span className="block text-[10px] text-amber-800 font-medium mt-0.5">₹{selectedPlan.trialPrice} for {selectedPlan.trialCredits.toLocaleString()} Credits ({selectedPlan.trialDurationDays} Days) once approved.</span>
                        </label>
                      </div>
                    )}
                    <div>
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">UTR / Transaction Reference Number</label>
                      <input 
                        type="text" 
                        value={utrNumber} onChange={e => setUtrNumber(e.target.value)}
                        className="w-full bg-bg-elevated border border-border-gold rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-border-gold mt-1" 
                        placeholder="e.g. 312345678901"
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={paymentSubmitting}
                    className="w-full py-3 btn-luxury hover:scale-105 transition-transform text-bg-primary rounded-xl text-xs font-bold mt-4 cursor-pointer disabled:opacity-50 transition"
                  >
                    {paymentSubmitting ? "Submitting..." : "Submit Payment for Verification"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
