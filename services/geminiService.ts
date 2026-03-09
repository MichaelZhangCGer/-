
import { GoogleGenAI } from "@google/genai";
import { AugmentationMode, AugmentationEffect } from '../types';

export class GeminiService {
  /**
   * 使用 Gemini 2.5 Flash Image 模型进行工业图像增强。
   */
  async augmentImage(
    base64Image: string, 
    effect: AugmentationEffect, 
    mode: AugmentationMode,
    strength: number // 强度参数 0-100
  ): Promise<string | null> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const modelName = 'gemini-2.5-flash-image';
    
    const strengthDesc = strength > 75 ? "extremely intense" : strength > 40 ? "moderate" : "subtle";

    const systemInstruction = mode === AugmentationMode.SAFE_PHYSICAL 
      ? `You are an industrial data augmentation tool. 
         Task: Add ${effect.name} effect with ${strengthDesc} intensity. 
         CRITICAL: You MUST preserve the exact pixel-level geometry and structure of the power equipment. 
         Do NOT add, remove, or morph any parts of the equipment. Only change lighting and atmosphere.`
      : `You are a generative AI for industrial augmentation. 
         Task: Reimagine this power equipment in a ${effect.name} scenario. 
         The core identity of the industrial equipment MUST remain recognizable.`;

    const prompt = `Augment this image with ${effect.promptMod}. Effect intensity: ${strength}%.`;

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
          imageConfig: {
            aspectRatio: "16:9"
          }
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
    } catch (error: any) {
      console.error("Gemini Augmentation Error:", error);
      
      // 提取深层错误信息
      let message = error.message || "未知连接错误";
      let status = error.status || "UNKNOWN";
      
      // 针对提供的日志结构进行解析: {"error":{"code":429,"message":"...","status":"RESOURCE_EXHAUSTED"}}
      if (error.error && typeof error.error === 'object') {
          message = error.error.message || message;
          status = error.error.status || status;
      } else if (typeof error === 'string') {
          try {
              const parsed = JSON.parse(error);
              if (parsed.error) {
                  message = parsed.error.message || message;
                  status = parsed.error.status || status;
              }
          } catch(e) {}
      }

      const detailedError = new Error(message);
      (detailedError as any).model = modelName;
      (detailedError as any).status = status;
      throw detailedError;
    }
  }
}
