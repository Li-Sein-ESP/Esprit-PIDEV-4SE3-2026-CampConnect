import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardDescriptionComponent, CardContentComponent } from '../../shared/components/card.component';
import { BadgeComponent } from '../../shared/components/badge.component';
import { DropdownComponent, DropdownOption } from '../../shared/components/dropdown.component';
import { LucideAngularModule, MapPin, Star, DollarSign, Users, Wifi, Flame, Droplet, Search } from 'lucide-angular';

interface Campsite {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  price: number;
  amenities: string[];
  image: string;
  featured: boolean;
}

@Component({
  selector: 'app-campsites',
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
          Discover Campsites
        </h1>
        <p class="text-[var(--color-text-secondary)]">
          Find the perfect spot for your next outdoor adventure
        </p>
      </div>

      <!-- Search & Filters -->
      <div class="bg-white rounded-lg border border-[var(--color-border-light)] p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              Search Location
            </label>
            <div class="relative">
              <div class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]">
                <lucide-icon [img]="SearchIcon" [size]="20"></lucide-icon>
              </div>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                placeholder="Search by name or location..."
                class="w-full px-4 py-2.5 pl-11 rounded-lg min-h-[44px] bg-white border-2 border-[var(--color-border-light)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-100)] transition-all duration-200"
              />
            </div>
          </div>

          <!-- Sort -->
          <div>
            <label class="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              Sort By
            </label>
            <app-dropdown
              [options]="sortOptions"
              [(ngModel)]="sortBy"
              placeholder="Select..."
            ></app-dropdown>
          </div>

          <!-- Price Range -->
          <div>
            <label class="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              Price Range
            </label>
            <app-dropdown
              [options]="priceOptions"
              [(ngModel)]="priceRange"
              placeholder="Any price"
            ></app-dropdown>
          </div>
        </div>
      </div>

      <!-- Results Count -->
      <div class="flex items-center justify-between mb-6">
        <p class="text-[var(--color-text-secondary)]">
          Showing {{ getFilteredCampsites().length }} campsites
        </p>
      </div>

      <!-- Campsites Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <app-card
          *ngFor="let campsite of getFilteredCampsites()"
          variant="default"
          padding="none"
          customClass="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          (click)="viewCampsite(campsite.id)"
        >
          <!-- Image -->
          <div class="h-48 bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-primary-600)] relative">
            <div class="absolute inset-0 flex items-center justify-center">
              <lucide-icon [img]="MapPinIcon" [size]="64" class="text-white/30"></lucide-icon>
            </div>
            <div *ngIf="campsite.featured" class="absolute top-4 left-4">
              <app-badge variant="warning">Featured</app-badge>
            </div>
            <div class="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-1">
              <lucide-icon [img]="StarIcon" [size]="16" class="text-yellow-500"></lucide-icon>
              <span class="font-semibold text-sm">{{ campsite.rating }}</span>
              <span class="text-xs text-[var(--color-text-tertiary)]">({{ campsite.reviews }})</span>
            </div>
          </div>

          <!-- Content -->
          <app-card-content customClass="p-6">
            <h3 class="text-lg font-semibold text-[var(--color-text-heading)] mb-1">
              {{ campsite.name }}
            </h3>
            <div class="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] mb-4">
              <lucide-icon [img]="MapPinIcon" [size]="14"></lucide-icon>
              {{ campsite.location }}
            </div>

            <!-- Amenities -->
            <div class="flex flex-wrap gap-2 mb-4">
              <div *ngFor="let amenity of campsite.amenities.slice(0, 3)" class="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
                <lucide-icon [img]="getAmenityIcon(amenity)" [size]="14"></lucide-icon>
                {{ amenity }}
              </div>
              <span *ngIf="campsite.amenities.length > 3" class="text-xs text-[var(--color-text-tertiary)]">
                +{{ campsite.amenities.length - 3 }} more
              </span>
            </div>

            <!-- Price -->
            <div class="flex items-center justify-between pt-4 border-t border-[var(--color-border-light)]">
              <div class="flex items-center gap-1">
                <lucide-icon [img]="DollarSignIcon" [size]="16" class="text-[var(--color-text-secondary)]"></lucide-icon>
                <span class="text-xl font-bold text-[var(--color-text-heading)]">{{ campsite.price }}</span>
                <span class="text-sm text-[var(--color-text-secondary)]">/night</span>
              </div>
              <button
                (click)="viewCampsite(campsite.id); $event.stopPropagation()"
                class="px-4 py-2 bg-[var(--color-primary-600)] text-white rounded-lg hover:bg-[var(--color-primary-700)] transition-colors text-sm font-medium"
              >
                View Details
              </button>
            </div>
          </app-card-content>
        </app-card>
      </div>

      <!-- Empty State -->
      <div *ngIf="getFilteredCampsites().length === 0" class="text-center py-16">
        <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-[var(--color-neutral-100)] flex items-center justify-center">
          <lucide-icon [img]="MapPinIcon" [size]="48" class="text-[var(--color-text-tertiary)]"></lucide-icon>
        </div>
        <h3 class="text-xl font-semibold text-[var(--color-text-heading)] mb-2">
          No campsites found
        </h3>
        <p class="text-[var(--color-text-secondary)]">
          Try adjusting your search or filters
        </p>
      </div>
    </div>
  `,
  styles: []
})
export class CampsitesComponent {
  MapPinIcon = MapPin;
  StarIcon = Star;
  DollarSignIcon = DollarSign;
  UsersIcon = Users;
  WifiIcon = Wifi;
  FlameIcon = Flame;
  DropletIcon = Droplet;
  SearchIcon = Search;

  searchQuery = '';
  sortBy = 'rating';
  priceRange = '';

  sortOptions: DropdownOption[] = [
    { label: 'Highest Rated', value: 'rating' },
    { label: 'Lowest Price', value: 'price-low' },
    { label: 'Highest Price', value: 'price-high' },
    { label: 'Most Reviews', value: 'reviews' },
  ];

  priceOptions: DropdownOption[] = [
    { label: 'Any Price', value: '' },
    { label: 'Under $50', value: '0-50' },
    { label: '$50 - $100', value: '50-100' },
    { label: '$100 - $150', value: '100-150' },
    { label: 'Over $150', value: '150+' },
  ];

  campsites: Campsite[] = [
    {
      id: '1',
      name: 'Half Dome Village',
      location: 'Yosemite National Park, CA',
      rating: 4.8,
      reviews: 342,
      price: 125,
      amenities: ['WiFi', 'Fire Pit', 'Water', 'Restrooms'],
      image: '',
      featured: true
    },
    {
      id: '2',
      name: 'Mather Campground',
      location: 'Grand Canyon, AZ',
      rating: 4.6,
      reviews: 289,
      price: 85,
      amenities: ['Fire Pit', 'Water', 'Restrooms', 'Showers'],
      image: '',
      featured: false
    },
    {
      id: '3',
      name: 'Madison Campground',
      location: 'Yellowstone National Park, WY',
      rating: 4.7,
      reviews: 215,
      price: 95,
      amenities: ['Fire Pit', 'Water', 'Restrooms'],
      image: '',
      featured: true
    },
    {
      id: '4',
      name: 'Watchman Campground',
      location: 'Zion National Park, UT',
      rating: 4.9,
      reviews: 412,
      price: 110,
      amenities: ['WiFi', 'Fire Pit', 'Water', 'Restrooms', 'Showers'],
      image: '',
      featured: false
    },
    {
      id: '5',
      name: 'Moraine Park',
      location: 'Rocky Mountain National Park, CO',
      rating: 4.5,
      reviews: 178,
      price: 75,
      amenities: ['Fire Pit', 'Water', 'Restrooms'],
      image: '',
      featured: false
    },
    {
      id: '6',
      name: 'Many Glacier',
      location: 'Glacier National Park, MT',
      rating: 4.8,
      reviews: 256,
      price: 105,
      amenities: ['Fire Pit', 'Water', 'Restrooms', 'Showers'],
      image: '',
      featured: true
    }
  ];

  constructor(private router: Router) { }

  getFilteredCampsites(): Campsite[] {
    let filtered = [...this.campsites];

    // Search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.location.toLowerCase().includes(query)
      );
    }

    // Price filter
    if (this.priceRange) {
      filtered = filtered.filter(c => {
        if (this.priceRange === '0-50') return c.price < 50;
        if (this.priceRange === '50-100') return c.price >= 50 && c.price < 100;
        if (this.priceRange === '100-150') return c.price >= 100 && c.price < 150;
        if (this.priceRange === '150+') return c.price >= 150;
        return true;
      });
    }

    // Sort
    if (this.sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (this.sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (this.sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (this.sortBy === 'reviews') {
      filtered.sort((a, b) => b.reviews - a.reviews);
    }

    return filtered;
  }

  getAmenityIcon(amenity: string): any {
    if (amenity.toLowerCase().includes('wifi')) return this.WifiIcon;
    if (amenity.toLowerCase().includes('fire')) return this.FlameIcon;
    if (amenity.toLowerCase().includes('water')) return this.DropletIcon;
    return this.MapPinIcon;
  }

  viewCampsite(id: string): void {
    this.router.navigate(['/campsites', id]);
  }
}
