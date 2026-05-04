import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardDescriptionComponent, CardContentComponent } from '../../shared/components/card.component';
import { BadgeComponent } from '../../shared/components/badge.component';
import { DropdownComponent, DropdownOption } from '../../shared/components/dropdown.component';
import { LucideAngularModule, MapPin, Star, DollarSign, Users, Wifi, Flame, Droplet, Search, Loader2 } from 'lucide-angular';
import { CampsiteService, Campsite } from '../../core/services/campsite.service';

interface CampsiteDisplay {
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
<<<<<<< HEAD
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
=======
    <div class="min-h-screen bg-gray-50 pb-16">
      <!-- Hero Section -->
      <div class="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div class="absolute inset-0">
          <img src="assets/images/camping_hero.png" alt="Camping Landscape" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-gray-50"></div>
        </div>
        
        <div class="relative z-10 text-center px-4 w-full max-w-4xl mx-auto mt-[-80px]">
          <span class="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-medium tracking-wider mb-4 border border-white/30 uppercase shadow-xl">
            Explore the Great Outdoors
          </span>
          <h1 class="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight drop-shadow-xl">
            Find Your Next <br/> <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">Adventure</span>
          </h1>
          <p class="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto font-light drop-shadow-md">
            Discover premium campsites, tailored experiences, and breathtaking locations for your perfect getaway.
          </p>
        </div>
      </div>

      <!-- Floating Search & Filters Bar (Glassmorphism) -->
      <div class="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-[-100px]">
        <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-6 md:p-8">
          <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <!-- Search -->
            <div class="md:col-span-6">
              <label class="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Destination
              </label>
              <div class="relative group">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 transition-colors group-focus-within:text-emerald-600">
                  <lucide-icon [img]="SearchIcon" [size]="22"></lucide-icon>
                </div>
                <input
                  type="text"
                  [(ngModel)]="searchQuery"
                  placeholder="Where do you want to go?"
                  class="w-full px-4 py-4 pl-12 rounded-xl bg-white border-0 ring-1 ring-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 shadow-inner transition-all duration-300 text-lg"
                />
              </div>
            </div>

            <!-- Sort -->
            <div class="md:col-span-3">
              <label class="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Sort By
              </label>
              <app-dropdown
                [options]="sortOptions"
                [(ngModel)]="sortBy"
                placeholder="Select sorting..."
                class="block w-full"
              ></app-dropdown>
            </div>

            <!-- Price Range -->
            <div class="md:col-span-3">
              <label class="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Budget
              </label>
              <app-dropdown
                [options]="priceOptions"
                [(ngModel)]="priceRange"
                placeholder="Any price"
                class="block w-full"
              ></app-dropdown>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        
        <!-- Results Count & Header -->
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-8 border-b border-gray-200 pb-4">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 tracking-tight">Featured Destinations</h2>
            <p class="text-gray-500 mt-1">Showing {{ getFilteredCampsites().length }} exclusive campsites</p>
          </div>
        </div>

        <!-- Campsites Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            *ngFor="let campsite of getFilteredCampsites()"
            class="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col cursor-pointer transform hover:-translate-y-2"
            (click)="viewCampsite(campsite.id)"
          >
            <!-- Image Header -->
            <div class="relative h-64 overflow-hidden bg-gray-200">
              <img 
                *ngIf="campsite.image" 
                [src]="campsite.image" 
                [alt]="campsite.name"
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div *ngIf="!campsite.image" class="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center transition-transform duration-700 group-hover:scale-110">
                <lucide-icon [img]="MapPinIcon" [size]="80" class="text-white/20"></lucide-icon>
              </div>
              
              <!-- Gradient Overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80"></div>
              
              <!-- Badges -->
              <div *ngIf="campsite.featured" class="absolute top-4 left-4">
                <span class="px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg border border-white/20">
                  Premium
                </span>
              </div>
              
              <!-- Floating Rating -->
              <div class="absolute top-4 right-4 bg-white/90 backdrop-blur-md rounded-xl px-3 py-2 flex flex-col items-center shadow-lg">
                <div class="flex items-center gap-1 text-amber-500">
                  <lucide-icon [img]="StarIcon" [size]="14" [class]="'fill-current'"></lucide-icon>
                  <span class="font-extrabold text-sm text-gray-900">{{ campsite.rating }}</span>
                </div>
                <span class="text-[10px] font-medium text-gray-500 uppercase">{{ campsite.reviews }} avis</span>
              </div>
              
