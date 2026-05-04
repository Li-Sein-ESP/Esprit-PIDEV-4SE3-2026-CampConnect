import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DemandForecastService, DemandForecastResponse } from './demand-forecast.service';

@Component({
  selector: 'app-demand-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 bg-gray-50 min-h-screen">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Tableau de Bord — Prévision de Demande</h1>
          <p class="text-gray-500 mt-1" *ngIf="forecastData">
            Saison : <span class="font-semibold">{{ forecastData.analysis_season }}</span> | 
            Mois analysé : <span class="font-semibold">{{ getMonthName(selectedMonth) }}</span>
          </p>
        </div>
        
        <div class="flex items-center gap-3">
          <select 
            [(ngModel)]="selectedMonth" 
            (change)="refreshForecast()"
            class="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm">
            <option [value]="1">Janvier</option>
            <option [value]="2">Février</option>
            <option [value]="3">Mars</option>
            <option [value]="4">Avril</option>
            <option [value]="5">Mai</option>
            <option [value]="6">Juin</option>
            <option [value]="7">Juillet</option>
            <option [value]="8">Août</option>
            <option [value]="9">Septembre</option>
            <option [value]="10">Octobre</option>
            <option [value]="11">Novembre</option>
            <option [value]="12">Décembre</option>
          </select>

          <button 
            (click)="refreshForecast()" 
            [disabled]="loading"
            class="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 transition-colors">
            <svg *ngIf="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg *ngIf="!loading" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            Rafraîchir
          </button>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="errorMessage" class="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded shadow-sm">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Erreur de chargement</h3>
            <div class="mt-2 text-sm text-red-700">
              <p>{{ errorMessage }}</p>
            </div>
            <div class="mt-4">
              <button (click)="refreshForecast()" type="button" class="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1.5 rounded-md text-sm font-medium focus:outline-none transition-colors">
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary Cards -->
      <div *ngIf="forecastData && !loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center">
          <div class="rounded-full bg-blue-100 p-3 mr-4">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Campings</p>
            <p class="text-3xl font-bold text-gray-900">{{ forecastData.total_campsites_analyzed }}</p>
          </div>
        </div>
        
        <!-- High Demand -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center">
          <div class="rounded-full bg-red-100 p-3 mr-4">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500 uppercase tracking-wider">Forte Demande</p>
            <p class="text-3xl font-bold text-gray-900">{{ forecastData.high_demand_count }}</p>
          </div>
        </div>

        <!-- Medium Demand -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center">
          <div class="rounded-full bg-orange-100 p-3 mr-4">
            <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14"></path></svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500 uppercase tracking-wider">Demande Modérée</p>
            <p class="text-3xl font-bold text-gray-900">{{ forecastData.medium_demand_count }}</p>
          </div>
        </div>

        <!-- Low Demand -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center">
          <div class="rounded-full bg-green-100 p-3 mr-4">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500 uppercase tracking-wider">Faible Demande</p>
            <p class="text-3xl font-bold text-gray-900">{{ forecastData.low_demand_count }}</p>
          </div>
        </div>
      </div>

      <!-- Skeletons (Loading) -->
      <div *ngIf="loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div *ngFor="let i of [1,2,3]" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
          <div class="flex justify-between items-start mb-6">
            <div class="space-y-3 flex-1">
              <div class="h-5 bg-gray-200 rounded w-2/3"></div>
              <div class="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
            <div class="h-6 bg-gray-200 rounded w-16"></div>
          </div>
          <div class="h-2 bg-gray-200 rounded w-full mb-6"></div>
          <div class="space-y-4">
            <div class="h-12 bg-gray-100 rounded"></div>
            <div class="h-12 bg-gray-100 rounded"></div>
            <div class="h-12 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && forecastData?.forecasts?.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-1">Aucune donnée de prévision disponible</h3>
        <p class="text-gray-500">Ajoutez des campings pour voir les prévisions.</p>
      </div>

      <!-- Forecast Grid -->
      <div *ngIf="!loading && forecastData && forecastData.forecasts.length > 0" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div *ngFor="let forecast of forecastData.forecasts" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
          <!-- Card Header -->
          <div class="p-6 border-b border-gray-100">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h2 class="text-xl font-bold text-gray-900">{{ forecast.campsite_name }}</h2>
                <div class="flex items-center mt-1 text-sm text-gray-500">
                  <svg class="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  {{ forecast.region }}
                </div>
              </div>
              <span [ngClass]="getBadgeClass(forecast.demand_level)" class="px-3 py-1 text-xs font-semibold rounded-full border">
                {{ getLevelLabel(forecast.demand_level) }}
              </span>
            </div>

            <!-- Progress Bar -->
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="font-medium text-gray-700">Probabilité ({{ forecast.demand_level }})</span>
                <span class="font-bold text-gray-900">{{ (forecast.demand_score * 100) | number:'1.0-0' }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div [ngClass]="getProgressBarClass(forecast.demand_level)" class="h-2 rounded-full" [style.width.%]="forecast.demand_score * 100"></div>
              </div>
            </div>
          </div>

          <!-- Recommendations -->
          <div class="p-0">
            <div class="divide-y divide-gray-100">
              
              <!-- Pricing -->
              <div class="p-4 flex gap-3 items-start border-l-4 border-l-green-400 bg-green-50/30">
                <div class="text-xl mt-0.5">💰</div>
                <div>
                  <h4 class="text-sm font-bold text-gray-900 mb-1">Recommandation Tarifaire</h4>
                  <p class="text-sm text-gray-700 leading-relaxed">{{ forecast.pricing_recommendation }}</p>
                </div>
              </div>

              <!-- Weather -->
              <div class="p-4 flex gap-3 items-start border-l-4 border-l-blue-400 bg-blue-50/30">
                <div class="text-xl mt-0.5">🌤️</div>
                <div>
                  <h4 class="text-sm font-bold text-gray-900 mb-1">Météo & Préparation</h4>
                  <p class="text-sm text-gray-700 leading-relaxed">{{ forecast.weather_advice }}</p>
                </div>
              </div>

              <!-- Staffing -->
              <div class="p-4 flex gap-3 items-start border-l-4 border-l-purple-400 bg-purple-50/30">
                <div class="text-xl mt-0.5">👥</div>
                <div>
                  <h4 class="text-sm font-bold text-gray-900 mb-1">Personnel & Logistique</h4>
                  <p class="text-sm text-gray-700 leading-relaxed">{{ forecast.staffing_recommendation }}</p>
                </div>
              </div>

              <!-- Activities -->
              <div class="p-4 flex gap-3 items-start border-l-4 border-l-orange-400 bg-orange-50/30">
                <div class="text-xl mt-0.5">🏕️</div>
                <div class="w-full">
                  <h4 class="text-sm font-bold text-gray-900 mb-2">Activités Suggérées</h4>
                  <div class="flex flex-wrap gap-2">
                    <span *ngFor="let act of forecast.activity_suggestions" class="bg-white border border-gray-200 text-gray-700 text-xs px-2.5 py-1 rounded-full shadow-sm">
                      {{ act }}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DemandDashboardComponent implements OnInit {
  forecastData: DemandForecastResponse | null = null;
  loading = false;
  errorMessage: string | null = null;
  selectedMonth = new Date().getMonth() + 1;

  constructor(private demandForecastService: DemandForecastService) {}

  ngOnInit() {
    this.loadForecast(this.selectedMonth);
  }

  refreshForecast() {
    this.loadForecast(this.selectedMonth);
  }

  loadForecast(month: number) {
    this.loading = true;
    this.errorMessage = null;
    this.forecastData = null;

    this.demandForecastService.getForecast(month).subscribe({
      next: (res) => {
        // Sort HIGH -> MEDIUM -> LOW
        if (res && res.forecasts) {
          const levelOrder = { 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
          res.forecasts.sort((a, b) => {
            const valA = levelOrder[a.demand_level] || 99;
            const valB = levelOrder[b.demand_level] || 99;
            return valA - valB;
          });
        }
        this.forecastData = res;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || err.message || 'Une erreur est survenue lors de la communication avec le service IA.';
        this.loading = false;
      }
    });
  }

  getMonthName(month: number): string {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return months[month - 1] || '';
  }

  getBadgeClass(level: string): string {
    if (level === 'HIGH') return 'bg-red-100 text-red-800 border-red-200';
    if (level === 'MEDIUM') return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-green-100 text-green-800 border-green-200';
  }

  getProgressBarClass(level: string): string {
    if (level === 'HIGH') return 'bg-red-500';
    if (level === 'MEDIUM') return 'bg-orange-500';
    return 'bg-green-500';
  }

  getLevelLabel(level: string): string {
    if (level === 'HIGH') return 'Forte Demande';
    if (level === 'MEDIUM') return 'Demande Modérée';
    if (level === 'LOW') return 'Faible Demande';
    return level;
  }
}
