import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { TrendingUp, TrendingDown, Minus, Bell, Calculator, Truck, Clock, ChartLine } from "lucide-react";

interface MarketTabProps {
  district?: string;
}

interface MarketPrice {
  id: string;
  crop: string;
  pricePerKg: string;
  district: string;
  change: string;
  trend: string;
  date: string;
}

export default function MarketTab({ district }: MarketTabProps) {
  const { t } = useLanguage();

  const { data: marketPrices = [], isLoading } = useQuery({
    queryKey: ["/api/market-prices"],
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="text-green-500" size={16} />;
      case "down":
        return <TrendingDown className="text-red-500" size={16} />;
      default:
        return <Minus className="text-muted-foreground" size={16} />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-500";
      case "down":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  const getCropIcon = (crop: string) => {
    const icons: Record<string, string> = {
      "Tomatoes": "🍅",
      "Chilli": "🌶️",
      "Onions": "🧅",
      "Rice": "🌾",
      "Coconut": "🥥",
    };
    return icons[crop] || "🌱";
  };

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">{t("market.loading")}</p>
        </div>
      </div>
    );
  }

  const risingPrices = (marketPrices as MarketPrice[]).filter((price: MarketPrice) => price.trend === "up");

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Price Alerts */}
      {risingPrices.length > 0 && (
        <Card className="border-accent bg-accent/5">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-accent">
              <Bell size={20} />
              <span>{t("market.priceAlerts")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-accent/10 border border-accent rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <TrendingUp className="text-accent" size={20} />
                <h4 className="font-semibold text-accent">
                  {t("market.pricesRising", { crop: risingPrices[0]?.crop })}
                </h4>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("market.currentPrice", { 
                  price: risingPrices[0]?.pricePerKg,
                  change: risingPrices[0]?.change 
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Market Prices */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <ChartLine className="text-primary" size={20} />
            <span>{t("market.todayPrices")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(marketPrices as MarketPrice[]).map((price: MarketPrice) => (
            <div
              key={price.id}
              className="flex items-center justify-between p-3 bg-muted rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{getCropIcon(price.crop)}</div>
                <div>
                  <p className="font-semibold">{price.crop}</p>
                  <p className="text-sm text-muted-foreground">{t("market.perKg")}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-lg">{price.pricePerKg}</p>
                <div className={`flex items-center ${getTrendColor(price.trend)}`}>
                  {getTrendIcon(price.trend)}
                  <span className="text-sm ml-1">{price.change}</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Best Selling Times */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <Clock className="text-primary" size={20} />
            <span>{t("market.bestSellingTimes")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-primary/10 p-4 rounded-lg">
            <h4 className="font-semibold text-primary mb-2">{t("market.thisWeek")}</h4>
            <p className="text-sm text-muted-foreground">
              {t("market.bestDaysVegetables")}
            </p>
          </div>
          <div className="bg-secondary/10 p-4 rounded-lg">
            <h4 className="font-semibold text-secondary mb-2">{t("market.nextMonth")}</h4>
            <p className="text-sm text-muted-foreground">
              {t("market.riceSeasonDemand")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>{t("market.quickActions")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="p-4 h-auto flex-col space-y-2 hover:bg-primary/10"
              data-testid="button-price-calculator"
            >
              <Calculator className="text-primary" size={24} />
              <span className="text-sm font-semibold">{t("market.priceCalculator")}</span>
            </Button>
            <Button
              variant="outline"
              className="p-4 h-auto flex-col space-y-2 hover:bg-accent/10"
              data-testid="button-transport-help"
            >
              <Truck className="text-accent" size={24} />
              <span className="text-sm font-semibold">{t("market.transportHelp")}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Market Insights */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>{t("market.insights")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
              <TrendingUp className="text-green-500 mt-1" size={16} />
              <div>
                <h5 className="font-semibold text-sm">{t("market.demandIncreasing")}</h5>
                <p className="text-xs text-muted-foreground">
                  {t("market.organicVegetables")}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
              <Clock className="text-primary mt-1" size={16} />
              <div>
                <h5 className="font-semibold text-sm">{t("market.seasonalTip")}</h5>
                <p className="text-xs text-muted-foreground">
                  {t("market.harvestTiming")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
