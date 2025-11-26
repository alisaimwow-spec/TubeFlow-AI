
export enum AppStep {
  IDEA_GENERATION = 0,
  SCRIPT_WRITING = 1,
  VOICE_OVER_GENERATION = 2,
  PROMPT_WRITING = 3,
  SEO_OPTIMIZATION = 4,
  THUMBNAIL_DESIGN = 5,
  THUMBNAIL_GENERATION = 6,
  CONTENT_PLANNING = 7,
  FINAL_REVIEW = 8,
}

export enum VideoPlatform {
  VEO = "Veo 3.1",
  SORA = "Sora 2.0",
  WAN = "Wan 2.2",
  GROK = "Grok AI",
  MIDJOURNEY = "Midjourney (Video)",
  RUNWAY = "Runway Gen-3"
}

export interface IdeaData {
  userInput: string;
  generatedTitle: string;
  generatedConcept: string;
  approved: boolean;
}

export interface ScriptData {
  niche: string;
  tone: string;
  length: string; // e.g., "10 minutes"
  generatedScript: string;
  approved: boolean;
}

export interface VoiceCustomization {
  accent: string;
  age: string;
  pacing: string;
}

export interface VoiceData {
  selectedVoice: string; // 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr'
  customization: VoiceCustomization;
  generatedAudioBase64: string | null; // Raw PCM or WAV base64
  previewUrl: string | null;
  approved: boolean;
}

export interface PromptData {
  count: number;
  platform: VideoPlatform;
  generatedPrompts: string[];
  approved: boolean;
}

export interface SeoData {
  optimizedTitle: string;
  optimizedDescription: string;
  optimizedTags: string[];
  approved: boolean;
}

export interface ThumbnailConcept {
  headline: string;
  visualDescription: string;
  reasoning: string;
}

export interface ThumbnailData {
  generatedConcepts: ThumbnailConcept[];
  selectedConceptIndex: number | null;
  approved: boolean;
}

export interface ThumbnailGenerationData {
  generatedImages: string[]; // base64 strings
  approved: boolean;
}

export interface PlannerData {
  publishDate: string;
  publishTime: string;
  generatedSchedule: string[]; // Checklist items
  approved: boolean;
}

export interface WorkflowState {
  currentStep: AppStep;
  idea: IdeaData;
  script: ScriptData;
  voice: VoiceData;
  prompts: PromptData;
  seo: SeoData;
  thumbnails: ThumbnailData;
  thumbnailImages: ThumbnailGenerationData;
  plan: PlannerData;
  isLoading: boolean;
}

export const INITIAL_STATE: WorkflowState = {
  currentStep: AppStep.IDEA_GENERATION,
  isLoading: false,
  idea: {
    userInput: '',
    generatedTitle: '',
    generatedConcept: '',
    approved: false,
  },
  script: {
    niche: '',
    tone: 'Engaging and Energetic',
    length: '8-10 minutes',
    generatedScript: '',
    approved: false,
  },
  voice: {
    selectedVoice: 'Kore',
    customization: {
      accent: 'Neutral',
      age: 'Default',
      pacing: 'Normal'
    },
    generatedAudioBase64: null,
    previewUrl: null,
    approved: false,
  },
  prompts: {
    count: 5,
    platform: VideoPlatform.VEO,
    generatedPrompts: [],
    approved: false,
  },
  seo: {
    optimizedTitle: '',
    optimizedDescription: '',
    optimizedTags: [],
    approved: false,
  },
  thumbnails: {
    generatedConcepts: [],
    selectedConceptIndex: null,
    approved: false,
  },
  thumbnailImages: {
    generatedImages: [],
    approved: false,
  },
  plan: {
    publishDate: '',
    publishTime: '',
    generatedSchedule: [],
    approved: false,
  }
};
