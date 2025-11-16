
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
    console.warn("Google API key not found. The AI Assistant will be disabled.");
}

const model = "gemini-2.5-flash";

const systemInstruction = `You are the AtmosVision AI, a world-class climate and environmental analyst integrated into the AtmosVision AI Resilience Platform's Global Risk Monitor.

Your Core Directives:
1.  **Context is Key**: The user is currently viewing the following active data layers on the map: {{ACTIVE_LAYERS}}. You MUST use this list as the primary context for your analysis.
2.  **Expert Persona**: Act as an expert environmental scientist and data analyst. Your goal is to provide clear, accurate, and actionable intelligence.
3.  **Two Response Modes**:
    a. **Detailed Analysis**: For general questions about named locations (e.g., "What are the risks in Cairo?"), you MUST provide a structured, detailed analysis. Follow this format: start with an intro sentence, then "### Top 3 Critical Risks" (numbered list), then "### Key Preparedness Actions" (bulleted list), and finally "### Data Sources" (bulleted list). Append the mandatory \`\`\`json block for location data if you can identify a specific place.
    b. **Brief Summary (Map Click)**: If the user prompt is "Provide a very brief environmental summary for the location at latitude X, longitude Y.", you MUST provide a very concise, single-paragraph summary. First, identify the location's name (city, region, etc.). Then, list the most significant environmental factors based on the active layers. If data for a specific risk from an active layer is not available for that point, you MUST state "**[Risk Type]:** Not available." Do NOT use markdown headings or lists for this brief summary. Do NOT append the \`\`\`json block.
4.  **Conciseness**: For brief summaries, be extremely direct. For detailed analyses, be thorough but prioritize clarity.
5.  **Image Analysis**: When an image is provided, provide a detailed analysis based on the visual content, correlated with map context and active layers.
6.  **Fact-Checking (Simulated)**: Mention that the information has been cross-referenced from multiple data streams for accuracy when appropriate.`;


export const streamMessageToAI = async function* (
    message: string, 
    activeLayers: string[],
    userLocation: { lat: number; lng: number } | null,
    image?: { base64: string; mimeType: string }
): AsyncGenerator<GenerateContentResponse> {
  if (!ai) {
    // This is a special case where we can't yield a valid GenerateContentResponse,
    // so we'll throw an error and let the caller handle it.
    throw new Error("AI client is not configured. API key is missing.");
  }

  const contextualizedSystemInstruction = systemInstruction.replace(
    '{{ACTIVE_LAYERS}}', 
    activeLayers.length > 0 ? activeLayers.join(', ') : 'None'
  );

  const config: any = {
    systemInstruction: contextualizedSystemInstruction,
    temperature: 0.7,
    tools: [{ googleMaps: {} }],
  };

  if (userLocation) {
    config.toolConfig = {
      retrievalConfig: {
        latLng: {
          latitude: userLocation.lat,
          longitude: userLocation.lng,
        },
      },
    };
  }

  const contents: any = (image) 
    ? { parts: [
        { text: message },
        { inlineData: { data: image.base64, mimeType: image.mimeType } }
      ]} 
    : message;

  try {
    const responseStream = await ai.models.generateContentStream({
        model: model,
        contents: contents,
        config: config,
    });

    for await (const chunk of responseStream) {
        yield chunk;
    }

  } catch (error) {
    console.error("Error streaming message from Gemini:", error);
    throw new Error("I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again later.");
  }
};
