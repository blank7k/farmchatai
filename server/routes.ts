import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFarmerSchema, insertChatMessageSchema, insertSuggestionSchema } from "@shared/schema";
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
  // In a real app, this would call a weather API
  // For now, return sample data
  const weatherData = {
    district,
    temperature: "28°C",
    humidity: "78%",
    rainfall: "Light rain expected",
    forecast: [
      { day: "Today", temp: "32°/24°", condition: "Sunny", rain: "0%" },
      { day: "Tomorrow", temp: "29°/23°", condition: "Light Rain", rain: "60%" },
      { day: "Wednesday", temp: "30°/24°", condition: "Cloudy", rain: "20%" }
    ],
    farmingAdvice: "Good conditions for planting vegetables. Delay irrigation due to expected rainfall."
  };
  
  return await storage.createWeatherData(weatherData);
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
