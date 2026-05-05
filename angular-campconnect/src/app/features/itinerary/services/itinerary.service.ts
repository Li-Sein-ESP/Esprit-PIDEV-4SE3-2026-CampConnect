import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import {
  ItineraryRequest,
  ItineraryResponse,
  SelectedItineraryRequest,
  BudgetCalculationResponse,
} from "../models/itinerary.models";

@Injectable({
  providedIn: "root",
})
export class ItineraryService {
  private aiServiceUrl = "http://localhost:5050"; // URL du service AI Python

  constructor(private http: HttpClient) {}

  /**
   * Récupère les 3 options d'itinéraires recommandées pour une destination
   * @param request - Données de la destination et préférences
   * @returns Observable avec les 3 programmes proposés
   */
  getRecommendedItineraries(
    request: ItineraryRequest,
  ): Observable<ItineraryResponse> {
    return this.http.post<ItineraryResponse>(
      `${this.aiServiceUrl}/recommend-itinerary`,
      request,
    );
  }

  /**
   * Calcule le budget détaillé pour l'itinéraire sélectionné par l'utilisateur
   * @param request - Détails de l'itinéraire sélectionné
   * @returns Observable avec le budget détaillé et les conseils
   */
  calculateBudgetForItinerary(
    request: SelectedItineraryRequest,
  ): Observable<BudgetCalculationResponse> {
    return this.http.post<BudgetCalculationResponse>(
      `${this.aiServiceUrl}/calculate-budget-for-itinerary`,
      request,
    );
  }

  /**
   * Vérifie l'état du service AI
   * @returns Observable avec l'état du service
   */
  healthCheck(): Observable<any> {
    return this.http.get(`${this.aiServiceUrl}/health`);
  }
}
