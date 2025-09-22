import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFarmerSchema, insertChatMessageSchema, insertSuggestionSchema } from "@shared/schema";
import { getDistrictByValue } from "../client/src/lib/kerala-data";
import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "" 
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Farmer profile routes
  app.post("/api/farmers", async (req, res) => {
    try {
      const farmerData = insertFarmerSchema.parse(req.body);
      const farmer = await storage.createFarmer(farmerData);
      
      // Generate initial suggestions based on farmer profile
      await generateInitialSuggestions(farmer.id, farmerData);
      
      res.json(farmer);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/farmers/:id", async (req, res) => {
    try {
      const farmer = await storage.getFarmer(req.params.id);
      if (!farmer) {
        return res.status(404).json({ message: "Farmer not found" });
      }
      res.json(farmer);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/farmers/:id", async (req, res) => {
    try {
      const updates = req.body;
      const farmer = await storage.updateFarmer(req.params.id, updates);
      if (!farmer) {
        return res.status(404).json({ message: "Farmer not found" });
      }
      res.json(farmer);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Chat routes
  app.post("/api/chat", async (req, res) => {
    try {
      const messageData = insertChatMessageSchema.parse(req.body);
      const chatMessage = await storage.createChatMessage(messageData);
      
      // Get farmer context for personalized response
      const farmer = await storage.getFarmer(messageData.farmerId!);
      
      // Generate AI response
      const aiResponse = await generateFarmingResponse(messageData.message, farmer);
      
      // Update chat message with response
      const updatedMessage = await storage.updateChatMessage(chatMessage.id, aiResponse);
      
      res.json(updatedMessage);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/chat/:farmerId", async (req, res) => {
    try {
      const messages = await storage.getChatMessages(req.params.farmerId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Suggestions routes
  app.get("/api/suggestions/:farmerId", async (req, res) => {
    try {
      const suggestions = await storage.getSuggestions(req.params.farmerId);
      res.json(suggestions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/suggestions/:id", async (req, res) => {
    try {
      const updates = req.body;
      const suggestion = await storage.updateSuggestion(req.params.id, updates);
      if (!suggestion) {
        return res.status(404).json({ message: "Suggestion not found" });
      }
      res.json(suggestion);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Weather routes
  app.get("/api/weather/:district", async (req, res) => {
    try {
      let weather = await storage.getWeatherData(req.params.district);
      
      // If no recent weather data, fetch from external API or generate sample
      if (!weather || isWeatherDataStale(weather)) {
        weather = await fetchWeatherData(req.params.district);
      }
      
      res.json(weather);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Market prices routes
  app.get("/api/market-prices", async (req, res) => {
    try {
      const district = req.query.district as string;
      let prices = await storage.getMarketPrices(district);
      
      // If no recent price data, generate sample data
      if (prices.length === 0) {
        prices = await generateSampleMarketPrices(district);
      }
      
      res.json(prices);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Generate farming suggestions
  app.post("/api/generate-suggestions/:farmerId", async (req, res) => {
    try {
      const farmer = await storage.getFarmer(req.params.farmerId);
      if (!farmer) {
        return res.status(404).json({ message: "Farmer not found" });
      }
      
      await generateSeasonalSuggestions(farmer.id, farmer);
      const suggestions = await storage.getSuggestions(farmer.id);
      
      res.json(suggestions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions
async function generateFarmingResponse(message: string, farmer: any): Promise<string> {
  try {
    const context = farmer ? `
      Farmer Profile:
      - Name: ${farmer.name}
      - Location: ${farmer.district}, Kerala
      - Land Size: ${farmer.landSize}
      - Land Type: ${farmer.landType}
      - Crops: ${farmer.crops?.join(', ')}
      - Experience: ${farmer.experience}
    ` : '';

    const prompt = `You are FarmBot, an AI assistant specialized in Kerala farming practices. 
    ${context}
    
    Farmer's question: "${message}"
    
    Provide helpful, practical farming advice specific to Kerala's climate, soil, and agricultural practices. 
    Keep responses concise but informative. Use simple language. Include emojis when appropriate.
    If relevant, mention timing based on Kerala's seasons (monsoon, post-monsoon, summer).
    
    Response format should be natural and conversational, not structured JSON.`;

    // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content || "I'm sorry, I couldn't process your question. Please try again.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "I'm having trouble connecting to my knowledge base. Please check your internet connection and try again.";
  }
}

async function generateInitialSuggestions(farmerId: string, farmer: any): Promise<void> {
  try {
    const prompt = `Generate 3 farming suggestions for a Kerala farmer with this profile:
    - District: ${farmer.district}
    - Land Size: ${farmer.landSize}  
    - Land Type: ${farmer.landType}
    - Crops: ${farmer.crops?.join(', ')}
    - Experience: ${farmer.experience}
    
    Current season: December (post-monsoon)
    
    Provide suggestions in JSON format:
    {
      "suggestions": [
        {
          "title": "Brief action title",
          "description": "Detailed description", 
          "priority": "high|medium|low",
          "category": "planting|care|harvest|pest|fertilizer|irrigation"
        }
      ]
    }`;

    // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{"suggestions":[]}');
    
    for (const suggestion of result.suggestions) {
      await storage.createSuggestion({
        farmerId,
        title: suggestion.title,
        description: suggestion.description,
        priority: suggestion.priority,
        category: suggestion.category,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week from now
      });
    }
  } catch (error) {
    console.error("Error generating initial suggestions:", error);
  }
}

async function generateSeasonalSuggestions(farmerId: string, farmer: any): Promise<void> {
  const currentMonth = new Date().getMonth() + 1;
  const season = getKeralaSeason(currentMonth);
  
  try {
    const prompt = `Generate 2-3 seasonal farming suggestions for ${season} season in Kerala for:
    - District: ${farmer.district}
    - Crops: ${farmer.crops?.join(', ')}
    - Land Type: ${farmer.landType}
    
    Focus on seasonal activities like planting, harvesting, pest control, or preparation.
    
    Respond in JSON format:
    {
      "suggestions": [
        {
          "title": "Action title",
          "description": "Detailed description",
          "priority": "high|medium|low", 
          "category": "seasonal"
        }
      ]
    }`;

    // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{"suggestions":[]}');
    
    for (const suggestion of result.suggestions) {
      await storage.createSuggestion({
        farmerId,
        title: suggestion.title,
        description: suggestion.description,
        priority: suggestion.priority,
        category: suggestion.category,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 2 weeks from now
      });
    }
  } catch (error) {
    console.error("Error generating seasonal suggestions:", error);
  }
}

function getKeralaSeason(month: number): string {
  if (month >= 6 && month <= 9) return "monsoon";
  if (month >= 10 && month <= 2) return "post-monsoon"; 
  return "summer";
}

async function fetchWeatherData(district: string): Promise<any> {
  try {
    // Get district coordinates
    const districtData = getDistrictByValue(district);
    if (!districtData) {
      throw new Error(`District ${district} not found`);
    }

    const { latitude, longitude } = districtData;
    
    // Call Open-Meteo weather API
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=Asia/Kolkata&forecast_days=7`;
    
    const response = await fetch(weatherUrl);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }
    
    const weatherApiData = await response.json();
    
    // Process the API response
    const current = weatherApiData.current;
    const daily = weatherApiData.daily;
    
    // Create forecast array
    const forecast = daily.time.slice(0, 5).map((date: string, index: number) => ({
      day: index === 0 ? "Today" : index === 1 ? "Tomorrow" : new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      temp: `${Math.round(daily.temperature_2m_max[index])}°/${Math.round(daily.temperature_2m_min[index])}°`,
      condition: getWeatherDescription(daily.weather_code[index]),
      rain: `${Math.round(daily.precipitation_sum[index])}mm`
    }));

    // Generate farming advice based on weather conditions
    const farmingAdvice = generateFarmingAdvice(current, daily, districtData);
    
    const weatherData = {
      district: districtData.label,
      temperature: `${Math.round(current.temperature_2m)}°C`,
      humidity: `${Math.round(current.relative_humidity_2m)}%`,
      rainfall: current.precipitation > 0 ? `${current.precipitation}mm currently` : "No current rainfall",
      windSpeed: `${Math.round(current.wind_speed_10m)} km/h`,
      forecast,
      farmingAdvice,
      rawData: weatherApiData // Keep raw data for advanced processing
    };
    
    return await storage.createWeatherData(weatherData);
  } catch (error) {
    console.error('Weather API error:', error);
    
    // Fallback to sample data if API fails
    const fallbackData = {
      district,
      temperature: "28°C",
      humidity: "78%",
      rainfall: "Weather data temporarily unavailable",
      windSpeed: "12 km/h",
      forecast: [
        { day: "Today", temp: "32°/24°", condition: "Partly Cloudy", rain: "0mm" },
        { day: "Tomorrow", temp: "29°/23°", condition: "Light Rain", rain: "5mm" }
      ],
      farmingAdvice: "Weather service temporarily unavailable. Please check local conditions and follow general seasonal guidelines.",
      isTemporary: true
    };
    
    return await storage.createWeatherData(fallbackData);
  }
}

function getWeatherDescription(weatherCode: number): string {
  // WMO Weather interpretation codes (WW)
  const weatherCodes: { [key: number]: string } = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy", 
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snowfall",
    73: "Moderate snowfall",
    75: "Heavy snowfall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail"
  };
  
  return weatherCodes[weatherCode] || "Unknown";
}

function generateFarmingAdvice(current: any, daily: any, districtData: any): string {
  const temp = current.temperature_2m;
  const humidity = current.relative_humidity_2m;
  const precipitation = current.precipitation;
  const upcomingRain = daily.precipitation_sum.slice(0, 3).reduce((sum: number, rain: number) => sum + rain, 0);
  const climate = districtData.climate;
  const currentMonth = new Date().getMonth() + 1;
  
  let advice = "";
  
  // Temperature-based advice
  if (temp > 35) {
    advice += "High temperature alert: Provide shade for crops, increase irrigation frequency. ";
  } else if (temp < 20) {
    advice += "Cool weather: Good for leafy vegetables and cool-season crops. ";
  } else {
    advice += "Optimal temperature range for most Kerala crops. ";
  }
  
  // Rainfall-based advice
  if (upcomingRain > 50) {
    advice += "Heavy rain expected: Ensure proper drainage, delay fertilizer application. ";
  } else if (upcomingRain > 10) {
    advice += "Moderate rain expected: Good for transplanting, reduce irrigation. ";
  } else if (upcomingRain < 2) {
    advice += "Dry period ahead: Increase irrigation, mulch around plants. ";
  }
  
  // Humidity-based advice
  if (humidity > 80) {
    advice += "High humidity: Monitor for fungal diseases, ensure good air circulation. ";
  } else if (humidity < 50) {
    advice += "Low humidity: Increase watering frequency, consider misting for sensitive plants. ";
  }
  
  // Climate-specific advice
  if (climate === "coastal") {
    advice += "Coastal area: Watch for salt damage, use salt-tolerant varieties. ";
  } else if (climate === "highland") {
    advice += "Highland area: Good conditions for spices and plantation crops. ";
  }
  
  // Seasonal advice
  if (currentMonth >= 6 && currentMonth <= 9) {
    advice += "Monsoon season: Ideal for rice planting and water-loving crops.";
  } else if (currentMonth >= 10 && currentMonth <= 2) {
    advice += "Post-monsoon: Perfect for vegetables and cool-season crops.";
  } else {
    advice += "Pre-monsoon: Focus on water conservation and heat-tolerant crops.";
  }
  
  return advice;
}

function isWeatherDataStale(weather: any): boolean {
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
  return weather.timestamp < sixHoursAgo;
}

async function generateSampleMarketPrices(district?: string): Promise<any[]> {
  const crops = [
    { crop: "Tomatoes", pricePerKg: "₹45", change: "+15%", trend: "up" },
    { crop: "Chilli", pricePerKg: "₹120", change: "-8%", trend: "down" },
    { crop: "Onions", pricePerKg: "₹35", change: "0%", trend: "stable" },
    { crop: "Rice", pricePerKg: "₹2,800", change: "+5%", trend: "up" },
    { crop: "Coconut", pricePerKg: "₹25", change: "+3%", trend: "up" }
  ];

  const prices = [];
  for (const cropData of crops) {
    const price = await storage.createMarketPrice({
      ...cropData,
      district: district || "Kerala"
    });
    prices.push(price);
  }
  
  return prices;
}
