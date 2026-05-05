import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardComponent, CardContentComponent } from '../../shared/components/card.component';
import { BadgeComponent } from '../../shared/components/badge.component';
import { DropdownComponent, DropdownOption } from '../../shared/components/dropdown.component';
import { LucideAngularModule, ShoppingBag, DollarSign, Search } from 'lucide-angular';
import { GearApiService } from './services/gear-api.service';
import { GearResponse } from './models/gear.model';

interface GearItem {
    id: string;
    name: string;
    category: string;
    price: number;
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

      <!-- Loading -->
      <div *ngIf="loading" class="text-center py-16 text-[var(--color-text-secondary)]">
        <div class="w-10 h-10 border-4 border-[var(--color-primary-600)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p>Loading gear...</p>
      </div>

      <!-- Error -->
      <div *ngIf="!loading && error" class="text-center py-16">
        <p class="text-red-500 mb-4">{{ error }}</p>
        <button (click)="loadGear()" class="px-4 py-2 bg-[var(--color-primary-600)] text-white rounded-lg">Try Again</button>
      </div>

      <!-- Results -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" *ngIf="!loading && !error">
        <app-card
          *ngFor="let item of getFilteredGear()"
          variant="default"
          padding="none"
          customClass="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          [routerLink]="['/gear', item.id]"
        >
          <!-- Image -->
          <div class="h-48 relative overflow-hidden bg-[var(--color-neutral-100)]">
            <img *ngIf="item.image" [src]="item.image" [alt]="item.name" class="w-full h-full object-cover" />
            <div *ngIf="!item.image" class="w-full h-full bg-gradient-to-br from-[var(--color-accent-400)] to-[var(--color-accent-600)] flex items-center justify-center">
              <lucide-icon [img]="ShoppingBagIcon" [size]="64" class="text-white/30"></lucide-icon>
            </div>
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

            <!-- Price -->
            <div class="flex items-center justify-between pt-3 border-t border-[var(--color-border-light)]">
              <div class="flex items-center gap-1">
                <lucide-icon [img]="DollarSignIcon" [size]="16" class="text-[var(--color-text-secondary)]"></lucide-icon>
                <span class="text-lg font-bold text-[var(--color-text-heading)]">{{ item.price }}</span>
                <span class="text-xs text-[var(--color-text-secondary)]">/day</span>
              </div>
              <button
                [disabled]="!item.available"
                [routerLink]="['/gear', item.id]"
                (click)="$event.stopPropagation()"
                class="px-3 py-1.5 bg-[var(--color-primary-600)] text-white rounded-lg hover:bg-[var(--color-primary-700)] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ item.available ? 'Rent' : 'Unavailable' }}
              </button>
            </div>
          </app-card-content>
        </app-card>
      </div>
    </div>
  `,
    styles: []
})
export class GearComponent implements OnInit {
    ShoppingBagIcon = ShoppingBag;
    DollarSignIcon = DollarSign;
    SearchIcon = Search;

    searchQuery = '';
    category = '';
    availability = '';
    loading = true;
    error: string | null = null;

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

    gearItems: GearItem[] = [];

    constructor(private router: Router, private gearApi: GearApiService) { }

    ngOnInit(): void {
        this.loadGear();
    }

    loadGear(): void {
        this.loading = true;
        this.error = null;
        this.gearApi.getGear({ page: 0, size: 24 }).subscribe({
            next: (page) => {
                this.gearItems = page.content.map((g: GearResponse) => ({
                    id: g.id,
                    name: g.name,
                    category: g.category,
                    price: g.price,
                    available: g.status === 'AVAILABLE' && g.quantity > 0,
                    image: g.images?.[0]?.imageUrl || ''
                }));
                this.loading = false;
            },
            error: () => {
                this.error = 'Failed to load gear items. Please try again.';
                this.loading = false;
            }
        });
    }

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
