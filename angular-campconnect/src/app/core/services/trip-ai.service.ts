import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "../../../environments/environment";

export interface TripPredictions {
  predictedBudget: number;
  cancellationProbability: number;
  budgetAdvice: string;
  cancellationAdvice: string;
  tripStyleSummary: string;
}

export interface ItineraryActivity {
  id: number;
  name: string;
  description: string;
  location?: string;
  timeSlot?: string;
  type: string;
  price: number;
  duration: number;
  level: string;
  category: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: ItineraryActivity[];
}

export interface ItineraryOption {
  programId: number;
  title: string;
  budgetLevel: string;
  description: string;
  totalEstimatedCostTnd: number;
  averagePerPersonTnd: number;
  days: ItineraryDay[];
}

export interface ItineraryBudgetPredictRequest {
  programId: number;
  user_proposed_budget_tnd?: number;
  transportMode?: "bus" | "train" | "car" | "van";
  /** Montant saisi : billet/personne (bus) ou location/jour groupe (voiture/van) */
  transportCostTnd?: number;
  /** per_person | per_day_group | flat_group — sinon le serveur utilise le modèle au km */
  transportCostType?: string;
  selectedActivityIds?: number[];
  selectedActivityNames?: string[];
  selectedActivities?: any[];
  includeFood?: boolean;
  includeAccommodation?: boolean;
  numPeople?: number;
}

export interface ItineraryBudgetPrediction {
  status: string;
  budgetLevel: string;
  totalBudgetTnd: number;
  perPersonTnd: number;
  breakdown: {
    transport: number;
    hebergement: number;
    nourriture: number;
    activites: number;
    total: number;
  };
  budgetStatus: string;
  budgetAdvice: string;
  cancellationProbability?: number;
  riskLevel?: string;
  predictedTotalBudgetTnd?: number;
  estimatedTotalBudgetTnd?: number;
  timestamp: string;
}

export interface ItineraryOptionsResponse {
  status: string;
  message?: string;
  region: string;
  season: string;
  durationDays: number;
  numPeople: number;
  programs: ItineraryOption[];
}

@Injectable({
  providedIn: "root",
})
export class TripAiService {
  private apiUrl = `${environment.apiUrl}/trips/ai`;

  constructor(private http: HttpClient) {}

  getTripPredictions(tripId: string): Observable<TripPredictions> {
    return this.http.get<TripPredictions>(`${this.apiUrl}/predict/${tripId}`);
  }

  getCustomPredictions(tripData: any): Observable<TripPredictions> {
    return this.http.post<TripPredictions>(
      `${this.apiUrl}/predict-custom`,
      tripData,
    );
  }

  generateItinerary(tripId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/itinerary/${tripId}`);
  }

  generateThreeItineraryOptions(
    tripId: string,
    reason?: string,
  ): Observable<ItineraryOptionsResponse> {
    const request$ = reason
      ? this.http.post<any>(`${this.apiUrl}/itinerary-options/${tripId}`, { feedback: reason })
      : this.http.get<any>(`${this.apiUrl}/itinerary-options/${tripId}`);
    return request$
      .pipe(
        map((res) => ({
          status: res?.status,
          message: res?.message,
          region: res?.region,
          season: res?.season,
          durationDays: res?.durationDays ?? res?.duration_days,
          numPeople: res?.numPeople ?? res?.num_people,
          programs: (res?.programs || []).map((p: any) => ({
            programId: p?.programId ?? p?.program_id,
            title: p?.title,
            budgetLevel: p?.budgetLevel ?? p?.budget_level,
            description: p?.description,
            totalEstimatedCostTnd:
              p?.totalEstimatedCostTnd ?? p?.total_estimated_cost_tnd ?? 0,
            averagePerPersonTnd:
              p?.averagePerPersonTnd ?? p?.average_per_person_tnd ?? 0,
            days: (p?.days || []).map((d: any) => ({
              day: d?.day ?? 0,
              title: d?.title ?? "",
              activities: (d?.activities || []).map((a: any) => ({
                id: a?.id ?? 0,
                name: a?.name ?? "Activité",
                description: a?.description ?? "",
                location: a?.location ?? a?.destination ?? "",
                timeSlot: a?.timeSlot ?? a?.time_slot ?? "",
                type: a?.type ?? "activity",
                price: a?.price ?? 0,
                duration: a?.duration ?? 0,
                level: a?.level ?? "",
                category: a?.category ?? "",
              })),
            })),
          })),
        })),
      );
  }

  predictSelectedItineraryBudget(
    tripId: string,
    request: ItineraryBudgetPredictRequest,
  ): Observable<ItineraryBudgetPrediction> {
    return this.http
      .post<any>(`${this.apiUrl}/itinerary-options/${tripId}/predict-budget`, request)
      .pipe(
        map((res) => ({
          status: res?.status,
          budgetLevel: res?.budgetLevel ?? res?.budget_level,
          totalBudgetTnd: res?.totalBudgetTnd ?? res?.total_budget_tnd ?? 0,
          perPersonTnd: res?.perPersonTnd ?? res?.per_person_tnd ?? 0,
          breakdown: {
            transport: res?.breakdown?.transport ?? 0,
            hebergement: res?.breakdown?.hebergement ?? 0,
            nourriture: res?.breakdown?.nourriture ?? 0,
            activites: res?.breakdown?.activites ?? 0,
            total: res?.breakdown?.total ?? 0,
          },
          budgetStatus: res?.budgetStatus ?? res?.budget_status ?? "",
          budgetAdvice: res?.budgetAdvice ?? res?.budget_advice ?? "",
          cancellationProbability:
            res?.cancellationProbability ?? res?.cancellation_probability,
          riskLevel: res?.riskLevel ?? res?.risk_level,
          predictedTotalBudgetTnd:
            res?.predictedTotalBudgetTnd ?? res?.predicted_total_budget_tnd,
          estimatedTotalBudgetTnd:
            res?.estimatedTotalBudgetTnd ?? res?.estimated_total_budget_tnd,
          timestamp: res?.timestamp ?? "",
        })),
      );
  }

  confirmItinerarySelection(tripId: string, selectedProgram: ItineraryOption): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/itinerary-options/${tripId}/confirm`, selectedProgram);
  }
}
