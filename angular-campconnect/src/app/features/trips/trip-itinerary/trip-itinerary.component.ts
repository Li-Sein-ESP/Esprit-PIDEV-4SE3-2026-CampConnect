import { Component, signal, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import {
  LucideAngularModule,
  Calendar,
  MapPin,
  Clock,
  Brain,
  AlertCircle,
  Check,
  Zap,
  Wallet,
} from "lucide-angular";
import { TripService } from "../services/trip.service";
import {
  TripAiService,
  ItineraryOptionsResponse,
  ItineraryOption,
  ItineraryDay,
  ItineraryBudgetPrediction,
} from "../../../core/services/trip-ai.service";
import {
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardContentComponent,
} from "../../../shared/components/card.component";
import { BadgeComponent } from "../../../shared/components/badge.component";

@Component({
  selector: "app-trip-itinerary",
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent,
    BadgeComponent,
  ],
  templateUrl: "./trip-itinerary.component.html",
})
export class TripItineraryComponent implements OnInit {
  readonly Calendar = Calendar;
  readonly MapPin = MapPin;
  readonly Clock = Clock;
  readonly Brain = Brain;
  readonly AlertCircle = AlertCircle;
  readonly Check = Check;
  readonly Zap = Zap;
  readonly Wallet = Wallet;

  tripId: string | null = null;
  itineraryDays: any[] = [];
  isLoading = true;
  error: string | null = null;

  // New: Three options UI state
  itineraryOptions: ItineraryOption[] = [];
  selectedOptionId = signal<number | null>(null);
  showOptions = true; // Show options selection first
  selectedItinerary: ItineraryOption | null = null;
  userProposedBudgetTnd = signal<number | null>(null);
  transportMode = signal<"bus" | "car" | "van">("car");
  budgetPrediction = signal<ItineraryBudgetPrediction | null>(null);
  isPredictingBudget = signal(false);
  selectedActivityKeys = signal<Set<string>>(new Set<string>());
  includeFood = signal(false);
  includeAccommodation = signal(false);
  numPeople = signal<number>(1);

  constructor(
    private route: ActivatedRoute,
    private tripService: TripService,
    private tripAiService: TripAiService,
  ) {}

  ngOnInit() {
    this.route.parent?.paramMap.subscribe((params) => {
      this.tripId = params.get("tripId") || params.get("id");
      if (this.tripId) {
        this.loadItinerary();
      } else {
        // Fallback to route itself if not loaded from parent
        this.route.paramMap.subscribe((p) => {
          this.tripId = p.get("tripId") || p.get("id");
          if (this.tripId) {
            this.loadItinerary();
          } else {
            this.error = "Trip ID is missing.";
            this.isLoading = false;
          }
        });
      }
    });
  }

  isSaved = false;

  loadItinerary() {
    if (!this.tripId) return;
    this.isLoading = true;
    this.error = null;

    // First, try to load a SAVED itinerary from the database
    this.tripService.getFullItinerary(this.tripId).subscribe({
      next: (savedDays) => {
        if (savedDays && savedDays.length > 0) {
          console.log("Loaded saved itinerary from DB:", savedDays);
          this.itineraryDays = savedDays;
          this.showOptions = false;
          this.isSaved = true;
          this.isLoading = false;
        } else {
          // If no saved itinerary, fall back to AI generation options
          this.loadAiOptions();
        }
      },
      error: (err) => {
        console.warn("Failed to load saved itinerary, falling back to AI", err);
        this.loadAiOptions();
      }
    });
  }

  loadAiOptions() {
    if (!this.tripId) return;
    this.isLoading = true;
    this.isSaved = false;

    // Try to load 3 options from AI
    this.tripAiService.generateThreeItineraryOptions(this.tripId).subscribe({
      next: (response: ItineraryOptionsResponse) => {
        this.itineraryOptions = response.programs;
        this.showOptions = true;
        this.isLoading = false;

        // Auto-select medium option if available
        if (this.itineraryOptions.length > 1) {
          this.selectOption(this.itineraryOptions[1].programId);
        } else if (this.itineraryOptions.length > 0) {
          this.selectOption(this.itineraryOptions[0].programId);
        }
        if (response.numPeople) {
          this.numPeople.set(response.numPeople);
        }
      },
      error: (err) => {
        console.error("Failed to load 3 itinerary options", err);
        // Fallback: try loading old single itinerary
        this.loadSingleItinerary();
      },
    });
  }

