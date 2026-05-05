import { Component, OnInit, OnDestroy, AfterViewInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import * as L from "leaflet";
import {
  LucideAngularModule,
  ChevronLeft,
  Calendar,
  Users,
  MapPin,
  Clock,
  List,
  Package,
  Map as MapIcon,
  Edit,
  Share2,
  Download,
  CheckCircle,
  Circle,
  ChevronRight,
  Sun,
  CloudRain,
  Thermometer,
  Wind,
  Search,
} from "lucide-angular";
import { ButtonComponent } from "../../../shared/components/button.component";
import { BadgeComponent } from "../../../shared/components/badge.component";
import {
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardDescriptionComponent,
  CardContentComponent,
} from "../../../shared/components/card.component";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { TripService } from "../services/trip.service";
import { WeatherService } from "../../../core/services/weather.service";
import { MapService } from "../../safety/services/map.service";
import {
  TripAiService,
  TripPredictions,
  ItineraryBudgetPrediction,
  ItineraryBudgetPredictRequest,
} from "../../../core/services/trip-ai.service";
import { PdfExportService } from "../../../shared/services/pdf-export.service";
import { TransportationService } from "../../transportation/services/transportation.service";
import {
  Brain,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  Map as MapIconIcon,
  Wallet,
} from "lucide-angular";

@Component({
  selector: "app-trip-detail",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    ButtonComponent,
    BadgeComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    FormsModule,
  ],
  templateUrl: "./trip-detail.component.html",
  styles: [
    `
      :host {
        display: block;
        background-color: #f5f3ea;
        color: #2A2A2A;
        font-family: 'Inter', -apple-system, sans-serif;
      }

      .editorial-card {
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(8px);
        border: 1px solid white;
        border-radius: 1.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      }

      .search-box {
        @apply flex items-center bg-white/50 backdrop-blur-md border border-white rounded-2xl px-6 py-3 transition-all focus-within:bg-white focus-within:shadow-lg focus-within:border-emerald-500/30;
      }

      .tab-btn {
        @apply px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border-2 border-transparent;
      }

      .tab-btn.active {
        @apply bg-emerald-900 text-white shadow-xl;
      }

      .tab-btn:not(.active) {
        @apply text-emerald-900/40 hover:bg-white/50 hover:text-emerald-900;
      }

      .section-header {
        position: relative;
        padding-left: 1.5rem;
      }

      .section-header::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0.5rem;
        bottom: 0.5rem;
        width: 4px;
        background: #064e3b; /* emerald-900 */
        border-radius: 2px;
      }

      .ai-gradient-bg {
        background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
      }

      .hover-lift {
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      .hover-lift:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      }

      .premium-budget-card {
        background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
        box-shadow: 0 25px 50px -12px rgba(6, 78, 59, 0.5);
        position: relative;
        overflow: hidden;
      }

      .premium-budget-card::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
        pointer-events: none;
      }
    `,
  ],
})
export class TripDetailComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();
  private map!: L.Map;
  private marker!: L.Marker;
  // Trip Data
  tripId: string | null = null;
  trip: any = null;
  weatherData: any = null;
  weatherAdvice: string = "";
  isLoadingWeather: boolean = false;

  // AI Prediction Data
  predictions: TripPredictions | null = null;
  isLoadingAI: boolean = false;

  // AI Itinerary Data
  itineraryOptions: any = null;
  selectedProgram: any = null;
  isGeneratingItinerary: boolean = false;
  selectedActivityKeys = new Set<string>();
  userProposedBudgetTnd: number | null = null;
  transportMode: "bus" | "train" | "car" | "van" = "car";
  /** Prix billet / personne (bus) ou location / jour groupe (voiture, van) */
  transportCostTnd: number | null = null;
  /** null = pas de ligne transport liée au trip ; défini après chargement API */
  transportFromTripLoaded = false;
  /** Priorité au modèle prix issu du transport enregistré sur le voyage */
  private transportPricingModel: "per_person" | "per_day_group" | "flat_group" | null =
    null;
  tripTransportSummary: string | null = null;
  includeFood: boolean = false;
  includeAccommodation: boolean = false;
  isPredictingBudget: boolean = false;
  budgetPrediction: ItineraryBudgetPrediction | null = null;
  itineraryMessage: string | null = null;
  showBudgetSettings: boolean = false;
  isPlanValidated: boolean = false;
  isActivitiesConfirmed: boolean = false;
  showRegenerationModal: boolean = false;
  regenerationReason: string = '';
  isRegenerating: boolean = false;
  showRejectionPrompt: boolean = false;
  rejectionReason: string = "";
  hasDelay: boolean = false;
  delayAmount: number = 0;

  // State management
  activeSection: string = "overview";
  itinerarySearchQuery: string = "";

  // Icons
  readonly ChevronLeft = ChevronLeft;
  readonly Calendar = Calendar;
  readonly Users = Users;
  readonly MapPin = MapPin;
  readonly Clock = Clock;
  readonly List = List;
  readonly Package = Package;
  readonly MapIcon = MapIcon;
  readonly Edit = Edit;
  readonly Share2 = Share2;
  readonly Download = Download;
  readonly CheckCircle = CheckCircle;
  readonly Circle = Circle;
  readonly ChevronRight = ChevronRight;
  readonly Sun = Sun;
  readonly CloudRain = CloudRain;
  readonly Thermometer = Thermometer;
  readonly Wind = Wind;
  readonly Brain = Brain;
  readonly AlertCircle = AlertCircle;
  readonly TrendingUp = TrendingUp;
  readonly ShieldCheck = ShieldCheck;
  readonly Sparkles = Sparkles;
  readonly Search = Search;
  readonly Wallet = Wallet;

  statusConfig: any = {
    draft: {
      label: "Draft",
      variant: "default",
      color: "var(--color-neutral-600)",
    },
    planned: {
      label: "Planned",
      variant: "primary",
      color: "var(--color-primary-600)",
    },
    completed: {
      label: "Completed",
      variant: "success",
      color: "var(--color-success)",
    },
  };

  // Mock Data
  mockTripData: any = {
    "1": {
      id: "1",
      name: "Yosemite Valley Adventure",
      destination: "Yosemite National Park, CA",
      startDate: "2026-03-15",
      endDate: "2026-03-18",
      groupSize: 4,
      status: "planned",
      adventureLevel: "moderate",
      comfortLevel: "comfortable",
      activities: ["hiking", "photography", "camping", "wildlife"],
      daysUntil: 42,
      imageUrl:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
      itineraryDays: 4,
      packingItems: { total: 42, packed: 28 },
      budget: { estimated: 850, actual: 320 },
      nearbyPlaces: 5,
    },
    "new-trip-id": {
      id: "new-trip-id",
      name: "New Adventure",
      destination: "Custom Location",
      startDate: "2026-04-01",
      endDate: "2026-04-05",
      groupSize: 2,
      status: "draft",
      adventureLevel: "moderate",
      comfortLevel: "basic",
      activities: ["hiking", "camping"],
      daysUntil: 59,
      imageUrl:
        "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=80",
      itineraryDays: 5,
      packingItems: { total: 35, packed: 0 },
      budget: { estimated: 600, actual: 0 },
      nearbyPlaces: 8,
    },
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tripService: TripService,
    private weatherService: WeatherService,
    private mapService: MapService,
    private tripAiService: TripAiService,
    private pdfExportService: PdfExportService,
    private transportationService: TransportationService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.tripId = params.get("id");
      this.loadTrip();
    });

    // Auto-generate AI itinerary if requested via query param
    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        if (params.get("autoGenerate") === "true") {
          // Wait a bit for the trip to load first
          setTimeout(() => {
            if (!this.itineraryOptions && !this.isGeneratingItinerary) {
              this.onGenerateItinerary();
            }
          }, 1500);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.map) {
      this.map.remove();
    }
  }

  ngAfterViewInit(): void {
    // Initializing map after view is ready
    if (this.tripId && this.trip) {
      this.initTripMap();
    }
  }

  loadTrip() {
    if (!this.tripId) return;

    // Try real data first
    this.tripService.getTripById(this.tripId).subscribe({
      next: (data) => {
        if (data) {
          this.trip = {
            ...data,
            name: data.title || data.name || "Untitled Expedition",
            destination:
              typeof data.destination === "string"
                ? data.destination
                : data.destination?.address || "Deep Wilderness",
            groupSize: data.participants || 1,
            // Provide defaults for UI fields not in backend yet
            daysUntil: this.calculateDaysUntil(data.startDate),
            adventureLevel: (data.difficulty || "MODERATE").toLowerCase(),
            comfortLevel: (data.comfortLevel || "BASIC").toLowerCase(),
            activities: data.activities || [],
            itineraryDays: data.itinerary?.length || 0,
            packingItems: { total: 0, packed: 0 },
            budget: { estimated: data.totalBudget || 0, actual: 0 },
            nearbyPlaces: 0,
          };
          if (data.totalBudget != null && data.totalBudget !== "") {
            const tb = Number(data.totalBudget);
            if (!Number.isNaN(tb)) {
              this.userProposedBudgetTnd = Math.round(tb);
            }
          }
          this.fetchWeather(this.trip.destination);
          this.fetchAIPredictions();
          this.hydrateTransportFromTrip(data);
          this.initTripMap();
        } else {
          console.warn("Trip data is null or empty from backend");
          this.trip = null;
        }
      },
      error: (err) => {
        console.error("Failed to load trip", err);
        // Fallback to mock for testing if it's one of the mock IDs
        this.trip = this.mockTripData[this.tripId || "1"];
      },
    });
  }

  private calculateDaysUntil(startDate: string): number {
    if (!startDate) return 0;
    const diff = new Date(startDate).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }


  get tripDuration(): number {
    if (!this.trip || !this.trip.startDate || !this.trip.endDate) return 0;
    const start = new Date(this.trip.startDate);
    const end = new Date(this.trip.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  getStatusVariant(
    status: string,
  ): "default" | "primary" | "success" | "error" | "warning" {
    return this.statusConfig[status]?.variant || "default";
  }

  getStatusLabel(status: string): string {
    return this.statusConfig[status]?.label || status;
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }

  onEdit() {
    if (!this.trip || !this.trip.id) return;
    // Navigate to the plan/edit flow and pass tripId as query param
    this.router.navigate(["/plan-trip"], {
      queryParams: { tripId: this.trip.id },
    });
  }

  onDelete() {
    if (!this.trip || !this.trip.id) return;
    const ok = confirm(
      "Are you sure you want to delete this trip? This action cannot be undone.",
    );
    if (!ok) return;
    this.tripService.deleteTrip(this.trip.id).subscribe({
      next: () => {
        // navigate back to list after delete
        this.router.navigate(["/trips"]);
      },
      error: (err) => {
        console.error("Failed to delete trip", err);
        alert(
          "Failed to delete trip: " +
            (err?.error?.message || err?.message || "Unknown error"),
        );
      },
    });
  }

  fetchWeather(location: string) {
    this.isLoadingWeather = true;
    console.log("Fetching weather for:", location);

    this.weatherService.getCurrentWeather(location || "Tunis").subscribe({
      next: (data) => {
        console.log("Weather data received:", data);
        this.weatherData = data;
        this.isLoadingWeather = false;
      },
      error: (err) => {
        console.error("Weather fetch failed, trying fallback to Tunis", err);
        // Fallback to a major city if specific location fails
        this.weatherService.getCurrentWeather("Tunis").subscribe({
          next: (fallbackData) => {
            this.weatherData = fallbackData;
            this.isLoadingWeather = false;
          },
        });
      },
    });

    this.weatherService.getWeatherAdvice(location || "Tunis").subscribe({
      next: (advice) => {
        this.weatherAdvice = advice;
      },
    });
  }

  private initTripMap() {
    if (!this.trip) return;

    const tryInit = (retries: number) => {
      const el = document.getElementById("trip-destination-map");
      if (el) {
        if (!this.map) {
          this.map = this.mapService.initMap(
            "trip-destination-map",
            [33.8869, 9.5375],
            5,
          );
        }
        this.updateMapLocation();
      } else if (retries > 0) {
        setTimeout(() => tryInit(retries - 1), 200);
      }
    };
    tryInit(10); // Attempt for up to 2 seconds
  }

  private updateMapLocation() {
    if (!this.map || !this.trip?.destination) return;

    // Tentative de géo-codage de la destination
    this.mapService.geocode(this.trip.destination).subscribe((coords) => {
      const latLng: [number, number] = coords
        ? [coords.lat, coords.lng]
        : [33.8869, 9.5375]; // Fallback sur la Tunisie si non trouvé

      // Animation vers la destination (zoom 14) ou le pays (zoom 6)
      this.map.flyTo(latLng, coords ? 14 : 6, {
        animate: true,
        duration: 1.5,
      });

      if (coords) {
        if (this.marker) this.marker.remove();

        this.marker = L.marker(latLng, {
          icon: L.divIcon({
            className: "custom-div-icon",
            html: `<div class="w-10 h-10 bg-primary-600 rounded-full border-4 border-white shadow-2xl flex items-center justify-center">
                    <div class="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  </div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
          }),
        }).addTo(this.map);

        this.marker
          .bindTooltip(`<b>${this.trip.name}</b><br>${this.trip.destination}`, {
            permanent: true,
            direction: "top",
            className:
              "bg-primary-900 text-white rounded-lg px-3 py-1 border-none shadow-xl font-bold",
          })
          .openTooltip();
      }

      setTimeout(() => this.map.invalidateSize(), 500);
    });
  }

  fetchAIPredictions() {
    if (!this.tripId) return;
    this.isLoadingAI = true;
    this.tripAiService.getTripPredictions(this.tripId).subscribe({
      next: (preds) => {
        this.predictions = preds;
        this.isLoadingAI = false;
      },
      error: (err) => {
        console.error("AI predictions failed", err);
        this.isLoadingAI = false;
      },
    });
  }

  onGenerateItinerary(reason?: string) {
    if (!this.tripId) return;
    this.isGeneratingItinerary = true;
    this.isRegenerating = !!reason;
    this.itineraryOptions = null;
    this.selectedProgram = null;
    this.budgetPrediction = null;
    this.isPredictingBudget = false;
    this.isPlanValidated = false;
    this.showRejectionPrompt = false;
    this.rejectionReason = "";
    this.showBudgetSettings = false;
    this.itineraryMessage = null;

    this.tripAiService.generateThreeItineraryOptions(this.tripId, reason).subscribe({
      next: (response) => {
        if (response.status === "invalid_destination") {
          this.isGeneratingItinerary = false;
          this.itineraryOptions = null;
          this.selectedProgram = null;
          this.itineraryMessage =
            response.message ||
            "Destination non reconnue dans le dataset. Veuillez corriger la destination du trip.";
          return;
        }
        this.itineraryOptions = response;
        if (response.programs && response.programs.length > 0) {
          // Single varied planning mode: auto-select first program
          this.selectedProgram = response.programs[0];
          if (!this.userProposedBudgetTnd) {
            this.userProposedBudgetTnd = Math.round(this.selectedProgram.totalEstimatedCostTnd || 0);
          }
          this.resetSelectedActivities();
        } else {
          this.itineraryMessage =
            response.message ||
            "Aucune activité trouvée pour cette destination. Vérifiez la destination du trip.";
        }
        this.isGeneratingItinerary = false;
        this.isActivitiesConfirmed = false;
        this.budgetPrediction = null;

        // Scroll to itinerary section
        setTimeout(() => {
          document
            .getElementById("ai-itinerary-section")
            ?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      },
      error: (err) => {
        console.error("Failed to generate AI itinerary options", err);
        this.isGeneratingItinerary = false;
        this.itineraryMessage =
          "L'IA n'a pas pu générer les options d'itinéraire. Veuillez réessayer.";
      },
    });
  }

  requestRegeneration(): void {
    this.showRegenerationModal = true;
    this.regenerationReason = '';
  }

  cancelRegeneration(): void {
    this.showRegenerationModal = false;
    this.regenerationReason = '';
  }

  submitRegeneration(): void {
    if (!this.regenerationReason.trim()) return;
    const reason = this.regenerationReason.trim();
    this.showRegenerationModal = false;
    this.regenerationReason = '';
    this.onGenerateItinerary(reason);
  }

  selectProgram(program: any) {
    this.selectedProgram = program;
    this.budgetPrediction = null;
    this.isPredictingBudget = false;
    this.isPlanValidated = false;
    this.showRejectionPrompt = false;
    this.rejectionReason = "";
    this.showBudgetSettings = false;
    this.itineraryMessage = null;
    if (!this.userProposedBudgetTnd) {
      this.userProposedBudgetTnd = Math.round(program.totalEstimatedCostTnd || 0);
    }
    this.resetSelectedActivities();
    this.isPlanValidated = true;
    this.budgetPrediction = null;
    this.isActivitiesConfirmed = false;
  }

  private hydrateTransportFromTrip(data: Record<string, unknown>): void {
    this.transportPricingModel = null;
    this.tripTransportSummary = null;
    this.transportFromTripLoaded = false;
    const rawIds = data["transportIds"];
    const ids = Array.isArray(rawIds) ? (rawIds as string[]) : undefined;
    if (!ids?.length) {
      this.transportFromTripLoaded = true;
      return;
    }
    this.transportationService.getTransportById(ids[0]).subscribe({
      next: (t: any) => {
        this.transportFromTripLoaded = true;
        const costNum =
          t?.cost !== undefined && t?.cost !== null
            ? Number(t.cost)
            : NaN;
        this.transportCostTnd =
          typeof costNum === "number" && !Number.isNaN(costNum) ? costNum : null;
        const m = String(t?.mode ?? "").toUpperCase();
        if (m === "BUS") {
          this.transportMode = "bus";
          this.transportPricingModel = "per_person";
          this.tripTransportSummary =
            `Bus — ${this.transportCostTnd ?? "?"} DT / personne (déjà choisi)`;
        } else if (m === "TRAIN") {
          this.transportMode = "train";
          this.transportPricingModel = "per_person";
          this.tripTransportSummary =
            `Train — ${this.transportCostTnd ?? "?"} DT / personne (déjà choisi)`;
        } else if (m === "CAR") {
          this.transportMode = "car";
          this.transportPricingModel = "per_day_group";
          this.tripTransportSummary =
            `Voiture — ${this.transportCostTnd ?? "?"} DT / jour groupe (déjà choisi)`;
        } else if (m === "SHARED_RIDE") {
          this.transportMode = "van";
          this.transportPricingModel = "per_person";
          this.tripTransportSummary =
            `Covoiturage / van — ${this.transportCostTnd ?? "?"} DT / personne (déjà choisi)`;
        } else if (m === "BIKE") {
          this.transportMode = "car";
          this.transportPricingModel = "flat_group";
          this.tripTransportSummary =
            `Vélo — forfait ${this.transportCostTnd ?? "?"} DT (déjà choisi)`;
        } else {
          this.transportMode = "car";
          this.transportPricingModel = "per_day_group";
          this.tripTransportSummary =
            `${m} — ${this.transportCostTnd ?? "?"} DT (déjà choisi)`;
        }
      },
      error: () => {
        this.transportFromTripLoaded = true;
        this.tripTransportSummary =
          "Impossible de charger le transport du voyage.";
      },
    });
  }

  /** Bus / train / covoiturage = billet par personne ; voiture = location jour groupe ; priorité aux données voyage */
  getTransportCostType(): string {
    if (this.transportPricingModel) {
      return this.transportPricingModel;
    }
    if (this.transportMode === "bus" || this.transportMode === "train") {
      return "per_person";
    }
    return "per_day_group";
  }

  onBudgetComparisonChange(): void {
    if (this.isPlanValidated) {
      this.predictSelectedBudget();
    }
  }

  validateSelectedProgram(): void {
    if (!this.selectedProgram) return;
    this.isPlanValidated = true;
    this.showRejectionPrompt = false;
    this.rejectionReason = "";
    this.itineraryMessage = null;
    this.predictSelectedBudget();
  }

  rejectSelectedProgram(): void {
    this.isPlanValidated = false;
    this.budgetPrediction = null;
    this.showBudgetSettings = false;
    this.showRejectionPrompt = true;
  }

  submitRejectionReason(): void {
    const reason = (this.rejectionReason || "").trim().toLowerCase();
    this.showRejectionPrompt = false;

    if (!reason) {
      this.itineraryMessage =
        "Merci de préciser la raison du refus (ex: prix trop élevé, activités non adaptées).";
      return;
    }

    if (reason.includes("prix") || reason.includes("cher") || reason.includes("budget")) {
      this.itineraryMessage =
        "Planning refusé pour cause de prix. Génération d'un nouveau planning en cours...";
      this.onGenerateItinerary();
      return;
    }

    this.itineraryMessage =
      "Planning non validé. Sélectionnez une autre option ou régénérez un nouveau planning.";
  }

  private activityKey(day: number, activityId: number | null, name: string): string {
    const idPart = activityId !== null && activityId !== undefined ? activityId : name;
    return `${day}::${idPart}`;
  }

  isActivitySelected(day: number, activityId: number | null, name: string): boolean {
    return this.selectedActivityKeys.has(this.activityKey(day, activityId, name));
  }

  toggleActivitySelection(day: number, activityId: number | null, name: string): void {
    const key = this.activityKey(day, activityId, name);
    if (this.selectedActivityKeys.has(key)) {
      this.selectedActivityKeys.delete(key);
    } else {
      this.selectedActivityKeys.add(key);
    }
    // Reset budget prediction when selection changes — user must re-confirm
    this.budgetPrediction = null;
    this.isActivitiesConfirmed = false;
  }

  private resetSelectedActivities(): void {
    this.selectedActivityKeys = new Set<string>();
    if (!this.selectedProgram?.days) return;
    this.selectedProgram.days.forEach((day: any) => {
      (day.activities || []).forEach((act: any, idx: number) => {
        this.selectedActivityKeys.add(
          this.activityKey(day.day, act.id ?? idx ?? null, act.name),
        );
      });
    });
  }

  private getSelectedActivities() {
    if (!this.selectedProgram?.days) return [];
    const selected: Array<{ id?: number; name: string }> = [];
    this.selectedProgram.days.forEach((day: any) => {
      (day.activities || []).forEach((act: any, idx: number) => {
        if (this.isActivitySelected(day.day, act.id ?? idx ?? null, act.name)) {
          selected.push({ id: act.id, name: act.name });
        }
      });
    });
    return selected;
  }

  confirmActivitySelection(): void {
    if (this.selectedActivityKeys.size === 0) return;
    this.isActivitiesConfirmed = true;
    this.predictSelectedBudget();
  }

  predictSelectedBudget(): void {
    if (this.isPredictingBudget || !this.tripId || !this.selectedProgram?.programId) return;
    const selectedActs = this.getSelectedActivities();
    this.isPredictingBudget = true;
    this.budgetPrediction = null;

    // Use the trip's initial budget as the budget limit — no manual input needed
    const tripBudget = this.trip?.budget?.estimated || this.userProposedBudgetTnd || undefined;

    const payload: ItineraryBudgetPredictRequest = {
      programId: this.selectedProgram.programId,
      user_proposed_budget_tnd: tripBudget,
      transportMode: this.transportMode,
      includeFood: false,
      includeAccommodation: false,
      selectedActivityIds: selectedActs
        .map((a) => a.id)
        .filter((id): id is number => typeof id === "number"),
      selectedActivityNames: selectedActs.map((a) => a.name),
    };
    if (this.transportCostTnd != null && this.transportCostTnd > 0) {
      payload.transportCostTnd = this.transportCostTnd;
      payload.transportCostType = this.getTransportCostType();
    }

    this.tripAiService
      .predictSelectedItineraryBudget(this.tripId, payload)
      .subscribe({
        next: (res) => {
          this.budgetPrediction = res;
          this.isPredictingBudget = false;
        },
        error: (err) => {
          console.error("Predict budget failed", err);
          this.isPredictingBudget = false;
          this.itineraryMessage =
            "Échec de prédiction budget. Vérifiez le service AI.";
        },
      });
  }

  get selectedActivitiesCount(): number {
    return this.selectedActivityKeys.size;
  }

  saveSelectedItinerary() {
    if (!this.selectedProgram || !this.tripId) return;
    
    this.isGeneratingItinerary = true; // Use existing loading state or add new
    this.tripAiService.confirmItinerarySelection(this.tripId, this.selectedProgram).subscribe({
      next: (updatedTrip) => {
        this.isGeneratingItinerary = false;
        alert(`Mission Log updated! Program "${this.selectedProgram.title}" has been successfully assigned to your expedition.`);
        
        // Update local state
        this.trip.itineraryDays = this.selectedProgram.days.length;
        this.trip.budget.estimated = this.selectedProgram.totalEstimatedCostTnd;
        
        // Navigate to dedicated itinerary tab or view
        this.router.navigate(['/trips', this.tripId], { fragment: 'itinerary' });
        this.activeSection = 'itinerary';
      },
      error: (err) => {
        this.isGeneratingItinerary = false;
        console.error("Failed to save itinerary", err);
        alert("Strategic Command Error: Could not persist the chosen itinerary. Please try again.");
      }
    });
  }

  exportPdf() {
    if (!this.trip) {
      alert("Trip data not available for export");
      return;
    }

    const fileName = `${this.trip.name || "Trip"}-${new Date().getTime()}.pdf`;

    this.pdfExportService
      .exportTripToPdf(this.trip, fileName)
      .catch((error) => {
        console.error("PDF export error:", error);
        alert("Failed to export PDF. Please try again.");
      });
  }

  get filteredActivities() {
    if (!this.selectedProgram) return [];
    
    // Flatten all activities from all days
    const allActivities = this.selectedProgram.days.flatMap((day: any) => 
      day.activities.map((act: any) => ({ ...act, day: day.day }))
    );

    if (!this.itinerarySearchQuery.trim()) return allActivities;
    
    const query = this.itinerarySearchQuery.toLowerCase();
    return allActivities.filter((act: any) => 
      act.name.toLowerCase().includes(query) || 
      act.description.toLowerCase().includes(query)
    );
  }

  setSection(section: string) {
    this.activeSection = section;
  }
}
