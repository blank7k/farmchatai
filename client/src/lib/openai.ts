import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "" 
});

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
export const DEFAULT_MODEL = "gpt-5";

export interface FarmingContext {
  name: string;
  district: string;
  landSize: string;
  landType: string;
  crops: string[];
  experience: string;
  language: string;
}

export async function generateFarmingResponse(
  message: string, 
  context?: FarmingContext
): Promise<string> {
  try {
    const contextPrompt = context ? `
      Farmer Profile:
      - Name: ${context.name}
      - Location: ${context.district}, Kerala
      - Land Size: ${context.landSize}
      - Land Type: ${context.landType}
      - Crops: ${context.crops.join(', ')}
      - Experience: ${context.experience}
      - Language: ${context.language}
    ` : '';

    const prompt = `You are FarmBot Kerala, an AI assistant specialized in Kerala farming practices. 
    ${contextPrompt}
    
    Farmer's question: "${message}"
    
    Provide helpful, practical farming advice specific to Kerala's climate, soil, and agricultural practices. 
    Consider the monsoon seasons (June-September), post-monsoon (October-February), and summer (March-May).
    Keep responses concise but informative. Use simple language appropriate for farmers.
    Include emojis when appropriate to make responses friendly and engaging.
    
    If the question is about:
    - Crop selection: Consider Kerala's tropical climate and seasonal patterns
    - Pest control: Focus on organic and sustainable methods popular in Kerala
    - Fertilizers: Emphasize organic options and local resources
    - Weather: Reference Kerala's monsoon patterns and seasonal farming calendar
    - Market: Consider local Kerala markets and traditional crops
    
    Response should be natural and conversational, not structured JSON.`;

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content || "I'm sorry, I couldn't process your question. Please try again.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Unable to connect to AI service. Please check your internet connection and try again.");
  }
}

export async function generateFarmingSuggestions(
  context: FarmingContext,
  count: number = 3,
  focus?: 'seasonal' | 'daily' | 'emergency'
): Promise<Array<{
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}>> {
  try {
    const currentMonth = new Date().getMonth() + 1;
    const season = getKeralaSeason(currentMonth);
    
    const focusPrompt = focus === 'seasonal' 
      ? `Focus on seasonal activities for ${season} season in Kerala.`
      : focus === 'daily'
      ? `Focus on daily/weekly tasks that need immediate attention.`
      : focus === 'emergency'
      ? `Focus on urgent issues that require immediate action.`
      : `Generate a mix of seasonal, maintenance, and planning suggestions.`;

    const prompt = `Generate ${count} farming suggestions for a Kerala farmer with this profile:
    - District: ${context.district}
    - Land Size: ${context.landSize}  
    - Land Type: ${context.landType}
    - Crops: ${context.crops.join(', ')}
    - Experience: ${context.experience}
    
    Current season: ${season} (Month: ${currentMonth})
    ${focusPrompt}
    
    Provide suggestions in JSON format:
    {
      "suggestions": [
        {
          "title": "Brief action title (max 50 chars)",
          "description": "Detailed description with specific steps", 
          "priority": "high|medium|low",
          "category": "planting|care|harvest|pest|fertilizer|irrigation|seasonal|planning"
        }
      ]
    }`;

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{"suggestions":[]}');
    return result.suggestions || [];
  } catch (error) {
    console.error("Error generating farming suggestions:", error);
    throw new Error("Unable to generate suggestions. Please try again later.");
  }
}

export async function generateWeatherAdvice(
  weatherData: {
    temperature: string;
    humidity: string;
    forecast: Array<{ condition: string; rain: string; }>;
  },
  context: FarmingContext
): Promise<string> {
  try {
    const prompt = `Based on this weather data for ${context.district}, Kerala:
    - Current Temperature: ${weatherData.temperature}
    - Humidity: ${weatherData.humidity}
    - Forecast: ${weatherData.forecast.map(f => `${f.condition} (${f.rain} rain)`).join(', ')}
    
    Farmer Profile:
    - Land Type: ${context.landType}
    - Crops: ${context.crops.join(', ')}
    
    Provide specific farming advice for the next 3-7 days considering this weather.
    Focus on irrigation, pest control, harvesting, and crop protection.
    Keep advice practical and actionable for Kerala farmers.`;

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
    });

    return response.choices[0]?.message?.content || "Weather-based farming advice is currently unavailable.";
  } catch (error) {
    console.error("Error generating weather advice:", error);
    throw new Error("Unable to generate weather advice. Please try again later.");
  }
}

export function getKeralaSeason(month: number): string {
  if (month >= 6 && month <= 9) return "monsoon";
  if (month >= 10 && month <= 2) return "post-monsoon";
  return "summer";
}

export function getSeasonalCrops(season: string, landType: string): string[] {
  const cropsBySeasonAndLand: Record<string, Record<string, string[]>> = {
    monsoon: {
      paddy: ["Rice", "Coconut", "Banana", "Ginger", "Turmeric"],
      upland: ["Pepper", "Cardamom", "Coffee", "Rubber", "Vegetables"],
      plantation: ["Coconut", "Rubber", "Pepper", "Cardamom", "Coffee"]
    },
    "post-monsoon": {
      paddy: ["Vegetables", "Coconut", "Banana", "Rice (second crop)"],
      upland: ["Vegetables", "Fruits", "Spices", "Pepper", "Cardamom"],
      plantation: ["Coconut", "Fruits", "Spices", "Coffee"]
    },
    summer: {
      paddy: ["Summer Rice", "Coconut", "Banana", "Vegetables (with irrigation)"],
      upland: ["Fruits", "Vegetables (shade)", "Spices", "Coconut"],
      plantation: ["Coconut", "Mango", "Jackfruit", "Cashew"]
    }
  };

  return cropsBySeasonAndLand[season]?.[landType] || ["Coconut", "Banana", "Vegetables"];
}
