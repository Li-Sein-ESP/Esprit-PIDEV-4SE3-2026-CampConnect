import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CardComponent, CardContentComponent, CardFooterComponent } from '../../shared/components/card.component';
import { BadgeComponent } from '../../shared/components/badge.component';
import { LucideAngularModule, Calendar, MapPin, Users, Plus, Edit, Trash2 } from 'lucide-angular';
import { TripService, Trip } from '../../core/services/trip.service';

@Component({
  selector: 'app-my-trips',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardComponent,
    CardContentComponent,
    CardFooterComponent,
    BadgeComponent,
    LucideAngularModule
  ],
  template: `
  <div class="container py-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-[var(--color-text-heading)] mb-2">
          My Trips
        </h1>
        <p class="text-[var(--color-text-secondary)]">
          Manage and track all your outdoor adventures
        </p>
      </div>
      <button
        (click)="router.navigate(['/plan-trip'])"
        class="flex items-center gap-2 px-6 py-3 bg-[var(--color-primary-600)] text-white rounded-lg hover:bg-[var(--color-primary-700)] transition-colors font-medium"
      >
        <lucide-icon [img]="PlusIcon" [size]="20"></lucide-icon>
        Plan New Trip
      </button>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 mb-6 border-b border-[var(--color-border-light)]">
      <button
        *ngFor="let tab of tabs"
        (click)="activeTab = tab.value"
        [class]="getTabClasses(tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Trips Grid -->
    <div *ngIf="!loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <app-card
        *ngFor="let trip of getFilteredTrips()"
        variant="default"
        padding="none"
        customClass="overflow-hidden hover:shadow-lg transition-shadow"
      >
        <!-- Trip Image -->
        <div class="h-48 bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-700)] relative">
          <div class="absolute inset-0 flex items-center justify-center">
            <lucide-icon [img]="MapPinIcon" [size]="64" class="text-white/30"></lucide-icon>
          </div>
          <div class="absolute top-4 right-4">
            <app-badge [variant]="getStatusVariant('confirmed')">
              {{ trip.difficulty }}
            </app-badge>
          </div>
        </div>

        <!-- Trip Details -->
        <app-card-content customClass="p-6">
          <h3 class="text-xl font-semibold text-[var(--color-text-heading)] mb-2">
            Trip to {{ trip.destination }}
          </h3>
          <div class="space-y-2 text-sm text-[var(--color-text-secondary)]">
            <div class="flex items-center gap-2">
              <lucide-icon [img]="MapPinIcon" [size]="16"></lucide-icon>
              {{ trip.destination }}
            </div>
            <div class="flex items-center gap-2">
              <lucide-icon [img]="CalendarIcon" [size]="16"></lucide-icon>
              {{ formatDate(trip.startDate) }} - {{ formatDate(trip.endDate) }}
            </div>
          </div>
        </app-card-content>

        <!-- Actions -->
        <app-card-footer customClass="p-4 flex gap-2">
          <button
            (click)="viewTrip(trip.id)"
            class="flex-1 px-4 py-2 bg-[var(--color-primary-600)] text-white rounded-lg hover:bg-[var(--color-primary-700)] transition-colors text-sm font-medium"
          >
            View Details
          </button>
          <button
            (click)="editTrip(trip.id)"
            class="px-4 py-2 border border-[var(--color-border-medium)] rounded-lg hover:bg-[var(--color-neutral-50)] transition-colors"
          >
            <lucide-icon [img]="EditIcon" [size]="16" class="text-[var(--color-text-secondary)]"></lucide-icon>
          </button>
          <button
            (click)="deleteTrip(trip.id)"
            class="px-4 py-2 border border-[var(--color-border-medium)] rounded-lg hover:bg-[var(--color-error-50)] hover:border-[var(--color-error-500)] transition-colors"
          >
            <lucide-icon [img]="Trash2Icon" [size]="16" class="text-[var(--color-text-secondary)]"></lucide-icon>
          </button>
        </app-card-footer>
      </app-card>
    </div>

    <!-- Loading State -->
    <div *ngIf="loading" class="text-center py-16">
        <p>Loading trips...</p>
    </div>

    <!-- Empty State -->
    <div *ngIf="!loading && getFilteredTrips().length === 0" class="text-center py-16">
      <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-[var(--color-neutral-100)] flex items-center justify-center">
        <lucide-icon [img]="MapPinIcon" [size]="48" class="text-[var(--color-text-tertiary)]"></lucide-icon>
      </div>
      <h3 class="text-xl font-semibold text-[var(--color-text-heading)] mb-2">
        No trips found
      </h3>
      <p class="text-[var(--color-text-secondary)] mb-6">
        Start planning your next outdoor adventure!
      </p>
      <button
        (click)="router.navigate(['/plan-trip'])"
        class="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary-600)] text-white rounded-lg hover:bg-[var(--color-primary-700)] transition-colors font-medium"
      >
        <lucide-icon [img]="PlusIcon" [size]="20"></lucide-icon>
        Plan Your First Trip
      </button>
    </div>
  </div>
    `,
  styles: []
})
export class MyTripsComponent implements OnInit {
  CalendarIcon = Calendar;
  MapPinIcon = MapPin;
  UsersIcon = Users;
  PlusIcon = Plus;
  EditIcon = Edit;
  Trash2Icon = Trash2;

  activeTab: string = 'all';
  loading: boolean = true;

  tabs = [
    { label: 'All Trips', value: 'all' },
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'Completed', value: 'completed' },
  ];

  trips: Trip[] = [];

  constructor(public router: Router, private tripService: TripService) { }

  ngOnInit(): void {
    this.loadTrips();
  }

  loadTrips(): void {
    this.loading = true;
    this.tripService.getTrips().subscribe({
      next: (trips) => {
        this.trips = trips;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading trips', err);
        this.loading = false;
      }
    });
  }

  getTabClasses(tabValue: string): string {
    const baseClasses = 'px-4 py-2 font-medium transition-colors';
    const activeClasses = 'text-[var(--color-primary-600)] border-b-2 border-[var(--color-primary-600)]';
    const inactiveClasses = 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]';

    return `${baseClasses} ${this.activeTab === tabValue ? activeClasses : inactiveClasses}`;
  }

  getFilteredTrips(): Trip[] {
    if (this.activeTab === 'all') {
      return this.trips;
    }
    // Simple filtering for now as backend model is simpler
    return this.trips;
  }

  getStatusVariant(status: string): 'success' | 'warning' | 'info' | 'default' {
    switch (status) {
      case 'confirmed': return 'success';
      case 'planning': return 'warning';
      case 'completed': return 'info';
      default: return 'default';
    }
  }

  formatDate(dateString: any): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  viewTrip(id: string): void {
    this.router.navigate(['/trips', id]);
  }

  editTrip(id: string): void {
    console.log('Edit trip:', id);
  }

  deleteTrip(id: string): void {
    if (confirm('Are you sure you want to delete this trip?')) {
      this.tripService.deleteTrip(id).subscribe({
        next: () => {
          this.loadTrips();
        }
      });
    }
  }
}