  loadSingleItinerary() {
    if (!this.tripId) return;
    this.tripAiService.generateItinerary(this.tripId).subscribe({
      next: (days) => {
        this.itineraryDays = days;
        this.showOptions = false;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Failed to load AI itinerary", err);
        this.error =
          "Failed to generate the itinerary. Please try again later.";
        this.isLoading = false;
      },
    });
  }

  selectOption(programId: number) {
    this.selectedOptionId.set(programId);
    const selected = this.itineraryOptions.find(
      (opt) => opt.programId === programId,
    );
    if (selected) {
      this.selectedItinerary = selected;
      this.itineraryDays = selected.days;
      this.budgetPrediction.set(null);
      this.userProposedBudgetTnd.set(
        Math.round(selected.totalEstimatedCostTnd || 0),
      );
      this.resetSelectedActivities();
      this.predictSelectedBudget();
      // Optionally, you could save this choice to the backend here
    }
  }

  getBudgetIcon(budgetLevel: string): string {
    switch (budgetLevel) {
      case "low":
        return "🎒";
      case "medium":
        return "⭐";
      case "high":
        return "💎";
      default:
        return "🎯";
    }
  }

  getBudgetColor(budgetLevel: string): string {
    switch (budgetLevel) {
      case "low":
        return "border-green-400 bg-green-50";
      case "medium":
        return "border-blue-400 bg-blue-50";
      case "high":
        return "border-purple-400 bg-purple-50";
      default:
        return "border-slate-400 bg-slate-50";
    }
  }

  confirmSelection() {
    this.showOptions = false;
  }

  predictSelectedBudget() {
    if (this.isPredictingBudget() || !this.tripId || !this.selectedOptionId()) return;
    this.isPredictingBudget.set(true);
    this.budgetPrediction.set(null);
    this.error = null;

    const selectedActivities = this.getSelectedActivitiesFromCurrentItinerary();

    this.tripAiService
      .predictSelectedItineraryBudget(this.tripId, {
        programId: this.selectedOptionId()!,
        user_proposed_budget_tnd: this.userProposedBudgetTnd() || undefined,
        transportMode: this.transportMode(),
        selectedActivityIds: selectedActivities
          .map((a) => a.id)
          .filter((id): id is number => typeof id === "number"),
        selectedActivityNames: selectedActivities.map((a) => a.name),
        selectedActivities: selectedActivities,
        includeFood: this.includeFood(),
        includeAccommodation: this.includeAccommodation(),
        numPeople: this.numPeople(),
      })
      .subscribe({
        next: (response) => {
          this.budgetPrediction.set(response);
          this.isPredictingBudget.set(false);
        },
        error: (err) => {
          console.error("Failed to predict selected itinerary budget", err);
          this.error = "Failed to predict budget for the selected itinerary.";
          this.isPredictingBudget.set(false);
        },
      });
  }

  private activityKey(day: number, idx: number, activityName: string): string {
    return `${day}::${idx}::${activityName}`;
  }

  isActivitySelected(day: number, idx: number, activityName: string): boolean {
    return this.selectedActivityKeys().has(this.activityKey(day, idx, activityName));
  }

  toggleActivitySelection(day: number, idx: number, activityName: string): void {
    const key = this.activityKey(day, idx, activityName);
    const next = new Set(this.selectedActivityKeys());
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    this.selectedActivityKeys.set(next);
    this.predictSelectedBudget();
  }

  private resetSelectedActivities(): void {
    const selected = new Set<string>();
    this.itineraryDays.forEach((day, dayIdx) => {
      (day.activities || []).forEach((activity: any, activityIdx: number) => {
        selected.add(this.activityKey(day.day ?? dayIdx + 1, activityIdx, activity.name));
      });
    });
    this.selectedActivityKeys.set(selected);
  }

  private getSelectedActivitiesFromCurrentItinerary(): any[] {
    const list: any[] = [];
    this.itineraryDays.forEach((day, dayIdx) => {
      (day.activities || []).forEach((activity: any, activityIdx: number) => {
        const key = this.activityKey(day.day ?? dayIdx + 1, activityIdx, activity.name);
        if (this.selectedActivityKeys().has(key)) {
          list.push({ ...activity });
        }
      });
    });
    return list;
  }
}
