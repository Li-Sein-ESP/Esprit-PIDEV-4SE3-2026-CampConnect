import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import {
  CardComponent,
  CardContentComponent,
  CardFooterComponent,
} from "../../shared/components/card.component";
import { BadgeComponent } from "../../shared/components/badge.component";
import {
  LucideAngularModule,
  Calendar,
  MapPin,
  Users,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
} from "lucide-angular";
import { TripService } from "./services/trip.service";
import { AuthService } from "../../core/services/auth.service";
import { OnInit } from "@angular/core";

interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  groupSize: number;
  status: "planning" | "upcoming" | "active" | "completed" | "cancelled";
  imageUrl?: string;
  template?: boolean;
}

@Component({
  selector: "app-my-trips",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardComponent,
    CardContentComponent,
    CardFooterComponent,
    BadgeComponent,
    LucideAngularModule,
  ],
  template: `
    <div class="container py-10 max-w-7xl mx-auto">
      <!-- Premium Header Section -->
      <div class="relative mb-12 p-8 rounded-3xl overflow-hidden bg-gradient-to-r from-[var(--color-primary-900)] via-[var(--color-primary-800)] to-[var(--color-primary-600)] shadow-2xl">
        <!-- Abstract background elements -->
        <div class="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 left-20 -mb-10 w-40 h-40 bg-[var(--color-accent-400)]/20 rounded-full blur-2xl"></div>
        
        <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 class="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
              My Adventures
            </h1>
            <p class="text-white/80 text-lg max-w-xl font-medium">
              Manage, track, and re-live all your outdoor camping trips in one beautiful place.
            </p>
          </div>
          <button
            (click)="router.navigate(['/plan-trip'])"
            class="group flex items-center gap-3 px-8 py-4 bg-white text-[var(--color-primary-900)] rounded-2xl hover:bg-[var(--color-accent-50)] hover:scale-105 transition-all duration-300 shadow-xl font-bold text-lg"
          >
            <lucide-icon [img]="PlusIcon" [size]="24" class="transition-transform group-hover:rotate-90"></lucide-icon>
            Plan New Trip
          </button>
        </div>
      </div>

      <!-- Modern Glassy Tabs -->
      <div class="flex gap-3 mb-10 p-1.5 bg-[var(--color-neutral-100)] rounded-xl w-fit">
        <button
          *ngFor="let tab of tabs"
          (click)="setActiveTab(tab.value)"
          [class]="getTabClasses(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Trips Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <app-card
          *ngFor="let trip of getFilteredTrips()"
          variant="default"
          padding="none"
          customClass="group overflow-hidden rounded-2xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white hover:-translate-y-2 flex flex-col h-full"
        >
          <!-- Dynamic Hero Image Section -->
          <div class="h-56 relative overflow-hidden bg-[var(--color-neutral-200)] cursor-pointer" (click)="viewTrip(trip.id)">
            <!-- Background Image with fallback gradient -->
            <div class="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-800)] mix-blend-multiply opacity-80 group-hover:opacity-60 transition-opacity duration-500 z-10"></div>
            <img 
              [src]="trip.imageUrl || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80'" 
              alt="Destination" 
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            
            <!-- Glassmorphism Status Badge -->
            <div class="absolute top-4 right-4 z-20">
              <div class="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full backdrop-blur-md border border-white/20 shadow-lg flex items-center gap-1.5"
                   [ngClass]="{
                     'bg-green-500/80 text-white': trip.status === 'upcoming' || trip.status === 'active',
                     'bg-amber-500/80 text-white': trip.status === 'planning',
                     'bg-blue-500/80 text-white': trip.status === 'completed',
                     'bg-gray-500/80 text-white': trip.status === 'cancelled'
                   }">
                <div class="w-1.5 h-1.5 rounded-full bg-white animate-pulse" *ngIf="trip.status === 'active' || trip.status === 'upcoming'"></div>
                {{ trip.status }}
              </div>
            </div>
            
            <!-- Bottom Gradient for Text Legibility -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
            
            <!-- Absolute Positioning Title over Image -->
            <div class="absolute bottom-4 left-4 right-4 z-20">
              <h3 class="text-2xl font-black text-white leading-tight drop-shadow-md line-clamp-2">
                {{ trip.name }}
              </h3>
            </div>
          </div>

          <!-- Trip Details -->
          <app-card-content customClass="p-6 flex-1 flex flex-col gap-4">
            <div class="flex items-start gap-3 mt-1">
              <div class="w-8 h-8 rounded-full bg-[var(--color-primary-50)] flex items-center justify-center flex-shrink-0">
                <lucide-icon [img]="MapPinIcon" [size]="16" class="text-[var(--color-primary-600)]"></lucide-icon>
              </div>
              <p class="text-[var(--color-text-secondary)] font-medium text-sm leading-tight mt-1.5 line-clamp-2">
                {{ trip.destination }}
              </p>
            </div>
            
            <div class="h-[1px] w-full bg-gradient-to-r from-transparent via-[var(--color-neutral-200)] to-transparent my-1"></div>
            
            <div class="grid grid-cols-2 gap-3 mt-auto">
              <div class="flex flex-col gap-1 bg-[var(--color-neutral-50)] p-3 rounded-xl border border-[var(--color-neutral-100)]">
                <span class="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">Dates</span>
                <div class="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-primary)]">
                  <lucide-icon [img]="CalendarIcon" [size]="14" class="text-[var(--color-primary-500)]"></lucide-icon>
                  <span class="truncate">{{ formatDate(trip.startDate) }}</span>
                </div>
              </div>
              <div class="flex flex-col gap-1 bg-[var(--color-neutral-50)] p-3 rounded-xl border border-[var(--color-neutral-100)]">
                <span class="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">Group</span>
                <div class="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-primary)]">
                  <lucide-icon [img]="UsersIcon" [size]="14" class="text-[var(--color-primary-500)]"></lucide-icon>
                  <span>{{ trip.groupSize }} Members</span>
                </div>
              </div>
            </div>
          </app-card-content>

          <!-- Floating Actions Footer -->
          <div class="p-4 bg-white border-t border-[var(--color-neutral-100)] flex gap-2">
            <button
              *ngIf="!trip.template"
              (click)="viewTrip(trip.id)"
              class="group/btn flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[var(--color-primary-50)] text-[var(--color-primary-700)] rounded-xl hover:bg-[var(--color-primary-600)] hover:text-white transition-all duration-300 font-bold text-sm"
            >
              Details
              <lucide-icon [img]="ChevronRight" [size]="16" class="transition-transform group-hover/btn:translate-x-1"></lucide-icon>
            </button>
            <button
              *ngIf="trip.template"
              (click)="editTrip(trip.id)"
              class="group/btn flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[var(--color-accent-50)] text-[var(--color-accent-700)] rounded-xl hover:bg-[var(--color-accent-600)] hover:text-white transition-all duration-300 font-bold text-sm"
            >
              Customize & Book
              <lucide-icon [img]="PlusIcon" [size]="16" class="transition-transform group-hover/btn:scale-125"></lucide-icon>
            </button>
            
            <button
              *ngIf="!trip.template"
              (click)="editTrip(trip.id)"
              class="p-3 bg-white border-2 border-[var(--color-neutral-200)] rounded-xl hover:border-[var(--color-primary-300)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-600)] transition-all text-[var(--color-text-secondary)] shadow-sm"
              title="Edit Trip"
            >
              <lucide-icon [img]="EditIcon" [size]="18"></lucide-icon>
            </button>
            <button
              *ngIf="!trip.template"
              (click)="deleteTrip(trip.id)"
              class="p-3 bg-white border-2 border-[var(--color-neutral-200)] rounded-xl hover:border-[var(--color-error-300)] hover:bg-[var(--color-error-50)] hover:text-[var(--color-error-600)] transition-all text-[var(--color-text-secondary)] shadow-sm"
              title="Delete Trip"
            >
              <lucide-icon [img]="Trash2Icon" [size]="18"></lucide-icon>
            </button>
          </div>
        </app-card>
      </div>

      <!-- Enhanced Empty State -->
      <div *ngIf="getFilteredTrips().length === 0" class="flex flex-col items-center justify-center py-24 px-4 text-center bg-white rounded-3xl border border-dashed border-[var(--color-neutral-300)] shadow-sm mt-8">
        <div class="relative mb-8">
          <div class="absolute inset-0 bg-[var(--color-primary-100)] blur-3xl rounded-full transform scale-150"></div>
          <div class="relative w-32 h-32 rounded-full bg-gradient-to-tr from-[var(--color-primary-50)] to-[var(--color-primary-100)] flex items-center justify-center shadow-inner border-[8px] border-white">
            <lucide-icon [img]="MapPinIcon" [size]="56" class="text-[var(--color-primary-500)]"></lucide-icon>
          </div>
        </div>
        <h3 class="text-3xl font-black text-[var(--color-primary-900)] mb-4 tracking-tight">
          Your Canvas is Empty
        </h3>
        <p class="text-[var(--color-text-secondary)] text-lg mb-10 max-w-md mx-auto leading-relaxed">
          It looks like you haven't started planning any trips yet. The great outdoors awaits your discovery!
        </p>
        <button
          (click)="router.navigate(['/plan-trip'])"
          class="group flex items-center gap-3 px-8 py-4 bg-[var(--color-primary-600)] text-white rounded-2xl hover:bg-[var(--color-primary-700)] hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--color-primary-500)]/30 transition-all duration-300 font-bold text-lg"
        >
          <lucide-icon [img]="PlusIcon" [size]="24" class="transition-transform group-hover:scale-110 group-hover:rotate-90"></lucide-icon>
          Craft Your First Adventure
        </button>
      </div>
    </div>
  `,
  styles: [],
})
export class MyTripsComponent implements OnInit {
  CalendarIcon = Calendar;
  MapPinIcon = MapPin;
  UsersIcon = Users;
  PlusIcon = Plus;
  EditIcon = Edit;
  Trash2Icon = Trash2;
  ChevronRight = ChevronRight;

