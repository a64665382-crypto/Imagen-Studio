import React, { useState } from "react";
import { 
  Sparkles, Download, Trash2, ZoomIn, Eye, Layers, 
  HelpCircle, User, MapPin, Palette, ArrowRight, 
  Grid, Compass, Cpu, AlertTriangle, ExternalLink, Loader2
} from "lucide-react";
import { GeneratedImage, SelectedFile, GenerationSettings } from "../types";
import { downloadImage } from "../utils";

interface CanvasWorkspaceProps {
  images: GeneratedImage[];
  onDeleteImage: (id: string) => void;
  isGenerating: boolean;
  statusText: string;
  subjects: SelectedFile[];
  scenes: SelectedFile[];
  styles: SelectedFile[];
  onQuickGenerate: () => void;
  hideImages: boolean;
  generationProgress: number;
  generationError: string | null;
  onClearError: () => void;
  settings: GenerationSettings;
  inputPrompt: string;
}

function UnblurringImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [isLoaded, setIsLoaded] = useState(false);
  return (
    <div className="relative w-full h-full bg-bg-elevated border border-border-gold overflow-hidden flex items-center justify-center">
      <div className={`absolute inset-0 bg-slate-200 transition-opacity duration-700 ${isLoaded ? "opacity-0 pointer-events-none" : "opacity-100"}`} />
      <img
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        className={`${className} transition-all duration-700 ${
          isLoaded ? "opacity-100 blur-0 scale-100" : "opacity-80 blur-md scale-102"
        }`}
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

export default function CanvasWorkspace({
  images,
  onDeleteImage,
  isGenerating,
  statusText,
  subjects,
  scenes,
  styles,
  onQuickGenerate,
  hideImages,
  generationProgress,
  generationError,
  onClearError,
  settings,
  inputPrompt,
}: CanvasWorkspaceProps) {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  // Helper to construct short display text for subject/scene/style
  const getSubjectText = () => subjects.map(s => s.name).join(" + ") || "No Subject Loaded";
  const getSceneText = () => scenes.map(s => s.name).join(" + ") || "No Scene Loaded";
  const getStyleText = () => styles.map(s => s.name).join(" + ") || "No Style Loaded";

  const hasIngredients = subjects.length > 0 || scenes.length > 0 || styles.length > 0;

  return (
    <main className="flex-1 bg-bg-primary flex flex-col h-full relative overflow-y-auto p-6 md:p-12 scrollbar-thin select-none animate-slide-up-fade">
      
      {/* Visual Workflow Node Map - When empty and not generating */}
      {images.length === 0 && !isGenerating ? (
        <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full py-6">
          <div className="text-center mb-10">
            <h1 className="font-display font-bold text-3xl md:text-4xl text-text-main tracking-tight mb-2">
              Studio Workspace
            </h1>
            <p className="text-sm text-text-secondary max-w-xl mx-auto font-medium">
              Combine subject references, scene backdrops, and style cues inside the panel to brew incredible, professional AI visuals.
            </p>
          </div>

          {/* Node blueprint diagram */}
          <div className="w-full relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 bg-bg-card border border-border-gold rounded-3xl p-8 shadow-xl mb-10 overflow-hidden">
            <div className="absolute top-0 left-0 bg-gold-primary text-bg-primary px-3.5 py-1.5 text-[10px] tracking-wider uppercase font-bold flex items-center gap-1.5 rounded-br-2xl shadow-md">
              <Compass className="w-3.5 h-3.5" /> Pipeline Blueprint
            </div>

            {/* Input Nodes Column */}
            <div className="flex flex-col gap-4 w-full md:w-[260px] z-10 pt-4">
              {/* Subject Node Preview */}
              <div className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
                subjects.length > 0 ? "border-gold-primary bg-gold-primary/10" : "border-border-gold bg-bg-elevated"
              }`}>
                <div className={`p-2 rounded-xl text-bg-primary ${subjects.length > 0 ? "bg-gold-primary" : "bg-text-muted"}`}>
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest block leading-none mb-1">Layer 1</span>
                  <span className="text-xs font-semibold text-text-main truncate block">
                    {subjects.length > 0 ? getSubjectText() : "Pick Subject..."}
                  </span>
                </div>
                <div className={`w-2 h-2 rounded-full ${subjects.length > 0 ? "bg-gold-soft animate-pulse" : "bg-text-muted"}`}></div>
              </div>

              {/* Scene Node Preview */}
              <div className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
                scenes.length > 0 ? "border-gold-primary bg-gold-primary/10" : "border-border-gold bg-bg-elevated"
              }`}>
                <div className={`p-2 rounded-xl text-bg-primary ${scenes.length > 0 ? "bg-gold-primary" : "bg-text-muted"}`}>
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest block leading-none mb-1">Layer 2</span>
                  <span className="text-xs font-semibold text-text-main truncate block">
                    {scenes.length > 0 ? getSceneText() : "Pick Scene backdrop..."}
                  </span>
                </div>
                <div className={`w-2 h-2 rounded-full ${scenes.length > 0 ? "bg-gold-soft animate-pulse" : "bg-text-muted"}`}></div>
              </div>

              {/* Style Node Preview */}
              <div className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 ${
                styles.length > 0 ? "border-gold-primary bg-gold-primary/10" : "border-border-gold bg-bg-elevated"
              }`}>
                <div className={`p-2 rounded-xl text-bg-primary ${styles.length > 0 ? "bg-gold-primary" : "bg-text-muted"}`}>
                  <Palette className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest block leading-none mb-1">Layer 3</span>
                  <span className="text-xs font-semibold text-text-main truncate block">
                    {styles.length > 0 ? getStyleText() : "Pick Style preset..."}
                  </span>
                </div>
                <div className={`w-2 h-2 rounded-full ${styles.length > 0 ? "bg-gold-soft animate-pulse" : "bg-text-muted"}`}></div>
              </div>
            </div>

            {/* Connecting visual pipeline strings */}
            <div className="hidden md:flex flex-col items-center justify-center grow h-32 relative text-text-secondary">
              <div className="absolute h-[1px] bg-border-gold left-0 right-0 top-1/2 -translate-y-1/2 z-0 border-dashed border-t"></div>
              <div className="bg-bg-elevated text-gold-primary rounded-full p-2.5 z-10 border border-border-gold shadow-sm">
                <Cpu className="w-4 h-4" />
              </div>
              <p className="text-[8px] font-mono font-bold text-text-muted mt-2 tracking-widest bg-bg-card px-2 z-10 uppercase">
                Ready to Compile
              </p>
            </div>

            {/* Imagen Studio output node card */}
            <div className="w-full md:w-[280px] bg-bg-elevated rounded-2xl p-6 border border-border-gold flex flex-col items-center justify-center text-center gap-3.5 z-10">
              <div className="w-11 h-11 rounded-full bg-gold-primary border border-border-gold flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-bg-primary" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-text-main uppercase tracking-widest">
                  STUDIO ENGINE
                </p>
                <p className="text-[11px] text-text-secondary mt-1 max-w-[200px] font-medium leading-relaxed">
                  Interpolates parameters to render detailed, thematic illustrations.
                </p>
              </div>

              {hasIngredients || inputPrompt.trim() ? (
                <button
                  id="btn-onboarding-generate"
                  onClick={onQuickGenerate}
                  disabled={isGenerating}
                  className="w-full mt-1.5 py-3 bg-gold-primary hover:bg-gold-soft text-bg-primary rounded-xl text-xs font-bold transition duration-150 flex items-center justify-center gap-2 shadow-lg active:scale-95 text-center leading-none disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Compiling...</span>
                    </>
                  ) : (
                    <>
                      {inputPrompt.trim() ? "Generate Image" : "Compile Ingredients"} <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              ) : (
                <div className="text-[10px] font-mono text-text-secondary bg-bg-card py-1.5 px-3 rounded-full border border-border-gold">
                  Waiting for prompt...
                </div>
              )}
            </div>
          </div>

          {/* Prompt Guide Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-text-secondary perspective-800">
            <div className="bg-bg-elevated/60 p-5 rounded-3xl border border-border-gold shadow-xl hover-3d-card transform-style-3d cursor-default">
              <h4 className="font-bold text-xs text-text-main uppercase tracking-wider flex items-center gap-2 mb-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-bg-card text-text-secondary text-[9px] font-extrabold border border-border-gold/50">1</span>
                Drop Reference Layers
              </h4>
              <p className="text-[11px] text-text-muted leading-relaxed font-medium">
                Add visuals for subject representation, specific environmental backdrops, or desired artistic mediums directly.
              </p>
            </div>

            <div className="bg-bg-elevated/60 p-5 rounded-3xl border border-border-gold shadow-xl hover-3d-card transform-style-3d cursor-default">
              <h4 className="font-bold text-xs text-text-main uppercase tracking-wider flex items-center gap-2 mb-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-bg-card text-text-secondary text-[9px] font-extrabold border border-border-gold/50">2</span>
                Inscribe Manual Cues
              </h4>
              <p className="text-[11px] text-text-muted leading-relaxed font-medium">
                Type in the bottom input pill to direct focal points, add subtle details, or influence camera angles.
              </p>
            </div>

            <div className="bg-bg-elevated/60 p-5 rounded-3xl border border-border-gold shadow-xl hover-3d-card transform-style-3d cursor-default">
              <h4 className="font-bold text-xs text-text-main uppercase tracking-wider flex items-center gap-2 mb-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gold-primary text-neutral-950 neon-btn-cyan text-[9px] font-extrabold shadow-sm">3</span>
                Imagen Studio Flow
              </h4>
              <p className="text-[11px] text-text-muted leading-relaxed font-medium">
                Click to generate! The engine takes your prompt and outputs a highly detailed asset.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Generated Images Canvas Grid View */}
      {(images.length > 0 || isGenerating || generationError) && !hideImages ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-border-gold">
            <div>
              <h2 className="font-display font-bold text-xl text-text-main tracking-tight flex items-center gap-2">
                <Grid className="w-5 h-5 text-text-secondary" /> Active Generations
              </h2>
              <p className="text-xs text-text-secondary mt-0.5 font-semibold">Showing compiled creations</p>
            </div>
            
            <span className="text-xs font-semibold text-text-secondary bg-bg-card border border-border-gold py-1.5 px-3 rounded-full shadow-sm">
              Total Assets: {images.length}
            </span>
          </div>

          {/* Bento-style Image Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 perspective-800">
            
            {/* INLINE COMPILATION LOADING CARD */}
            {isGenerating && (
              <div className="bg-bg-card border border-border-gold rounded-2xl overflow-hidden shadow-xl flex flex-col relative animate-in fade-in duration-200">
                <div className={`overflow-hidden relative bg-bg-primary flex flex-col items-center justify-center rounded-2xl ${
                  settings.aspectRatio === "16:9" ? "aspect-video" : settings.aspectRatio === "9:16" ? "aspect-[9/16]" : settings.aspectRatio === "4:3" ? "aspect-[4/3]" : "aspect-square"
                }`}>
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10 select-none">
                    <div className="bg-bg-glass backdrop-blur-md border border-border-gold rounded-2xl px-5 py-4 flex flex-col items-center justify-center gap-2.5 max-w-[170px] shadow-lg">
                      <Sparkles className="w-4.5 h-4.5 text-gold-primary animate-pulse shrink-0" />
                      <div className="space-y-0.5 text-center">
                        <span className="text-[9px] uppercase font-mono font-bold text-text-secondary tracking-wider block">Generating</span>
                        <span className="text-2xl font-black text-gold-primary font-mono leading-none tracking-tight block animate-pulse">
                          {Math.round(generationProgress)}%
                        </span>
                      </div>
                      
                      <div className="w-24 h-1 bg-bg-primary rounded-full overflow-hidden">
                        <div 
                          className="bg-gold-primary h-full rounded-full transition-all duration-150"
                          style={{ width: `${generationProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* INLINE COMPILATION ERROR CARD */}
            {generationError && !isGenerating && (
              <div
                className="bg-bg-elevated/80 backdrop-blur-md border border-rose-900/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4 animate-in fade-in zoom-in-95 duration-200"
              >
                <div className="w-10 h-10 rounded-full bg-rose-950/50 text-rose-500 flex items-center justify-center shrink-0 border border-rose-900/50">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                
                <div className="space-y-1">
                  <p className="text-[11px] text-text-main font-semibold leading-relaxed max-w-[220px]">
                    {generationError}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={onQuickGenerate}
                    className="py-2 px-4 bg-gold-primary hover:bg-gold-soft text-bg-primary font-bold text-[10px] rounded-lg transition active:scale-95"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {images.map((img) => (
              <div
                key={img.id}
                className="bg-bg-elevated border border-border-gold rounded-2xl overflow-hidden shadow-xl hover:shadow-[0_0_20px_rgba(0,240,255,0.1)] transition-all duration-300 flex flex-col group relative hover-3d-card transform-style-3d cursor-default"
              >
                {/* Photo container */}
                <div 
                  className={`overflow-hidden relative bg-bg-primary flex items-center justify-center rounded-t-2xl cursor-pointer ${
                    img.aspectRatio === "16:9" ? "aspect-video" : img.aspectRatio === "9:16" ? "aspect-[9/16]" : img.aspectRatio === "4:3" ? "aspect-[4/3]" : "aspect-square"
                  }`}
                  onClick={() => setSelectedImage(img)}
                  title="Click to view prompt and details"
                >
                  <UnblurringImage
                    src={img.imageUrl}
                    alt={img.title}
                    className="w-full h-full object-contain group-hover:scale-[1.05] transition-transform duration-700"
                  />
                  {/* Subtle Aspect Ratio Badge */}
                  <div className="absolute top-3 left-3 bg-bg-elevated/60 backdrop-blur-sm border border-border-gold/50 text-text-main text-[9px] font-bold py-0.5 px-2 rounded-full uppercase">
                    {img.aspectRatio}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-center border-t border-border-gold bg-bg-elevated">
                  <button
                    onClick={() => downloadImage(img.imageUrl, `${img.title.toLowerCase().replace(/\s+/g, "_")}.jpg`)}
                    className="flex-1 py-3 px-2 text-xs font-bold text-text-secondary hover:text-text-main hover:bg-bg-card transition flex items-center justify-center gap-1.5 border-r border-border-gold"
                  >
                    <Download className="w-4 h-4" /> Download
                  </button>
                  <button
                    onClick={() => onDeleteImage(img.id)}
                    className="flex-1 py-3 px-2 text-xs font-bold text-red-500 hover:text-red-400 hover:bg-red-500/10 transition flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* When hideImages is active */}
      {images.length > 0 && hideImages ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-bg-elevated border border-border-gold rounded-3xl shadow-xl max-w-lg mx-auto w-full my-auto gap-4 animate-in fade-in duration-150">
          <div className="w-14 h-14 rounded-full bg-bg-card border border-border-gold/50 flex items-center justify-center">
            <Eye className="w-6 h-6 text-text-muted" />
          </div>
          <div>
            <h3 className="font-sans font-bold text-lg text-text-main">Images Hidden</h3>
            <p className="text-xs text-text-muted mt-1 max-w-[320px] font-medium">
              You have enabled the "Hide Images" switch. Toggle it off in the bottom prompt bar to view generated canvas graphics.
            </p>
          </div>
        </div>
      ) : null}

      {/* Interactive image detail modal for inspecting recipe outputs */}
      {selectedImage && (
        <div className="fixed inset-0 bg-bg-primary/80 backdrop-blur-md flex items-center justify-center z-50 p-4 md:p-6" onClick={() => setSelectedImage(null)}>
          <div 
            className="bg-bg-elevated border border-border-gold rounded-3xl shadow-[0_0_40px_rgba(0,240,255,0.05)] max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col md:flex-row animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Visual media half */}
            <div className="md:w-1/2 bg-bg-primary/80 flex items-center justify-center relative min-h-[300px]">
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.title}
                className="w-full h-full object-contain max-h-[80vh]"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-4 left-4 bg-bg-elevated/80 backdrop-blur text-text-main border border-border-gold text-[10px] font-semibold py-1 px-3 rounded-full uppercase leading-none neon-text-cyan shadow-[0_0_8px_rgba(0,240,255,0.1)]">
                Aspect: {selectedImage.aspectRatio}
              </span>
            </div>

            {/* Recipe and Prompt detail metadata half */}
            <div className="md:w-1/2 p-6 flex flex-col gap-4 overflow-y-auto text-text-secondary">
              {/* Header */}
              <div className="flex justify-between items-start pb-4 border-b border-border-gold">
                <div>
                  <h3 className="font-extrabold text-xl text-text-main tracking-tight">
                    {selectedImage.title}
                  </h3>
                  <span className="text-[10px] font-mono text-text-muted font-semibold uppercase mt-0.5 block">
                    Created {selectedImage.timestamp}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-1.5 hover:bg-bg-card rounded-full border border-border-gold/50 text-text-muted hover:text-text-main transition"
                >
                  <Trash2 className="w-4 h-4 rotate-45 transform" />
                </button>
              </div>

              {/* Recipe Ingredients Box */}
              <div className="bg-bg-primary/50 rounded-2xl p-4 border border-border-gold flex flex-col gap-2.5">
                <span className="text-[10px] font-extrabold text-gold-primary uppercase tracking-widest block leading-none">Visually Compiled Recipe</span>
                
                <div className="grid grid-cols-1 gap-1.5 mt-1 text-xs font-semibold text-text-secondary">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="text-text-muted font-medium font-sans">Subject:</span>
                    <span className="truncate">{selectedImage.recipe.subject || "Imagen Studio"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    <span className="text-text-muted font-medium font-sans">Scene:</span>
                    <span className="truncate">{selectedImage.recipe.scene || "Imagen Studio"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Palette className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span className="text-text-muted font-medium font-sans">Style:</span>
                    <span className="truncate">{selectedImage.recipe.style || "Imagen Studio"}</span>
                  </div>
                </div>
              </div>

              {/* Prompt Box */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold text-gold-primary uppercase tracking-widest block leading-none">Expanded Prompt Formulation</span>
                <p className="text-xs text-text-muted bg-bg-primary/30 p-4 rounded-xl border border-border-gold leading-relaxed font-semibold">
                  {selectedImage.prompt}
                </p>
              </div>

              {/* Tags and Metadata */}
              <div className="space-y-1.5 mt-auto pt-4 border-t border-border-gold">
                <span className="text-[10px] font-extrabold text-gold-primary uppercase tracking-widest block leading-none mb-1">Visual Keywords</span>
                <div className="flex flex-wrap gap-1">
                  {selectedImage.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] font-bold uppercase bg-gold-primary/10 border border-gold-primary/30 text-gold-primary px-2.5 py-1 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="grid grid-cols-2 gap-3 pt-3">
                <button
                  onClick={() => downloadImage(selectedImage.imageUrl, `${selectedImage.title.toLowerCase().replace(/\s+/g, "_")}.jpg`)}
                  className="py-2.5 px-4 bg-gold-primary hover:bg-cyan-400 text-slate-950 rounded-xl text-center text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.25)] neon-btn-cyan"
                >
                  <Download className="w-4 h-4" /> Download High-Res
                </button>
                <button
                  onClick={() => {
                    onDeleteImage(selectedImage.id);
                    setSelectedImage(null);
                  }}
                  className="py-2.5 px-4 bg-red-950/30 hover:bg-red-900/50 border border-red-500/30 text-red-500 rounded-xl text-center text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Discard Creation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
