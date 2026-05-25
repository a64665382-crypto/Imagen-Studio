/**
 * Data types for Whisk Structured AI builder
 */

export interface PresetItem {
  id: string;
  name: string;
  imageUrl: string;
  description?: string;
}

export interface PresetCollection {
  subjects: PresetItem[];
  scenes: PresetItem[];
  styles: PresetItem[];
}

export interface SelectedFile {
  id: string;
  name: string;
  dataUrl: string; // base64 encoded thumbnail
  isPreset?: boolean;
}
export interface GeneratedImage {
  id: string;
  title: string;
  prompt: string;
  imageUrl: string;
  timestamp: string;
  aspectRatio: "1:1" | "16:9" | "9:16" | "4:3";
  tags: string[];
  recipe: {
    subject: string;
    scene: string;
    style: string;
  };
}

export interface Plan {
  id: string;
  name: string;
  type: string;
  originalPrice: number;
  offerPrice: number | null;
  offerStartAt: string | null;
  offerEndAt: string | null;
  offerActive: boolean;
  credits: number;
  description: string;
  creditFrequency: "monthly" | "daily";
  defaultForNewUsers: boolean;
  trialEnabled: boolean;
  trialDurationDays: number;
  trialPrice: number;
  trialCredits: number;
  trialCreditFrequency: "monthly" | "daily";
  freeTaskEnabled: boolean;
  freeTaskUrl: string;
  freeTaskHeading: string;
  showFirstAsPopup?: boolean;
}

export interface AppSettings {
  newUserSignupCredits: number;
  paymentUpi: string;
  creditCost720p: number;
  creditCost1080p: number;
  apiKey: string;
  useUrl: boolean;
  apiUrl: string;
}

export interface DiceRecipe {
  title: string;
  subject: string;
  scene: string;
  style: string;
  explanation: string;
}

export interface GenerationSettings {
  aspectRatio: "1:1" | "16:9" | "9:16" | "4:3";
  imageCount: number;
  creativityLevel: number; // 1 to 5
  styleWeight: number; // 0 to 100
  dimensions: { width: number; height: number };
  quality: "720p" | "1080p";
}
