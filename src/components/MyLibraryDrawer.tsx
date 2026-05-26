import React from "react";
import { X, Trash2, Download, Copy, ExternalLink, Calendar, Library, Eye } from "lucide-react";
import { GeneratedImage } from "../types";
import { downloadImage } from "../utils";

interface MyLibraryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  images: GeneratedImage[];
  onDeleteImage: (id: string) => void;
  onSelectImage: (img: GeneratedImage) => void;
}

export default function MyLibraryDrawer({
  isOpen,
  onClose,
  images,
  onDeleteImage,
  onSelectImage,
}: MyLibraryDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-bg-primary border-l border-border-gold shadow-[-10px_0_30px_rgba(255,215,0,0.05)] border-l border-border-gold/30 shadow-[-10px_0px_30px_rgba(0,0,0,0.05)] flex flex-col z-50 animate-in slide-in-from-right duration-200">
      
      {/* Header */}
      <div className="p-5 border-b border-border-gold/30 flex items-center justify-between select-none">
        <div className="flex items-center gap-2.5">
          <div className="bg-[#00F0FF] text-neutral-950 p-2 rounded-xl shadow-sm">
            <Library className="w-4 h-4 text-neutral-900" />
          </div>
          <div>
            <h3 className="font-sans font-extrabold text-sm uppercase text-text-main">
              My Creations
            </h3>
            <p className="text-[10px] text-text-secondary font-semibold">
              A chronological log of Imagen Studio formula mixes
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-bg-elevated/50 text-slate-450 hover:text-text-main rounded-full border border-slate-150 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* List content grid */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
        {images.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center select-none gap-3">
            <div className="w-12 h-12 rounded-full border border-dashed border-border-gold/60 flex items-center justify-center text-text-secondary">
              <Library className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-xs text-slate-800">Library is Empty</p>
              <p className="text-[10px] text-text-secondary max-w-[200px] mt-0.5 font-medium">
                Assemble ingredients and click Compile to create your first visual asset.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {images.map((img, idx) => (
              <div 
                key={`${img.id}-${idx}`}
                className="group bg-bg-elevated/50/50 hover:bg-bg-elevated/50 p-3.5 rounded-2xl border border-slate-150 hover:border-slate-300 transition flex items-center gap-4 relative overflow-hidden"
              >
                {/* Micro Thumbnail */}
                <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden border border-border-gold/60 bg-slate-950 relative">
                  <img
                    src={img.imageUrl}
                    alt={img.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-0.5 left-0.5 bg-slate-950/80 text-text-main text-[7px] font-extrabold px-1 py-0.5 rounded leading-none">
                    {img.aspectRatio}
                  </div>
                </div>

                {/* Info Text */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <span 
                      onClick={() => onSelectImage(img)}
                      className="font-sans font-extrabold text-xs text-slate-800 truncate hover:text-text-muted cursor-pointer block"
                    >
                      {img.title}
                    </span>
                    <span className="text-[8px] font-mono font-bold text-text-secondary shrink-0">
                      {img.timestamp}
                    </span>
                  </div>
                  
                  <p className="text-[10px] text-text-muted line-clamp-2 mt-0.5 font-medium leading-relaxed">
                    {img.prompt}
                  </p>

                  {/* Actions Tray */}
                  <div className="flex items-center gap-3 mt-2 select-none">
                    <button
                      onClick={() => onSelectImage(img)}
                      className="text-[9px] font-bold text-slate-600 hover:text-text-main flex items-center gap-1 leading-none"
                    >
                      <Eye className="w-3 h-3 text-text-secondary" /> Inspect
                    </button>
                    <button
                      onClick={() => downloadImage(img.imageUrl, `${img.title.toLowerCase().replace(/\s+/g, "_")}.jpg`)}
                      className="text-[9px] font-bold text-slate-600 hover:text-text-main flex items-center gap-1 leading-none border-l border-slate-150 pl-3 cursor-pointer"
                    >
                      <Download className="w-3 h-3 text-text-secondary" /> Download
                    </button>
                    <button
                      onClick={() => onDeleteImage(img.id)}
                      className="text-[9px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1 leading-none border-l border-slate-150 pl-3 ml-auto"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" /> Delete
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border-gold/30 bg-bg-elevated/50 flex flex-col gap-2.5 select-none">
        <div className="flex justify-between items-center text-[10px] font-mono font-bold text-text-secondary">
          <span>Active Session History:</span>
          <span>{images.length} Saves</span>
        </div>
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-bg-elevated hover:bg-bg-primary text-text-main rounded-xl text-xs font-bold transition shadow-sm"
        >
          Resume Workspace Design
        </button>
      </div>
    </div>
  );
}
