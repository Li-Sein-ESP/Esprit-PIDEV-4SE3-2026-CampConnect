import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Calendar, Users, MapPin, Star, Wifi, Zap, Droplets, Car, TreePine, Tent, Info, ChevronRight, Filter, Bell, CheckCircle } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { BadgeComponent } from '../../../shared/components/badge.component';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';
import { Campsite, CampsiteService } from '../../../core/services/campsite.service';

interface SearchParams {
  startDate: string;
  endDate: string;
  guests: number;
}

type AvailabilityStatus = 'available' | 'limited' | 'full';

interface DisplayCampsite extends Partial<Campsite> {
  id: string;
  name: string;
  imageUrl: string;
  availability: AvailabilityStatus;
  basePrice: number;
  reviews: number;
  maxCapacity: number;
  terrain: string;
  tags: string[];
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
  readonly Bell = Bell;
  readonly CheckCircle = CheckCircle;

  searchParams = signal<SearchParams>({
    startDate: '',
    endDate: '',
    guests: 2
  });

  isSearching = signal(false);
  showResults = signal(false);
  minDate = new Date().toISOString().split('T')[0];

  // Waitlist State
  joinedWaitlists = signal<string[]>([]);
  showNotification = signal<{ site: any | null }>({ site: null });

  campsites = signal<any[]>([]);

  availabilityConfig: Record<AvailabilityStatus, { label: string; variant: 'success' | 'warning' | 'default'; color: string }> = {
    available: { label: 'Available', variant: 'success', color: 'text-green-600' },
    limited: { label: 'Limited', variant: 'warning', color: 'text-amber-600' },
    full: { label: 'Full', variant: 'default', color: 'text-[var(--color-text-tertiary)]' },
  };

  amenityIcons: Record<string, any> = {
    wifi: Wifi,
    power: Zap,
    water: Droplets,
    parking: Car,
  };

  constructor(private router: Router, private campsiteService: CampsiteService) { }

  get filteredSites(): DisplayCampsite[] {
    return this.campsites().map(site => ({
      ...site,
      imageUrl: site.images?.[0] || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
      availability: (site.available ? 'available' : 'full') as AvailabilityStatus,
      basePrice: site.price,
      reviews: site.reviewCount || 0,
      maxCapacity: site.capacity || 2,
      terrain: 'Campsite',
      tags: site.tags || []
    })).filter(
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

  updateSearchParam(field: keyof SearchParams, value: any) {
    this.searchParams.update(params => ({ ...params, [field]: value }));
  }

  handleSearch() {
    this.isSearching.set(true);
    this.campsiteService.getAllCampsites().subscribe({
      next: (data) => {
        this.campsites.set(data);
        this.isSearching.set(false);
        this.showResults.set(true);
      },
      error: () => {
        this.isSearching.set(false);
      }
    });
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

  reserveSite(site: any) {
    this.router.navigate([`/booking/reserve/${site.id}`], {
      state: {
        campsite: site,
        startDate: this.searchParams().startDate,
        endDate: this.searchParams().endDate
      },
    });
  }

  joinWaitlist(site: any) {
    if (this.isOnWaitlist(site.id)) return;

    this.joinedWaitlists.update(list => [...list, site.id]);

    // Simulate someone canceling 8 seconds later
    setTimeout(() => {
      this.showNotification.set({ site });
    }, 8000);
  }

  isOnWaitlist(siteId: string): boolean {
    return this.joinedWaitlists().includes(siteId);
  }

  dismissNotification() {
    this.showNotification.set({ site: null });
  }

  bookFromWaitlist(site: any) {
    this.dismissNotification();
    this.reserveSite(site);
  }
}
