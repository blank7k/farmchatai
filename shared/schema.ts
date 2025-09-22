import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const farmers = pgTable("farmers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  district: text("district").notNull(),
  landSize: text("land_size").notNull(),
  landType: text("land_type").notNull(),
  crops: jsonb("crops").$type<string[]>().notNull(),
  experience: text("experience").notNull(),
  language: text("language").default("en"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  farmerId: varchar("farmer_id").references(() => farmers.id),
  message: text("message").notNull(),
  response: text("response"),
  isVoice: boolean("is_voice").default(false),
  timestamp: timestamp("timestamp").default(sql`now()`),
});

export const suggestions = pgTable("suggestions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  farmerId: varchar("farmer_id").references(() => farmers.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull(),
  category: text("category").notNull(),
  isCompleted: boolean("is_completed").default(false),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const weatherData = pgTable("weather_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  district: text("district").notNull(),
  temperature: text("temperature"),
  humidity: text("humidity"),
  rainfall: text("rainfall"),
  forecast: jsonb("forecast"),
  farmingAdvice: text("farming_advice"),
  timestamp: timestamp("timestamp").default(sql`now()`),
});

export const marketPrices = pgTable("market_prices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  crop: text("crop").notNull(),
  pricePerKg: text("price_per_kg"),
  district: text("district"),
  change: text("change"),
  trend: text("trend"),
  date: timestamp("date").default(sql`now()`),
});

export const insertFarmerSchema = createInsertSchema(farmers).pick({
  name: true,
  district: true,
  landSize: true,
  landType: true,
  crops: true,
  experience: true,
  language: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  farmerId: true,
  message: true,
  isVoice: true,
});

export const insertSuggestionSchema = createInsertSchema(suggestions).pick({
  farmerId: true,
  title: true,
  description: true,
  priority: true,
  category: true,
  dueDate: true,
});

export type InsertFarmer = z.infer<typeof insertFarmerSchema>;
export type Farmer = typeof farmers.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertSuggestion = z.infer<typeof insertSuggestionSchema>;
export type Suggestion = typeof suggestions.$inferSelect;
export type WeatherData = typeof weatherData.$inferSelect;
export type MarketPrice = typeof marketPrices.$inferSelect;
