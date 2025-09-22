import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/components/theme-provider";
import { useLanguage } from "@/hooks/use-language";
import { Sprout, Moon, Sun, Globe, User, MessageCircle, Lightbulb, Cloud, TrendingUp, Users } from "lucide-react";
import ChatInterface from "@/components/chat-interface";
import SuggestionsTab from "@/components/suggestions-tab";
import WeatherTab from "@/components/weather-tab";
import MarketTab from "@/components/market-tab";
import CommunityTab from "@/components/community-tab";

export default function MainAppPage() {
  const [, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const [farmerId, setFarmerId] = useState<string | null>(null);
  const [farmerProfile, setFarmerProfile] = useState<any>(null);

  useEffect(() => {
    const storedFarmerId = localStorage.getItem("farmerId");
    const storedProfile = localStorage.getItem("farmerProfile");
    
    if (!storedFarmerId) {
      setLocation("/");
      return;
    }
    
    setFarmerId(storedFarmerId);
    if (storedProfile) {
      setFarmerProfile(JSON.parse(storedProfile));
    }
  }, [setLocation]);

  if (!farmerId) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Sprout className="text-primary-foreground" size={16} />
          </div>
          <h1 className="text-lg font-bold text-foreground">{t("app.title")}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            data-testid="button-profile"
          >
            <User size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            data-testid="button-main-language-toggle"
          >
            <Globe size={16} className="mr-1" />
            {language === "en" ? "EN" : "മലയാളം"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            data-testid="button-main-theme-toggle"
          >
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </Button>
        </div>
      </header>

      {/* Main Content with Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="chat" className="h-full flex flex-col">
          {/* Tab Navigation */}
          <div className="bg-card border-b border-border px-4 py-2 overflow-x-auto">
            <TabsList className="inline-flex w-auto min-w-max space-x-2">
              <TabsTrigger 
                value="chat" 
                className="flex items-center space-x-2 whitespace-nowrap"
                data-testid="tab-chat"
              >
                <MessageCircle size={16} />
                <span>{t("tabs.chat")}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="suggestions" 
                className="flex items-center space-x-2 whitespace-nowrap"
                data-testid="tab-suggestions"
              >
                <Lightbulb size={16} />
                <span>{t("tabs.suggestions")}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="weather" 
                className="flex items-center space-x-2 whitespace-nowrap"
                data-testid="tab-weather"
              >
                <Cloud size={16} />
                <span>{t("tabs.weather")}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="market" 
                className="flex items-center space-x-2 whitespace-nowrap"
                data-testid="tab-market"
              >
                <TrendingUp size={16} />
                <span>{t("tabs.market")}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="community" 
                className="flex items-center space-x-2 whitespace-nowrap"
                data-testid="tab-community"
              >
                <Users size={16} />
                <span>{t("tabs.community")}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            <TabsContent value="chat" className="h-full m-0">
              <ChatInterface farmerId={farmerId} farmerProfile={farmerProfile} />
            </TabsContent>
            
            <TabsContent value="suggestions" className="h-full m-0">
              <SuggestionsTab farmerId={farmerId} farmerProfile={farmerProfile} />
            </TabsContent>
            
            <TabsContent value="weather" className="h-full m-0">
              <WeatherTab district={farmerProfile?.district} />
            </TabsContent>
            
            <TabsContent value="market" className="h-full m-0">
              <MarketTab district={farmerProfile?.district} />
            </TabsContent>
            
            <TabsContent value="community" className="h-full m-0">
              <CommunityTab farmerId={farmerId} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
