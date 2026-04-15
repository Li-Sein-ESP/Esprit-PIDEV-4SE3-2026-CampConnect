import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
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
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
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
  ) {}

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
        } else {
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
}
