import React, { useState, useEffect, useRef } from "react";
import { get as idbGet, set as idbSet } from "./idb";
import Sidebar from "./components/Sidebar";
import CanvasWorkspace from "./components/CanvasWorkspace";
import PromptBar from "./components/PromptBar";
import MyLibraryDrawer from "./components/MyLibraryDrawer";
import AuthScreen from "./components/AuthScreen";
import AdminDashboard from "./components/AdminDashboard";
import Plans from "./components/Plans";
import { SelectedFile, GeneratedImage, GenerationSettings } from "./types";
import { PRESETS } from "./data";
import { 
  Sparkles, Layers, Sliders, Cpu, ChevronRight, Check,
  Info, Shield, Zap, Globe, Clock, ArrowUpRight, HelpCircle, Heart, Star, BookOpen, LogOut, Lock,
  User, Settings, Calendar, DollarSign, X, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";


// Central provider mapping configuration for Pollinations AI's robust "default" model
export function resolveGenerationConfig(
  aspectRatio: string,
  quality: string
) {
  const allowedRatios = ["1:1", "16:9", "9:16", "4:3"];
  const allowedQualities = ["720p", "1080p"];

  if (!allowedRatios.includes(aspectRatio) || !allowedQualities.includes(quality)) {
    return {
      supported: false,
      width: 1024,
      height: 1024,
      model: "default"
    };
  }

  let width = 1024;
  let height = 1024;
  const model = "default";

  if (quality === "720p") {
    if (aspectRatio === "16:9") {
      width = 768;
      height = 432;
    } else if (aspectRatio === "9:16") {
      width = 432;
      height = 768;
    } else if (aspectRatio === "4:3") {
      width = 768;
      height = 576;
    } else if (aspectRatio === "1:1") {
      width = 768;
      height = 768;
    }
  } else if (quality === "1080p") {
    if (aspectRatio === "16:9") {
      width = 1024;
      height = 576;
    } else if (aspectRatio === "9:16") {
      width = 576;
      height = 1024;
    } else if (aspectRatio === "4:3") {
      width = 1024;
      height = 768;
    } else if (aspectRatio === "1:1") {
      width = 1024;
      height = 1024;
    }
  }

  return {
    supported: true,
    width,
    height,
    model
  };
}

export default function App() {
  // Application Primary States
  const [subjects, setSubjects] = useState<SelectedFile[]>([]);
  const [scenes, setScenes] = useState<SelectedFile[]>([]);
  const [styles, setStyles] = useState<SelectedFile[]>([]);
  const [inputPrompt, setInputPrompt] = useState<string>("");
  const [images, setImages] = useState<GeneratedImage[]>([]);

  // Active request tracking to prevent duplicate/stale responses
  const activeRequestIdRef = useRef<number>(0);
  const isFallbackDisabledRef = useRef<boolean>(false);

  // UX Control States
  const [activeTab, setActiveTab] = useState<"generator" | "pricing" | "admin">("generator");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>("Analyzing formula ingredients...");
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [promptValidationError, setPromptValidationError] = useState<string | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);
  const [hideImages, setHideImages] = useState<boolean>(false);
  
  const [hasEntered, setHasEntered] = useState<boolean>(false);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>("user");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [appSettingsState, setAppSettingsState] = useState<any>(null);
  const [showPricingGuest, setShowPricingGuest] = useState<boolean>(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Settings configs
  const [settings, setSettings] = useState<GenerationSettings>({
    aspectRatio: "16:9",
    imageCount: 1,
    creativityLevel: 4,
    styleWeight: 80,
    dimensions: { width: 1024, height: 576 },
    quality: "1080p",
  });

  // Helper to format dates beautifully inside subscription settings
  const formatSubscriptionDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "N/A";
    if (dateStr === "Lifetime") return "Lifetime (Unlimited)";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  // Helper to calculate and format time remaining
  const calculateTimeRemaining = (dateStr: string | null | undefined) => {
    if (!dateStr || dateStr === "Lifetime") {
      return "Unlimited (Continuous Access)";
    }
    try {
      const expiry = new Date(dateStr).getTime();
      const now = Date.now();
      const diff = expiry - now;
      if (diff <= 0) {
        return "Expired (Renews on purchase)";
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        return `${days} day${days > 1 ? "s" : ""} and ${hours} hour${hours > 1 ? "s" : ""} remaining`;
      } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? "s" : ""} and ${minutes} minute${minutes > 1 ? "s" : ""} remaining`;
      } else {
        return `${minutes} minute${minutes > 1 ? "s" : ""} remaining`;
      }
    } catch {
      return "Active";
    }
  };

  // Helper to format subscription cost
  const formatSubscriptionCost = (cost: any, planId: string) => {
    if (cost === 0 || cost === "0") {
      if (planId === "base") {
        return "Free (Base Tier)";
      }
      return "Free (YouTube Task)";
    }
    if (cost === undefined || cost === null) {
      return "N/A";
    }
    return `$${cost}.00 USD`;
  };

  const handleSetInputPrompt = (val: string) => {
    setInputPrompt(val);
    if (val.trim()) {
      setPromptValidationError(null);
    }
  };

  // Calculate pixel dimensions based on aspect ratio and quality using central config mapping
  useEffect(() => {
    const config = resolveGenerationConfig(settings.aspectRatio, settings.quality);
    setSettings(prev => ({
      ...prev,
      dimensions: { width: config.width, height: config.height }
    }));
  }, [settings.aspectRatio, settings.quality]);

  // Load creations from IDB scoped by user email to ensure strict data isolation
  useEffect(() => {
    async function loadCache() {
      if (isAuthenticated && userProfile?.email) {
        const cacheKey = "whisk_creations_idb_" + userProfile.email;
        const cached = await idbGet(cacheKey);
        if (cached) {
          try {
            setImages(JSON.parse(cached as string));
          } catch (err) {
            console.error("Failed to parse cached library. Clearing cache.", err);
            await idbSet(cacheKey, JSON.stringify([]));
            setImages([]);
          }
        } else {
          setImages([]);
        }
      } else {
        setImages([]);
      }
    }
    loadCache();
  }, [isAuthenticated, userProfile?.email]);

  useEffect(() => {
    // Check initial auth state
    const token = localStorage.getItem("whisk_auth_token");
    if (token) {
      setIsAuthenticated(true);
      setUserRole(localStorage.getItem("whisk_user_role") || "user");
    }
  }, []);

  // Fetch updated user profile and balance when authenticated or after generation
  const fetchUserProfile = async () => {
    const token = localStorage.getItem("whisk_auth_token");
    if (!token) return;
    try {
      const res = await fetch("/api/user/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserProfile(data.user);
        if (data.appSettings) {
          setAppSettingsState(data.appSettings);
        }
      }
    } catch (e) {
      console.error("Failed to fetch user profile:", e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated]);

  // Scoped logout to completely wipe private states & prevent data leak across users
  const handleLogout = () => {
    localStorage.removeItem("whisk_auth_token");
    localStorage.removeItem("whisk_user_role");
    
    setIsAuthenticated(false);
    setUserRole("user");
    setUserProfile(null);
    setHasEntered(false);
    
    // Wipe workspace inputs & states to avoid showing previous state to a newly logged-in user
    setInputPrompt("");
    setImages([]);
    setSubjects([]);
    setScenes([]);
    setStyles([]);
    setSettings({
      aspectRatio: "16:9",
      imageCount: 1,
      creativityLevel: 4,
      styleWeight: 80,
      dimensions: { width: 1024, height: 576 },
      quality: "1080p",
    });
    setActiveTab("generator");
  };

  // Sync creations back to IDB whenever they change, scoped by user email
  const saveCreationsToCache = (updatedList: GeneratedImage[]) => {
    setImages(updatedList);
    if (isAuthenticated && userProfile?.email) {
      const cacheKey = "whisk_creations_idb_" + userProfile.email;
      idbSet(cacheKey, JSON.stringify(updatedList)).catch(e => console.error("IDB save error", e));
    } else {
      idbSet("whisk_creations_idb", JSON.stringify(updatedList)).catch(e => console.error("IDB save error", e));
    }
  };

  // Master Prompt Generation handler (Uses exact user-entered prompt without auto-expansion or modification)
  const handleGenerateImage = async () => {
    if (isGenerating) return;
    const currentPrompt = inputPrompt.trim();

    if (!currentPrompt) {
      setPromptValidationError("Please enter an image prompt.");
      return;
    }
    setPromptValidationError(null);

    // Track active request ID to prevent duplicate or stale updates
    const requestId = ++activeRequestIdRef.current;

    setGenerationError(null);
    setGenerationProgress(0);
    setIsGenerating(true);

    const config = resolveGenerationConfig(settings.aspectRatio, settings.quality);
    if (!config.supported) {
      setIsGenerating(false);
      setGenerationError("Selected ratio or quality is not supported. Please choose another setting.");
      return;
    }

    const { width: requestWidth, height: requestHeight, model: configModel } = config;

    const token = localStorage.getItem("whisk_auth_token");
    let cost = 0;
    try {
      const startRes = await fetch("/api/generations/start", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ quality: settings.quality })
      });
      const startData = await startRes.json();
      if (!startRes.ok) {
        setIsGenerating(false);
        setGenerationError(startData.error || "Generation error");
        return;
      }
      cost = startData.cost;
    } catch(err) {
      setIsGenerating(false);
      setGenerationError("Failed to verifying credits.");
      return;
    }

    // 1. Quality-aware timeout and model configuration mapping
    let generationTimeoutMs = 60000; // default 60s
    let statusMsg = "Mixing visual composite...";

    if (settings.quality === "720p") {
      generationTimeoutMs = 45000;   // 45 seconds for draft
      statusMsg = "Mixing fast 720p draft composite (Flux)...";
    } else if (settings.quality === "1080p") {
      generationTimeoutMs = 90000;  // 90 seconds
      statusMsg = "Generating balanced standard 1080p HD composition (Flux)...";
    }

    setStatusText(statusMsg);

    // Smooth perceived progress generator
    let currentProgress = 0;
    const progressTimer = setInterval(() => {
      const remaining = 95 - currentProgress;
      const step = Math.max(1, Math.min(8, remaining * 0.15 + Math.random() * 2));
      currentProgress += step;
      if (currentProgress >= 95) {
        currentProgress = 95;
      }
      setGenerationProgress(currentProgress);
    }, 85);

    try {
      // Use the exact prompt string exactly as entered without prompt enhancement or modifications
      const finalBlendedPrompt = currentPrompt;
      console.log("[Whisk Generation Engine] Outgoing image request prompt:", finalBlendedPrompt);

      // Request a dynamic, free text-to-image graphic
      const randomSeed = Math.floor(Math.random() * 9999999);
      
      const token = localStorage.getItem("whisk_auth_token");
      const payload: any = {
         prompt: finalBlendedPrompt,
         width: requestWidth,
         height: requestHeight,
         references: []
      };
      if (subjects.length > 0) payload.references.push({ type: "character", dataUrl: subjects[0].dataUrl });
      if (scenes.length > 0) payload.references.push({ type: "scene", dataUrl: scenes[0].dataUrl });
      if (styles.length > 0) payload.references.push({ type: "style", dataUrl: styles[0].dataUrl });

      const proxyRes = await fetch("/api/generate-image", {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
         },
         body: JSON.stringify(payload)
      });

      if (!proxyRes.ok) {
        let errMessage = "Image proxy generation failed.";
        try {
           const errData = await proxyRes.json();
           if (errData.error) errMessage = errData.error;
        } catch(e) { }
        throw new Error(errMessage);
      }
      
      const blob = await proxyRes.blob();
      
      const successUrl = await new Promise<string>((resolve) => {
         const reader = new FileReader();
         reader.onloadend = () => resolve(reader.result as string);
         reader.readAsDataURL(blob);
      });

      // Verify if this is still the active request before checking status or preloading
      if (requestId !== activeRequestIdRef.current) {
        clearInterval(progressTimer);
        console.log("[Whisk] Ignored old generation request fetch response:", requestId);
        return;
      }

      // Done preloading, transition clearly to 100%
      clearInterval(progressTimer);
      setGenerationProgress(100);

      // Squeeze tiny pause (150ms) to let visual satisfaction register
      await new Promise((r) => setTimeout(r, 150));

      const title = currentPrompt.substring(0, 30) + (currentPrompt.length > 30 ? "..." : "");
      
      const now = new Date();
      const dateString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " - " + now.toLocaleDateString([], { month: 'short', day: 'numeric' });
      
      const newImage: GeneratedImage = {
        id: `gen-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: title,
        prompt: finalBlendedPrompt,
        imageUrl: successUrl,
        timestamp: dateString,
        aspectRatio: settings.aspectRatio,
        tags: ["Imagen Studio"],
        recipe: {
          subject: subjects.length > 0 ? subjects.map(s => s.name).join(" + ") : "Imagen Studio",
          scene: scenes.length > 0 ? scenes.map(s => s.name).join(" + ") : "Imagen Studio",
          style: styles.length > 0 ? styles.map(s => s.name).join(" + ") : "Imagen Studio",
        }
      };

      // Add to beginning of active grid
      const updatedList = [newImage, ...images];
      saveCreationsToCache(updatedList);

      // Complete credit deduction
      try {
        const completeRes = await fetch("/api/generations/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ quality: settings.quality })
        });
        if (completeRes.ok) {
           fetchUserProfile(); // Refresh credits
        }
      } catch (err) {
        console.error("Failed to complete credit deduction", err);
      }

    } catch (error: any) {
      // Discard errors from canceled/old requests
      if (requestId !== activeRequestIdRef.current) {
        clearInterval(progressTimer);
        console.log("[Whisk] Ignored stale error for request:", requestId);
        return;
      }

      console.error("Generation pipeline halted with error:", error);
      clearInterval(progressTimer);

      let mappedError = error?.message || "NVIDIA image generation failed. Please retry.";
      if (mappedError.includes("Image proxy generation failed")) {
         mappedError = "NVIDIA image generation failed. Please retry.";
      }
      setGenerationError(mappedError);
    } finally {
      if (requestId === activeRequestIdRef.current) {
        setIsGenerating(false);
      }
    }
  };

  // Discard specified creation
  const handleDeleteImage = (id: string) => {
    const updated = images.filter((img) => img.id !== id);
    saveCreationsToCache(updated);
  };



  // Load a complete custom dice oracle recipe
  const handleLoadCustomRecipe = (recipe: { subject: string; scene: string; style: string }) => {
    const customSubjId = `usr-subj-${Date.now()}`;
    const customSceneId = `usr-scene-${Date.now()}`;
    const customStyleId = `usr-style-${Date.now()}`;

    setSubjects([
      {
        id: customSubjId,
        name: recipe.subject,
        dataUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&q=50",
        isPreset: false,
      }
    ]);

    setScenes([
      {
        id: customSceneId,
        name: recipe.scene,
        dataUrl: "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?w=100&q=50",
        isPreset: false,
      }
    ]);

    setStyles([
      {
        id: customStyleId,
        name: recipe.style,
        dataUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&q=50",
        isPreset: false,
      }
    ]);
    setActiveTab("generator");
  };

  // Load specific preset recipe combination directly and activate generator laboratory
  const handleLoadSpecificPresetCombination = (
    subjName: string, 
    sceneName: string, 
    styleName: string, 
    customCue: string,
    subjUrl: string,
    sceneUrl: string,
    styleUrl: string
  ) => {
    setSubjects([
      {
        id: `preset-subj-${Date.now()}`,
        name: subjName,
        dataUrl: subjUrl,
        isPreset: true,
      }
    ]);

    setScenes([
      {
        id: `preset-scene-${Date.now()}`,
        name: sceneName,
        dataUrl: sceneUrl,
        isPreset: true,
      }
    ]);

    setStyles([
      {
        id: `preset-style-${Date.now()}`,
        name: styleName,
        dataUrl: styleUrl,
        isPreset: true,
      }
    ]);

    setInputPrompt(customCue);
    setActiveTab("generator");
  };

  if (!hasEntered) {
    const renderParticles = () => (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gold-primary opacity-20 animate-float-gentle"
            style={{
              width: Math.random() * 6 + 2 + "px",
              height: Math.random() * 6 + 2 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              animationDuration: (Math.random() * 15 + 10) + "s",
              animationDelay: (Math.random() * 5) + "s",
              boxShadow: "0 0 10px rgba(255, 215, 0, 0.4)",
            }}
          />
        ))}
      </div>
    );

    return (
      <div className={`h-screen w-screen bg-bg-primary flex flex-col items-center justify-center p-6 select-none overflow-hidden relative transition-opacity duration-700 ${isFadingOut ? "opacity-0" : "opacity-100"}`}>
        
        {renderParticles()}
        
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gold-primary rounded-full mix-blend-screen animate-gold-flicker opacity-20 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gold-champagne rounded-full mix-blend-screen animate-gold-flicker opacity-15 blur-[100px]" />
        </div>

        {/* Premium Content */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="text-center relative z-10 w-full max-w-lg px-4"
        >
          {/* Animated Website Title */}
          <h1 className="text-6xl sm:text-7xl font-display font-bold tracking-tight text-text-main mb-3 relative">
            <span className="bg-gradient-to-r from-text-main via-gold-champagne to-text-main bg-clip-text text-transparent animate-gradient-slow">
              Imagen Studio
            </span>
          </h1>

          <p className="font-sans text-text-secondary tracking-[0.2em] uppercase text-xs mb-10">
            Create Beyond Imagination
          </p>

          {/* Premium Enter Button */}
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px var(--color-glow-gold)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsFadingOut(true);
              setTimeout(() => {
                setHasEntered(true);
              }, 300);
            }}
            className="px-12 py-4 bg-bg-glass text-text-main border border-border-gold rounded-full transition-all duration-300 hover:border-border-active cursor-pointer relative group overflow-hidden"
          >
            <span className="relative z-10 text-sm font-semibold tracking-widest uppercase">Enter</span>
            <div className="absolute inset-0 bg-gold-primary opacity-0 hover:opacity-10 transition-opacity duration-300" />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (hasEntered && !isAuthenticated) {
    if (showPricingGuest) {
      return (
        <div className="h-screen w-screen bg-bg-primary flex flex-col font-sans select-none antialiased overflow-hidden">
          <header className="h-16 bg-bg-secondary/80 flex border-b border-border-gold backdrop-blur-md px-6 flex items-center justify-between z-35 shrink-0 shadow-sm">
            <span className="text-base font-black tracking-tight text-text-main font-sans">Imagen Studio Workspace</span>
            <button 
              onClick={() => setShowPricingGuest(false)}
              className="px-4 py-2 text-xs font-bold text-text-main bg-gold-primary rounded-xl transition cursor-pointer hover:bg-gold-soft text-bg-primary"
            >
              Back to Access / Login
            </button>
          </header>
          <div className="flex-1 overflow-y-auto p-6 md:p-12">
            <Plans 
              userProfile={null} 
              onPlanPurchased={() => {}} 
              onAuthRedirect={() => setShowPricingGuest(false)} 
            />
          </div>
        </div>
      );
    }

    return (
      <AuthScreen 
        onSuccess={(role) => {
          setIsAuthenticated(true);
          setUserRole(role);
        }} 
        onViewPricing={() => setShowPricingGuest(true)}
      />
    );
  }

  if (hasEntered && isAuthenticated && userRole === "admin" && activeTab === "admin") {
    return <AdminDashboard onLogout={handleLogout} onBackToWorkspace={() => setActiveTab("generator")} />;
  }

  return (
    <div className="h-screen w-screen bg-bg-primary font-sans antialiased text-slate-100 flex relative overflow-hidden">
      
      {/* 1. COLLAPSIBLE MOBILE SIDEBAR DRAWER OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative flex w-80 max-w-[85%] flex-col h-full bg-gold-primary text-text-main shadow-2xl shadow-gold-primary/20 animate-in slide-in-from-left duration-200">
            <Sidebar
              subjects={subjects}
              scenes={scenes}
              styles={styles}
              setSubjects={setSubjects}
              setScenes={setScenes}
              setStyles={setStyles}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onCloseMobileDrawer={() => setIsMobileMenuOpen(false)}
              userProfile={userProfile}
            />
          </div>
        </div>
      )}

      {/* 2. FIXED SIDE REGISTRATION ON DESKTOP */}
      <div className="hidden md:flex flex-col h-full shrink-0">
        <Sidebar
          subjects={subjects}
          scenes={scenes}
          styles={styles}
          setSubjects={setSubjects}
          setScenes={setScenes}
          setStyles={setStyles}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userProfile={userProfile}
        />
      </div>

      {/* 3. DYNAMIC WORKSPACE COMPOSER PANEL */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* RIGHT TOPBAR NAVIGATION SHELL */}
        <header className="shrink-0 bg-bg-glass backdrop-blur-md border-b border-border-gold shadow-sm relative z-30">
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-3">
              {/* Mobile Sidebar toggle menu */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-xl bg-bg-primary/80 hover:bg-slate-800 border border-slate-800 text-text-main transition cursor-pointer"
                title="Open Navigation"
              >
                <svg className="w-5 h-5 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h18m-7 6h7" />
                </svg>
              </button>

              <span className="text-base font-black tracking-tight text-white md:pr-4">
                Imagen Studio
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Plan/Credits Display (Compact on mobile) */}
              {userProfile && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-elevated rounded-xl border border-border-gold shadow-sm text-[11px] font-bold select-none text-text-main">
                  <span className="text-slate-500 font-bold uppercase text-[9px] hidden sm:inline">Credits:</span>
                  <span className="text-white font-black">{userProfile.credits}</span>
                </div>
              )}

              {/* User Profile */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="bg-bg-elevated text-text-main hover:bg-slate-100 border border-slate-200 text-text-main p-1.5 rounded-full transition flex items-center justify-center shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-300"
                  title="Your Profile & Settings"
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-gold-primary to-gold-champagne text-bg-primary font-sans font-black text-[10px] rounded-full flex items-center justify-center uppercase shadow-sm">
                    {userProfile?.email ? userProfile.email.slice(0, 2) : "US"}
                  </div>
                </button>
                {/* Profile Dropdown ... (existing dropdown logic remains) */}
                {showProfileDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileDropdown(false)} />
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-bg-card border border-border-gold shadow-xl overflow-hidden z-50 py-1.5 animate-in fade-in slide-in-from-top-3 duration-150">
                      {/* ... (existing dropdown content) ... */}
                      <div className="px-4 py-2 border-b border-border-gold/30">
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Logged in as</p>
                        <p className="text-xs font-black text-text-main truncate" title={userProfile?.email}>{userProfile?.email || "Guest User"}</p>
                      </div>
                      <div className="p-1">
                        <button onClick={() => { setIsSettingsOpen(true); setShowProfileDropdown(false); }} className="w-full px-3 py-2 rounded-xl text-left text-xs font-medium text-slate-700 hover:bg-bg-elevated text-text-main hover:text-text-main transition flex items-center gap-2 cursor-pointer">
                          <Settings className="w-3.5 h-3.5 text-slate-400" />
                          <span>Settings</span>
                        </button>
                        <button onClick={() => { setShowProfileDropdown(false); handleLogout(); }} className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-rose-600 hover:bg-rose-50/50 hover:text-rose-700 transition flex items-center gap-2 cursor-pointer">
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Log out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tab Row: Horizontal scrollable */}
          <div className="flex h-12 items-center px-4 overflow-x-auto no-scrollbar gap-2 border-t border-border-gold/50">
            <button onClick={() => setActiveTab("generator")} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition ${activeTab === "generator" ? "bg-gold-primary text-bg-primary" : "text-text-secondary hover:text-text-main hover:bg-bg-elevated"}`}>Laboratory</button>
            <button onClick={() => setActiveTab("pricing")} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition ${activeTab === "pricing" ? "bg-gold-primary text-bg-primary" : "text-text-secondary hover:text-text-main hover:bg-bg-elevated"}`}>Buy Credit</button>
            {userRole === "admin" && (
                <button onClick={() => setActiveTab("admin")} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition ${activeTab === "admin" ? "bg-gold-primary text-bg-primary" : "text-text-secondary hover:text-text-main hover:bg-bg-elevated"}`}>Admin</button>
            )}
            <button onClick={() => setIsLibraryOpen(true)} className="whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-text-secondary hover:text-text-main hover:bg-bg-elevated transition flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Library
            </button>
          </div>
        </header>

        {/* WORKSPACE CENTRAL WORK PANES */}
        <div className="flex-1 overflow-hidden flex flex-col relative h-full">
          {activeTab === "generator" && (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                <CanvasWorkspace
                  images={images}
                  onDeleteImage={handleDeleteImage}
                  isGenerating={isGenerating}
                  statusText={statusText}
                  subjects={subjects}
                  scenes={scenes}
                  styles={styles}
                  onQuickGenerate={handleGenerateImage}
                  hideImages={hideImages}
                  generationProgress={generationProgress}
                  generationError={generationError}
                  onClearError={() => setGenerationError(null)}
                  settings={settings}
                  inputPrompt={inputPrompt}
                />
              </div>
              
              <PromptBar
                inputPrompt={inputPrompt}
                setInputPrompt={handleSetInputPrompt}
                promptValidationError={promptValidationError}
                onGenerate={handleGenerateImage}
                isGenerating={isGenerating}
                settings={settings}
                setSettings={setSettings}
                appSettings={appSettingsState}
              />
            </div>
          )}

          {activeTab === "pricing" && (
            <div className="flex-1 overflow-y-auto bg-bg-primary p-4 sm:p-6 md:p-10 scrollbar-thin">
              <Plans userProfile={userProfile} onPlanPurchased={fetchUserProfile} />
            </div>
          )}
        </div>

      </div>

      {/* 4. MODALS/LIBRARY PERSISTENCE VIEWS */}
      
      {isLibraryOpen && (
        <MyLibraryDrawer
          isOpen={isLibraryOpen}
          onClose={() => setIsLibraryOpen(false)}
          images={images}
          onDeleteImage={handleDeleteImage}
          onSelectImage={() => {}}
        />
      )}

      {/* 5. USER PROFILE SETTINGS & SUBSCRIPTION MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-border-gold">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-bg-elevated text-text-main">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-text-main animate-spin" style={{ animationDuration: '6s' }} />
                <h3 className="font-extrabold text-text-main text-sm">Account Settings</h3>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(false)} 
                className="p-1 hover:bg-slate-200 rounded-full text-slate-500 cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              
              {/* User Profile Info section */}
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-bg-elevated text-text-main border border-border-gold">
                <div className="w-10 h-10 bg-gradient-to-br from-[#00F0FF] to-purple-500 rounded-full flex items-center justify-center font-black text-xs text-neutral-900 shadow-sm uppercase shrink-0">
                  {userProfile?.email ? userProfile.email.slice(0, 2) : "US"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Account</p>
                  <p className="text-xs font-black text-text-main truncate">{userProfile?.email || "N/A"}</p>
                </div>
                <div className="shrink-0 font-mono text-xs text-slate-500 bg-bg-primary border border-border-gold rounded-lg py-1 px-2.5 font-bold">
                  {userProfile?.credits ?? 0} Cr
                </div>
              </div>

              {/* Subscription Details Section */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Subscription Plan Details</h4>
                
                {/* 1. Plan Name */}
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-bg-elevated text-text-main transition border border-transparent hover:border-slate-150">
                  <div className="flex items-center gap-2.5">
                    <Zap className="w-4 h-4 text-gold-primary shrink-0" />
                    <span className="text-xs font-bold text-slate-700">Active Membership</span>
                  </div>
                  <span className="text-xs font-black uppercase text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                    {userProfile?.plan === "ultra_premium" ? "Ultra Premium" : userProfile?.plan === "pro" ? "Pro" : userProfile?.plan === "best" ? "Basic" : "Base"}
                  </span>
                </div>

                {/* 3. Validity Expires */}
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-bg-elevated text-text-main transition border border-transparent hover:border-slate-150">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="text-xs font-bold text-slate-700">Expiration Date</span>
                  </div>
                  <span className="text-xs font-black text-text-main">
                    {formatSubscriptionDate(userProfile?.subscriptionExpires)}
                  </span>
                </div>

                {/* 4. Time Remaining */}
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-bg-elevated text-text-main transition border border-transparent hover:border-slate-150">
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-purple-500 shrink-0" />
                    <span className="text-xs font-bold text-slate-700">Time Remaining</span>
                  </div>
                  <span className="text-xs font-black text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-100">
                    {calculateTimeRemaining(userProfile?.subscriptionExpires)}
                  </span>
                </div>

              </div>

              {/* Close Button / Manage Button */}
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="w-full mt-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-[11px] uppercase tracking-wider rounded-xl transition cursor-pointer text-center"
              >
                Close Settings
              </button>

            </div>
          </div>
        </div>
      )}



    </div>
  );
}
