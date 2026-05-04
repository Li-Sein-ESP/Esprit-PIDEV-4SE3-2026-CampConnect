import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface AtRiskUserDto {
  customerId: string;
  churnScore: number;
  riskLevel: 'High' | 'Medium' | 'Low' | string;
  action: string;
  lastActionDate: string;
}

export interface TriggerActionsResponseDto {
  queued: number;
  skippedAntiSpam: number;
  runDate: string;
}

export interface CampGuardKpiDto {
  high: number;
  medium: number;
  low: number;
  recall: number;
  precision: number;
  reengagementRate: number;
  churnBefore: number;
  churnAfter: number;
}

@Injectable({
  providedIn: 'root'
})
export class CampGuardService {
  private readonly apiUrl = `${environment.apiUrl}/churn`;

  constructor(private http: HttpClient) {}

  getAtRiskUsers(level?: string, search?: string): Observable<AtRiskUserDto[]> {
    let params = new HttpParams();
    if (level && level.trim().length > 0) {
      params = params.set('level', level.trim());
    }
    if (search && search.trim().length > 0) {
      params = params.set('search', search.trim());
    }
    return this.http.get<AtRiskUserDto[]>(`${this.apiUrl}/at-risk-users`, { params });
  }

  triggerActions(): Observable<TriggerActionsResponseDto> {
    return this.http.post<TriggerActionsResponseDto>(`${this.apiUrl}/trigger-actions`, {});
  }

  getKpis(): Observable<CampGuardKpiDto> {
    return this.http.get<CampGuardKpiDto>(`${this.apiUrl}/kpis`);
  }
}
