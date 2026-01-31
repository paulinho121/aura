

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
   * Generates a symbolic portrait URL based on the user's vibration and visual prompt.
   * This uses Pollinations AI to generate a unique, real-time image for the user.
   */
  async generateSymbolicPortrait(traits: string): Promise<string | null> {
    try {
      // Enhanced prompt synthesis for high-quality artistic results
      const artisticPrompt = `Highly detailed, abstract symbolic portrait of consciousness, defined by ${traits}, iridescent textures, bioluminescent organic structures, sacred geometry, cosmic light, deep obsidian background, 8k resolution, ethereal, by Alberto Seveso and Peter Mohrbacher.`;

      const encodedPrompt = encodeURIComponent(artisticPrompt);
      const seed = Math.floor(Math.random() * 1000000);

      // Using Pollinations AI for actual image generation from the prompt
      return `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${seed}&width=1024&height=1024&nologo=true`;
    } catch (error) {
      console.error("Image generation failed:", error);
      return `https://picsum.photos/seed/${encodeURIComponent(traits)}/800/800`;
    }
  }

  async generatePulseVisual(content: string, mood: string): Promise<string | null> {
    try {
      const prompt = `Cosmic bioluminescence manifest: "${content}". Mood: ${mood}. Style: deep obsidian background, intricate light filaments, sacred geometry, highly detailed, ethereal 8k.`;
      const encodedPrompt = encodeURIComponent(prompt);
      const seed = Math.floor(Math.random() * 1000000);

      return `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${seed}&width=1280&height=720&nologo=true`;
    } catch (error) {
      console.error("Pulse image generation failed:", error);
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
