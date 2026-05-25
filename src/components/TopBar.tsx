import React, { useState } from "react";
import { Sparkles, Library, Bell, HelpCircle, Play, Layers, BadgeAlert } from "lucide-react";
import { SelectedFile } from "../types";

interface TopBarProps {
  onLoadDemoRecipe: () => void;
  onToggleLibrary: () => void;
  libraryCount: number;
}

export default function TopBar({
  onLoadDemoRecipe,
  onToggleLibrary,
  libraryCount,
}: TopBarProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <header className="h-16 shrink-0 bg-bg-glass backdrop-blur-md border-b border-border-gold px-4 md:px-8 flex items-center justify-between select-none relative z-30">
      
      {/* Left: App Logo + Info Badge */}
      <div className="flex items-center space-x-3">
        <span className="text-xl font-bold tracking-tight text-text-main">
          Imagen Studio
        </span>
        <span className="hidden sm:flex px-2 py-0.5 bg-bg-card border border-border-gold text-[10px] font-bold text-gold-primary rounded uppercase tracking-tighter">
          Experiment
        </span>
      </div>

      {/* Center: "Try Flow" dynamic workflow loader */}
      <div className="hidden sm:block relative group">
        <button
          id="btn-try-flow"
          onClick={onLoadDemoRecipe}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="px-5 py-2 text-sm font-semibold border border-border-gold rounded-full hover:bg-bg-elevated transition-colors flex items-center gap-2 text-gold-champagne bg-bg-card shadow-[0_0_8px_var(--color-glow-gold)]"
        >
          <Play className="w-3.5 h-3.5 fill-current text-gold-primary" />
          <span>Try Flow</span>
        </button>
        
        {/* Help tooltip showing what Try Flow does */}
        {showTooltip && (
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-56 bg-bg-elevated text-text-main text-[10px] font-medium p-2.5 rounded-xl border border-border-gold shadow-2xl text-center animate-in fade-in slide-in-from-top-1 duration-150 pointer-events-none z-50">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 border-4 border-transparent border-b-bg-elevated"></div>
            <strong className="text-gold-primary">Instant Recipe!</strong> Click to auto-mix a preloaded Subject, Scene, and Style key inside Imagen Studio.
          </div>
        )}
      </div>

      {/* Right: Library + Alert Icons + Avatar */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar ml-auto">
        {/* My Library Button */}
        <button
          id="btn-toggle-library"
          onClick={onToggleLibrary}
          className="relative bg-bg-card hover:bg-bg-elevated shadow-sm border border-border-gold text-text-muted hover:text-gold-primary font-sans font-bold text-xs py-2 px-3 md:px-4 rounded-full transition duration-150 flex items-center gap-2 group"
        >
          <Library className="w-4 h-4 text-text-muted group-hover:text-gold-primary" />
          <span className="hidden sm:inline">My Library</span>
          {libraryCount > 0 && (
            <span className="absolute -top-1.5 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-primary px-1 text-[9px] font-bold text-bg-primary leading-none border border-bg-elevated animate-pulse">
              {libraryCount}
            </span>
          )}
        </button>

        {/* Action Tray */}
        <div className="flex items-center gap-1 text-text-muted border-l border-border-gold pl-4 shrink-0">
          <button className="text-xs font-semibold hover:text-neutral-900 whitespace-nowrap px-2">Buy Credits</button>
          <button className="text-xs font-semibold hover:text-neutral-900 whitespace-nowrap px-2">Admin</button>
          <button
            className="p-1.5 hover:bg-bg-elevated hover:text-gold-primary rounded-full transition"
            title="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
          </button>
          <button
            className="p-1.5 hover:bg-bg-elevated hover:text-gold-primary rounded-full transition"
            title="Help & Imagen Studio Workflow Docs"
          >
            <HelpCircle className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Profile Avatar */}
        <div className="w-8 h-8 rounded-full bg-gold-primary/10 border border-gold-primary/30 flex items-center justify-center text-xs font-bold text-gold-primary select-none cursor-pointer hover:bg-gold-primary hover:text-bg-primary hover:shadow-[0_0_10px_var(--color-glow-gold)] transition">
          AI
        </div>

      </div>
    </header>
  );
}
