import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  BudgetCalculationResponse,
  ItineraryProgram,
} from "../../models/itinerary.models";

@Component({
  selector: "app-budget-detail",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Back button -->
      <button
        (click)="goBack()"
        class="px-4 py-2 text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-2"
      >
        ← Retour aux options
      </button>

      <!-- Main card -->
      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <!-- Header -->
        <div
          class="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-8"
        >
          <h2 class="text-3xl font-bold mb-2">
            Détails du Budget - {{ selectedProgram.title }}
          </h2>
          <p class="text-emerald-100">
            Calcul détaillé pour votre itinéraire sélectionné
          </p>
        </div>

        <!-- Content -->
        <div class="p-8 space-y-8">
          <!-- Total Budget Summary -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Total -->
            <div
              class="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border-l-4 border-emerald-500"
            >
              <p class="text-slate-600 text-sm font-semibold mb-1">
                BUDGET TOTAL
              </p>
              <p class="text-3xl font-bold text-slate-900">
                {{ budgetData.total_budget_tnd.toFixed(0) }}
                <span class="text-lg text-slate-600">DT</span>
              </p>
            </div>

            <!-- Per person -->
            <div
              class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-l-4 border-blue-500"
            >
              <p class="text-blue-600 text-sm font-semibold mb-1">
                PAR PERSONNE
              </p>
              <p class="text-3xl font-bold text-blue-900">
                {{ budgetData.per_person_tnd.toFixed(0) }}
                <span class="text-lg text-blue-600">DT</span>
              </p>
            </div>

            <!-- Budget Status -->
            <div
              class="rounded-lg p-6 border-l-4"
              [ngClass]="getBudgetStatusClass()"
            >
              <p
                class="text-sm font-semibold mb-1"
                [ngClass]="getBudgetStatusTextClass()"
              >
                STATUS
              </p>
              <p
                class="text-xl font-bold"
                [ngClass]="getBudgetStatusTextClass()"
              >
                {{ budgetData.budget_status }}
              </p>
            </div>
          </div>

          <!-- Budget Breakdown Chart -->
          <div class="space-y-4">
            <h3 class="text-xl font-bold text-slate-900">Décomposition</h3>

            <!-- Transport -->
            <div class="space-y-1">
              <div class="flex justify-between items-center mb-1">
                <span class="font-semibold text-slate-700"> 🚗 Transport </span>
                <span class="text-lg font-bold text-slate-900">
                  {{ budgetData.breakdown.transport.toFixed(0) }} DT
                </span>
              </div>
              <div class="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  class="bg-blue-500 h-full transition-all"
                  [style.width]="
                    getPercentage(budgetData.breakdown.transport) + '%'
                  "
                ></div>
              </div>
              <p class="text-xs text-slate-500">
                {{ getPercentage(budgetData.breakdown.transport).toFixed(0) }}%
                du budget
              </p>
            </div>

            <!-- Accommodation -->
            <div class="space-y-1">
              <div class="flex justify-between items-center mb-1">
                <span class="font-semibold text-slate-700">
                  🏕️ Hébergement
                </span>
                <span class="text-lg font-bold text-slate-900">
                  {{ budgetData.breakdown.hebergement.toFixed(0) }} DT
                </span>
              </div>
              <div class="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  class="bg-orange-500 h-full transition-all"
                  [style.width]="
                    getPercentage(budgetData.breakdown.hebergement) + '%'
                  "
                ></div>
              </div>
              <p class="text-xs text-slate-500">
                {{
                  getPercentage(budgetData.breakdown.hebergement).toFixed(0)
                }}% du budget
              </p>
            </div>

            <!-- Food -->
            <div class="space-y-1">
              <div class="flex justify-between items-center mb-1">
                <span class="font-semibold text-slate-700">
                  🍽️ Nourriture
                </span>
                <span class="text-lg font-bold text-slate-900">
                  {{ budgetData.breakdown.nourriture.toFixed(0) }} DT
                </span>
              </div>
              <div class="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  class="bg-green-500 h-full transition-all"
                  [style.width]="
                    getPercentage(budgetData.breakdown.nourriture) + '%'
                  "
                ></div>
              </div>
              <p class="text-xs text-slate-500">
                {{ getPercentage(budgetData.breakdown.nourriture).toFixed(0) }}%
                du budget
              </p>
            </div>

            <!-- Activities -->
            <div class="space-y-1">
              <div class="flex justify-between items-center mb-1">
                <span class="font-semibold text-slate-700"> 🎯 Activités </span>
                <span class="text-lg font-bold text-slate-900">
                  {{ budgetData.breakdown.activites.toFixed(0) }} DT
                </span>
              </div>
              <div class="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  class="bg-purple-500 h-full transition-all"
                  [style.width]="
                    getPercentage(budgetData.breakdown.activites) + '%'
                  "
                ></div>
              </div>
              <p class="text-xs text-slate-500">
                {{ getPercentage(budgetData.breakdown.activites).toFixed(0) }}%
                du budget
              </p>
            </div>
          </div>

          <!-- Budget Advice -->
          <div class="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
            <p class="text-blue-900 font-semibold flex items-start gap-3">
              <span class="text-xl">💡</span>
              <span>{{ budgetData.budget_advice }}</span>
            </p>
          </div>

          <!-- Risk Information -->
          <div *ngIf="budgetData.risk_level" class="space-y-4">
            <h3 class="text-xl font-bold text-slate-900">Analyse du Risque</h3>
            <div
              class="p-6 rounded-lg border-l-4"
              [ngClass]="getRiskStatusClass()"
            >
              <div class="flex justify-between items-center">
                <div>
                  <p
                    class="text-sm font-semibold"
                    [ngClass]="getRiskTextClass()"
                  >
                    NIVEAU DE RISQUE
                  </p>
                  <p
                    class="text-xl font-bold mt-1"
                    [ngClass]="getRiskTextClass()"
                  >
                    {{ budgetData.risk_level }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-sm text-slate-600">Probabilité d'annulation</p>
                  <p class="text-2xl font-bold text-slate-900">
                    {{
                      (
                        (budgetData.cancellation_probability || 0) * 100
                      ).toFixed(0)
                    }}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-4 pt-6">
            <button
              (click)="goBack()"
              class="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:border-slate-400 transition"
            >
              Voir d'autres options
            </button>
            <button
              class="flex-1 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition"
            >
              Réserver ce Voyage
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class BudgetDetailComponent {
  @Input() budgetData!: BudgetCalculationResponse;
  @Input() selectedProgram!: ItineraryProgram;
  @Output() onBack = new EventEmitter<void>();

  goBack(): void {
    this.onBack.emit();
  }

  getPercentage(value: number): number {
    return (value / this.budgetData.total_budget_tnd) * 100;
  }

  getBudgetStatusClass(): string {
    if (this.budgetData.budget_status.includes("Dépasse")) {
      return "bg-red-50 border-l-red-500";
    }
    return "bg-green-50 border-l-green-500";
  }

  getBudgetStatusTextClass(): string {
    if (this.budgetData.budget_status.includes("Dépasse")) {
      return "text-red-700";
    }
    return "text-green-700";
  }

  getRiskStatusClass(): string {
    const risk = this.budgetData.risk_level?.toLowerCase() || "";
    if (risk.includes("élevé")) return "bg-red-50 border-l-red-500";
    if (risk.includes("modéré")) return "bg-orange-50 border-l-orange-500";
    return "bg-green-50 border-l-green-500";
  }

  getRiskTextClass(): string {
    const risk = this.budgetData.risk_level?.toLowerCase() || "";
    if (risk.includes("élevé")) return "text-red-700";
    if (risk.includes("modéré")) return "text-orange-700";
    return "text-green-700";
  }
}
