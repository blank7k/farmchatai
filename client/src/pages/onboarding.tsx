import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/theme-provider";
import { useLanguage } from "@/hooks/use-language";
import { Sprout, Moon, Sun, Globe } from "lucide-react";
import { KERALA_DISTRICTS, LAND_TYPES, CROP_OPTIONS, EXPERIENCE_LEVELS } from "@/lib/kerala-data";

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  
  const [formData, setFormData] = useState({
    name: "",
    district: "",
    landSize: "",
    landType: "",
    crops: [] as string[],
    experience: "",
    language: language
  });

  const createFarmerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/farmers", data);
      return response.json();
    },
    onSuccess: (farmer) => {
      localStorage.setItem("farmerId", farmer.id);
      localStorage.setItem("farmerProfile", JSON.stringify(farmer));
      toast({
        title: t("onboarding.success.title"),
        description: t("onboarding.success.description"),
      });
      setLocation("/app");
    },
    onError: (error: any) => {
      toast({
        title: t("onboarding.error.title"),
        description: error.message || t("onboarding.error.description"),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.district || !formData.landSize || !formData.landType || !formData.experience) {
      toast({
        title: t("onboarding.validation.title"),
        description: t("onboarding.validation.description"),
        variant: "destructive",
      });
      return;
    }

    createFarmerMutation.mutate(formData);
  };

  const toggleCrop = (crop: string) => {
    setFormData(prev => ({
      ...prev,
      crops: prev.crops.includes(crop)
        ? prev.crops.filter(c => c !== crop)
        : [...prev.crops, crop]
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <Sprout className="text-primary-foreground" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{t("app.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("app.subtitle")}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            data-testid="button-language-toggle"
          >
            <Globe size={16} className="mr-1" />
            {language === "en" ? "EN" : "മലയാളം"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
          >
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </Button>
        </div>
      </header>

      {/* Onboarding Content */}
      <div className="flex-1 p-6 max-w-md mx-auto w-full">
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="w-32 h-32 bg-primary/10 rounded-full mx-auto flex items-center justify-center">
              <Sprout className="text-primary" size={64} />
            </div>
            <h2 className="text-2xl font-bold text-primary">{t("onboarding.welcome.title")}</h2>
            <p className="text-muted-foreground text-lg">{t("onboarding.welcome.subtitle")}</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-semibold mb-2 block">
                {t("onboarding.form.name")}
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t("onboarding.form.namePlaceholder")}
                className="text-lg p-4"
                data-testid="input-name"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold mb-2 block">
                {t("onboarding.form.district")}
              </Label>
              <Select
                value={formData.district}
                onValueChange={(value) => setFormData(prev => ({ ...prev, district: value }))}
              >
                <SelectTrigger className="text-lg p-4" data-testid="select-district">
                  <SelectValue placeholder={t("onboarding.form.districtPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {KERALA_DISTRICTS.map((district) => (
                    <SelectItem key={district.value} value={district.value}>
                      {district.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-semibold mb-2 block">
                {t("onboarding.form.landSize")}
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {["< 1 Acre", "1-5 Acres", "5-10 Acres", "10+ Acres"].map((size) => (
                  <Button
                    key={size}
                    variant={formData.landSize === size ? "default" : "outline"}
                    onClick={() => setFormData(prev => ({ ...prev, landSize: size }))}
                    className="p-4 h-auto flex-col"
                    data-testid={`button-land-size-${size.replace(/[^a-zA-Z0-9]/g, "")}`}
                  >
                    <div className="text-lg font-semibold">{size}</div>
                    <div className="text-sm text-muted-foreground">
                      {size === "< 1 Acre" && t("onboarding.form.landSizes.small")}
                      {size === "1-5 Acres" && t("onboarding.form.landSizes.medium")}
                      {size === "5-10 Acres" && t("onboarding.form.landSizes.large")}
                      {size === "10+ Acres" && t("onboarding.form.landSizes.veryLarge")}
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold mb-2 block">
                {t("onboarding.form.landType")}
              </Label>
              <div className="grid grid-cols-1 gap-3">
                {LAND_TYPES.map((type) => (
                  <Button
                    key={type.value}
                    variant={formData.landType === type.value ? "default" : "outline"}
                    onClick={() => setFormData(prev => ({ ...prev, landType: type.value }))}
                    className="p-4 text-left h-auto justify-start"
                    data-testid={`button-land-type-${type.value}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-primary text-xl">{type.icon}</div>
                      <div>
                        <div className="font-semibold">{type.label}</div>
                        <div className="text-sm text-muted-foreground">{type.description}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold mb-2 block">
                {t("onboarding.form.crops")}
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {CROP_OPTIONS.map((crop) => (
                  <Button
                    key={crop.value}
                    variant={formData.crops.includes(crop.value) ? "default" : "outline"}
                    onClick={() => toggleCrop(crop.value)}
                    className="p-3 h-auto flex-col"
                    data-testid={`button-crop-${crop.value}`}
                  >
                    <div className="text-xl mb-2">{crop.icon}</div>
                    <div className="text-sm font-semibold">{crop.label}</div>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold mb-2 block">
                {t("onboarding.form.experience")}
              </Label>
              <div className="grid grid-cols-1 gap-3">
                {EXPERIENCE_LEVELS.map((level) => (
                  <Button
                    key={level.value}
                    variant={formData.experience === level.value ? "default" : "outline"}
                    onClick={() => setFormData(prev => ({ ...prev, experience: level.value }))}
                    className="p-4 text-left h-auto justify-start"
                    data-testid={`button-experience-${level.value}`}
                  >
                    <div>
                      <div className="font-semibold">{level.label}</div>
                      <div className="text-sm text-muted-foreground">{level.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={createFarmerMutation.isPending}
            className="w-full p-4 text-lg font-semibold"
            data-testid="button-complete-onboarding"
          >
            {createFarmerMutation.isPending 
              ? t("onboarding.form.submitting")
              : t("onboarding.form.submit")
            }
          </Button>
        </div>
      </div>
    </div>
  );
}
