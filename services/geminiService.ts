
import { GoogleGenAI } from "@google/genai";
import { AugmentationMode, AugmentationEffect } from '../types';

export class GeminiService {
  /**
   * Augment an industrial image using Gemini 2.5 Flash Image model.
   * Uses process.env.API_KEY directly as required.
   */
  async augmentImage(
    base64Image: string, 
    effect: AugmentationEffect, 
    mode: AugmentationMode
  ): Promise<string | null> {
    // Obtain the API key exclusively from the environment variable.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const modelName = 'gemini-2.5-flash-image';
    
    // Construct System Instruction based on mode to guide the model's behavior.
    const systemInstruction = mode === AugmentationMode.SAFE_PHYSICAL 
      ? `You are an industrial data augmentation tool. 
         Task: Add ${effect.name} effect. 
         CRITICAL: You MUST preserve the exact pixel-level geometry and structure of the power equipment (transformers, insulators, wires, poles). 
         Do NOT add, remove, or morph any parts of the equipment. Only change the lighting, weather, noise, and environmental atmospheric effects.
         The result must be suitable for training a high-precision object detection model (YOLO).`
      : `You are a generative creative AI. 
         Task: Reimagine this power equipment in a ${effect.name} scenario. 
         Enhance the visual style with ${effect.promptMod}. 
         Background changes and minor structural styling are acceptable to create a realistic diverse sample.`;

    const prompt = `Augment this image with ${effect.promptMod}. Ensure high quality and professional industrial look.`;

    try {
      // Call generateContent with the appropriate model and parts.
      const response = await ai.models.generateContent({
        model: modelName,
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Image.split(',')[1] || base64Image,
                mimeType: 'image/png',
              },
            },
            {
              text: prompt,
            },
          ],
        },
        config: {
          systemInstruction: systemInstruction,
        },
      });

      // Safely access candidates and iterate through parts to find the image.
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }
      return null;
    } catch (error) {
      console.error("Gemini Augmentation Error:", error);
      throw error;
    }
  }
}