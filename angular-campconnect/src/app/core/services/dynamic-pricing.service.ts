import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface PricingFactors {
  basePrice: number;
  occupancyMultiplier: number;
  seasonMultiplier: number;
  weatherMultiplier: number;
  environmentalMultiplier: number;
  occupancyRate: number;
  seasonLabel: string;
  temperatureMax: number;
  precipitation: number;
  activeEnvironmentalRules: number;
  worstSeverity: string;
  dynamicPrice: number;
  savingsOrSurcharge: number;
  priceDirection: 'UP' | 'DOWN' | 'STABLE';
}

@Injectable({ providedIn: 'root' })
export class DynamicPricingService {
  private readonly apiUrl = `${environment.apiUrl}/pricing`;

  constructor(private http: HttpClient) {}

  getPricingFactors(campsiteId: string): Observable<PricingFactors | null> {
    return this.http.get<PricingFactors>(`${this.apiUrl}/${campsiteId}`).pipe(
      catchError(err => {
        console.warn('Dynamic pricing unavailable:', err);
        return of(null);
      })
    );
  }
}
