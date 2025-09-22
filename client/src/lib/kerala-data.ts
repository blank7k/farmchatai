export interface District {
  value: string;
  label: string;
  region: 'north' | 'central' | 'south';
  climate: 'coastal' | 'midland' | 'highland';
  latitude: number;
  longitude: number;
}

export interface LandType {
  value: string;
  label: string;
  description: string;
  icon: string;
  suitableCrops: string[];
}

export interface CropOption {
  value: string;
  label: string;
  icon: string;
  season: 'all' | 'monsoon' | 'post-monsoon' | 'summer';
  landTypes: string[];
}

export interface ExperienceLevel {
  value: string;
  label: string;
  description: string;
}

// Kerala Districts with geographical and climatic information
export const KERALA_DISTRICTS: District[] = [
  // Northern Kerala
  { value: "kasaragod", label: "Kasaragod", region: "north", climate: "coastal", latitude: 12.4996, longitude: 74.9869 },
  { value: "kannur", label: "Kannur", region: "north", climate: "coastal", latitude: 11.8745, longitude: 75.3704 },
  { value: "wayanad", label: "Wayanad", region: "north", climate: "highland", latitude: 11.6854, longitude: 76.1320 },
  { value: "kozhikode", label: "Kozhikode", region: "north", climate: "coastal", latitude: 11.2588, longitude: 75.7804 },
  { value: "malappuram", label: "Malappuram", region: "north", climate: "midland", latitude: 11.0510, longitude: 76.0711 },
  
  // Central Kerala
  { value: "palakkad", label: "Palakkad", region: "central", climate: "midland", latitude: 10.7867, longitude: 76.6548 },
  { value: "thrissur", label: "Thrissur", region: "central", climate: "coastal", latitude: 10.5276, longitude: 76.2144 },
  { value: "ernakulam", label: "Ernakulam", region: "central", climate: "coastal", latitude: 9.9312, longitude: 76.2673 },
  { value: "idukki", label: "Idukki", region: "central", climate: "highland", latitude: 9.9100, longitude: 76.9700 },
  { value: "kottayam", label: "Kottayam", region: "central", climate: "midland", latitude: 9.5916, longitude: 76.5222 },
  
  // Southern Kerala
  { value: "alappuzha", label: "Alappuzha", region: "south", climate: "coastal", latitude: 9.4981, longitude: 76.3388 },
  { value: "pathanamthitta", label: "Pathanamthitta", region: "south", climate: "midland", latitude: 9.2648, longitude: 76.7870 },
  { value: "kollam", label: "Kollam", region: "south", climate: "coastal", latitude: 8.8932, longitude: 76.6141 },
  { value: "thiruvananthapuram", label: "Thiruvananthapuram", region: "south", climate: "coastal", latitude: 8.5241, longitude: 76.9366 }
];

// Land Types in Kerala Agriculture
export const LAND_TYPES: LandType[] = [
  {
    value: "paddy",
    label: "Paddy/Wetland",
    description: "For rice cultivation",
    icon: "💧",
    suitableCrops: ["Rice", "Coconut", "Banana", "Fish", "Duck"]
  },
  {
    value: "upland",
    label: "Upland/Garden",
    description: "For vegetables, fruits",
    icon: "🏔️",
    suitableCrops: ["Vegetables", "Fruits", "Pepper", "Cardamom", "Coffee"]
  },
  {
    value: "plantation",
    label: "Plantation",
    description: "Coconut, rubber, spices",
    icon: "🌴",
    suitableCrops: ["Coconut", "Rubber", "Pepper", "Cardamom", "Coffee", "Cashew"]
  }
];

// Major Crops in Kerala
export const CROP_OPTIONS: CropOption[] = [
  {
    value: "rice",
    label: "Rice",
    icon: "🌾",
    season: "monsoon",
    landTypes: ["paddy"]
  },
  {
    value: "coconut",
    label: "Coconut",
    icon: "🥥",
    season: "all",
    landTypes: ["paddy", "upland", "plantation"]
  },
  {
    value: "pepper",
    label: "Pepper",
    icon: "🌶️",
    season: "post-monsoon",
    landTypes: ["upland", "plantation"]
  },
  {
    value: "cardamom",
    label: "Cardamom",
    icon: "🌿",
    season: "all",
    landTypes: ["upland", "plantation"]
  },
  {
    value: "coffee",
    label: "Coffee",
    icon: "☕",
    season: "all",
    landTypes: ["upland", "plantation"]
  },
  {
    value: "rubber",
    label: "Rubber",
    icon: "🌳",
    season: "all",
    landTypes: ["plantation"]
  },
  {
    value: "banana",
    label: "Banana",
    icon: "🍌",
    season: "all",
    landTypes: ["paddy", "upland"]
  },
  {
    value: "vegetables",
    label: "Vegetables",
    icon: "🥬",
    season: "post-monsoon",
    landTypes: ["paddy", "upland"]
  },
  {
    value: "fruits",
    label: "Fruits",
    icon: "🍎",
    season: "all",
    landTypes: ["upland", "plantation"]
  },
  {
    value: "ginger",
    label: "Ginger",
    icon: "🫚",
    season: "monsoon",
    landTypes: ["upland"]
  },
  {
    value: "turmeric",
    label: "Turmeric",
    icon: "🟡",
    season: "monsoon",
    landTypes: ["upland"]
  },
  {
    value: "cashew",
    label: "Cashew",
    icon: "🥜",
    season: "all",
    landTypes: ["plantation"]
  }
];

