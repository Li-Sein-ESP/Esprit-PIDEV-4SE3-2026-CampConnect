import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule, Location } from "@angular/common";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import {
  LucideAngularModule,
  ChevronLeft,
  Calendar,
  Users,
  MapPin,
  Clock,
  List,
  Package,
  DollarSign,
  Map as MapIcon,
  Edit,
  Share2,
  Download,
  CheckCircle,
  Circle,
  ChevronRight,
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
import { Subject, takeUntil } from "rxjs";
import { TripService } from "../services/trip.service";

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
  ],
  templateUrl: "./trip-detail.component.html",
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class TripDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  tripId: string | null = null;
  trip: any = null;

  // Icons
  readonly ChevronLeft = ChevronLeft;
  readonly Calendar = Calendar;
  readonly Users = Users;
  readonly MapPin = MapPin;
  readonly Clock = Clock;
  readonly List = List;
  readonly Package = Package;
  readonly DollarSign = DollarSign;
  readonly MapIcon = MapIcon;
  readonly Edit = Edit;
  readonly Share2 = Share2;
  readonly Download = Download;
  readonly CheckCircle = CheckCircle;
  readonly Circle = Circle;
  readonly ChevronRight = ChevronRight;

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tripService: TripService,
    private location: Location
  ) {}

  goBack(): void {
    this.location.back();
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.tripId = params.get("id");
      this.loadTrip();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTrip() {
    if (!this.tripId) return;

    this.tripService.getTripById(this.tripId).subscribe({
      next: (data) => {
        // Mappage des données backend vers le format attendu par le template
        this.trip = {
          id: data.id,
          name: data.title || data.name,
          destination:
            typeof data.destination === "string"
              ? data.destination
              : data.destination?.address || "Destination inconnue",
          startDate: data.startDate,
          endDate: data.endDate,
          groupSize: data.participants || 1,
          status: data.status?.toLowerCase() || "planned",
          adventureLevel: data.difficulty?.toLowerCase() || "moderate",
          comfortLevel: data.comfortLevel?.toLowerCase() || "basic",
          activities: data.activities || [],
          daysUntil: this.calculateDaysUntil(data.startDate),
          imageUrl:
            data.imageUrl ||
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
          itineraryDays: data.itineraryIds?.length || 0,
          packingItems: { total: 10, packed: 0 }, // TODO: Lier à PackingListService
          budget: {
            estimated: data.totalBudget || 0,
            actual: 0, // TODO: Lier à BudgetService
          },
          nearbyPlaces: 0,
        };
      },
      error: (err) => {
        console.error("Failed to load trip", err);
        this.trip = null;
      },
    });
  }

  private calculateDaysUntil(dateStr: string): number {
    if (!dateStr) return 0;
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  get tripDuration(): number {
    if (!this.trip) return 0;
    return Math.ceil(
      (new Date(this.trip.endDate).getTime() -
        new Date(this.trip.startDate).getTime()) /
        (1000 * 60 * 60 * 24),
    );
  }

  get packingProgress(): number {
    if (!this.trip) return 0;
    return Math.round(
      (this.trip.packingItems.packed / this.trip.packingItems.total) * 100,
    );
  }

  get budgetProgress(): number {
    if (!this.trip) return 0;
    return this.trip.budget.estimated > 0
      ? Math.round((this.trip.budget.actual / this.trip.budget.estimated) * 100)
      : 0;
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

  editTrip() {
    if (!this.trip || !this.trip.id) return;
    // Navigate to planner with tripId for editing
    this.router.navigate(["/plan-trip"], {
      queryParams: { tripId: this.trip.id },
    });
  }

  deleteTripConfirm() {
    if (!this.trip || !this.trip.id) return;
    if (!confirm("Are you sure you want to delete this trip?")) return;
    this.tripService.deleteTrip(this.trip.id).subscribe({
      next: () => {
        this.router.navigate(["/trips"]);
      },
      error: (err) => {
        console.error("Failed to delete trip", err);
        alert("Failed to delete trip.");
      },
    });
  }
}
