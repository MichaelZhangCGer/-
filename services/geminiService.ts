
import { GoogleGenAI } from "@google/genai";
import { AugmentationMode, AugmentationEffect } from '../types';

export class GeminiService {
  /**
   * 使用 Gemini 2.5 Flash Image 模型进行工业图像增强。
   * 支持通过 strength 参数调节效果深度。
   */
  async augmentImage(
    base64Image: string, 
    effect: AugmentationEffect, 
    mode: AugmentationMode,
    strength: number // 强度参数 0-100
  ): Promise<string | null> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const modelName = 'gemini-2.5-flash-image';
    
    // 将强度转化为描述性词汇
    const strengthDesc = strength > 75 ? "extremely intense" : strength > 40 ? "moderate" : "subtle";

    const systemInstruction = mode === AugmentationMode.SAFE_PHYSICAL 
      ? `You are an industrial data augmentation tool. 
         Task: Add ${effect.name} effect with ${strengthDesc} intensity. 
         CRITICAL: You MUST preserve the exact pixel-level geometry and structure of the power equipment (transformers, insulators, wires, poles). 
         Do NOT add, remove, or morph any parts of the equipment. Only change the lighting, weather, noise, and environmental atmospheric effects.
         The resulting image should look like the equipment was photographed in ${effect.name} conditions with ${strength}% effect visibility.`
      : `You are a generative creative AI for industrial augmentation. 
         Task: Reimagine this power equipment in a ${effect.name} scenario. 
         Enhance the visual style with ${effect.promptMod}. 
         The style transformation level is ${strength}% (higher means more variation in background and environmental lighting). 
         CRITICAL: While reimagining the environment, the core identity and identifiable features of the industrial equipment MUST remain recognizable. 
         Do not turn the equipment into abstract shapes. Maintain industrial high-fidelity.`;

    const prompt = `Augment this image with ${effect.promptMod}. Effect intensity: ${strength}%. Ensure professional industrial high-fidelity results.`;

    try {
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