// Experience Levels
export const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  {
    value: "new",
    label: "New Farmer",
    description: "Less than 2 years"
  },
  {
    value: "experienced",
    label: "Experienced",
    description: "2-10 years"
  },
  {
    value: "veteran",
    label: "Veteran Farmer",
    description: "10+ years"
  }
];

// Kerala Seasons
export interface Season {
  name: string;
  months: number[];
  description: string;
  mainActivities: string[];
}

export const KERALA_SEASONS: Season[] = [
  {
    name: "Pre-Monsoon/Summer",
    months: [3, 4, 5],
    description: "Hot and dry period, water management critical",
    mainActivities: [
      "Harvest summer crops",
      "Prepare fields for monsoon",
      "Water management",
      "Shade protection for plants"
    ]
  },
  {
    name: "Southwest Monsoon",
    months: [6, 7, 8, 9],
    description: "Heavy rainfall period, main planting season",
    mainActivities: [
      "Plant rice and other monsoon crops",
      "Manage drainage",
      "Pest and disease control",
      "Weed management"
    ]
  },
  {
    name: "Post-Monsoon",
    months: [10, 11],
    description: "Retreating monsoon, ideal for many crops",
    mainActivities: [
      "Plant winter vegetables",
      "Harvest monsoon crops",
      "Field preparation",
      "Irrigation setup"
    ]
  },
  {
    name: "Winter/Northeast Monsoon",
    months: [12, 1, 2],
    description: "Cool and pleasant, good for vegetables and fruits",
    mainActivities: [
      "Vegetable cultivation",
      "Fruit harvesting",
      "Land preparation",
      "Organic matter addition"
    ]
  }
];

// Helper functions
export function getDistrictByValue(value: string): District | undefined {
  return KERALA_DISTRICTS.find(d => d.value === value);
}

export function getCropsByLandType(landType: string): CropOption[] {
  return CROP_OPTIONS.filter(crop => crop.landTypes.includes(landType));
}

export function getCropsBySeason(season: string): CropOption[] {
  return CROP_OPTIONS.filter(crop => crop.season === season || crop.season === 'all');
}

export function getCurrentSeason(): Season {
  const currentMonth = new Date().getMonth() + 1;
  return KERALA_SEASONS.find(season => season.months.includes(currentMonth)) || KERALA_SEASONS[0];
}

export function getDistrictsByRegion(region: 'north' | 'central' | 'south'): District[] {
  return KERALA_DISTRICTS.filter(d => d.region === region);
}

export function getDistrictsByClimate(climate: 'coastal' | 'midland' | 'highland'): District[] {
  return KERALA_DISTRICTS.filter(d => d.climate === climate);
}

// Market prices for common Kerala crops (base reference prices)
export interface CropPriceInfo {
  crop: string;
  basePrice: number; // Base price per kg in INR
  unit: 'kg' | 'quintal' | 'piece';
  seasonal: boolean;
  peakMonths: number[];
  marketCenters: string[];
}

export const KERALA_CROP_PRICES: CropPriceInfo[] = [
  {
    crop: "Rice",
    basePrice: 2800,
    unit: "quintal",
    seasonal: false,
    peakMonths: [4, 5, 11, 12],
    marketCenters: ["Palakkad", "Alappuzha", "Thrissur"]
  },
  {
    crop: "Coconut",
    basePrice: 25,
    unit: "piece",
    seasonal: false,
    peakMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    marketCenters: ["Pollachi", "Kozhikode", "Ernakulam"]
  },
  {
    crop: "Pepper",
    basePrice: 450,
    unit: "kg",
    seasonal: true,
    peakMonths: [12, 1, 2, 3],
    marketCenters: ["Kochi", "Idukki", "Wayanad"]
  },
  {
    crop: "Cardamom",
    basePrice: 1200,
    unit: "kg",
    seasonal: true,
    peakMonths: [10, 11, 12, 1],
    marketCenters: ["Kumily", "Vandiperiyar", "Idukki"]
  },
  {
    crop: "Coffee",
    basePrice: 180,
    unit: "kg",
    seasonal: true,
    peakMonths: [12, 1, 2, 3, 4],
    marketCenters: ["Wayanad", "Idukki", "Nelliampathy"]
  },
  {
    crop: "Rubber",
    basePrice: 160,
    unit: "kg",
    seasonal: false,
    peakMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    marketCenters: ["Kottayam", "Pathanamthitta", "Kollam"]
  },
  {
    crop: "Banana",
    basePrice: 30,
    unit: "kg",
    seasonal: false,
    peakMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    marketCenters: ["Thrissur", "Ernakulam", "Wayanad"]
  }
];

export function getCropPriceInfo(cropName: string): CropPriceInfo | undefined {
  return KERALA_CROP_PRICES.find(
    price => price.crop.toLowerCase() === cropName.toLowerCase()
  );
}

export function isHarvestSeason(cropName: string, month?: number): boolean {
  const currentMonth = month || new Date().getMonth() + 1;
  const cropPrice = getCropPriceInfo(cropName);
  
  if (!cropPrice) return false;
  
  return cropPrice.peakMonths.includes(currentMonth);
}
