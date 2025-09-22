import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/use-language";
import { CalendarDays, Lightbulb, CheckCircle, Clock, AlertTriangle } from "lucide-react";

interface SuggestionsTabProps {
  farmerId: string;
  farmerProfile: any;
}

interface Suggestion {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  category: string;
  isCompleted: boolean;
  dueDate: string;
  createdAt: string;
}

export default function SuggestionsTab({ farmerId, farmerProfile }: SuggestionsTabProps) {
  const { t } = useLanguage();

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ["/api/suggestions", farmerId],
    enabled: !!farmerId,
  });

  const generateSuggestionsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/generate-suggestions/${farmerId}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suggestions", farmerId] });
    },
  });

  const updateSuggestionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Suggestion> }) => {
      const response = await apiRequest("PATCH", `/api/suggestions/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suggestions", farmerId] });
    },
  });

  const completeSuggestion = (id: string) => {
    updateSuggestionMutation.mutate({
      id,
      updates: { isCompleted: true },
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive";
      case "medium":
        return "bg-accent/10 text-accent border-accent";
      case "low":
        return "bg-primary/10 text-primary border-primary";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle size={16} />;
      case "medium":
        return <Clock size={16} />;
      case "low":
        return <Lightbulb size={16} />;
      default:
        return <Lightbulb size={16} />;
    }
  };

  const todayTasks = (suggestions as Suggestion[]).filter((s: Suggestion) => 
    !s.isCompleted && new Date(s.dueDate) <= new Date(Date.now() + 24 * 60 * 60 * 1000)
  );

  const upcomingTasks = (suggestions as Suggestion[]).filter((s: Suggestion) => 
    !s.isCompleted && new Date(s.dueDate) > new Date(Date.now() + 24 * 60 * 60 * 1000)
  );

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">{t("suggestions.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Today's Tasks */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <CalendarDays className="text-primary" size={20} />
            <span>{t("suggestions.todayTasks")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {todayTasks.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle className="mx-auto text-primary mb-2" size={32} />
              <p className="text-muted-foreground">{t("suggestions.noTasksToday")}</p>
            </div>
          ) : (
            todayTasks.map((suggestion: Suggestion) => (
              <div
                key={suggestion.id}
                className="suggestion-card border border-border rounded-lg p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{suggestion.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{suggestion.description}</p>
                  </div>
                  <Badge className={getPriorityColor(suggestion.priority)} variant="outline">
                    <div className="flex items-center space-x-1">
                      {getPriorityIcon(suggestion.priority)}
                      <span className="capitalize">{suggestion.priority}</span>
                    </div>
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Clock size={12} />
                    <span>{t("suggestions.dueToday")}</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => completeSuggestion(suggestion.id)}
                    disabled={updateSuggestionMutation.isPending}
                    data-testid={`button-complete-${suggestion.id}`}
                  >
                    {t("suggestions.markComplete")}
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Seasonal Recommendations */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Lightbulb className="text-primary" size={20} />
            <span>{t("suggestions.seasonalRecommendations")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4">
            <h4 className="font-semibold mb-2">{t("suggestions.decemberPlanting")}</h4>
            <p className="text-sm text-muted-foreground mb-3">
              {t("suggestions.decemberDescription")}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background/50 p-3 rounded text-center">
                <div className="text-2xl mb-1">🥬</div>
                <h5 className="font-semibold text-sm">{t("suggestions.leafyGreens")}</h5>
                <p className="text-xs text-muted-foreground">{t("suggestions.perfectSeason")}</p>
              </div>
              <div className="bg-background/50 p-3 rounded text-center">
                <div className="text-2xl mb-1">🥕</div>
                <h5 className="font-semibold text-sm">{t("suggestions.rootVegetables")}</h5>
                <p className="text-xs text-muted-foreground">{t("suggestions.goodTime")}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Tasks */}
      {upcomingTasks.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Clock className="text-primary" size={20} />
              <span>{t("suggestions.upcomingTasks")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingTasks.map((suggestion: Suggestion) => (
              <div
                key={suggestion.id}
                className="border border-border rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-foreground">{suggestion.title}</h4>
                  <Badge className={getPriorityColor(suggestion.priority)} variant="outline">
                    <span className="capitalize">{suggestion.priority}</span>
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{suggestion.description}</p>
                <div className="text-xs text-muted-foreground">
                  {t("suggestions.dueDate")}: {new Date(suggestion.dueDate).toLocaleDateString()}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Generate New Suggestions */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Button
              onClick={() => generateSuggestionsMutation.mutate()}
              disabled={generateSuggestionsMutation.isPending}
              className="w-full"
              data-testid="button-generate-suggestions"
            >
              {generateSuggestionsMutation.isPending
                ? t("suggestions.generating")
                : t("suggestions.generateNew")
              }
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              {t("suggestions.aiPowered")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
