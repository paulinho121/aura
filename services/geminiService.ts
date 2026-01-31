

import { GoogleGenAI } from "@google/genai";

export class AuraAIService {
  private ai: any = null;

  constructor() {
    const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || '';
    if (apiKey) {
      try {
        this.ai = new GoogleGenAI(apiKey);
      } catch (e) {
        console.warn("Failed to initialize Gemini AI:", e);
      }
    }
  }

  /**
   * Generates a symbolic portrait description. 
   * In a production environment with Imagen/DALL-E, this would trigger an image generation.
   */
  async generateSymbolicPortrait(traits: string): Promise<string | null> {
    try {
      const prompt = `Describe a highly abstract, symbolic portrait of a consciousness defined by: ${traits}. 
      Include iridescent textures, bioluminescent organic structures, and sacred geometry. 
      Limit to 2 sentences. Focus on colors and light.`;

      const model = this.ai.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      const result = await model.generateContent(prompt);
      const response = await result.response;

      // Use the seed for some variability in the placeholder while we don't have real GEN-AI Image API
      return `https://picsum.photos/seed/${encodeURIComponent(traits + response.text().slice(0, 10))}/800/800`;
    } catch (error) {
      return `https://picsum.photos/seed/${encodeURIComponent(traits)}/800/800`;
    }
  }

  async generatePulseVisual(content: string, mood: string): Promise<string | null> {
    try {
      const prompt = `Synthesize a visual frequency for this manifest: "${content}". 
      Mood: ${mood}. Style: Cosmic bioluminescence, deep obsidian background, intricate light filaments.`;

      const model = this.ai.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      const result = await model.generateContent(prompt);
      const response = await result.response;

      return `https://picsum.photos/seed/${encodeURIComponent(content.slice(0, 20))}/1200/675`;
    } catch (error) {
      return `https://picsum.photos/seed/pulse-${Date.now()}/1200/675`;
    }
  }

  async poetizeContent(text: string): Promise<string> {
    try {
      const prompt = `You are the Oracle of Aura. Transform this human vibration into a Sacred Frequency Manifest.
      Keep it extremely brief (max 15 words). Use ethereal, profound, and non-linear language.
      Vibration: "${text}". 
      Language: Portuguese (BR).
      Output only the manifest, no quotation marks.`;

      const model = this.ai.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim().replace(/^"|"$/g, '');
    } catch (error) {
      return text;
    }
  }

  async analyzeIntention(text: string): Promise<{ mood: string; energy: number; frequency: number; color: string }> {
    try {
      const prompt = `Analyze this Sacred Frequency: "${text}". 
      Determine:
      1. atmospheric mood (one word)
      2. resonance energy (0.0 to 1.0)
      3. fundamental frequency (432 to 528 Hz)
      4. dominant ethereal color (hex)
      Return ONLY valid JSON: { "mood": "string", "energy": number, "frequency": number, "color": "string" }`;

      const model = this.ai.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const jsonText = response.text().replace(/```json|```/g, "").trim();
      return JSON.parse(jsonText);
    } catch (error) {
      return { mood: "Harmonia", energy: 0.85, frequency: 432, color: "#00ffff" };
    }
  }
}

export const auraAI = new AuraAIService();
