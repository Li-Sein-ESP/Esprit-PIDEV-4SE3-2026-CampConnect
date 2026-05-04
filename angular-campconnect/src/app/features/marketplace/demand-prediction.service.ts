import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DemandPredictionRequest {
  year: number;
  month: number;
  category: string;
  region: string;
  views: number;
  rentals: number;
  purchases: number;
  avg_price: number;
  avg_rating: number;
  is_holiday: number;
  delivery_demand: number;
}

export interface DemandPredictionResponse {
  category: string;
  month: number;
  season: string;
  predicted_demand: number;
  suggested_price: number;
  price_action: string;
}

@Injectable({ providedIn: 'root' })
export class DemandPredictionService {

  private apiUrl = 'http://localhost:8090/api/ml';

  constructor(private http: HttpClient) {}

  predictDemand(payload: DemandPredictionRequest): Observable<DemandPredictionResponse> {
    return this.http.post<DemandPredictionResponse>(
      `${this.apiUrl}/predict-demand`, payload
    );
  }
}
