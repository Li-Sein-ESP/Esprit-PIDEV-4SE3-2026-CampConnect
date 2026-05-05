import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ItineraryProgram } from "../../models/itinerary.models";

@Component({
  selector: "app-itinerary-cards",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h2 class="text-2xl font-bold text-slate-900 mb-6">
        3 Options d'Itinéraires Recommandées
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          *ngFor="let program of itineraries"
          (click)="selectItinerary(program)"
          class="bg-white rounded-lg shadow-lg hover:shadow-2xl transition cursor-pointer overflow-hidden border-t-4"
          [ngClass]="getBorderColor(program.budget_level)"
        >
          <!-- Header -->
          <div class="p-6" [ngClass]="getHeaderBg(program.budget_level)">
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-xl font-bold text-white">
                {{ program.title }}
              </h3>
              <span class="text-2xl">{{ getEmoji(program.budget_level) }}</span>
            </div>
            <p class="text-white/90 text-sm">{{ program.description }}</p>
          </div>

          <!-- Content -->
          <div class="p-6 space-y-4">
            <!-- Price Section -->
            <div
              class="bg-gradient-to-r from-emerald-50 to-slate-50 p-4 rounded-lg border-l-4 border-emerald-500"
            >
              <div class="space-y-2">
                <div class="flex justify-between items-center">
                  <span class="text-sm font-semibold text-slate-700"
                    >💰 Total du Groupe:</span
                  >
                  <p class="text-2xl font-bold text-emerald-600">
                    {{ program.total_estimated_cost_tnd.toFixed(0) }}
                    <span class="text-sm text-slate-600">DT</span>
                  </p>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm font-semibold text-slate-700"
                    >👥 Par Personne:</span
                  >
                  <p class="text-lg font-bold text-slate-900">
                    {{ program.average_per_person_tnd.toFixed(0) }}
                    <span class="text-sm text-slate-600">DT</span>
                  </p>
                </div>
                <div class="flex justify-between items-center text-xs">
                  <span class="text-slate-600">Nombre de personnes:</span>
                  <span class="font-semibold">{{
                    program.num_people || 1
                  }}</span>
                </div>
              </div>
            </div>

            <!-- Budget Status -->
            <div
              class="p-3 rounded-lg text-sm font-semibold"
              [ngClass]="getBudgetStatusClass(program.budget_status)"
            >
              {{ program.budget_status }}
            </div>

            <!-- Breakdown -->
            <div class="space-y-2 text-sm">
              <p class="flex justify-between">
                <span class="text-slate-600">🚗 Transport:</span>
                <span class="font-semibold"
                  >{{ program.breakdown.transport }} DT</span
                >
              </p>
              <p class="flex justify-between">
                <span class="text-slate-600">🏕️ Hébergement:</span>
                <span class="font-semibold"
                  >{{ program.breakdown.hebergement }} DT</span
                >
              </p>
              <p class="flex justify-between">
                <span class="text-slate-600">🍽️ Nourriture:</span>
                <span class="font-semibold"
                  >{{ program.breakdown.nourriture }} DT</span
                >
              </p>
              <p class="flex justify-between">
                <span class="text-slate-600">🎯 Activités:</span>
                <span class="font-semibold"
                  >{{ program.breakdown.activites }} DT</span
                >
              </p>
            </div>

            <!-- Days count -->
            <p class="text-xs text-slate-500 text-center">
              📅 {{ program.days.length }} jours planifiés
            </p>

            <!-- CTA Button -->
            <button
              (click)="selectItinerary(program)"
              class="w-full mt-4 px-4 py-3 font-semibold rounded-lg transition"
              [ngClass]="getButtonClass(program.budget_level)"
            >
              Voir le Détail du Budget
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class ItineraryCardsComponent {
  @Input() itineraries: ItineraryProgram[] = [];
  @Input() budgetLimit?: number;
  @Output() onSelectItinerary = new EventEmitter<ItineraryProgram>();

  selectItinerary(program: ItineraryProgram): void {
    this.onSelectItinerary.emit(program);
  }

  getEmoji(budgetLevel: string): string {
    const level = budgetLevel.toLowerCase();
    if (level.includes("low") || level.includes("économique")) return "🎒";
    if (level.includes("high") || level.includes("premium")) return "💎";
    return "⭐";
  }

  getHeaderBg(budgetLevel: string): string {
    const level = budgetLevel.toLowerCase();
    if (level.includes("low") || level.includes("économique"))
      return "bg-gradient-to-r from-blue-500 to-blue-600";
    if (level.includes("high") || level.includes("premium"))
      return "bg-gradient-to-r from-purple-500 to-purple-600";
    return "bg-gradient-to-r from-emerald-500 to-emerald-600";
  }

  getBorderColor(budgetLevel: string): string {
    const level = budgetLevel.toLowerCase();
    if (level.includes("low") || level.includes("économique"))
      return "border-t-blue-500";
    if (level.includes("high") || level.includes("premium"))
      return "border-t-purple-500";
    return "border-t-emerald-500";
  }

  getButtonClass(budgetLevel: string): string {
    const level = budgetLevel.toLowerCase();
    const baseClass = "text-white font-semibold";
    if (level.includes("low") || level.includes("économique"))
      return `${baseClass} bg-blue-600 hover:bg-blue-700`;
    if (level.includes("high") || level.includes("premium"))
      return `${baseClass} bg-purple-600 hover:bg-purple-700`;
    return `${baseClass} bg-emerald-600 hover:bg-emerald-700`;
  }

  getBudgetStatusClass(status: string): string {
    if (status.includes("Dépasse")) {
      return "bg-red-50 text-red-700 border border-red-200";
    }
    return "bg-green-50 text-green-700 border border-green-200";
  }
}