  activeTab: string = "all";

  tabs = [
    { label: "My Trips+", value: "all" },
    { label: "Discover Trips", value: "discover" },
    { label: "Upcoming", value: "upcoming" },
    { label: "Completed", value: "completed" },
  ];

  adminTemplates: Trip[] = [];

  get trips(): Trip[] {
    const rawTrips = this.tripService.trips() as any[];
    return rawTrips.map((t) => ({
      ...t,
      name: t.title || t.name,
      groupSize: t.participants || t.groupSize || 1,
      imageUrl: t.imageUrl
    })) as unknown as Trip[];
  }

  constructor(
    public router: Router,
    private tripService: TripService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe((user) => {
      if (user?.id) {
        this.tripService.loadUserTrips(user.id);
      }
    });
    this.loadAdminTemplates();
  }

  loadAdminTemplates(): void {
    this.tripService.getAllTemplates().subscribe({
      next: (data) => {
        this.adminTemplates = data.map(t => ({
          id: t.id,
          name: t.title || t.name,
          destination: typeof t.destination === 'string' ? t.destination : (t.destination?.address || 'Destination inconnue'),
          startDate: t.startDate,
          endDate: t.endDate,
          groupSize: t.participants || 1,
          status: 'upcoming',
          imageUrl: t.imageUrl,
          template: true
        }));
      },
      error: (err) => console.error('Failed to load admin templates', err)
    });
  }

