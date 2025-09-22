export interface FarmerProfile {
  id: string;
  name: string;
  district: string;
  landSize: string;
  landType: string;
  crops: string[];
  experience: string;
  language: string;
  createdAt: Date;
}

export interface CropCalendar {
  crop: string;
  plantingMonths: number[];
  harvestMonths: number[];
  careInstructions: {
    watering: string;
    fertilizer: string;
    pestControl: string;
  };
}

export interface FarmingTask {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'planting' | 'care' | 'harvest' | 'pest' | 'fertilizer' | 'irrigation' | 'seasonal' | 'planning';
  dueDate: Date;
  isCompleted: boolean;
  crops?: string[];
  landTypes?: string[];
}

// Kerala farming calendar based on traditional practices
export const KERALA_CROP_CALENDAR: CropCalendar[] = [
  {
    crop: "Rice",
    plantingMonths: [6, 7, 11, 12], // June-July (Kharif), Nov-Dec (Rabi)
    harvestMonths: [10, 11, 3, 4], // Oct-Nov, Mar-Apr
    careInstructions: {
      watering: "Maintain 2-3 cm water level during growing season",
      fertilizer: "Organic compost before planting, urea during tillering",
      pestControl: "Neem oil spray, encourage beneficial insects"
    }
  },
  {
    crop: "Coconut",
    plantingMonths: [4, 5, 9, 10], // April-May, Sept-Oct
    harvestMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // Year-round
    careInstructions: {
      watering: "Deep watering during dry months, mulching around base",
      fertilizer: "Organic manure twice yearly, potash for better yield",
      pestControl: "Regular inspection for rhinoceros beetle, red palm weevil"
    }
  },
  {
    crop: "Pepper",
    plantingMonths: [5, 6], // May-June
    harvestMonths: [12, 1, 2], // Dec-Feb
    careInstructions: {
      watering: "Regular watering, avoid waterlogging",
      fertilizer: "Organic compost, bone meal for flowering",
      pestControl: "Bordeaux mixture for fungal diseases"
    }
  },
  {
    crop: "Vegetables",
    plantingMonths: [10, 11, 12, 1], // Oct-Jan (winter vegetables)
    harvestMonths: [12, 1, 2, 3], // Dec-Mar
    careInstructions: {
      watering: "Morning watering, drip irrigation preferred",
      fertilizer: "Compost before planting, liquid fertilizer bi-weekly",
      pestControl: "Companion planting, organic sprays"
    }
  },
  {
    crop: "Banana",
    plantingMonths: [4, 5, 9, 10], // April-May, Sept-Oct
    harvestMonths: [1, 2, 3, 7, 8, 9, 10, 11, 12], // Varies by variety
    careInstructions: {
      watering: "Consistent moisture, mulching recommended",
      fertilizer: "High potash fertilizer, organic matter",
      pestControl: "Remove diseased leaves, proper spacing"
    }
  }
];

export function getFarmerProfile(): FarmerProfile | null {
  const stored = localStorage.getItem("farmerProfile");
  if (!stored) return null;
  
  try {
    const profile = JSON.parse(stored);
    return {
      ...profile,
      createdAt: new Date(profile.createdAt)
    };
  } catch (error) {
    console.error("Error parsing farmer profile:", error);
    return null;
  }
}

export function saveFarmerProfile(profile: FarmerProfile): void {
  localStorage.setItem("farmerProfile", JSON.stringify(profile));
  localStorage.setItem("farmerId", profile.id);
}

export function getCurrentSeasonTasks(
  crops: string[], 
  landType: string,
  district: string
): FarmingTask[] {
  const currentMonth = new Date().getMonth() + 1;
  const tasks: FarmingTask[] = [];

  // Generate tasks based on crop calendar
  crops.forEach(crop => {
    const cropInfo = KERALA_CROP_CALENDAR.find(c => c.crop.toLowerCase() === crop.toLowerCase());
    if (!cropInfo) return;

    const taskId = `${crop}-${currentMonth}-${Date.now()}`;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // Default to 7 days from now

    if (cropInfo.plantingMonths.includes(currentMonth)) {
      tasks.push({
        id: `plant-${taskId}`,
        title: `Plant ${crop}`,
        description: `Optimal time to plant ${crop}. ${cropInfo.careInstructions.watering}`,
        priority: 'high',
        category: 'planting',
        dueDate,
        isCompleted: false,
        crops: [crop],
        landTypes: [landType]
      });
    }

    if (cropInfo.harvestMonths.includes(currentMonth)) {
      tasks.push({
        id: `harvest-${taskId}`,
        title: `Harvest ${crop}`,
        description: `Time to harvest ${crop}. Check for ripeness and weather conditions.`,
        priority: 'high', 
        category: 'harvest',
        dueDate,
        isCompleted: false,
        crops: [crop],
        landTypes: [landType]
      });
    }
  });

  // Add seasonal maintenance tasks
  const seasonalTasks = getSeasonalMaintenanceTasks(currentMonth, landType, district);
  tasks.push(...seasonalTasks);

  return tasks.slice(0, 5); // Return top 5 tasks
}

