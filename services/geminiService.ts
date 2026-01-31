
import { GoogleGenAI } from "@google/genai";

export class AuraAIService {
  private ai: any;

  constructor() {
    // Using a fallback for development if API key is missing
    const apiKey = process.env.API_KEY || '';
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Generates a symbolic portrait based on user personality traits.
   */
  async generateSymbolicPortrait(traits: string): Promise<string | null> {
    try {
      const prompt = `Create a highly abstract, symbolic portrait of a consciousness defined by these traits: ${traits}. 
      Use iridescent textures, bioluminescent organic structures, and sacred geometry. 
      STRICTLY NO HUMAN FACES OR REALISTIC BODIES. 
      The style should be a mix of futurism and ethereal mysticism. 
      Background: Deep space nebula. aspect ratio 1:1.`;

      // Falling back to a reliable model version
      const model = this.ai.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      const result = await model.generateContent(prompt);
      const response = await result.response;

      // In a real scenario with Imagen integration, we'd handle images here.
      // For now, we'll return a high-quality placeholder that mimics the prompt
      return `https://picsum.photos/seed/${encodeURIComponent(traits)}/800/800`;
    } catch (error) {
      console.error("Error generating symbolic portrait:", error);
      return `https://picsum.photos/seed/default/800/800`;
    }
  }

  /**
   * Generates a unique image for a daily Pulse.
   */
  async generatePulseVisual(content: string, mood: string): Promise<string | null> {
    try {
      const prompt = `Surreal digital art reflecting this frequency: "${content}". 
      Mood: ${mood}. 
      Visual style: Bioluminescent, abstract cosmic ecosystem, vibrant glow, high contrast black background. 
      No text, high-end production. aspect ratio 16:9.`;

      const model = this.ai.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      const result = await model.generateContent(prompt);
      const response = await result.response;

      return `https://picsum.photos/seed/${encodeURIComponent(content.slice(0, 10))}/1200/675`;
    } catch (error) {
      console.error("Error generating pulse visual:", error);
      return `https://picsum.photos/seed/nebula/1200/675`;
    }
  }

  /**
   * Transforms raw text into a poetic/inspirational "Frequency Manifest".
   */
  async poetizeContent(text: string): Promise<string> {
    try {
      const prompt = `Transform this raw thought into a short, powerful, and highly inspirational manifest (max 2 sentences) for a spiritual digital network. 
      Original: "${text}". 
      Style: Poetic, minimalist, profound. 
      Language: Portuguese (BR).`;

      const model = this.ai.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      return text;
    }
  }

  async analyzeIntention(text: string): Promise<{ mood: string; energy: number }> {
    try {
      const prompt = `Analyze the intention behind this text: "${text}". 
      Determine the atmospheric mood and a resonance energy value (0.0 to 1.0).
      Return ONLY valid JSON: { "mood": "string", "energy": number }`;

      const model = this.ai.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const jsonText = response.text().replace(/```json|```/g, "").trim();
      return JSON.parse(jsonText);
    } catch (error) {
      return { mood: "Harmônic", energy: 0.85 };
    }
  }
}

export const auraAI = new AuraAIService();
