import React, { useState } from "react";
import { 
  Settings2, ArrowRight, Loader2, X 
} from "lucide-react";
import { motion } from "motion/react";
import { GenerationSettings } from "../types";

interface PromptBarProps {
  inputPrompt: string;
  setInputPrompt: (val: string) => void;
  promptValidationError?: string | null;
  onGenerate: () => void;
  isGenerating: boolean;
  settings: GenerationSettings;
  setSettings: React.Dispatch<React.SetStateAction<GenerationSettings>>;
  appSettings?: any;
}

export default function PromptBar({
  inputPrompt,
  setInputPrompt,
  promptValidationError,
  onGenerate,
  isGenerating,
  settings,
  setSettings,
  appSettings,
}: PromptBarProps) {
  const [showSettings, setShowSettings] = useState(false);

  const handleApplyAspectRatio = (aspect: "1:1" | "16:9" | "9:16" | "4:3") => {
    setSettings(prev => ({ ...prev, aspectRatio: aspect }));
  };

  const handleApplyQuality = (quality: "720p" | "1080p") => {
    setSettings(prev => ({ ...prev, quality }));
  };

  return (
    <div className="w-full shrink-0 bg-bg-primary/90 backdrop-blur-xl border-t border-border-gold px-6 py-4.5 flex flex-col items-center select-none relative z-40">
      
      {/* Advanced Settings/Configuration Overlay Popover */}
      {showSettings && (
        <div className="absolute bottom-20 right-10 w-80 bg-bg-card border border-border-gold rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom-2 duration-200 z-55">
          <div className="flex items-center justify-between pb-2 border-b border-border-gold mb-3">
            <div className="flex items-center gap-1.5">
              <Settings2 className="w-4 h-4 text-text-main" />
              <h4 className="font-sans font-extrabold text-xs text-text-main uppercase tracking-tight">
                Canvas Parameters
              </h4>
            </div>
            <button
              onClick={() => setShowSettings(false)}
              className="p-1 text-text-muted hover:text-text-main rounded-full hover:bg-bg-elevated transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4 text-xs font-semibold text-text-secondary">
            {/* Aspect Ratio picker */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold text-gold-primary uppercase tracking-widest block leading-none">
                Aspect Ratio
              </span>
              <div className="grid grid-cols-4 gap-2.5 pt-1">
                {([
                  { id: "16:9", label: "Land", class: "w-5 h-3" },
                  { id: "9:16", label: "Port", class: "w-3 h-5" },
                  { id: "1:1", label: "Square", class: "w-4 h-4" },
                  { id: "4:3", label: "Std", class: "w-4 h-3" }
                ] as const).map((opt) => (
                  <button
                    key={opt.id}
                    id={`btn-aspect-${opt.id.replace(":", "-")}`}
                    onClick={() => handleApplyAspectRatio(opt.id as any)}
                    className={`py-2 px-1 rounded-xl border font-semibold text-[10px] text-center transition ${
                      settings.aspectRatio === opt.id
                        ? "border-gold-primary bg-gold-primary/10 text-gold-primary shadow-sm"
                        : "border-border-gold bg-bg-card text-text-muted hover:border-border-active hover:text-text-main"
                    }`}
                  >
                    <div className="w-full h-5 flex items-center justify-center mb-1">
                      {/* Geometric ratios representations */}
                      <span className={`border border-current rounded opacity-60 ${opt.class}`}></span>
                    </div>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality selection block */}
            <div className="space-y-1.5 pt-3 border-t border-border-gold">
              <span className="text-[10px] font-extrabold text-gold-primary uppercase tracking-widest block leading-none">
                Image Quality
              </span>
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {(["720p", "1080p"] as const).map((q) => (
                  <button
                    key={q}
                    id={`btn-quality-${q}`}
                    onClick={() => handleApplyQuality(q)}
                    className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition ${
                      settings.quality === q
                        ? "border-gold-primary bg-gold-primary/10 text-gold-primary shadow-sm"
                        : "border-border-gold bg-bg-card text-text-muted hover:border-border-active hover:text-text-main"
                    }`}
                  >
                    <span className="font-semibold text-[10px]">{q === "720p" ? "720p (Fast)" : "1080p (HQ)"}</span>
                    <span className={`text-[8px] font-bold ${settings.quality === q ? "text-gold-primary" : "text-text-muted"}`}>
                      Cost: {
                        q === "720p" ? (appSettings?.creditCost720p ?? 5) : 
                        (appSettings?.creditCost1080p ?? 10)
                      } credits
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Bar Wrapper */}
      <div className="w-full max-w-4xl flex flex-col gap-1.5">
        {promptValidationError && (
          <div id="inline-prompt-error-msg" className="text-error font-extrabold text-xs tracking-wide text-left pl-4 flex items-center gap-1.5 animate-pulse sm:translate-x-32">
            <span>⚠️</span> {promptValidationError}
          </div>
        )}
        <div className="w-full flex items-center gap-1.5 flex-wrap sm:flex-nowrap">

         {/* Input Pill Container - Contains Generate Button */}
         <div className="prompt-wrapper-focus flex-1 w-full sm:min-w-[200px] bg-bg-glass border border-border-gold rounded-full flex items-center px-1 py-1 gap-2 transition shadow-sm relative group hover:border-gold-primary">
           
           <input
             id="text-prompt-input"
             type="text"
             value={inputPrompt}
             onChange={(e) => setInputPrompt(e.target.value)}
             onKeyDown={(e) => {
               if (e.key === "Enter" && !isGenerating) onGenerate();
             }}
             placeholder="Enter your prompt..."
             className="prompt-textarea flex-1 w-full py-4 px-4 rounded-l-full bg-transparent text-sm font-semibold text-text-main placeholder-text-muted focus:outline-none placeholder:font-medium"
             disabled={isGenerating}
           />

           {/* Configuration settings panel toggle */}
           <button
             id="btn-settings-toggle"
             onClick={() => setShowSettings(!showSettings)}
             className={`p-2 rounded-full transition duration-150 flex items-center justify-center ${
               showSettings 
                 ? "bg-gold-primary text-bg-primary shadow-[0_0_10px_var(--color-glow-gold)]" 
                 : "text-text-secondary hover:text-gold-primary hover:bg-bg-elevated"
             }`}
             title="Adjust aspect ratio and quality"
           >
             <Settings2 className="w-4 h-4" />
           </button>
           
           {/* Integrated Generate Button */}
           <motion.button
             id="btn-compiler-master"
             whileHover={{ scale: 1.02, boxShadow: "0 0 10px var(--color-glow-gold)" }}
             whileTap={{ scale: 0.95 }}
             onClick={onGenerate}
             disabled={isGenerating}
             className="shrink-0 bg-gold-primary text-bg-primary disabled:opacity-50 disabled:pointer-events-none py-3 px-5 rounded-full border border-gold-primary font-black text-[10px] tracking-widest uppercase transition duration-150 flex items-center gap-2 shadow-sm cursor-pointer"
           >
             {isGenerating ? (
               <Loader2 className="w-4 h-4 animate-spin text-bg-primary" />
             ) : (
                <ArrowRight className="w-4 h-4 text-bg-primary" />
             )}
           </motion.button>
         </div>
       </div>
     </div>
    </div>
  );
}
