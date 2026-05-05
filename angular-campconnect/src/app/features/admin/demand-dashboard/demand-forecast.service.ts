import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CampsiteForecast {
  campsite_id: string;
  campsite_name: string;
  region: string;
  season: string;
  target_month: number;
  demand_level: 'HIGH' | 'MEDIUM' | 'LOW';
  demand_score: number;
  probabilities: { HIGH: number; MEDIUM: number; LOW: number };
  pricing_recommendation: string;
  weather_advice: string;
  staffing_recommendation: string;
  activity_suggestions: string[];
}

export interface DemandForecastResponse {
  forecasts: CampsiteForecast[];
  analysis_month: number;
  analysis_season: string;
  total_campsites_analyzed: number;
  high_demand_count: number;
  medium_demand_count: number;
  low_demand_count: number;
}

@Injectable({ providedIn: 'root' })
export class DemandForecastService {
  private apiUrl = 'http://localhost:8090/api/ml';
  constructor(private http: HttpClient) {}

  getForecast(month?: number): Observable<DemandForecastResponse> {
    const params = month ? `?month=${month}` : '';
    return this.http.get<DemandForecastResponse>(
      `${this.apiUrl}/demand-forecast${params}`
    );
  }
}
