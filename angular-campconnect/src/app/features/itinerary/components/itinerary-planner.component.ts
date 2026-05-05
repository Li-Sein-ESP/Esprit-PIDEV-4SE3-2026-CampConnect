import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { ItineraryService } from "../services/itinerary.service";
import {
  ItineraryRequest,
  ItineraryResponse,
  ItineraryProgram,
  SelectedItineraryRequest,
  BudgetCalculationResponse,
} from "../models/itinerary.models";
import { BudgetDetailComponent } from "./budget-detail/budget-detail.component";
import { ItineraryCardsComponent } from "./itinerary-cards/itinerary-cards.component";

@Component({
  selector: "app-itinerary-planner",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    ItineraryCardsComponent,
    BudgetDetailComponent,
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div class="max-w-6xl mx-auto space-y-8">
        <!-- Header -->
        <div class="text-center space-y-2">
          <h1 class="text-4xl font-bold text-slate-900">
            Planificateur d'Itinéraires
          </h1>
          <p class="text-lg text-slate-600">
            Découvrez 3 options d'itinéraires et calculez votre budget
          </p>
        </div>

        <!-- Formulaire de recherche -->
        <div
          class="bg-white rounded-lg shadow-md p-6 border-l-4 border-emerald-500"
        >
          <h2 class="text-xl font-semibold mb-4 text-slate-900">
            Votre Destination
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">
                Destination
              </label>
              <input
                type="text"
                [(ngModel)]="searchParams.region"
                placeholder="Ex: Bizerte, Hammamet"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">
                Saison
              </label>
              <select
                [(ngModel)]="searchParams.season"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
              >
                <option value="Printemps">Printemps</option>
                <option value="Été">Été</option>
                <option value="Automne">Automne</option>
                <option value="Hiver">Hiver</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">
                Durée (jours)
              </label>
              <input
                type="number"
                [(ngModel)]="searchParams.duration_days"
                min="1"
                max="30"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">
                Personnes
              </label>
              <input
                type="number"
                [(ngModel)]="searchParams.num_people"
                min="1"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">
                Transport
              </label>
              <select
                [(ngModel)]="searchParams.transport_mode"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
              >
                <option value="bus">Bus</option>
                <option value="car">Voiture</option>
                <option value="van">Van / Minibus</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">
                &nbsp;
              </label>
              <button
                (click)="searchItineraries()"
                [disabled]="isLoading()"
                class="w-full px-6 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                {{ isLoading() ? "Recherche..." : "Chercher" }}
              </button>
            </div>
          </div>

          <!-- Budget limit optional -->
          <div class="mt-4">
            <label class="flex items-center">
              <input
                type="checkbox"
                [(ngModel)]="hasBudgetLimit"
                class="rounded border-slate-300"
              />
              <span class="ml-2 text-slate-700">J'ai un budget limite</span>
            </label>
            <div *ngIf="hasBudgetLimit" class="mt-3">
              <label class="block text-sm font-medium text-slate-700 mb-2">
                Budget maximum (TND)
              </label>
              <input
                type="number"
                [(ngModel)]="searchParams.total_budget_tnd"
                placeholder="Ex: 500"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <!-- Loading state -->
        <div *ngIf="isLoading()" class="flex justify-center">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"
          ></div>
        </div>

        <!-- Error message -->
        <div
          *ngIf="errorMessage()"
          class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700"
        >
          {{ errorMessage() }}
        </div>

        <!-- Success message -->
        <div
          *ngIf="itineraryResponse() && !isLoading() && !selectedBudget()"
          class="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700"
        >
          ✅ Recherche complétée!
          <span *ngIf="itineraryResponse()!.programs.length > 0">
            Découvrez les {{ itineraryResponse()!.programs.length }} options
            d'itinéraires pour
            <strong>{{ itineraryResponse()!.region }}</strong>
            ({{ itineraryResponse()!.duration_days }} jours)
          </span>
        </div>

        <!-- Destinations info -->
        <div
          class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700 text-sm"
        >
          <strong>ℹ️ Destinations disponibles:</strong>
          <p class="mt-2">
            Tunis, Bizerte, Hammamet, Nabeul, Tozeur, Kebili, Djerba, Gabès,
            Beja, Jendouba, Zaghouan, Kairouan, Siliana
          </p>
          <p class="mt-2 text-xs text-blue-600">
            Assurez-vous de bien épeler votre destination!
          </p>
        </div>

        <!-- Itineraries display -->
        <div *ngIf="itineraryResponse() && !isLoading()">
          <app-itinerary-cards
            [itineraries]="itineraryResponse()!.programs"
            [budgetLimit]="searchParams.total_budget_tnd"
            (onSelectItinerary)="onSelectItinerary($event)"
          ></app-itinerary-cards>
        </div>

        <!-- Budget detail after selection -->
        <div *ngIf="selectedBudget()">
          <app-budget-detail
            [budgetData]="selectedBudget()!"
            [selectedProgram]="selectedProgram()!"
            (onBack)="onBackToItineraries()"
          ></app-budget-detail>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class ItineraryPlannerComponent implements OnInit {
  itineraryService = new ItineraryService(null as any); // Will be injected

  searchParams: ItineraryRequest = {
    region: "",
    season: "Été",
    duration_days: 3,
    num_people: 1,
    distance_km: 100,
    transport_mode: "car",
  };

  hasBudgetLimit = false;

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  itineraryResponse = signal<ItineraryResponse | null>(null);
  selectedBudget = signal<BudgetCalculationResponse | null>(null);
  selectedProgram = signal<ItineraryProgram | null>(null);

  constructor(itineraryService: ItineraryService) {
    this.itineraryService = itineraryService;
  }

  ngOnInit(): void {
    this.itineraryService.healthCheck().subscribe({
      next: (health) => console.log("AI Service Health:", health),
      error: (err) => console.error("AI Service unavailable:", err),
    });
  }

  searchItineraries(): void {
    if (!this.searchParams.region.trim()) {
      this.errorMessage.set("Veuillez entrer une destination");
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.selectedBudget.set(null);

    this.itineraryService
      .getRecommendedItineraries(this.searchParams)
      .subscribe({
        next: (response) => {
          this.itineraryResponse.set(response);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error("Error fetching itineraries:", error);
          this.errorMessage.set(
            "Erreur lors de la recherche. Veuillez vérifier vos données.",
          );
          this.isLoading.set(false);
        },
      });
  }

  onSelectItinerary(program: ItineraryProgram): void {
    this.selectedProgram.set(program);
    this.isLoading.set(true);

    const selectedActivities = program.days.flatMap((day) =>
      day.activities.map((activity) => ({
        id: activity.id,
        name: activity.name,
        description: activity.description,
        price: activity.price,
        duration: activity.duration,
        type: activity.type || "activity",
      })),
    );

    const budgetRequest: SelectedItineraryRequest = {
      region: this.searchParams.region,
      season: this.searchParams.season,
      duration_days: this.searchParams.duration_days,
      budget_level: program.budget_level,
      num_people: this.searchParams.num_people || 1,
      distance_km: this.searchParams.distance_km || 100,
      transport_mode: this.searchParams.transport_mode || "car",
      user_proposed_budget_tnd: this.searchParams.total_budget_tnd,
      selected_activities: selectedActivities,
    };

    this.itineraryService.calculateBudgetForItinerary(budgetRequest).subscribe({
      next: (response) => {
        this.selectedBudget.set(response);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error("Error calculating budget:", error);
        this.errorMessage.set("Erreur lors du calcul du budget");
        this.isLoading.set(false);
      },
    });
  }

  onBackToItineraries(): void {
    this.selectedBudget.set(null);
    this.selectedProgram.set(null);
  }
}
