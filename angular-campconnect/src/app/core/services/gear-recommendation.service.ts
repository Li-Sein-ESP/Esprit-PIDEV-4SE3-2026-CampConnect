import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  GearRecommendationRequest,
  GearCategoryResult,
  GearRecommendationResult
} from '../models/gear-recommendation.models';

@Injectable({ providedIn: 'root' })
export class GearRecommendationService {
  private readonly base = `${environment.apiUrl}/recommendations`;

  constructor(private http: HttpClient) {}

  /** Phase 1 — ML model tells the camper what gear categories they need */
  getCategories(payload: GearRecommendationRequest): Observable<GearCategoryResult> {
    return this.http.post<GearCategoryResult>(`${this.base}/gear/categories`, payload);
  }

  /** Phase 2 — actual marketplace items matching those categories */
  getMatchingItems(payload: GearRecommendationRequest): Observable<GearRecommendationResult> {
    return this.http.post<GearRecommendationResult>(`${this.base}/gear`, payload);
  }

  checkHealth(): Observable<any> {
    return this.http.get<any>(`${this.base}/health`);
  }
}
