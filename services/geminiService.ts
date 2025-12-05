import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CompanyProfile, GeneratedContent, Platform } from "../types";

// Helper to safely get API Key checking multiple environment variable standards
const getAPIKey = (): string => {
  // 1. Check standard process.env (Webpack/Node/Create-React-App)
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {}

  // 2. Check Vite standard (import.meta.env)
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        // @ts-ignore
        if (import.meta.env.VITE_API_KEY) return import.meta.env.VITE_API_KEY;
        // @ts-ignore
        if (import.meta.env.PUBLIC_API_KEY) return import.meta.env.PUBLIC_API_KEY;
        // @ts-ignore
        if (import.meta.env.API_KEY) return import.meta.env.API_KEY;
    }
  } catch (e) {}

  return '';
};

// Helper to construct dynamic schema based on selected platforms
const createDynamicSchema = (platforms: Platform[]): Schema => {
  const properties: Record<string, any> = {};
  const required: string[] = [];

  platforms.forEach(p => {
    const key = p.toLowerCase();
    properties[key] = { type: Type.STRING, description: `Content optimized for ${p}` };
    required.push(key);
  });

  return {
    type: Type.OBJECT,
    properties,
    required,
  };
};

export const generateSocialPosts = async (
  topic: string,
  company: CompanyProfile,
  platforms: Platform[],
  modelName: string = "gemini-2.5-flash"
): Promise<GeneratedContent | null> => {
  const apiKey = getAPIKey();
  if (!apiKey) {
    throw new Error("API Key no encontrada. Asegúrate de configurar la variable de entorno API_KEY.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Rules per platform
    const rules = {
      [Platform.Twitter]: "Max 280 chars. Usa un 'Hook' provocativo al inicio. Hilos si es necesario. 2-3 hashtags de tendencia.",
      [Platform.LinkedIn]: "Tono profesional pero humano. Estructura: Gancho -> Contexto -> Valor -> Llamada a la acción. 3-5 hashtags estratégicos.",
      [Platform.Instagram]: "Visual y emotivo. Primera línea debe obligar a leer más. Usa espacios. Bloque de 15-20 hashtags optimizados (mezcla de nicho y populares) al final.",
      [Platform.Facebook]: "Comunitario y compartible. Preguntas abiertas para generar comentarios. Longitud media."
    };

    const selectedRules = platforms.map(p => `- ${p}: ${rules[p]}`).join("\n");

    const prompt = `
      Actúa como un experto Estratega de Redes Sociales y Growth Hacker para la empresa "${company.name}".
      
      Detalles de la empresa:
      - Industria: ${company.industry}
      - Tono: ${company.tone}
      - Descripción: ${company.description}
      
      Tarea: Genera posts virales para las siguientes redes sociales sobre el tema: "${topic}".
      
      ESTRATEGIA DE TENDENCIAS Y VIRALIDAD (IMPORTANTE):
      1. HOOKS: Cada post debe comenzar con un gancho irresistible (pregunta retórica, dato impactante, afirmación controversial) para detener el scroll.
      2. HASHTAGS: No uses hashtags genéricos. Usa una mezcla de hashtags de tendencia actual (#Trending), hashtags de nicho y hashtags de marca.
      3. ESTRUCTURA: Usa saltos de línea CLAROS (doble enter) para separar párrafos. Usa emojis estratégicos como viñetas. El texto NO debe verse como un bloque denso.
      4. COPYWRITING: Enfócate en el beneficio para el lector, no solo en las características de la empresa.
      
      Reglas Específicas por Red Social:
      ${selectedRules}
      
      Requisitos Globales:
      1. Mantén el tono de marca "${company.tone}".
      2. Devuelve SOLAMENTE el objeto JSON con las claves correspondientes a las redes solicitadas (${platforms.map(p => p.toLowerCase()).join(', ')}).
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: createDynamicSchema(platforms),
        temperature: 0.75, // Slightly higher for creativity/viral hooks
      },
    });

    const text = response.text;
    if (!text) return null;

    // Sanitize JSON (remove markdown code blocks if present)
    const jsonString = text.replace(/```json|```/g, '').trim();
    
    return JSON.parse(jsonString) as GeneratedContent;
  } catch (error) {
    console.error("Error generating posts:", error);
    throw error;
  }
};

export const generateAIImage = async (topic: string, style: string = 'photorealistic', customPrompt?: string): Promise<string | null> => {
    const apiKey = getAPIKey();
    if (!apiKey) {
        throw new Error("API Key no encontrada.");
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        
        // Logic: Use custom prompt if provided, otherwise build from topic + style
        const finalPrompt = customPrompt && customPrompt.trim() !== '' 
            ? `${customPrompt}. Style: ${style}. Aspect ratio 1:1. High quality.` 
            : `Create a high quality, professional social media image about: ${topic}. Style: ${style}. Aspect ratio 1:1. High contrast, vibrant colors, trending aesthetic.`;

        // Using gemini-2.5-flash-image (Nano Banana)
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
              parts: [{ text: finalPrompt }]
            },
            config: {
               // Nano banana does not support responseMimeType or responseSchema
            }
        });

        // Iterate through parts to find the image
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        }
        
        return null;
    } catch (error) {
        console.error("Error generating image:", error);
        return null;
    }
};

export const analyzePostImpact = async (content: string, platform: string): Promise<{ score: number; suggestion: string }> => {
    const apiKey = getAPIKey();
    if (!apiKey) {
        return { score: 0, suggestion: "API Key no configurada." };
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analiza el siguiente post de ${platform} considerando las tendencias actuales. Dame una puntuación del 1 al 100 de potencial viral y una sugerencia de mejora.\n\nPost: "${content}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.INTEGER },
                        suggestion: { type: Type.STRING }
                    }
                }
            }
        });
        const text = response.text;
        const jsonString = text?.replace(/```json|```/g, '').trim();
        return jsonString ? JSON.parse(jsonString) : { score: 0, suggestion: "Error analyzing" };
    } catch (e) {
        console.error(e);
        return { score: 50, suggestion: "No se pudo conectar con la IA." };
    }
}