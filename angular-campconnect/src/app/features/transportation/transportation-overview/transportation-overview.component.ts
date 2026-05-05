import { Component, OnInit, signal, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import {
  LucideAngularModule,
  MapPin, Search, Car, Bus, Train, Bike, Clock,
  Wallet, ChevronRight, Shield, Star, Zap, ArrowRight,
  Users, Globe, TrendingUp
} from 'lucide-angular';
import { TransportationService } from '../services/transportation.service';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';
import { MapService } from '../../safety/services/map.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-transportation-overview',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, LucideAngularModule,
    ButtonComponent, CardComponent, CardContentComponent
  ],
  template: `
    <div class="min-h-screen bg-[#f5f3ea]">

      <!-- ══════════════════════════════════════════════
           HERO BANNER — Premium Billboard
      ══════════════════════════════════════════════ -->
      <section class="relative overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white py-28 px-6">
        <!-- Decorative blobs -->
        <div class="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]"></div>
        <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]"></div>
        <div class="absolute inset-0 opacity-5 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

        <div class="relative max-w-6xl mx-auto text-center space-y-8">
          <!-- Category pill -->
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md text-emerald-300 border border-white/10 rounded-full text-xs font-black uppercase tracking-[0.2em]">
            <lucide-icon [img]="ShieldIcon" [size]="12"></lucide-icon>
            Verified Fleet Registry
          </div>

          <h1 class="text-5xl md:text-7xl font-black leading-none tracking-tighter">
            Transport Your<br/>
            <span class="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Next Mission</span>
          </h1>
          <p class="text-xl text-white/60 max-w-2xl mx-auto font-medium leading-relaxed">
            Every transport option below is curated and verified by our fleet command team. 
            Pick your logistics node and conquer the wilderness.
          </p>

          <!-- Quick Stats -->
          <div class="flex flex-wrap items-center justify-center gap-8 pt-4">
            <div class="text-center">
              <p class="text-3xl font-black text-white">{{ transports().length }}</p>
              <p class="text-xs text-white/50 uppercase tracking-widest font-bold mt-1">Active Nodes</p>
            </div>
            <div class="w-px h-8 bg-white/10"></div>
            <div class="text-center">
              <p class="text-3xl font-black text-white">{{ getModeCount('BUS') }}</p>
              <p class="text-xs text-white/50 uppercase tracking-widest font-bold mt-1">Group Transit</p>
            </div>
            <div class="w-px h-8 bg-white/10"></div>
            <div class="text-center">
              <p class="text-3xl font-black text-white">{{ getModeCount('CAR') }}</p>
              <p class="text-xs text-white/50 uppercase tracking-widest font-bold mt-1">Private Fleet</p>
            </div>
            <div class="w-px h-8 bg-white/10"></div>
            <div class="text-center">
              <p class="text-3xl font-black text-white">100%</p>
              <p class="text-xs text-white/50 uppercase tracking-widest font-bold mt-1">Verified</p>
            </div>
          </div>

          <!-- CTA Scroll Hint -->
          <div class="flex justify-center pt-6">
            <button (click)="scrollToFleet()" class="flex flex-col items-center gap-2 text-white/40 hover:text-white transition-colors">
              <span class="text-xs font-bold uppercase tracking-widest">Browse Fleet</span>
              <div class="w-6 h-10 border-2 border-white/20 rounded-full flex items-center justify-center">
                <div class="w-1.5 h-3 bg-white/40 rounded-full animate-bounce"></div>
              </div>
            </button>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════
           FILTER BAR — Intelligent Category Strip
      ══════════════════════════════════════════════ -->
      <section class="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm">
        <div class="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center gap-4">
          <!-- Mode Filters -->
          <div class="flex items-center gap-2 flex-wrap">
            <button *ngFor="let mode of filterModes"
              (click)="setFilter(mode.key)"
              [class]="activeFilter === mode.key
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
              class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200">
              <lucide-icon [img]="getModeIconObj(mode.key)" [size]="16"></lucide-icon>
              {{ mode.label }}
              <span class="ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-black"
                [class]="activeFilter === mode.key ? 'bg-white/20' : 'bg-slate-200 text-slate-500'">
                {{ getModeCount(mode.key) }}
              </span>
            </button>
          </div>

          <!-- Search box -->
          <div class="md:ml-auto relative">
            <lucide-icon [img]="SearchIcon" [size]="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></lucide-icon>
            <input
              type="text" [(ngModel)]="searchQuery" (input)="onSearch()"
              placeholder="Search provider or mode..."
              class="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm w-64 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all">
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════
           FLEET COMMAND MAP — Creative Visualizer
      ══════════════════════════════════════════════ -->
      <section class="max-w-7xl mx-auto px-6 py-12">
        <div class="relative bg-white rounded-[3rem] shadow-2xl shadow-emerald-900/10 overflow-hidden border border-slate-100">
           <!-- Map Header -->
           <div class="absolute top-6 left-6 z-20 bg-slate-950/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 shadow-2xl">
              <div class="flex items-center gap-3">
                 <div class="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
                 <div>
                    <h4 class="text-white text-sm font-black uppercase tracking-widest leading-none">Fleet Command</h4>
                    <p class="text-emerald-400 text-[10px] font-bold mt-1 uppercase">Live Node Network • Tunisia</p>
                 </div>
              </div>
           </div>

           <!-- Map Container -->
           <div id="transport-fleet-map" class="h-[500px] w-full z-10 transition-all duration-700"></div>

           <!-- Map Footer Stats -->
           <div class="absolute bottom-6 right-6 z-20 flex gap-3">
              <div class="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100">
                 <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Global Coverage</p>
                 <p class="text-xl font-black text-slate-900 mt-1 leading-none">24 Govs</p>
              </div>
              <div class="bg-emerald-600 p-4 rounded-2xl shadow-xl shadow-emerald-200">
                 <lucide-icon [img]="GlobeIcon" class="text-white w-6 h-6"></lucide-icon>
              </div>
           </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════
           FLEET GRID — Main Showcase
      ══════════════════════════════════════════════ -->
      <section id="fleet-grid" class="max-w-7xl mx-auto px-6 py-16 space-y-12">

        <!-- Section Header -->
        <div class="flex items-end justify-between">
          <div>
            <h2 class="text-3xl font-black text-slate-900 tracking-tight">Available Fleet</h2>
            <p class="text-slate-500 mt-1 font-medium">
              {{ filteredTransports().length }} transport node{{ filteredTransports().length !== 1 ? 's' : '' }} ready for deployment
            </p>
          </div>
          <button routerLink="/transportation/options"
            class="hidden md:flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
            View All Options
            <lucide-icon [img]="ArrowRightIcon" [size]="16"></lucide-icon>
          </button>
        </div>

        <!-- Loading skeleton -->
        <div *ngIf="isLoading()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div *ngFor="let i of [1,2,3,4,5,6]"
            class="bg-white rounded-[2rem] h-[480px] animate-pulse border border-slate-100 overflow-hidden">
            <div class="h-56 bg-slate-200"></div>
            <div class="p-8 space-y-4">
              <div class="h-4 bg-slate-100 rounded-full w-2/3"></div>
              <div class="h-3 bg-slate-100 rounded-full w-1/2"></div>
              <div class="h-3 bg-slate-100 rounded-full w-3/4"></div>
            </div>
          </div>
        </div>

        <!-- Transport Cards -->
        <div *ngIf="!isLoading()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div *ngFor="let t of filteredTransports(); let i = index"
            class="group relative bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-lg shadow-slate-200/40 hover:shadow-2xl hover:shadow-emerald-200/50 transition-all duration-500 hover:-translate-y-2 cursor-pointer"
            (click)="goToDetail(t.id)">

            <!-- ── Image Area ── -->
            <div class="relative h-60 overflow-hidden">
              <img
                [src]="t.imageUrl || getDefaultImage(t.mode)"
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />

              <!-- Gradient overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>

              <!-- Mode pill + rating -->
              <div class="absolute top-5 left-5 flex items-center gap-2">
                <span class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-tighter shadow-xl backdrop-blur-sm border border-white/20"
                  [ngClass]="getModeColor(t.mode)">
                  <lucide-icon [img]="getModeIconObj(t.mode)" [size]="12"></lucide-icon>
                  {{ t.mode }}
                </span>
              </div>

              <!-- Price Badge -->
              <div class="absolute top-5 right-5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-xl">
                <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-0.5">Per trip</p>
                <p class="text-base font-black text-slate-900 leading-none">{{ t.cost }} <span class="text-emerald-600 text-[10px]">TND</span></p>
              </div>

              <!-- Provider name over image -->
              <div class="absolute bottom-5 left-5 right-5">
                <h3 class="text-xl font-black text-white leading-tight drop-shadow-md line-clamp-1">
                  {{ t.provider || 'Independent Provider' }}
                </h3>
              </div>
            </div>

            <!-- ── Card Body ── -->
            <div class="p-7 space-y-6">

              <!-- Metrics row -->
              <div class="grid grid-cols-2 gap-3">
                <div class="flex items-center gap-3 bg-slate-50 rounded-2xl p-3.5">
                  <div class="w-9 h-9 rounded-xl bg-white text-emerald-600 flex items-center justify-center shadow-sm flex-shrink-0">
                    <lucide-icon [img]="ClockIcon" [size]="16"></lucide-icon>
                  </div>
                  <div>
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                    <p class="text-sm font-black text-slate-900">{{ t.duration }} min</p>
                  </div>
                </div>
                <div class="flex items-center gap-3 bg-slate-50 rounded-2xl p-3.5">
                  <div class="w-9 h-9 rounded-xl bg-white text-emerald-600 flex items-center justify-center shadow-sm flex-shrink-0">
                    <lucide-icon [img]="WalletIcon" [size]="16"></lucide-icon>
                  </div>
                  <div>
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cost</p>
                    <p class="text-sm font-black text-slate-900">{{ t.cost }} TND</p>
                  </div>
                </div>
              </div>

              <!-- Rating row -->
              <div *ngIf="t.averageRating" class="flex items-center gap-2">
                <div class="flex gap-0.5">
                  <span *ngFor="let s of getStars(t.averageRating)" class="text-amber-400 text-sm">★</span>
                  <span *ngFor="let s of getEmptyStars(t.averageRating)" class="text-slate-200 text-sm">★</span>
                </div>
                <span class="text-xs font-black text-slate-700">{{ t.averageRating | number:'1.1-1' }}</span>
                <span class="text-xs text-slate-400">({{ t.reviewCount || 0 }} reviews)</span>
              </div>

              <!-- CTA Footer -->
              <div class="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                  <div class="flex items-center gap-1.5 mt-1">
                    <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span class="text-xs font-bold text-emerald-600">Available Now</span>
                  </div>
                </div>
                <button (click)="goToDetail(t.id); $event.stopPropagation()"
                  class="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-emerald-600 transition-all hover:shadow-lg hover:shadow-emerald-200 active:scale-95">
                  Details
                  <lucide-icon [img]="ChevronRightIcon" [size]="16"></lucide-icon>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading() && filteredTransports().length === 0"
          class="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
          <div class="p-8 bg-slate-50 rounded-full mb-6">
            <lucide-icon [img]="SearchIcon" [size]="56" class="text-slate-200"></lucide-icon>
          </div>
          <h3 class="text-2xl font-black text-slate-900 mb-3">No Matching Transport Found</h3>
          <p class="text-slate-500 max-w-sm font-medium">Try adjusting your filters or search query.</p>
          <button (click)="resetFilters()" class="mt-8 px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all">
            Clear Filters
          </button>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════
           TRUST STRIP AT BOTTOM
      ══════════════════════════════════════════════ -->
      <section class="max-w-7xl mx-auto px-6 pb-20">
        <div class="bg-gradient-to-r from-slate-900 to-emerald-900 rounded-[2.5rem] p-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-white relative overflow-hidden">
          <div class="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div class="flex items-start gap-5 relative z-10">
            <div class="p-4 bg-emerald-500/20 rounded-2xl flex-shrink-0">
              <lucide-icon [img]="ShieldIcon" [size]="28"></lucide-icon>
            </div>
            <div>
              <h4 class="font-black text-lg mb-2">Admin Verified</h4>
              <p class="text-white/60 text-sm font-medium leading-relaxed">Each transport node is manually approved and maintained by the fleet command team.</p>
            </div>
          </div>
          <div class="flex items-start gap-5 relative z-10">
            <div class="p-4 bg-emerald-500/20 rounded-2xl flex-shrink-0">
              <lucide-icon [img]="ZapIcon" [size]="28"></lucide-icon>
            </div>
            <div>
              <h4 class="font-black text-lg mb-2">Instant Booking</h4>
              <p class="text-white/60 text-sm font-medium leading-relaxed">Link your transport directly to your expedition at the time of trip planning.</p>
            </div>
          </div>
          <div class="flex items-start gap-5 relative z-10">
            <div class="p-4 bg-emerald-500/20 rounded-2xl flex-shrink-0">
              <lucide-icon [img]="GlobeIcon" [size]="28"></lucide-icon>
            </div>
            <div>
              <h4 class="font-black text-lg mb-2">Tunisia-Wide Coverage</h4>
              <p class="text-white/60 text-sm font-medium leading-relaxed">From Tunis to Tataouine, our fleet covers the most demanding wilderness routes.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class TransportationOverviewComponent implements OnInit, AfterViewInit, OnDestroy {
  private map!: L.Map;
  private markers: L.Marker[] = [];

  SearchIcon = Search;
  MapPinIcon = MapPin;
  CarIcon = Car;
  BusIcon = Bus;
  TrainIcon = Train;
  BikeIcon = Bike;
  ClockIcon = Clock;
  WalletIcon = Wallet;
  ChevronRightIcon = ChevronRight;
  ShieldIcon = Shield;
  ZapIcon = Zap;
  ArrowRightIcon = ArrowRight;
  UsersIcon = Users;
  GlobeIcon = Globe;
  StarIcon = Star;
  TrendingUpIcon = TrendingUp;

  transports = signal<any[]>([]);
  filteredTransports = signal<any[]>([]);
  isLoading = signal(true);
  activeFilter = 'ALL';
  searchQuery = '';

  filterModes = [
    { key: 'ALL', label: 'All Modes' },
    { key: 'CAR', label: 'Car' },
    { key: 'BUS', label: 'Bus' },
    { key: 'TRAIN', label: 'Train' },
    { key: 'SHARED_RIDE', label: 'Shared' },
    { key: 'BIKE', label: 'Bike' },
  ];

  constructor(
    private transportService: TransportationService,
    private router: Router,
    private mapService: MapService
  ) { }

  ngOnInit(): void {
    this.transportService.getAllTransports().subscribe({
      next: (data) => {
        this.transports.set(data || []);
        this.filteredTransports.set(data || []);
        this.isLoading.set(false);
        this.updateMapMarkers();
      },
      error: (err) => {
        console.error('Failed to load transports', err);
        this.isLoading.set(false);
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initMap();
    }, 500);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    this.map = this.mapService.initMap('transport-fleet-map', [33.8869, 9.5375], 6);
    this.updateMapMarkers();
  }

  private updateMapMarkers(): void {
    if (!this.map || this.transports().length === 0) return;

    // Clear existing
    this.markers.forEach(m => m.remove());
    this.markers = [];

    // Add some random/simulated markers for Tunisia Govs to show a "network"
    const tunisiaPopulatedPlaces = [
      { lat: 36.8065, lng: 10.1815, name: 'Tunis Hub' },
      { lat: 35.8256, lng: 10.6369, name: 'Sousse Depot' },
      { lat: 34.7406, lng: 10.7603, name: 'Sfax Logistics' },
      { lat: 37.2744, lng: 9.8739, name: 'Bizerte North' },
      { lat: 33.8815, lng: 10.0982, name: 'Gabes Gateway' },
      { lat: 33.9197, lng: 8.1336, name: 'Tozeur Desert Center' }
    ];

    tunisiaPopulatedPlaces.forEach(place => {
      const marker = L.marker([place.lat, place.lng], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `<div class="relative">
                  <div class="absolute -inset-2 bg-emerald-500/20 rounded-full animate-pulse"></div>
                  <div class="w-4 h-4 bg-emerald-600 rounded-full border-2 border-white shadow-lg"></div>
                </div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
      }).addTo(this.map);
      
      marker.bindTooltip(`<b>${place.name}</b><br>Active Fleet Node`, {
        direction: 'top',
        className: 'bg-slate-900 text-white rounded-lg border-none px-3 py-1 text-xs font-bold'
      });
      
      this.markers.push(marker);
    });
  }

  setFilter(mode: string) {
    this.activeFilter = mode;
    this.applyFilters();
  }

  onSearch() {
    this.applyFilters();
  }

  applyFilters() {
    let result = this.transports();
    if (this.activeFilter !== 'ALL') {
      result = result.filter(t => t.mode === this.activeFilter);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(t =>
        (t.provider || '').toLowerCase().includes(q) ||
        (t.mode || '').toLowerCase().includes(q)
      );
    }
    this.filteredTransports.set(result);
  }

  resetFilters() {
    this.activeFilter = 'ALL';
    this.searchQuery = '';
    this.filteredTransports.set(this.transports());
  }

  getModeCount(mode: string): number {
    if (mode === 'ALL') return this.transports().length;
    return this.transports().filter(t => t.mode === mode).length;
  }

  getModeIconObj(mode: string) {
    switch (mode?.toUpperCase()) {
      case 'BUS': return Bus;
      case 'TRAIN': return Train;
      case 'BIKE': return Bike;
      case 'SHARED_RIDE': return Users;
      default: return Car;
    }
  }

  getModeColor(mode: string): string {
    switch (mode?.toUpperCase()) {
      case 'CAR': return 'bg-teal-500/80 text-white';
      case 'BUS': return 'bg-indigo-500/80 text-white';
      case 'TRAIN': return 'bg-amber-500/80 text-white';
      case 'SHARED_RIDE': return 'bg-purple-500/80 text-white';
      case 'BIKE': return 'bg-lime-500/80 text-white';
      default: return 'bg-slate-500/80 text-white';
    }
  }

  getDefaultImage(mode: string): string {
    switch (mode?.toUpperCase()) {
      case 'CAR': return 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80';
      case 'BUS': return 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&q=80';
      case 'TRAIN': return 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&q=80';
      case 'SHARED_RIDE': return 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80';
      case 'BIKE': return 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80';
      default: return 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80';
    }
  }

  getStars(rating: number): number[] {
    return Array(Math.round(rating)).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - Math.round(rating)).fill(0);
  }

  goToDetail(id: string) {
    this.router.navigate(['/transportation/route', id]);
  }

  scrollToFleet() {
    document.getElementById('fleet-grid')?.scrollIntoView({ behavior: 'smooth' });
  }
}
