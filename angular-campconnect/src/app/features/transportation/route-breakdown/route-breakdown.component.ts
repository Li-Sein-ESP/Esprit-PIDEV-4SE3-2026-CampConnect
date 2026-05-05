import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  MapPin, Clock, Navigation, Car, Bus, Train, Bike,
  ChevronLeft, Wallet, Users, Shield, Star, CheckCircle,
  ArrowRight, Zap, Calendar
} from 'lucide-angular';
import { TransportationService } from '../services/transportation.service';

@Component({
  selector: 'app-route-breakdown',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-slate-50">

      <!-- Back Nav -->
      <div class="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4">
        <div class="max-w-6xl mx-auto flex items-center gap-4">
          <button (click)="router.navigate(['/transportation'])"
            class="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm transition-colors group">
            <lucide-icon [img]="ChevronLeftIcon" [size]="20" class="group-hover:-translate-x-1 transition-transform"></lucide-icon>
            Back to Fleet
          </button>
          <div class="w-px h-5 bg-slate-200"></div>
          <span class="text-slate-400 text-sm font-medium">Transport Detail</span>
        </div>
      </div>

      <!-- Loading Skeleton -->
      <div *ngIf="isLoading()" class="max-w-6xl mx-auto px-6 py-16 space-y-8">
        <div class="h-72 bg-white rounded-[2.5rem] animate-pulse border border-slate-100"></div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 h-96 bg-white rounded-[2.5rem] animate-pulse border border-slate-100"></div>
          <div class="h-96 bg-white rounded-[2.5rem] animate-pulse border border-slate-100"></div>
        </div>
      </div>

      <!-- Transport Not Found -->
      <div *ngIf="!isLoading() && !transport()" class="max-w-6xl mx-auto px-6 py-32 flex flex-col items-center text-center">
        <div class="p-8 bg-slate-100 rounded-full mb-8">
          <lucide-icon [img]="NavigationIcon" [size]="56" class="text-slate-300"></lucide-icon>
        </div>
        <h2 class="text-3xl font-black text-slate-900 mb-4">Transport Not Found</h2>
        <p class="text-slate-500 max-w-sm mb-8 font-medium">This transport node may have been decommissioned or relocated from the active fleet registry.</p>
        <button (click)="router.navigate(['/transportation'])"
          class="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all">
          Browse Available Fleet
        </button>
      </div>

      <!-- Transport Detail Content -->
      <div *ngIf="!isLoading() && transport()" class="max-w-6xl mx-auto px-6 py-12 space-y-10">

        <!-- ─── Hero Image Banner ─── -->
        <div class="relative h-80 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-300/50">
          <img [src]="transport()!.imageUrl || getDefaultImage(transport()!.mode)"
               class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

          <!-- Mode badge -->
          <div class="absolute top-8 left-8">
            <span class="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-black uppercase tracking-tight shadow-xl backdrop-blur-md border border-white/20"
              [ngClass]="getModeColor(transport()!.mode)">
              <lucide-icon [img]="getModeIconObj(transport()!.mode)" [size]="16"></lucide-icon>
              {{ transport()!.mode }}
            </span>
          </div>

          <!-- Key Stats Overlay -->
          <div class="absolute bottom-8 left-8 right-8 flex flex-col md:flex-row items-end md:items-center justify-between gap-4">
            <div>
              <h1 class="text-4xl font-black text-white leading-tight drop-shadow-xl">
                {{ transport()!.provider || 'Independent Provider' }}
              </h1>
              <div class="flex items-center gap-3 mt-2" *ngIf="transport()!.averageRating">
                <div class="flex gap-0.5">
                  <span *ngFor="let s of getStars(transport()!.averageRating)" class="text-amber-400 text-base">★</span>
                  <span *ngFor="let s of getEmptyStars(transport()!.averageRating)" class="text-white/30 text-base">★</span>
                </div>
                <span class="text-white/80 text-sm font-bold">{{ transport()!.averageRating | number:'1.1-1' }} ({{ transport()!.reviewCount }} reviews)</span>
              </div>
            </div>
            <div class="bg-white/95 backdrop-blur-md px-6 py-4 rounded-2xl shadow-2xl text-right">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mission Quote</p>
              <p class="text-3xl font-black text-slate-900 mt-1">{{ transport()!.cost }} <span class="text-emerald-600 text-sm">TND</span></p>
            </div>
          </div>
        </div>

        <!-- ─── Main Grid: Details + Booking ─── -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <!-- LEFT: Intel Breakdown -->
          <div class="lg:col-span-2 space-y-8">

            <!-- Core Specs -->
            <div class="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
              <h2 class="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <div class="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                  <lucide-icon [img]="ZapIcon" [size]="16" class="text-slate-600"></lucide-icon>
                </div>
                Transport Specifications
              </h2>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-slate-50 rounded-2xl p-5 text-center border border-slate-100">
                  <div class="w-10 h-10 rounded-xl bg-white flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <lucide-icon [img]="ClockIcon" [size]="20" class="text-emerald-600"></lucide-icon>
                  </div>
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                  <p class="text-xl font-black text-slate-900 mt-1">{{ transport()!.duration }}</p>
                  <p class="text-xs text-slate-400 font-medium">minutes</p>
                </div>
                <div class="bg-slate-50 rounded-2xl p-5 text-center border border-slate-100">
                  <div class="w-10 h-10 rounded-xl bg-white flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <lucide-icon [img]="WalletIcon" [size]="20" class="text-emerald-600"></lucide-icon>
                  </div>
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cost</p>
                  <p class="text-xl font-black text-slate-900 mt-1">{{ transport()!.cost }}</p>
                  <p class="text-xs text-slate-400 font-medium">TND</p>
                </div>
                <div class="bg-slate-50 rounded-2xl p-5 text-center border border-slate-100">
                  <div class="w-10 h-10 rounded-xl bg-white flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <lucide-icon [img]="CarIcon" [size]="20" class="text-emerald-600"></lucide-icon>
                  </div>
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mode</p>
                  <p class="text-base font-black text-slate-900 mt-1">{{ transport()!.mode }}</p>
                  <p class="text-xs text-slate-400 font-medium">transit type</p>
                </div>
                <div class="bg-slate-50 rounded-2xl p-5 text-center border border-slate-100">
                  <div class="w-10 h-10 rounded-xl bg-white flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <lucide-icon [img]="ShieldIcon" [size]="20" class="text-emerald-600"></lucide-icon>
                  </div>
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                  <p class="text-base font-black text-emerald-600 mt-1">Active</p>
                  <p class="text-xs text-slate-400 font-medium">available</p>
                </div>
              </div>
            </div>

            <!-- Route Stages -->
            <div class="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
              <h2 class="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <div class="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                  <lucide-icon [img]="NavigationIcon" [size]="16" class="text-slate-600"></lucide-icon>
                </div>
                Journey Stages
              </h2>
              <div class="space-y-0">
                <div *ngFor="let stage of journeyStages; let last = last" class="flex gap-5">
                  <!-- Indicator column -->
                  <div class="flex flex-col items-center">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
                      [ngClass]="stage.type === 'start' ? 'bg-emerald-500 text-white' : stage.type === 'end' ? 'bg-slate-900 text-white' : 'bg-white border-2 border-slate-200 text-slate-400'">
                      <lucide-icon [img]="stage.type === 'start' ? MapPinIcon : stage.type === 'end' ? CheckCircleIcon : NavigationIcon" [size]="16"></lucide-icon>
                    </div>
                    <div *ngIf="!last" class="w-px flex-1 bg-slate-100 my-1.5"></div>
                  </div>
                  <!-- Content -->
                  <div class="pb-8 flex-1">
                    <div class="flex items-center justify-between">
                      <h4 class="font-black text-slate-900">{{ stage.title }}</h4>
                      <span class="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full">{{ stage.duration }}</span>
                    </div>
                    <p class="text-sm text-slate-500 font-medium mt-1">{{ stage.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT: Booking Card -->
          <div class="space-y-6">

            <!-- Booking Panel -->
            <div class="bg-slate-900 rounded-[2rem] p-8 text-white sticky top-24 overflow-hidden relative">
              <!-- Decorative glow -->
              <div class="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl"></div>

              <h3 class="text-xl font-black mb-2 relative z-10">Reserve This Node</h3>
              <p class="text-white/50 text-sm font-medium mb-8 relative z-10">Link this transport to your next expedition</p>

              <!-- Price display -->
              <div class="bg-white/10 rounded-2xl p-5 mb-6 backdrop-blur-sm relative z-10">
                <p class="text-white/60 text-xs font-black uppercase tracking-widest">Total Cost</p>
                <p class="text-4xl font-black mt-2">{{ transport()!.cost }} <span class="text-emerald-400 text-sm">TND</span></p>
              </div>

              <!-- Feature list -->
              <ul class="space-y-3 mb-8 relative z-10">
                <li class="flex items-center gap-3 text-sm font-medium text-white/70">
                  <lucide-icon [img]="CheckCircleIcon" [size]="16" class="text-emerald-400 flex-shrink-0"></lucide-icon>
                  Admin-verified transport node
                </li>
                <li class="flex items-center gap-3 text-sm font-medium text-white/70">
                  <lucide-icon [img]="CheckCircleIcon" [size]="16" class="text-emerald-400 flex-shrink-0"></lucide-icon>
                  Linkable to any active trip
                </li>
                <li class="flex items-center gap-3 text-sm font-medium text-white/70">
                  <lucide-icon [img]="CheckCircleIcon" [size]="16" class="text-emerald-400 flex-shrink-0"></lucide-icon>
                  Real-time availability status
                </li>
              </ul>

              <!-- CTA -->
              <button (click)="planWithTransport()"
                class="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-base hover:bg-emerald-400 transition-all active:scale-95 flex items-center justify-center gap-3 relative z-10 shadow-xl shadow-emerald-500/30">
                Plan a Trip with This
                <lucide-icon [img]="ArrowRightIcon" [size]="20"></lucide-icon>
              </button>
              <button (click)="router.navigate(['/transportation'])"
                class="w-full mt-3 py-3.5 bg-white/10 text-white/80 rounded-2xl font-bold text-sm hover:bg-white/20 transition-all active:scale-95 relative z-10">
                Browse Other Options
              </button>
            </div>

            <!-- Ref Card -->
            <div class="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Node Reference</p>
              <p class="font-mono text-xs text-slate-500 bg-slate-50 p-3 rounded-xl break-all">
                {{ transport()!.id }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class RouteBreakdownComponent implements OnInit {
  MapPinIcon = MapPin;
  ClockIcon = Clock;
  NavigationIcon = Navigation;
  CarIcon = Car;
  BusIcon = Bus;
  TrainIcon = Train;
  BikeIcon = Bike;
  ChevronLeftIcon = ChevronLeft;
  WalletIcon = Wallet;
  UsersIcon = Users;
  ShieldIcon = Shield;
  StarIcon = Star;
  CheckCircleIcon = CheckCircle;
  ArrowRightIcon = ArrowRight;
  ZapIcon = Zap;
  CalendarIcon = Calendar;

  transport = signal<any>(null);
  isLoading = signal(true);

  journeyStages = [
    { title: 'Departure Point', duration: '0 min', description: 'Passengers board at the agreed pickup zone.', type: 'start' },
    { title: 'Route In Progress', duration: 'Ongoing', description: 'Vehicle traverses the planned expedition route.', type: 'transit' },
    { title: 'Arrival at Destination', duration: 'ETA varies', description: 'Safe arrival at the wilderness destination.', type: 'end' },
  ];

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private transportService: TransportationService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('optionId');
    if (id) {
      this.transportService.getAllTransports().subscribe({
        next: (data) => {
          const found = (data || []).find((t: any) => t.id === id);
          this.transport.set(found || null);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
    } else {
      this.isLoading.set(false);
    }
  }

  getModeIconObj(mode: string) {
    switch (mode?.toUpperCase()) {
      case 'BUS': return Bus;
      case 'TRAIN': return Train;
      case 'BIKE': return Bike;
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
      case 'CAR': return 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&q=80';
      case 'BUS': return 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1200&q=80';
      case 'TRAIN': return 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1200&q=80';
      case 'BIKE': return 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=1200&q=80';
      default: return 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80';
    }
  }

  getStars(rating: number): number[] {
    return Array(Math.round(rating)).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - Math.round(rating)).fill(0);
  }

  planWithTransport(): void {
    this.router.navigate(['/plan-trip'], {
      queryParams: { transportId: this.transport()?.id }
    });
  }
}