  setActiveTab(value: string): void {
    this.activeTab = value;
  }

  getTabClasses(tabValue: string): string {
    if (this.activeTab === tabValue) {
      return "px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 shadow-md bg-white text-[var(--color-primary-700)] border border-[var(--color-primary-100)]";
    }
    return "px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 text-[var(--color-text-secondary)] hover:text-[var(--color-primary-600)] hover:bg-white/60";
  }

  getFilteredTrips(): Trip[] {
    if (this.activeTab === "discover") {
      return this.adminTemplates;
    }
    
    if (this.activeTab === "all") {
      return this.trips;
    } else if (this.activeTab === "upcoming") {
      return this.trips.filter(
        (t) =>
          t.status === "upcoming" ||
          t.status === "planning" ||
          t.status === "active",
      );
    } else if (this.activeTab === "completed") {
      return this.trips.filter((t) => t.status === "completed");
    }
    return this.trips;
  }

  getStatusVariant(status: string): "success" | "warning" | "info" | "default" {
    switch (status) {
      case "active":
      case "upcoming":
        return "success";
      case "planning":
        return "warning";
      case "completed":
        return "info";
      default:
        return "default";
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  viewTrip(id: string): void {
    this.router.navigate(["/trips", id]);
  }

  editTrip(id: string): void {
    // Navigate to planner with tripId to edit existing trip
    this.router.navigate(["/plan-trip"], { queryParams: { tripId: id } });
  }

  deleteTrip(id: string): void {
    if (!confirm("Are you sure you want to delete this trip?")) return;
    this.tripService.deleteTrip(id).subscribe({
      next: (res) => {
        // Remove from local signal for immediate UI feedback
        this.tripService.trips.update((current) =>
          current.filter((t) => t.id !== id),
        );
      },
      error: (err) => {
        console.error("Failed to delete trip", err);
        alert("Failed to delete trip.");
      },
    });
  }
}
