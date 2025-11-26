
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { IdeaData, ScriptData, PromptData, SeoData, ThumbnailConcept, VoiceCustomization } from "../types";

// Helper to get safe AI client instance
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

// Retry utility for robust API calls
async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    // Retry on 500s, 503s, or network errors
    // Also retry on 429 (Too Many Requests)
    if (retries > 0 && (
        error.message?.includes('500') || 
        error.message?.includes('503') || 
        error.message?.includes('xhr') || 
        error.message?.includes('fetch') ||
        error.message?.includes('overloaded') ||
        error.message?.includes('429')
    )) {
      console.warn(`API Call Failed. Retrying... Attempts left: ${retries}. Error: ${error.message}`);
      await new Promise(r => setTimeout(r, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

const MODEL_FAST = 'gemini-2.5-flash';
const MODEL_COMPLEX = 'gemini-3-pro-preview'; 
const MODEL_TTS = 'gemini-2.5-flash-preview-tts';
const MODEL_IMAGE_HQ = 'gemini-2.5-flash-image';
const MODEL_IMAGE_FALLBACK = 'imagen-3.0-generate-001';

// --- Agent 1: Idea Generator ---
export const generateVideoIdea = async (
  topic: string, 
  feedback?: string, 
  currentIdea?: IdeaData
): Promise<{ title: string; concept: string }> => {
  return retryWithBackoff(async () => {
    const ai = getAiClient();
    let prompt = `User Topic: ${topic}\n\n`;
    
    if (feedback && currentIdea) {
      prompt += `Previous Title: ${currentIdea.generatedTitle}\nPrevious Concept: ${currentIdea.generatedConcept}\n\nUser Feedback to improve: ${feedback}\n\nRefine the idea based on the feedback.`;
    } else {
      prompt += `Generate a high-viral potential YouTube video title and a brief concept summary (2-3 sentences).`;
    }

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        systemInstruction: "You are a YouTube Strategy Agent. Your goal is to generate viral, high-CTR video ideas. Focus on curiosity gaps, clear value propositions, and trending formats. Return JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            concept: { type: Type.STRING }
          },
          required: ["title", "concept"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  });
};

// --- Agent 2: Script Writer ---
export const generateScript = async (
  config: ScriptData,
  idea: IdeaData,
  feedback?: string
): Promise<string> => {
  const runGeneration = async (model: string) => {
    return retryWithBackoff(async () => {
        const ai = getAiClient();
        
        // Calculate Word Count Target based on Length selection
        // SIGNIFICANTLY INCREASED for longer voiceovers
        let minWords = 1500;
        let sectionCount = 5;
        
        if (config.length.includes('15+')) {
          minWords = 5000; // Target ~25-30 mins spoken
          sectionCount = 10;
        } else if (config.length.includes('8-10')) {
          minWords = 3000; // Target ~15-18 mins spoken
          sectionCount = 7;
        } else if (config.length.includes('Short')) {
          minWords = 1500; // ~8 mins spoken
          sectionCount = 4;
        }

        let prompt = `Video Title: ${idea.generatedTitle}\nConcept: ${idea.generatedConcept}\nTarget Length: ${config.length}\nMinimum Word Count: ${minWords} words\nNiche: ${config.niche}\nTone: ${config.tone}\n\n`;

        if (feedback && config.generatedScript) {
          const previousScriptContext = config.generatedScript.length > 5000 
            ? config.generatedScript.substring(0, 5000) + "...[truncated]" 
            : config.generatedScript;
          prompt += `Current Script Context: ${previousScriptContext}\nUser Feedback: ${feedback}\n\nRewrite or adjust the script based on this feedback. Ensure the length requirements are still met.`;
        } else {
          prompt += `Write a comprehensive, deep-dive YouTube script. 
          
          CRITICAL LENGTH INSTRUCTION: 
          The user requested a LONG video (${config.length}). 
          You MUST generate at least ${minWords} words of spoken narration. 
          Do NOT summarize. Do NOT use bullet points for speaking parts. 
          EXPAND every concept into multiple paragraphs.
          For every key point, provide a detailed real-world example or case study.
          Explain the 'Why' and 'How' in depth, not just the 'What'.
          Avoid brevity. Be verbose, descriptive, and thorough.
          
          Structure Requirements:
          1. **Hook (0:00-2:00)**: A long, engaging story or problem statement to grab attention.
          2. **Intro**: Detailed value proposition and what to expect.
          3. **Deep Dive Body (${sectionCount} distinct sections)**: 
             - For EACH section, provide:
               - A theoretical explanation (2-3 paragraphs).
               - A real-world example or case study (invent one if needed but make it realistic and detailed).
               - A "How-to" or practical application step.
               - A counter-argument or common pitfall.
          4. **Conclusion**: Extensive summary and strong Call to Action.
          
          Format the output with Markdown headers.`;
        }

        const response = await ai.models.generateContent({
          model: model, 
          contents: prompt,
          config: {
            systemInstruction: `You are a Professional Documentary Screenwriter for YouTube. 
            You specialize in high-retention, long-form content (video essays, deep dives, masterclasses).
            
            RULES FOR LENGTH & DEPTH:
            1. Your primary goal is VOLUME and DEPTH.
            2. Never write "Discuss X". Instead, actually write the full speech discussing X in detail.
            3. Use analogies, metaphors, and storytelling to elaborate on points.
            4. If a section feels short, add a "For example..." or "Imagine this..." paragraph.
            5. Write in a natural, spoken rhythm, but keep talking.
            6. When explaining a concept, assume the audience needs a detailed breakdown.
            7. Tone: ${config.tone}.`,
          }
        });

        return response.text || "";
    });
  };

  try {
    // Try with the Pro model first for best quality
    return await runGeneration(MODEL_COMPLEX);
  } catch (e: any) {
    // Broad fallback: If Pro model fails for ANY reason (403, 404, 500), fall back to Flash
    console.warn("Gemini 3 Pro failed, falling back to Flash 2.5 for script generation.", e);
    return await runGeneration(MODEL_FAST);
  }
};

// --- Agent 3: Voice Over Generator ---
export const generateAudio = async (
  text: string,
  voiceName: string,
  customization?: VoiceCustomization
): Promise<string> => {
  return retryWithBackoff(async () => {
    const ai = getAiClient();
    
    // Gemini TTS has input limit. For very long scripts, we might need to truncate for the demo.
    let cleanText = text.replace(/[*#_]/g, '').substring(0, 4500); 

    // Apply voice customization via prompt injection
    if (customization) {
        const styles = [];
        if (customization.accent && customization.accent !== 'Neutral') styles.push(`${customization.accent} accent`);
        if (customization.age && customization.age !== 'Default') styles.push(`${customization.age} voice`);
        if (customization.pacing && customization.pacing !== 'Normal') styles.push(`speak ${customization.pacing}`);
        
        if (styles.length > 0) {
            // Prepended directions guide the model's prosody
            cleanText = `(Speaking style: ${styles.join(', ')}): ${cleanText}`;
        }
    }

    try {
        const response = await ai.models.generateContent({
        model: MODEL_TTS,
        contents: [{ parts: [{ text: cleanText }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
            voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voiceName },
            },
            },
        },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("No audio generated");
        
        return base64Audio;
    } catch (e: any) {
        console.error("Audio generation error:", e);
        throw e;
    }
  });
};

// --- Agent 4: Prompt Writer ---
export const generatePrompts = async (
  config: PromptData,
  script: string,
  feedback?: string
): Promise<string[]> => {
  return retryWithBackoff(async () => {
    const ai = getAiClient();
    let prompt = `Platform: ${config.platform}\nNumber of Prompts: ${config.count}\n\nBased on the following script, generate optimized image/video generation prompts to visualize the key scenes.\n\nScript Context: ${script.substring(0, 3000)}... (truncated for context)\n\n`;

    if (feedback && config.generatedPrompts.length > 0) {
      prompt += `Previous Prompts: ${JSON.stringify(config.generatedPrompts)}\nUser Feedback: ${feedback}\n\nRegenerate prompts based on feedback.`;
    }

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        systemInstruction: `You are a Generative Video Prompt Engineer Agent. You are an expert in prompting for ${config.platform}. Include details about camera angles, lighting, style (photorealistic, cinematic, etc.), and motion. Return a JSON array of strings.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  });
};

// --- Agent 5: SEO Expert ---
export const generateSEO = async (
  script: string,
  prompts: string[],
  feedback?: string,
  currentSeo?: SeoData
): Promise<{ title: string; description: string; tags: string[] }> => {
  return retryWithBackoff(async () => {
    const ai = getAiClient();
    let prompt = `Script Context: ${script.substring(0, 2000)}...\n\n`;
    
    if (feedback && currentSeo) {
       prompt += `Previous Title: ${currentSeo.optimizedTitle}\nUser Feedback: ${feedback}\n\nRefine the SEO metadata.`;
    } else {
      prompt += `Analyze the content and generate the ultimate SEO metadata package to rank #1 on YouTube.`;
    }

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        systemInstruction: "You are a YouTube SEO Expert Agent. You understand keywords, search intent, and the YouTube algorithm. Your titles should be punchy and keyword-rich. Descriptions should be structured with timestamps placeholders if applicable. Tags should be high-volume keywords. Return JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "description", "tags"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  });
};

// --- Agent 6: Thumbnail Idea Generator ---
export const generateThumbnailConcepts = async (
  title: string,
  script: string,
  feedback?: string,
): Promise<ThumbnailConcept[]> => {
  return retryWithBackoff(async () => {
    const ai = getAiClient();
    let prompt = `Video Title: ${title}\nScript Summary: ${script.substring(0, 1000)}...\n\n`;

    if (feedback) {
      prompt += `User Feedback for revision: ${feedback}\n\n`;
    }
    
    prompt += `Generate 3-5 high-CTR thumbnail concepts. For each, provide a 'headline' (text on image), 'visualDescription' (what to see), and 'reasoning' (why it works).`;

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        systemInstruction: "You are a YouTube Thumbnail Strategy Agent. You focus on high contrast, emotional expressions, and curiosity gaps. Keep text overlays under 5 words. Return JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              visualDescription: { type: Type.STRING },
              reasoning: { type: Type.STRING }
            },
            required: ["headline", "visualDescription", "reasoning"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  });
};

// --- Agent 7: Thumbnail Generator (Image Generation) ---
export const generateThumbnailImages = async (
  concept: ThumbnailConcept
): Promise<string[]> => {
  const ai = getAiClient();
  
  // Enhanced prompt for Realism
  const promptText = `Generate a high-end, photorealistic YouTube Thumbnail.
  
  Visual Content: ${concept.visualDescription}
  
  Text Overlay Requirement: The text "${concept.headline}" must be clearly visible.
  
  STYLE GUIDE (STRICT):
  - PHOTOREALISTIC: Use raw photography style, not illustration or 3D render style.
  - Camera: Shot on Phase One XF IQ4 150MP, 50mm Prime Lens.
  - Lighting: Professional studio lighting, rim lighting, volumetric fog, high contrast, dramatic shadows.
  - Details: Ultra-detailed skin texture, realistic eyes, natural hair, 8K textures.
  - Composition: Rule of thirds, depth of field (bokeh background), dynamic angle.
  - Color: Cinematic color grading, teal and orange look, high dynamic range (HDR).
  - NEGATIVE: Do not use cartoon, anime, drawing, painting, blurry, low resolution, distorted faces, bad text.
  
  Make it look like a trending viral YouTube video thumbnail from a top creator.`;

  // We execute 3 parallel requests to get 3 variations
  // We handle individual errors so one failure doesn't kill the whole batch
  const promises = Array(3).fill(null).map(async () => {
    try {
      return await retryWithBackoff(async () => {
        try {
            // 1. Try Primary Model (Gemini Flash Image)
            const response = await ai.models.generateContent({
                model: MODEL_IMAGE_HQ, 
                contents: {
                    parts: [{ text: promptText }]
                },
                config: {
                    imageConfig: {
                    aspectRatio: "16:9",
                    }
                }
            });

            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    return part.inlineData.data;
                }
            }
            throw new Error("No image data in response");

        } catch (err: any) {
            // 2. Fallback: If Permission Denied (403), try Imagen
            if (err.message?.includes('403') || err.message?.includes('PERMISSION_DENIED') || JSON.stringify(err).includes('PERMISSION_DENIED')) {
                 console.warn(`Gemini Image failed with 403, falling back to ${MODEL_IMAGE_FALLBACK}`);
                 const response = await ai.models.generateImages({
                    model: MODEL_IMAGE_FALLBACK,
                    prompt: promptText,
                    config: {
                      numberOfImages: 1,
                      outputMimeType: 'image/jpeg',
                      aspectRatio: '16:9',
                    },
                 });
                 if (response.generatedImages?.[0]?.image?.imageBytes) {
                     return response.generatedImages[0].image.imageBytes;
                 }
            }
            throw err; // Re-throw if not 403 or if fallback fails
        }
      });
    } catch (e) {
      console.error("Thumbnail generation failed for one variation", e);
      return null;
    }
  });

  const results = await Promise.all(promises);
  return results.filter((res): res is string => res !== null);
};

// --- Agent 8: Content Planner ---
export const generateSchedule = async (
  title: string,
  publishDate: string,
  publishTime: string,
  feedback?: string
): Promise<string[]> => {
  return retryWithBackoff(async () => {
    const ai = getAiClient();
    const prompt = `Video Title: ${title}\nTarget Publish Date: ${publishDate} at ${publishTime}\n\nGenerate a production checklist and social media promotion schedule leading up to this date. Return a list of strings.`;

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        systemInstruction: "You are a Content Manager Agent. Create a reverse-chronological checklist for a YouTube video launch (e.g., T-3 days: Finalize Thumbnail, T-0: Hit Publish, T+1 hour: Reply to comments). Return a JSON array of strings.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  });
};
