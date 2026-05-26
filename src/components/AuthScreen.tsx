import React, { useState } from "react";
import { Sparkles, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AuthScreenProps {
  onSuccess: (role: string) => void;
  onViewPricing?: () => void;
}

export default function AuthScreen({ onSuccess, onViewPricing }: AuthScreenProps) {
  const [authState, setAuthState] = useState<"signup" | "login" | "verify">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCodeInput, setVerificationCodeInput] = useState("");
  
  // This is the code displayed to the user for testing/current flow
  const [displayedCode, setDisplayedCode] = useState("");
  
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    return String(email).toLowerCase().match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  };

  const clearError = () => setErrorMsg("");

  const parseSafeJson = async (res: Response): Promise<any> => {
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      try {
        return await res.json();
      } catch (e: any) {
        throw new Error(`JSON_PARSE_ERROR: ${e?.message || "Invalid JSON syntax"}`);
      }
    } else {
      throw new Error(`NON_JSON_RESPONSE: Server returned status ${res.status}`);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    const formattedEmail = email.trim();
    if (!formattedEmail) return setErrorMsg("Please enter your email.");
    if (!validateEmail(formattedEmail)) return setErrorMsg("Please enter a valid email address.");
    if (!password) return setErrorMsg("Please enter a password.");
    if (!confirmPassword) return setErrorMsg("Please confirm your password.");
    if (password !== confirmPassword) return setErrorMsg("Passwords do not match.");
    if (password.length < 6) return setErrorMsg("Please choose a stronger password.");

    setIsLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || "") + "/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formattedEmail, password })
      });
      const data = await parseSafeJson(res);
      if (!res.ok) {
        setErrorMsg(data.error || "An error occurred.");
      } else {
        setDisplayedCode(data.verificationCode);
        setAuthState("verify");
      }
    } catch(err: any) {
      console.error("[Sign Up Network Error]", err);
      setErrorMsg("Login service is temporarily unavailable. Please try again after deployment configuration is completed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    const formattedEmail = email.trim();
    if (!formattedEmail) return setErrorMsg("Please enter your email.");
    if (!password) return setErrorMsg("Please enter your password.");

    setIsLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || "") + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formattedEmail, password })
      });
      const data = await parseSafeJson(res);
      if (!res.ok) {
        setErrorMsg(data.error || "Invalid email or password.");
      } else {
        if (formattedEmail === "a64665382@gmail.com" && data.role !== "admin") {
          // Admin config bug case
          setErrorMsg("Unable to open your account right now. Please try again.");
          return;
        }
        localStorage.setItem("whisk_auth_token", data.token);
        localStorage.setItem("whisk_user_role", data.role);
        onSuccess(data.role);
      }
    } catch(err: any) {
      console.error("[Login Network Error]", err);
      setErrorMsg("Login service is temporarily unavailable. Please try again after deployment configuration is completed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!verificationCodeInput) return setErrorMsg("Invalid verification code.");

    setIsLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || "") + "/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verificationCodeInput })
      });
      const data = await parseSafeJson(res);
      if (!res.ok) {
        setErrorMsg(data.error || "Invalid verification code.");
      } else {
        localStorage.setItem("whisk_auth_token", data.token);
        localStorage.setItem("whisk_user_role", data.role);
        onSuccess(data.role);
      }
    } catch(err: any) {
      console.error("[Verification Network Error]", err);
      setErrorMsg("Login service is temporarily unavailable. Please try again after deployment configuration is completed.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenerateNewCode = async () => {
    clearError();
    setIsLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || "") + "/api/auth/generate-new-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await parseSafeJson(res);
      if (!res.ok) {
        setErrorMsg(data.error || "An error occurred.");
      } else {
        setDisplayedCode(data.verificationCode);
      }
    } catch(err: any) {
      console.error("[Generate Code Network Error]", err);
      setErrorMsg("Login service is temporarily unavailable. Please try again after deployment configuration is completed.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderParticles = () => {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gold-primary opacity-20 animate-float-gentle"
            style={{
              width: Math.random() * 6 + 2 + "px",
              height: Math.random() * 6 + 2 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              animationDuration: (Math.random() * 10 + 5) + "s",
              animationDelay: (Math.random() * 5) + "s",
              boxShadow: "0 0 10px rgba(255, 215, 0, 0.4)",
            }}
          />
        ))}
      </div>
    );
  };

  if (authState === "verify") {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="h-screen w-screen bg-bg-primary flex flex-col items-center justify-center p-6 sm:p-10 select-none text-text-main relative overflow-hidden"
      >
        {renderParticles()}
        
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-primary/10 via-bg-primary to-bg-primary z-0 animate-pulse" />

        <motion.div 
          initial={{ y: 30, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5, type: "spring", stiffness: 100 }}
          className="w-full max-w-[400px] glass-panel p-8 rounded-3xl shadow-2xl border border-border-gold flex flex-col items-center z-10 animate-glow-pulse"
        >
          
          <button 
            onClick={() => setAuthState("signup")}
            className="absolute top-6 left-6 text-text-muted hover:text-gold-primary transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="inline-flex p-3 bg-gradient-to-br from-gold-primary to-gold-champagne text-bg-primary rounded-2xl shadow-[0_0_20px_var(--color-glow-gold)] mb-4">
            <Sparkles className="w-6 h-6 fill-current" />
          </div>
          
          <h2 className="text-xl font-extrabold text-white mb-2 tracking-tight">Verify Your Account</h2>
          <p className="text-sm font-medium text-text-muted text-center mb-6">
            We sent a verification code to your email. Enter it below to start compiling.
          </p>
          
          <div className="w-full bg-bg-elevated p-4 rounded-xl border border-border-gold border-dashed mb-6 text-center select-text">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-1">Test Code (Demo)</span>
            <span className="text-lg font-mono font-bold tracking-[0.25em] text-gold-primary">{displayedCode}</span>
          </div>
          
          <form onSubmit={handleVerify} className="w-full flex flex-col gap-4">
            <input 
              type="text" 
              placeholder="Verification Code" 
              className="w-full px-4 py-3 rounded-xl border border-border-gold bg-bg-elevated text-gold-primary placeholder-text-muted focus:outline-none focus:border-gold-primary focus:ring-1 focus:ring-gold-primary/50 text-center font-mono tracking-widest transition"
              value={verificationCodeInput}
              onChange={(e) => setVerificationCodeInput(e.target.value.replace(/[^0-9]/g, ''))}
              maxLength={6}
            />
            
            {errorMsg && <p className="text-red-400 text-xs font-semibold text-center">{errorMsg}</p>}
            
            <motion.button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-4 btn-luxury flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? "Verifying..." : "Verify & Sign Up"}
            </motion.button>
          </form>
          
          <button 
            type="button" 
            onClick={handleGenerateNewCode} 
            disabled={isLoading}
            className="mt-6 text-xs text-text-muted hover:text-gold-primary font-medium cursor-pointer transition disabled:opacity-50"
          >
            Generate New Code
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="h-screen w-screen bg-bg-primary flex flex-col items-center justify-center p-6 sm:p-10 select-none text-text-main relative overflow-hidden"
    >
      {renderParticles()}
      
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-primary/5 via-bg-primary to-bg-primary pointer-events-none z-0" />

      <motion.div 
        initial={{ y: 30, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.6, type: "spring", stiffness: 80 }}
        className="w-full max-w-[400px] glass-panel p-8 rounded-3xl z-10 flex flex-col items-center relative animate-glow-pulse"
      >
        <div className="inline-flex p-3 bg-gradient-to-br from-gold-primary to-gold-champagne text-bg-primary rounded-2xl shadow-[0_0_25px_var(--color-glow-gold)] mb-6 transform rotate-3 hover:rotate-0 transition duration-300">
          <Sparkles className="w-6 h-6 fill-current animate-pulse" />
        </div>
        
        <div className="flex w-full mb-8 bg-bg-elevated p-1.5 rounded-xl border border-border-gold shadow-inner">
          <button
            type="button"
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${authState === "signup" ? "bg-bg-glass shadow-[0_0_10px_var(--color-glow-gold)] text-gold-primary border border-border-gold" : "text-text-muted hover:text-text-main cursor-pointer"}`}
            onClick={() => { setAuthState("signup"); clearError(); }}
          >
            Sign Up
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${authState === "login" ? "bg-bg-glass shadow-[0_0_10px_var(--color-glow-gold)] text-gold-primary border border-border-gold" : "text-text-muted hover:text-text-main cursor-pointer"}`}
            onClick={() => { setAuthState("login"); clearError(); }}
          >
            Login
          </button>
        </div>

        <form onSubmit={authState === "signup" ? handleSignUp : handleLogin} className="w-full flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            <motion.div layout>
              <input 
                type="text" 
                placeholder="Email" 
                className="w-full px-4 py-3 rounded-xl border border-border-gold bg-bg-elevated text-gold-primary placeholder-text-muted focus:outline-none focus:border-gold-primary focus:ring-1 focus:ring-gold-primary/50 text-sm transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </motion.div>
            <motion.div layout>
              <input 
                type="password" 
                placeholder="Password" 
                className="w-full px-4 py-3 rounded-xl border border-border-gold bg-bg-elevated text-gold-primary placeholder-text-muted focus:outline-none focus:border-gold-primary focus:ring-1 focus:ring-gold-primary/50 text-sm transition mt-1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </motion.div>
            {authState === "signup" && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <input 
                  type="password" 
                  placeholder="Confirm Password" 
                  className="w-full px-4 py-3 rounded-xl border border-border-gold bg-bg-elevated text-gold-primary placeholder-text-muted focus:outline-none focus:border-gold-primary focus:ring-1 focus:ring-gold-primary/50 text-sm transition mt-1"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {errorMsg && <p className="text-red-400 text-xs font-semibold text-center mt-1 animate-slide-up-fade">{errorMsg}</p>}

          <motion.button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 mt-2 btn-luxury flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wider text-xs"
          >
            {isLoading 
              ? (authState === "signup" ? "Creating Account..." : "Logging In...") 
              : (authState === "signup" ? "Start Compiling Free" : "Login to Workspace")}
          </motion.button>
        </form>

        <button 
          type="button"
          onClick={() => {
            setAuthState(authState === "signup" ? "login" : "signup");
            clearError();
          }}
          className="mt-6 text-xs text-text-muted hover:text-gold-primary font-medium cursor-pointer transition"
        >
          {authState === "signup" ? "Already have an account? Login" : "New creator? Sign Up & Earn Credits"}
        </button>

        {onViewPricing && (
          <>
            <div className="w-full my-5 border-t border-border-gold/50 flex items-center justify-center relative">
              <span className="bg-bg-primary px-3 text-[10px] uppercase tracking-widest text-text-muted font-bold absolute top-[-7px]">OR</span>
            </div>
            <button 
              type="button"
              onClick={onViewPricing}
              className="text-xs font-extrabold text-gold-primary hover:text-gold-primary/80 flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Go back to Pricing
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
