import { GoogleGenAI, Type } from "@google/genai";
import { CharacterData, GradingResult } from "../types";

const modelFlash = 'gemini-2.5-flash';

export const getCharacterDetails = async (char: string): Promise<CharacterData> => {
  if (!char) throw new Error("Character is required");

  // Initialize inside the function to prevent module-level crashes if process is not defined yet
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `请提供汉字 "${char}" 的以下信息：拼音、中文释义、部首、总笔画数。`;
  
  try {
    const response = await ai.models.generateContent({
      model: modelFlash,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            char: { type: Type.STRING, description: "汉字字符" },
            pinyin: { type: Type.STRING, description: "汉字的拼音" },
            definition: { type: Type.STRING, description: "汉字的中文简要释义" },
            radical: { type: Type.STRING, description: "汉字的部首" },
            strokeCount: { type: Type.NUMBER, description: "汉字的总笔画数" },
          },
          required: ["char", "pinyin", "definition", "radical", "strokeCount"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as CharacterData;
  } catch (error) {
    console.error("Error fetching character details:", error);
    // Fallback data to prevent crash if AI fails
    return {
      char,
      pinyin: "...",
      definition: "暂无释义",
      radical: "?",
      strokeCount: 0
    };
  }
};

export const gradeHandwriting = async (targetChar: string, imageBase64: string): Promise<GradingResult> => {
  // Initialize inside the function
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Remove data URL prefix if present
  const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

  const prompt = `
    我正在练习书写汉字 "${targetChar}"。
    附件是我在数字画布上的手写作品。
    请像一位书法老师一样，从以下几个方面对我的书写进行评分（0-100分）：
    1. 间架结构（是否重心平稳，结构匀称）
    2. 笔画比例（横竖长短是否合适）
    3. 笔画在田字格中的位置
    
    请用中文回复，态度要鼓励但严格。
    请提供具体的“优点”和“改进建议”。
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelFlash,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Data
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "0-100分的评分" },
            feedback: { type: Type.STRING, description: "综合且具有建设性的反馈段落，使用中文" },
            strengths: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "1-3个书写优点，使用中文"
            },
            improvements: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "1-3个具体的改进建议，使用中文"
            },
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No grading response");
    
    return JSON.parse(text) as GradingResult;
  } catch (error) {
    console.error("Error grading handwriting:", error);
    return {
      score: 0,
      feedback: "暂时无法分析图片，请稍后再试。",
      strengths: [],
      improvements: ["请检查网络连接"]
    };
  }
};