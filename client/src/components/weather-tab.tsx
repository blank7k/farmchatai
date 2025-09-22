import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Cloud, Sun, CloudRain, Wind, Eye, Droplets, Calendar, Tractor, SprayCan } from "lucide-react";

interface WeatherTabProps {
  district?: string;
}

interface WeatherData {
  id: string;
  district: string;
  temperature: string;
  humidity: string;
  rainfall: string;
  forecast: Array<{
    day: string;
    temp: string;
    condition: string;
    rain: string;
  }>;
  farmingAdvice: string;
}

export default function WeatherTab({ district }: WeatherTabProps) {
  const { t } = useLanguage();

  const { data: weatherData, isLoading } = useQuery({
    queryKey: ["/api/weather", district],
    enabled: !!district,
  });

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "sunny":
        return <Sun className="text-yellow-500" size={24} />;
      case "light rain":
        return <CloudRain className="text-blue-500" size={24} />;
      case "cloudy":
        return <Cloud className="text-gray-500" size={24} />;
      default:
        return <Cloud className="text-gray-500" size={24} />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">{t("weather.loading")}</p>
        </div>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <div className="text-center">
          <Cloud className="mx-auto text-muted-foreground mb-2" size={48} />
          <p className="text-muted-foreground">{t("weather.noData")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Current Weather */}
      <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-3xl font-bold">{(weatherData as WeatherData)?.temperature}</h3>
              <p className="text-muted-foreground">{t("weather.partlyCloudy")}</p>
              <p className="text-sm text-muted-foreground">{(weatherData as WeatherData)?.district}, Kerala</p>
            </div>
            <div className="text-right">
              <div className="text-6xl mb-2">
                <Sun className="text-accent" size={64} />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("weather.humidity")}: {(weatherData as WeatherData)?.humidity}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background/50 p-3 rounded-lg text-center">
              <Eye className="text-primary mx-auto mb-1" size={20} />
              <p className="text-xs text-muted-foreground">{t("weather.visibility")}</p>
              <p className="font-semibold">10 km</p>
            </div>
            <div className="bg-background/50 p-3 rounded-lg text-center">
              <Wind className="text-primary mx-auto mb-1" size={20} />
              <p className="text-xs text-muted-foreground">{t("weather.wind")}</p>
              <p className="font-semibold">12 km/h</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5-Day Forecast */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="text-primary" size={20} />
            <span>{t("weather.forecast5Day")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(weatherData as WeatherData)?.forecast?.map((day: any, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getWeatherIcon(day.condition)}
                <div>
                  <p className="font-semibold">{day.day}</p>
                  <p className="text-sm text-muted-foreground">{day.condition}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{day.temp}</p>
                <p className="text-sm text-muted-foreground">{day.rain} rain</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Farming Weather Advice */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <Tractor className="text-primary" size={20} />
            <span>{t("weather.farmingAdvice")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Droplets className="text-primary" size={16} />
              <h4 className="font-semibold">{t("weather.irrigationTiming")}</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("weather.irrigationAdvice")}
            </p>
          </div>

          <div className="bg-accent/10 border-l-4 border-accent p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <SprayCan className="text-accent" size={16} />
              <h4 className="font-semibold">{t("weather.pesticideApplication")}</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("weather.pesticideAdvice")}
            </p>
          </div>

          {(weatherData as WeatherData)?.farmingAdvice && (
            <div className="bg-secondary/10 border-l-4 border-secondary p-4 rounded-lg">
              <h4 className="font-semibold mb-2">{t("weather.generalAdvice")}</h4>
              <p className="text-sm text-muted-foreground">{(weatherData as WeatherData)?.farmingAdvice}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
