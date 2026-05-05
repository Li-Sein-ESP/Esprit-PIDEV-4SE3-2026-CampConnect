/**
 * Modèles pour les itinéraires et budgets
 * Correspond aux modèles Pydantic du service AI Python
 */

export interface ActivityItem {
  id?: number;
  name: string;
  description?: string;
  price: number;
  duration: number;
  type: string;
}

export interface DayPlanning {
  day: number;
  title: string;
  camping_site: string;
  activities: ActivityItem[];
}

export interface ItineraryProgram {
  program_id: number;
  title: string;
  budget_level: string;
  description: string;
  total_estimated_cost_tnd: number;
  average_per_person_tnd: number;
  budget_status: string;
  breakdown: {
    transport: number;
    hebergement: number;
    nourriture: number;
    activites: number;
  };
  days: DayPlanning[];
  num_people?: number;
}

export interface ItineraryResponse {
  status: string;
  region: string;
  duration_days: number;
  user_limit_tnd?: number;
  programs: ItineraryProgram[];
}

export interface ItineraryRequest {
  region: string;
  season: string;
  duration_days: number;
  budget_level?: string;
  total_budget_tnd?: number;
  num_people?: number;
  distance_km?: number;
  transport_mode?: "bus" | "car" | "van";
}

export interface BudgetBreakdown {
  transport: number;
  hebergement: number;
  nourriture: number;
  activites: number;
  total: number;
}

export interface BudgetCalculationResponse {
  status: string;
  budget_level: string;
  total_budget_tnd: number;
  per_person_tnd: number;
  breakdown: BudgetBreakdown;
  budget_status: string;
  budget_advice: string;
  cancellation_probability?: number;
  risk_level?: string;
  predicted_total_budget_tnd?: number;
  estimated_total_budget_tnd?: number;
  timestamp: string;
}

export interface SelectedItineraryRequest {
  region: string;
  season: string;
  duration_days: number;
  budget_level: string;
  num_people: number;
  distance_km?: number;
  transport_mode?: "bus" | "car" | "van";
  hotel_quality?: number;
  user_proposed_budget_tnd?: number;
  group_size?: number;
  selected_activities?: ActivityItem[];
}
