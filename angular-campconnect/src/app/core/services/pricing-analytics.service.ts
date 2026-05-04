import { Injectcore, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PricingTrend {
  id: number;
  factorName: string;
  multiplier: number;
  impactAmount: number;
}

export interface CampsiteAudit {
  id: number;
  campsiteId: string;
  campsiteName: string;
  region: string;
  auditDate: string;
  trends: PricingTrend[];
}

@Injectable({
  providedIn: 'root'
})
export class PricingAnalyticsService {
  private apiUrl = 'http://localhost:8090/api/analytics';

  constructor(private http: HttpClient) {}

  getAllAudits(): Observable<CampsiteAudit[]> {
    return this.http.get<CampsiteAudit[]>(`${this.apiUrl}/all`);
  }

  /**
   * Consumes complex JPQL Join endpoint
   */
  getHighImpactAudits(region: string, threshold: number): Observable<CampsiteAudit[]> {
    return this.http.get<CampsiteAudit[]>(`${this.apiUrl}/high-impact`, {
      params: { region, threshold: threshold.toString() }
    });
  }

  /**
   * Consumes complex Keywords endpoint
   */
  searchAudits(name: string, minMultiplier: number): Observable<CampsiteAudit[]> {
    return this.http.get<CampsiteAudit[]>(`${this.apiUrl}/search`, {
      params: { name, minMultiplier: minMultiplier.toString() }
    });
  }
}
