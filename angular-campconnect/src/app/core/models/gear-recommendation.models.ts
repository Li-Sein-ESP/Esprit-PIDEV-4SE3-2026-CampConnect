export interface GearRecommendationRequest {
  destination: string;
  month: number;
  durationDays: number;
  groupSize: number;
  activity: string;
  experienceLevel: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
}

/** A single category recommendation from the ML model */
export interface GearCategoryRecommendation {
  category: string;
  priority: 'essential' | 'recommended' | 'optional';
}

/** Phase 1 response — ML model tells camper what gear categories they need */
export interface GearCategoryResult {
  destination: string;
  terrain: string;
  season: string;
  recommendations: GearCategoryRecommendation[];
}

export interface GearSuggestion {
  gearId: string;
  gearName: string;
  category: string;
  imageUrl: string;
  pricePerDay: number;
  averageRating: number;
  availableForDates: boolean;
  providerId: string;
}

export interface RecommendedGearGroup {
  priority: 'essential' | 'recommended' | 'optional';
  items: GearSuggestion[];
}

/** Phase 2 response — actual gear items from the marketplace */
export interface GearRecommendationResult {
  destination: string;
  terrain: string;
  season: string;
  groups: RecommendedGearGroup[];
}
