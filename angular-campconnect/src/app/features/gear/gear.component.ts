import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardComponent, CardContentComponent } from '../../shared/components/card.component';
import { BadgeComponent } from '../../shared/components/badge.component';
import { DropdownComponent, DropdownOption } from '../../shared/components/dropdown.component';
import { LucideAngularModule, ShoppingBag, Star, DollarSign, Search } from 'lucide-angular';

interface GearItem {
    id: string;
    name: string;
    category: string;
    price: number;
    rating: number;
    reviews: number;
    available: boolean;
    image: string;
}

@Component({
    selector: 'app-gear',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        CardComponent,
        CardContentComponent,
        BadgeComponent,
        DropdownComponent,
        LucideAngularModule
    ],
    template: `
    <div class="container py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-[var(--color-text-heading)] mb-2">
          Gear Marketplace
        </h1>
        <p class="text-[var(--color-text-secondary)]">
          Rent or buy camping equipment for your next adventure
        </p>
      </div>

      <!-- Search & Filters -->
      <div class="bg-white rounded-lg border border-[var(--color-border-light)] p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Search -->
          <div>
            <label class="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              Search Gear
            </label>
            <div class="relative">
              <div class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]">
                <lucide-icon [img]="SearchIcon" [size]="20"></lucide-icon>
              </div>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                placeholder="Search equipment..."
                class="w-full px-4 py-2.5 pl-11 rounded-lg min-h-[44px] bg-white border-2 border-[var(--color-border-light)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-100)] transition-all duration-200"
              />
            </div>
          </div>

          <!-- Category -->
          <div>
            <label class="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              Category
            </label>
            <app-dropdown
              [options]="categoryOptions"
              [(ngModel)]="category"
              placeholder="All Categories"
            ></app-dropdown>
          </div>

          <!-- Availability -->
          <div>
            <label class="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              Availability
            </label>
            <app-dropdown
              [options]="availabilityOptions"
              [(ngModel)]="availability"
              placeholder="All Items"
            ></app-dropdown>
          </div>
        </div>
      </div>

      <!-- Results -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <app-card
          *ngFor="let item of getFilteredGear()"
          variant="default"
          padding="none"
          customClass="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
        >
          <!-- Image -->
          <div class="h-48 bg-gradient-to-br from-[var(--color-accent-400)] to-[var(--color-accent-600)] relative flex items-center justify-center">
            <lucide-icon [img]="ShoppingBagIcon" [size]="64" class="text-white/30"></lucide-icon>
            <div *ngIf="!item.available" class="absolute top-4 right-4">
              <app-badge variant="error">Unavailable</app-badge>
            </div>
          </div>

          <!-- Content -->
          <app-card-content customClass="p-4">
            <div class="mb-2">
              <app-badge variant="outline" size="sm">{{ item.category }}</app-badge>
            </div>
            <h3 class="text-base font-semibold text-[var(--color-text-heading)] mb-2">
              {{ item.name }}
            </h3>
            
            <!-- Rating -->
            <div class="flex items-center gap-1 mb-3">
              <lucide-icon [img]="StarIcon" [size]="14" class="text-yellow-500"></lucide-icon>
              <span class="text-sm font-medium">{{ item.rating }}</span>
              <span class="text-xs text-[var(--color-text-tertiary)]">({{ item.reviews }})</span>
            </div>

            <!-- Price -->
            <div class="flex items-center justify-between pt-3 border-t border-[var(--color-border-light)]">
              <div class="flex items-center gap-1">
                <lucide-icon [img]="DollarSignIcon" [size]="16" class="text-[var(--color-text-secondary)]"></lucide-icon>
                <span class="text-lg font-bold text-[var(--color-text-heading)]">{{ item.price }}</span>
                <span class="text-xs text-[var(--color-text-secondary)]">/day</span>
              </div>
              <button
                [disabled]="!item.available"
                class="px-3 py-1.5 bg-[var(--color-primary-600)] text-white rounded-lg hover:bg-[var(--color-primary-700)] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Rent
              </button>
            </div>
          </app-card-content>
        </app-card>
      </div>
    </div>
  `,
    styles: []
})
export class GearComponent {
    ShoppingBagIcon = ShoppingBag;
    StarIcon = Star;
    DollarSignIcon = DollarSign;
    SearchIcon = Search;

    searchQuery = '';
    category = '';
    availability = '';

    categoryOptions: DropdownOption[] = [
        { label: 'All Categories', value: '' },
        { label: 'Tents', value: 'tents' },
        { label: 'Sleeping Bags', value: 'sleeping-bags' },
        { label: 'Backpacks', value: 'backpacks' },
        { label: 'Cooking', value: 'cooking' },
        { label: 'Lighting', value: 'lighting' },
    ];

    availabilityOptions: DropdownOption[] = [
        { label: 'All Items', value: '' },
        { label: 'Available Only', value: 'available' },
    ];

    gearItems: GearItem[] = [
        { id: '1', name: '4-Person Tent', category: 'Tents', price: 45, rating: 4.8, reviews: 124, available: true, image: '' },
        { id: '2', name: 'Sleeping Bag (-10°F)', category: 'Sleeping Bags', price: 25, rating: 4.6, reviews: 89, available: true, image: '' },
        { id: '3', name: '65L Backpack', category: 'Backpacks', price: 30, rating: 4.7, reviews: 156, available: false, image: '' },
        { id: '4', name: 'Camp Stove', category: 'Cooking', price: 15, rating: 4.5, reviews: 67, available: true, image: '' },
        { id: '5', name: 'LED Lantern', category: 'Lighting', price: 10, rating: 4.9, reviews: 203, available: true, image: '' },
        { id: '6', name: '2-Person Tent', category: 'Tents', price: 35, rating: 4.7, reviews: 98, available: true, image: '' },
        { id: '7', name: 'Camping Cookware Set', category: 'Cooking', price: 20, rating: 4.6, reviews: 74, available: true, image: '' },
        { id: '8', name: 'Headlamp', category: 'Lighting', price: 8, rating: 4.8, reviews: 145, available: false, image: '' },
    ];

    constructor(private router: Router) { }

    getFilteredGear(): GearItem[] {
        let filtered = [...this.gearItems];

        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query)
            );
        }

        if (this.category) {
            filtered = filtered.filter(item => item.category.toLowerCase() === this.category);
        }

        if (this.availability === 'available') {
            filtered = filtered.filter(item => item.available);
        }

        return filtered;
    }
}