              <!-- Location Info on Image -->
              <div class="absolute bottom-4 left-4 right-4">
                <div class="flex items-center gap-1.5 text-white/90 mb-1">
                  <lucide-icon [img]="MapPinIcon" [size]="16" class="text-emerald-400"></lucide-icon>
                  <span class="text-sm font-medium drop-shadow-md">{{ campsite.location }}</span>
                </div>
                <h3 class="text-2xl font-bold text-white drop-shadow-lg leading-tight">{{ campsite.name }}</h3>
              </div>
            </div>

            <!-- Card Body -->
            <div class="p-6 flex-1 flex flex-col">
              
              <!-- Amenities Pills -->
              <div class="flex flex-wrap gap-2 mb-6">
                <div *ngFor="let amenity of campsite.amenities.slice(0, 3)" 
                     class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-semibold border border-gray-100 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                  <lucide-icon [img]="getAmenityIcon(amenity)" [size]="14"></lucide-icon>
                  {{ amenity }}
                </div>
                <div *ngIf="campsite.amenities.length > 3" 
                     class="flex items-center justify-center px-2 py-1.5 bg-gray-50 text-gray-500 rounded-lg text-xs font-semibold border border-gray-100">
                  +{{ campsite.amenities.length - 3 }}
                </div>
              </div>

              <div class="mt-auto"></div>

              <!-- Price & CTA -->
              <div class="flex items-center justify-between pt-5 border-t border-gray-100">
                <div class="flex flex-col">
                  <span class="text-xs text-gray-400 font-medium uppercase tracking-wide">Starting from</span>
                  <div class="flex items-baseline gap-1">
                    <span class="text-2xl font-extrabold text-gray-900">{{ campsite.price }}<span class="text-sm">TND</span></span>
                    <span class="text-sm text-gray-500 font-medium">/ night</span>
                  </div>
                </div>
                <button
                  (click)="viewCampsite(campsite.id); $event.stopPropagation()"
                  class="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-emerald-600 text-white rounded-xl transition-colors font-semibold shadow-md hover:shadow-xl transform hover:-translate-y-0.5 duration-200"
                >
                  Book Now
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="getFilteredCampsites().length === 0" class="flex flex-col items-center justify-center py-24 px-4 text-center bg-white rounded-3xl shadow-sm border border-gray-100">
          <div class="w-24 h-24 mb-6 rounded-full bg-emerald-50 flex items-center justify-center">
            <lucide-icon [img]="MapPinIcon" [size]="40" class="text-emerald-500"></lucide-icon>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-2">No campsites found</h3>
          <p class="text-gray-500 max-w-md mx-auto mb-8">
            We couldn't find any campsites matching your current filters. Try adjusting your destination or budget.
          </p>
          <button (click)="searchQuery = ''; priceRange = ''; sortBy = 'rating'" class="px-6 py-3 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-bold rounded-xl transition-colors">
            Clear all filters
          </button>
        </div>
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
      </div>
    </div>
  `,
  styles: []
})
export class CampsitesComponent implements OnInit {
  MapPinIcon = MapPin;
  StarIcon = Star;
  DollarSignIcon = DollarSign;
  UsersIcon = Users;
  WifiIcon = Wifi;
  FlameIcon = Flame;
  DropletIcon = Droplet;
  SearchIcon = Search;
  LoaderIcon = Loader2;

  searchQuery = '';
  sortBy = 'rating';
  priceRange = '';
  isLoading = true;
  error: string | null = null;

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

  campsites: CampsiteDisplay[] = [];

  constructor(
    private router: Router,
    private campsiteService: CampsiteService
  ) { }

  ngOnInit(): void {
    this.loadCampsites();
  }

  loadCampsites(): void {
    this.isLoading = true;
    this.error = null;
    
    this.campsiteService.getAllCampsites().subscribe({
      next: (data) => {
        this.campsites = data.map(campsite => this.mapToDisplay(campsite));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading campsites:', err);
        this.error = 'Failed to load campsites. Showing sample data.';
        this.campsites = this.getFallbackCampsites();
        this.isLoading = false;
      }
    });
  }

  private mapToDisplay(campsite: Campsite): CampsiteDisplay {
    return {
      id: campsite.id,
      name: campsite.name,
      location: campsite.location,
      rating: campsite.rating || 0,
      reviews: campsite.reviewCount || 0,
      price: campsite.price,
      amenities: campsite.amenities || [],
<<<<<<< HEAD
      image: campsite.images?.[0] || '',
=======
      image: campsite.images?.[0]
        ? (campsite.images[0].startsWith('data:') || campsite.images[0].startsWith('http')
            ? campsite.images[0]
            : 'http://localhost:8090' + campsite.images[0])
        : '',
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
      featured: campsite.rating >= 4.7
    };
  }

  private getFallbackCampsites(): CampsiteDisplay[] {
    return [
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
      }
    ];
  }

  getFilteredCampsites(): CampsiteDisplay[] {
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
