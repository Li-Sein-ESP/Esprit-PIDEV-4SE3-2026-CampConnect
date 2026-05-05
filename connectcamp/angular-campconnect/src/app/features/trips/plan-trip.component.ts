import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardComponent, CardContentComponent, CardHeaderComponent, CardTitleComponent } from '../../shared/components/card.component';
import { DropdownComponent, DropdownOption } from '../../shared/components/dropdown.component';
import { LucideAngularModule, Calendar, MapPin, Users, DollarSign, Plus } from 'lucide-angular';


@Component({
  selector: 'app-plan-trip',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    DropdownComponent,
    LucideAngularModule
  ],
  template: `
    <div class="container py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-[var(--color-text-heading)] mb-2">
          Plan Your Trip
        </h1>
        <p class="text-[var(--color-text-secondary)]">
          Create a detailed itinerary for your next outdoor adventure
        </p>
      </div>

      <!-- Trip Planning Form -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Form -->
        <div class="lg:col-span-2">
          <app-card variant="default" padding="lg">
            <form (ngSubmit)="handleSubmit()" class="space-y-6">
              <!-- Trip Name -->
              <div>
                <label class="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Trip Name
                </label>
                <input
                  type="text"
                  [(ngModel)]="tripName"
                  name="tripName"
                  placeholder="e.g., Summer Yosemite Adventure"
                  class="w-full px-4 py-2.5 rounded-lg min-h-[44px] bg-white border-2 border-[var(--color-border-light)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-100)] transition-all duration-200"
                  required
                />
              </div>

              <!-- Destination -->
              <div>
                <label class="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Destination
                </label>
                <app-dropdown
                  [options]="destinationOptions"
                  [(ngModel)]="destination"
                  name="destination"
                  placeholder="Select a destination"
                ></app-dropdown>
              </div>

              <!-- Dates -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    [(ngModel)]="startDate"
                    name="startDate"
                    class="w-full px-4 py-2.5 rounded-lg min-h-[44px] bg-white border-2 border-[var(--color-border-light)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-100)] transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    [(ngModel)]="endDate"
                    name="endDate"
                    class="w-full px-4 py-2.5 rounded-lg min-h-[44px] bg-white border-2 border-[var(--color-border-light)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-100)] transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <!-- Group Size -->
              <div>
                <label class="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Group Size
                </label>
                <input
                  type="number"
                  [(ngModel)]="groupSize"
                  name="groupSize"
                  min="1"
                  max="20"
                  placeholder="Number of people"
                  class="w-full px-4 py-2.5 rounded-lg min-h-[44px] bg-white border-2 border-[var(--color-border-light)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-100)] transition-all duration-200"
                  required
                />
              </div>

              <!-- Budget -->
              <div>
                <label class="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Estimated Budget (per person)
                </label>
                <div class="relative">
                  <div class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]">
                    <lucide-icon [img]="DollarSignIcon" [size]="20"></lucide-icon>
                  </div>
                  <input
                    type="number"
                    [(ngModel)]="budget"
                    name="budget"
                    min="0"
                    placeholder="0.00"
                    class="w-full px-4 py-2.5 pl-11 rounded-lg min-h-[44px] bg-white border-2 border-[var(--color-border-light)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-100)] transition-all duration-200"
                  />
                </div>
              </div>

              <!-- Notes -->
              <div>
                <label class="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Trip Notes
                </label>
                <textarea
                  [(ngModel)]="notes"
                  name="notes"
                  rows="4"
                  placeholder="Add any special requirements, activities, or notes..."
                  class="w-full px-4 py-2.5 rounded-lg bg-white border-2 border-[var(--color-border-light)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-100)] transition-all duration-200 resize-none"
                ></textarea>
              </div>

              <!-- Submit Button -->
              <div class="flex gap-3">
                <button
                  type="submit"
                  class="flex-1 px-6 py-3 bg-[var(--color-primary-600)] text-white rounded-lg hover:bg-[var(--color-primary-700)] transition-colors font-medium"
                >
                  Create Trip Plan
                </button>
                <button
                  type="button"
                  (click)="router.navigate(['/trips'])"
                  class="px-6 py-3 bg-[var(--color-neutral-100)] text-[var(--color-text-primary)] border border-[var(--color-border-medium)] rounded-lg hover:bg-[var(--color-neutral-200)] transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </app-card>
        </div>

        <!-- Sidebar - Quick Tips -->
        <div class="lg:col-span-1">
          <app-card variant="default" padding="md">
            <app-card-header>
              <app-card-title>Planning Tips</app-card-title>
            </app-card-header>
            <app-card-content>
              <div class="space-y-4">
                <div class="flex gap-3">
                  <div class="w-8 h-8 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center flex-shrink-0">
                    <lucide-icon [img]="CalendarIcon" [size]="16" class="text-[var(--color-primary-600)]"></lucide-icon>
                  </div>
                  <div>
                    <div class="font-medium text-sm text-[var(--color-text-primary)]">Book Early</div>
                    <div class="text-xs text-[var(--color-text-secondary)]">Popular campsites fill up months in advance</div>
                  </div>
                </div>
                <div class="flex gap-3">
                  <div class="w-8 h-8 rounded-full bg-[var(--color-success-100)] flex items-center justify-center flex-shrink-0">
                    <lucide-icon [img]="MapPinIcon" [size]="16" class="text-[var(--color-success-600)]"></lucide-icon>
                  </div>
                  <div>
                    <div class="font-medium text-sm text-[var(--color-text-primary)]">Check Permits</div>
                    <div class="text-xs text-[var(--color-text-secondary)]">Some areas require special permits</div>
                  </div>
                </div>
                <div class="flex gap-3">
                  <div class="w-8 h-8 rounded-full bg-[var(--color-accent-100)] flex items-center justify-center flex-shrink-0">
                    <lucide-icon [img]="UsersIcon" [size]="16" class="text-[var(--color-accent-600)]"></lucide-icon>
                  </div>
                  <div>
                    <div class="font-medium text-sm text-[var(--color-text-primary)]">Group Size</div>
                    <div class="text-xs text-[var(--color-text-secondary)]">Most sites have group size limits</div>
                  </div>
                </div>
              </div>
            </app-card-content>
          </app-card>

          <!-- Popular Destinations -->
          <app-card variant="default" padding="md" customClass="mt-6">
            <app-card-header>
              <app-card-title>Popular Destinations</app-card-title>
            </app-card-header>
            <app-card-content>
              <div class="space-y-2">
                <button class="w-full text-left px-3 py-2 rounded-lg hover:bg-[var(--color-neutral-50)] transition-colors text-sm text-[var(--color-text-primary)]">
                  Yosemite National Park
                </button>
                <button class="w-full text-left px-3 py-2 rounded-lg hover:bg-[var(--color-neutral-50)] transition-colors text-sm text-[var(--color-text-primary)]">
                  Grand Canyon
                </button>
                <button class="w-full text-left px-3 py-2 rounded-lg hover:bg-[var(--color-neutral-50)] transition-colors text-sm text-[var(--color-text-primary)]">
                  Yellowstone
                </button>
                <button class="w-full text-left px-3 py-2 rounded-lg hover:bg-[var(--color-neutral-50)] transition-colors text-sm text-[var(--color-text-primary)]">
                  Zion National Park
                </button>
              </div>
            </app-card-content>
          </app-card>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PlanTripComponent {
  CalendarIcon = Calendar;
  MapPinIcon = MapPin;
  UsersIcon = Users;
  DollarSignIcon = DollarSign;
  PlusIcon = Plus;

  tripName = '';
  destination = '';
  startDate = '';
  endDate = '';
  groupSize = 1;
  budget = 0;
  notes = '';

  destinationOptions: DropdownOption[] = [
    { label: 'Yosemite National Park', value: 'yosemite' },
    { label: 'Grand Canyon National Park', value: 'grand-canyon' },
    { label: 'Yellowstone National Park', value: 'yellowstone' },
    { label: 'Zion National Park', value: 'zion' },
    { label: 'Rocky Mountain National Park', value: 'rocky-mountain' },
    { label: 'Glacier National Park', value: 'glacier' },
  ];

  constructor(public router: Router) { }

  handleSubmit(): void {
    const tripData = {
      name: this.tripName,
      destination: this.destination,
      startDate: this.startDate,
      endDate: this.endDate,
      groupSize: this.groupSize,
      budget: this.budget,
      notes: this.notes
    };
    console.log('Creating trip:', tripData);
    this.router.navigate(['/trips']);
  }
}
