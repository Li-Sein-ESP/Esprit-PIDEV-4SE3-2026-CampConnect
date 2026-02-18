import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Calendar, Users, MapPin, Star, Wifi, Zap, Droplets, Car, TreePine, Tent, Info, ChevronRight, Filter } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { BadgeComponent } from '../../../shared/components/badge.component';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';

interface Campsite {
  id: string;
  name: string;
  location: string;
  description: string;
  basePrice: number;
  rating: number;
  reviews: number;
  maxCapacity: number;
  availability: 'available' | 'limited' | 'full';
  amenities: string[];
  imageUrl: string;
  terrain: string;
  tags: string[];
}

interface SearchParams {
  startDate: string;
  endDate: string;
  guests: number;
}

@Component({
  selector: 'app-availability-search',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LucideAngularModule,
    ButtonComponent,
    BadgeComponent,
    CardComponent,
    CardContentComponent
  ],
  templateUrl: './availability-search.component.html',
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AvailabilitySearchComponent {
  readonly Search = Search;
  readonly Calendar = Calendar;
  readonly Users = Users;
  readonly MapPin = MapPin;
  readonly Star = Star;
  readonly Wifi = Wifi;
  readonly Zap = Zap;
  readonly Droplets = Droplets;
  readonly Car = Car;
  readonly TreePine = TreePine;
  readonly Tent = Tent;
  readonly Info = Info;
  readonly ChevronRight = ChevronRight;
  readonly Filter = Filter;

  searchParams = signal<SearchParams>({
    startDate: '',
    endDate: '',
    guests: 2
  });

  isSearching = signal(false);
  showResults = signal(false);
  minDate = new Date().toISOString().split('T')[0];

  mockCampsites: Campsite[] = [
    {
      id: 'site-1',
      name: 'Upper Pines Campground',
      location: 'Yosemite National Park, CA',
      description: 'Nestled in the heart of Yosemite Valley with stunning views of Half Dome.',
      basePrice: 35,
      rating: 4.8,
      reviews: 1243,
      maxCapacity: 6,
      availability: 'available',
      amenities: ['wifi', 'power', 'water', 'parking'],
      imageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
      terrain: 'Forest',
      tags: ['Family Friendly', 'Scenic'],
    },
    {
      id: 'site-2',
      name: 'Big Sur Campground',
      location: 'Big Sur, CA',
      description: 'Oceanfront camping with breathtaking Pacific Coast Highway views.',
      basePrice: 45,
      rating: 4.9,
      reviews: 892,
      maxCapacity: 4,
      availability: 'limited',
      amenities: ['water', 'parking'],
      imageUrl: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&q=80',
      terrain: 'Coastal',
      tags: ['Ocean View', 'Romantic'],
    },
    {
      id: 'site-3',
      name: 'Joshua Tree Oasis',
      location: 'Joshua Tree National Park, CA',
      description: 'Desert landscape with unique rock formations and star-filled skies.',
      basePrice: 30,
      rating: 4.7,
      reviews: 657,
      maxCapacity: 8,
      availability: 'available',
      amenities: ['power', 'parking'],
      imageUrl: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&q=80',
      terrain: 'Desert',
      tags: ['Stargazing', 'Photography'],
    },
    {
      id: 'site-4',
      name: 'Sequoia River Camp',
      location: 'Sequoia National Park, CA',
      description: 'Riverside camping among giant sequoia trees with excellent hiking trails.',
      basePrice: 40,
      rating: 4.6,
      reviews: 534,
      maxCapacity: 6,
      availability: 'available',
      amenities: ['wifi', 'water', 'parking'],
      imageUrl: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&q=80',
      terrain: 'Forest',
      tags: ['Hiking', 'Wildlife'],
    },
    {
      id: 'site-5',
      name: 'Lake Tahoe Retreat',
      location: 'Lake Tahoe, CA',
      description: 'Premium lakeside camping with water sports and mountain activities.',
      basePrice: 55,
      rating: 4.9,
      reviews: 1876,
      maxCapacity: 4,
      availability: 'full',
      amenities: ['wifi', 'power', 'water', 'parking'],
      imageUrl: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&q=80',
      terrain: 'Lakeside',
      tags: ['Water Sports', 'Premium'],
    },
  ];

  availabilityConfig = {
    available: { label: 'Available', variant: 'success' as const, color: 'text-green-600' },
    limited: { label: 'Limited', variant: 'warning' as const, color: 'text-amber-600' },
    full: { label: 'Full', variant: 'default' as const, color: 'text-[var(--color-text-tertiary)]' },
  };

  amenityIcons: Record<string, any> = {
    wifi: Wifi,
    power: Zap,
    water: Droplets,
    parking: Car,
  };

  constructor(private router: Router) { }

  get filteredSites(): Campsite[] {
    return this.mockCampsites.filter(
      site => site.maxCapacity >= this.searchParams().guests
    );
  }

  get nights(): number {
    const params = this.searchParams();
    if (!params.startDate || !params.endDate) return 0;

    const start = new Date(params.startDate).getTime();
    const end = new Date(params.endDate).getTime();
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  }

  get minEndDate(): string {
    return this.searchParams().startDate || this.minDate;
  }

  updateSearchParam(field: keyof SearchParams, value: any) {
    this.searchParams.update(params => ({ ...params, [field]: value }));
  }

  handleSearch() {
    const params = this.searchParams();
    if (!params.startDate || !params.endDate) {
      return;
    }

    this.isSearching.set(true);
    // Simulate API call
    setTimeout(() => {
      this.isSearching.set(false);
      this.showResults.set(true);
    }, 1500);
  }

  formatDate(dateString: string, options: Intl.DateTimeFormatOptions): string {
    return new Date(dateString).toLocaleDateString('en-US', options);
  }

  getAmenityIcon(amenity: string): any {
    return this.amenityIcons[amenity];
  }

  getTotalPrice(basePrice: number): number {
    return basePrice * this.nights;
  }

  reserveSite(site: Campsite) {
    this.router.navigate([`/booking/reserve/${site.id}`], {
      state: {
        campsite: site,
        searchParams: this.searchParams(),
        nights: this.nights,
        totalPrice: this.getTotalPrice(site.basePrice),
      },
    });
  }
}
