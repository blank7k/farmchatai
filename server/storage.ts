import { 
  type Farmer, 
  type InsertFarmer,
  type ChatMessage,
  type InsertChatMessage,
  type Suggestion,
  type InsertSuggestion,
  type WeatherData,
  type MarketPrice
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Farmer operations
  getFarmer(id: string): Promise<Farmer | undefined>;
  createFarmer(farmer: InsertFarmer): Promise<Farmer>;
  updateFarmer(id: string, farmer: Partial<Farmer>): Promise<Farmer | undefined>;
  
  // Chat operations
  getChatMessages(farmerId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  updateChatMessage(id: string, response: string): Promise<ChatMessage | undefined>;
  
  // Suggestion operations
  getSuggestions(farmerId: string): Promise<Suggestion[]>;
  createSuggestion(suggestion: InsertSuggestion): Promise<Suggestion>;
  updateSuggestion(id: string, updates: Partial<Suggestion>): Promise<Suggestion | undefined>;
  
  // Weather operations
  getWeatherData(district: string): Promise<WeatherData | undefined>;
  createWeatherData(weather: Omit<WeatherData, 'id' | 'timestamp'>): Promise<WeatherData>;
  
  // Market operations
  getMarketPrices(district?: string): Promise<MarketPrice[]>;
  createMarketPrice(price: Omit<MarketPrice, 'id' | 'date'>): Promise<MarketPrice>;
}

export class MemStorage implements IStorage {
  private farmers: Map<string, Farmer> = new Map();
  private chatMessages: Map<string, ChatMessage> = new Map();
  private suggestions: Map<string, Suggestion> = new Map();
  private weatherData: Map<string, WeatherData> = new Map();
  private marketPrices: Map<string, MarketPrice> = new Map();

  async getFarmer(id: string): Promise<Farmer | undefined> {
    return this.farmers.get(id) || undefined;
  }

  async createFarmer(insertFarmer: InsertFarmer): Promise<Farmer> {
    const id = randomUUID();
    const farmer: Farmer = { 
      ...insertFarmer, 
      crops: insertFarmer.crops as string[],
      id, 
      language: insertFarmer.language || "en",
      createdAt: new Date() 
    };
    this.farmers.set(id, farmer);
    return farmer;
  }

  async updateFarmer(id: string, updates: Partial<Farmer>): Promise<Farmer | undefined> {
    const farmer = this.farmers.get(id);
    if (!farmer) return undefined;
    
    const updatedFarmer = { ...farmer, ...updates };
    this.farmers.set(id, updatedFarmer);
    return updatedFarmer;
  }

  async getChatMessages(farmerId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.farmerId === farmerId)
      .sort((a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0));
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = {
      ...insertMessage,
      farmerId: insertMessage.farmerId || null,
      isVoice: insertMessage.isVoice || false,
      id,
      response: null,
      timestamp: new Date()
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async updateChatMessage(id: string, response: string): Promise<ChatMessage | undefined> {
    const message = this.chatMessages.get(id);
    if (!message) return undefined;
    
    const updatedMessage = { ...message, response };
    this.chatMessages.set(id, updatedMessage);
    return updatedMessage;
  }

  async getSuggestions(farmerId: string): Promise<Suggestion[]> {
    return Array.from(this.suggestions.values())
      .filter(suggestion => suggestion.farmerId === farmerId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createSuggestion(insertSuggestion: InsertSuggestion): Promise<Suggestion> {
    const id = randomUUID();
    const suggestion: Suggestion = {
      ...insertSuggestion,
      farmerId: insertSuggestion.farmerId || null,
      dueDate: insertSuggestion.dueDate || null,
      id,
      isCompleted: false,
      createdAt: new Date()
    };
    this.suggestions.set(id, suggestion);
    return suggestion;
  }

  async updateSuggestion(id: string, updates: Partial<Suggestion>): Promise<Suggestion | undefined> {
    const suggestion = this.suggestions.get(id);
    if (!suggestion) return undefined;
    
    const updatedSuggestion = { ...suggestion, ...updates };
    this.suggestions.set(id, updatedSuggestion);
    return updatedSuggestion;
  }

  async getWeatherData(district: string): Promise<WeatherData | undefined> {
    return Array.from(this.weatherData.values())
      .find(weather => weather.district.toLowerCase() === district.toLowerCase());
  }

  async createWeatherData(weather: Omit<WeatherData, 'id' | 'timestamp'>): Promise<WeatherData> {
    const id = randomUUID();
    const weatherData: WeatherData = {
      ...weather,
      id,
      timestamp: new Date()
    };
    this.weatherData.set(id, weatherData);
    return weatherData;
  }

  async getMarketPrices(district?: string): Promise<MarketPrice[]> {
    const prices = Array.from(this.marketPrices.values());
    if (district) {
      return prices.filter(price => 
        price.district?.toLowerCase() === district.toLowerCase()
      );
    }
    return prices.sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));
  }

  async createMarketPrice(price: Omit<MarketPrice, 'id' | 'date'>): Promise<MarketPrice> {
    const id = randomUUID();
    const marketPrice: MarketPrice = {
      ...price,
      id,
      date: new Date()
    };
    this.marketPrices.set(id, marketPrice);
    return marketPrice;
  }
}

export const storage = new MemStorage();