export function getSeasonalMaintenanceTasks(
  month: number,
  landType: string,
  district: string
): FarmingTask[] {
  const tasks: FarmingTask[] = [];
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14); // 2 weeks from now

  // Monsoon preparation (May-June)
  if (month >= 5 && month <= 6) {
    tasks.push({
      id: `monsoon-prep-${Date.now()}`,
      title: "Prepare for Monsoon",
      description: "Clean drainage channels, secure plant supports, check irrigation systems",
      priority: 'high',
      category: 'seasonal',
      dueDate,
      isCompleted: false,
      landTypes: [landType]
    });
  }

  // Post-monsoon care (October-November) 
  if (month >= 10 && month <= 11) {
    tasks.push({
      id: `post-monsoon-${Date.now()}`,
      title: "Post-Monsoon Field Care",
      description: "Check for waterlogging, fungal diseases, and damaged plants",
      priority: 'medium',
      category: 'care',
      dueDate,
      isCompleted: false,
      landTypes: [landType]
    });
  }

  // Summer preparation (February-March)
  if (month >= 2 && month <= 3) {
    tasks.push({
      id: `summer-prep-${Date.now()}`,
      title: "Summer Water Management",
      description: "Set up shade nets, check irrigation, mulch around plants",
      priority: 'high',
      category: 'irrigation',
      dueDate,
      isCompleted: false,
      landTypes: [landType]
    });
  }

  return tasks;
}

export function getCropRecommendations(
  landType: string,
  district: string,
  experience: string
): { crop: string; reason: string; difficulty: 'easy' | 'medium' | 'hard' }[] {
  const recommendations: { crop: string; reason: string; difficulty: 'easy' | 'medium' | 'hard' }[] = [];

  const difficultyForExperience = (exp: string) => {
    if (exp === "New Farmer") return 'easy';
    if (exp === "Experienced") return 'medium';
    return 'hard';
  };

  // Land type specific recommendations
  if (landType === "paddy") {
    recommendations.push(
      { crop: "Rice", reason: "Traditional crop, well-suited for wetland cultivation", difficulty: 'medium' },
      { crop: "Coconut", reason: "Long-term investment with steady income", difficulty: 'easy' },
      { crop: "Banana", reason: "Quick returns, grows well in Kerala climate", difficulty: 'easy' }
    );
  } else if (landType === "upland") {
    recommendations.push(
      { crop: "Vegetables", reason: "High demand, good returns with proper care", difficulty: difficultyForExperience(experience) },
      { crop: "Pepper", reason: "High-value spice crop, traditional in Kerala", difficulty: 'medium' },
      { crop: "Fruits", reason: "Diversified income, local market demand", difficulty: 'medium' }
    );
  } else if (landType === "plantation") {
    recommendations.push(
      { crop: "Coconut", reason: "Main plantation crop in Kerala", difficulty: 'easy' },
      { crop: "Rubber", reason: "Good long-term income in suitable areas", difficulty: 'hard' },
      { crop: "Coffee", reason: "Premium crop for hill regions", difficulty: 'medium' }
    );
  }

  return recommendations.slice(0, 3);
}

export function validateFarmerData(data: Partial<FarmerProfile>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long");
  }

  if (!data.district) {
    errors.push("District is required");
  }

  if (!data.landSize) {
    errors.push("Land size is required");
  }

  if (!data.landType) {
    errors.push("Land type is required");
  }

  if (!data.experience) {
    errors.push("Experience level is required");
  }

  if (!data.crops || data.crops.length === 0) {
    errors.push("At least one crop must be selected");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
