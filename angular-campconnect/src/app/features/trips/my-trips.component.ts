<<<<<<< HEAD
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CardComponent, CardContentComponent, CardFooterComponent } from '../../shared/components/card.component';
import { BadgeComponent } from '../../shared/components/badge.component';
import { LucideAngularModule, Calendar, MapPin, Users, Plus, Edit, Trash2 } from 'lucide-angular';
import { TripService } from './services/trip.service';
=======
import { Component, OnInit, signal, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Subject, takeUntil } from "rxjs";
import { Router, RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import {
  CardComponent,
  CardContentComponent,
  CardFooterComponent,
} from "../../shared/components/card.component";
import { BadgeComponent } from "../../shared/components/badge.component";
import {
  LucideAngularModule,
  Calendar,
  MapPin,
  Users,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  Search,
  Award
} from "lucide-angular";
import { TripService } from "./services/trip.service";
import { AuthService } from "../../core/services/auth.service";
import { TransportationService } from "../transportation/services/transportation.service";
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)

interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  groupSize: number;
<<<<<<< HEAD
  status: 'planning' | 'confirmed' | 'completed' | 'cancelled';
}

@Component({
  selector: 'app-my-trips',
=======
  status: "planning" | "upcoming" | "active" | "completed" | "cancelled";
  imageUrl?: string;
  template?: boolean;
}

@Component({
  selector: "app-my-trips",
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardComponent,
    CardContentComponent,
    CardFooterComponent,
    BadgeComponent,
<<<<<<< HEAD
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
        (click)="router.navigate(['/trip-intents/create'])"
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
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <app-badge [variant]="getStatusVariant(trip.status)">
              {{ trip.status }}
            </app-badge>
          </div>
        </div>

        <!-- Trip Details -->
        <app-card-content customClass="p-6">
          <h3 class="text-xl font-semibold text-[var(--color-text-heading)] mb-2">
            {{ trip.name }}
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
            <div class="flex items-center gap-2">
              <lucide-icon [img]="UsersIcon" [size]="16"></lucide-icon>
              {{ trip.groupSize }} {{ trip.groupSize === 1 ? 'person' : 'people' }}
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

    <!-- Empty State -->
    <div *ngIf="getFilteredTrips().length === 0" class="text-center py-16">
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
        (click)="router.navigate(['/trip-intents/create'])"
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
export class MyTripsComponent {
=======
    FormsModule,
    LucideAngularModule,
  ],
  template: `
    <div class="min-h-screen bg-[var(--color-neutral-50)]">
      <!-- Immersive Cinematic Hero -->
      <section class="relative h-[45vh] min-h-[400px] flex items-center overflow-hidden">
        <div class="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1533873984035-25970ab07461?auto=format&fit=crop&q=80" 
               class="w-full h-full object-cover scale-105" alt="Adventure Background" />
          <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[var(--color-neutral-50)]"></div>
          <!-- Animated Particles / Overlay -->
          <div class="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        </div>

        <div class="container relative z-10 px-6">
          <div class="max-w-3xl animate-in fade-in slide-in-from-left-8 duration-1000">
            <div class="flex items-center gap-3 mb-6">
              <span class="px-4 py-1.5 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-widest">
                Expedition Hub
              </span>
              <div class="h-[1px] w-12 bg-emerald-500/50"></div>
            </div>
            
            <h1 class="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter leading-none">
              My <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">Adventures</span>
            </h1>
            
            <p class="text-xl text-white/80 max-w-xl font-medium leading-relaxed mb-10 border-l-4 border-emerald-500 pl-6">
              Track your telemetry, monitor active routes, and archive your greatest wilderness breakthroughs.
            </p>

            <div class="flex flex-wrap gap-4">
              <button (click)="router.navigate(['/plan-trip'])" 
                      class="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-lg shadow-2xl shadow-emerald-900/40 transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
                <lucide-icon [img]="PlusIcon" [size]="20"></lucide-icon>
                Launch New Mission
              </button>
            </div>
          </div>
        </div>
        
        <div class="absolute bottom-12 right-12 hidden lg:flex gap-6 animate-in fade-in slide-in-from-right-8 duration-1000">
          <!-- Travel Analytics -->
          <div *ngFor="let stat of difficultyStats().slice(0, 1)" class="p-6 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl min-w-[180px]">
            <p class="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Top Intensity</p>
            <p class="text-3xl font-black text-white">{{ stat._id || 'Unknown' }}</p>
          </div>
          <!-- Transport Popularity (Task 2) -->
          <div *ngFor="let pop of popularityStats().slice(0, 1)" class="p-6 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl min-w-[180px]">
            <p class="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-1">Most Used Mode</p>
            <p class="text-3xl font-black text-white">{{ pop._id }}</p>
            <p class="text-[10px] text-white/40 uppercase font-black">{{ pop.usageCount }} bookings</p>
          </div>
        </div>
      </section>

      <div class="container px-6 -mt-10 relative z-20 pb-24">
        <!-- Smart Filter & Search Bar -->
        <div class="bg-white/70 backdrop-blur-2xl p-4 rounded-[32px] border border-white shadow-2xl shadow-black/5 flex flex-col lg:flex-row items-center gap-4 mb-12">
          <!-- Advanced Tabs -->
          <div class="flex p-2 bg-[var(--color-neutral-100)] rounded-[24px] w-full lg:w-fit overflow-x-auto no-scrollbar">
            <button *ngFor="let tab of tabs" (click)="setActiveTab(tab.value)" 
                    class="whitespace-nowrap px-6 py-3 rounded-[18px] text-sm font-bold transition-all duration-300 flex items-center gap-2"
                    [ngClass]="activeTab === tab.value ? 'bg-white text-emerald-700 shadow-xl shadow-black/5 scale-100' : 'text-slate-500 hover:text-emerald-600 hover:bg-white/50'">
              {{ tab.label }}
            </button>
          </div>

          <!-- Creative Search -->
          <div class="relative w-full lg:flex-1 h-16 group">
            <div class="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <lucide-icon [img]="SearchIcon" [size]="18" class="text-slate-400 group-focus-within:text-emerald-500 transition-colors"></lucide-icon>
            </div>
            <input type="text" [(ngModel)]="searchQuery" (keyup.enter)="performSearch()" 
                   placeholder="Search missions by destination or title..." 
                   class="w-full h-full pl-16 pr-6 bg-[var(--color-neutral-50)] border-2 border-transparent focus:bg-white focus:border-emerald-500/30 rounded-[24px] text-sm font-bold transition-all outline-none" />
            
            <button (click)="performSearch()" class="absolute right-3 top-3 bottom-3 px-6 bg-slate-900 text-white rounded-[18px] text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95">
              Execute
            </button>
          </div>
          
          <!-- Advanced Criteria Toggle (Task 3) -->
          <div class="flex gap-2">
            <select [(ngModel)]="selectedDifficulty" class="px-4 py-2 bg-slate-50 border-2 border-transparent rounded-xl text-xs font-bold outline-none focus:border-emerald-500/20">
              <option value="">All Difficulty</option>
              <option value="EASY">Easy</option>
              <option value="MODERATE">Moderate</option>
              <option value="HARD">Hard</option>
            </select>
            <button (click)="performAdvancedSearch()" class="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all">
                Deep Scan
            </button>
          </div>
        </div>

        <!-- Trips Grid: Creative Card Layout -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
          <div *ngFor="let trip of getFilteredTrips()" 
               class="group relative bg-white rounded-[40px] p-4 border border-[var(--color-neutral-100)] shadow-xl hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-4">
            
            <!-- Image Core -->
            <div class="relative h-64 rounded-[32px] overflow-hidden mb-6">
              <img [src]="trip.imageUrl || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80'" 
                   class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
              
              <!-- Badges -->
              <div class="absolute top-4 left-4 flex flex-col gap-2">
                <span class="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest">
                  {{ trip.status }}
                </span>
                <span *ngIf="trip.template" class="px-3 py-1.5 rounded-xl bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest">
                  Blueprint
                </span>
              </div>

              <!-- Quick Action Overlay -->
              <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/40 backdrop-blur-[2px]">
                <button (click)="viewTrip(trip.id)" class="px-6 py-3 bg-white text-slate-900 rounded-full font-black text-sm hover:scale-105 active:scale-95 transition-all">
                  Open Mission
                </button>
              </div>
            </div>

            <!-- Content -->
            <div class="px-4 pb-4">
              <div class="flex items-center gap-2 mb-2">
                <lucide-icon [img]="MapPinIcon" [size]="12" class="text-emerald-500"></lucide-icon>
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ trip.destination }}</span>
              </div>
              
              <h3 class="text-xl font-black text-slate-900 mb-6 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                {{ trip.name }}
              </h3>

              <!-- Telemetry Grid -->
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="p-4 rounded-3xl bg-[var(--color-neutral-50)] border border-[var(--color-neutral-100)] flex flex-col">
                  <span class="text-[10px] font-bold text-slate-400 uppercase mb-1">Schedule</span>
                  <div class="flex items-center gap-2 text-xs font-black text-slate-700">
                    <lucide-icon [img]="CalendarIcon" [size]="14" class="text-emerald-600"></lucide-icon>
                    {{ formatDate(trip.startDate) }}
                  </div>
                </div>
                <div class="p-4 rounded-3xl bg-[var(--color-neutral-50)] border border-[var(--color-neutral-100)] flex flex-col">
                  <span class="text-[10px] font-bold text-slate-400 uppercase mb-1">Squad</span>
                  <div class="flex items-center gap-2 text-xs font-black text-slate-700">
                    <lucide-icon [img]="UsersIcon" [size]="14" class="text-emerald-600"></lucide-icon>
                    {{ trip.groupSize }} Members
                  </div>
                </div>
              </div>

              <!-- Footer Actions (Hidden for History) -->
              <div class="flex gap-2" *ngIf="activeTab !== 'completed'">
                <button (click)="editTrip(trip.id)" class="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                  <lucide-icon [img]="EditIcon" [size]="16"></lucide-icon>
                </button>
                <button (click)="deleteTrip(trip.id)" class="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all">
                  <lucide-icon [img]="Trash2Icon" [size]="16"></lucide-icon>
                </button>
              </div>
              <div *ngIf="activeTab === 'completed'" class="flex items-center gap-2 py-3 px-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <lucide-icon [img]="AwardIcon" [size]="14" class="text-amber-500"></lucide-icon>
                  <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Achieved Mission Archive</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="getFilteredTrips().length === 0" 
             class="flex flex-col items-center justify-center py-32 text-center bg-white rounded-[48px] border-2 border-dashed border-slate-200 mt-8 group">
          <div class="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <lucide-icon [img]="SearchIcon" [size]="48" class="text-slate-200"></lucide-icon>
          </div>
          <h3 class="text-3xl font-black text-slate-900 mb-2">No missions detected</h3>
          <p class="text-slate-500 mb-4 max-w-sm font-medium">Your expedition logs are currently empty for this sector.</p>
          <div class="mb-10 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Tactical ID</p>
            <code class="text-xs font-mono text-emerald-600 font-bold">{{ currentSessionId || 'NO_SESSION' }}</code>
          </div>
          <button (click)="searchQuery = ''; setActiveTab('all'); loadUserTrips()" class="px-8 py-3 bg-slate-900 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all">
            Re-Sync Sensors
          </button>
        </div>
      </div>

      <!-- Floating Interaction Hub -->
      <div class="fixed bottom-10 right-10 z-50 flex flex-col gap-4">
        <button (click)="router.navigate(['/plan-trip'])" 
                class="w-16 h-16 bg-emerald-600 text-white rounded-[24px] shadow-2xl shadow-emerald-900/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all group overflow-hidden relative">
          <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
          <lucide-icon [img]="PlusIcon" [size]="32" class="relative z-10"></lucide-icon>
        </button>
      </div>
    </div>
  `,
  styles: [],
})
export class MyTripsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
  CalendarIcon = Calendar;
  MapPinIcon = MapPin;
  UsersIcon = Users;
  PlusIcon = Plus;
  EditIcon = Edit;
  Trash2Icon = Trash2;
<<<<<<< HEAD

  activeTab: string = 'all';

  tabs = [
    { label: 'All Trips', value: 'all' },
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'Completed', value: 'completed' },
  ];

  get trips(): Trip[] {
    return this.tripService.trips().map(t => ({
      ...t,
      groupSize: (t as any).participants || (t as any).groupSize || 1
    })) as unknown as Trip[];
  }

  constructor(public router: Router, private tripService: TripService) { }

  getTabClasses(tabValue: string): string {
    const baseClasses = 'px-4 py-2 font-medium transition-colors';
    const activeClasses = 'text-[var(--color-primary-600)] border-b-2 border-[var(--color-primary-600)]';
    const inactiveClasses = 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]';

    return `${baseClasses} ${this.activeTab === tabValue ? activeClasses : inactiveClasses}`;
  }

  getFilteredTrips(): Trip[] {
    if (this.activeTab === 'all') {
      return this.trips;
    } else if (this.activeTab === 'upcoming') {
      return this.trips.filter(t => t.status === 'confirmed' || t.status === 'planning');
    } else if (this.activeTab === 'completed') {
      return this.trips.filter(t => t.status === 'completed');
    }
    return this.trips;
  }

  getStatusVariant(status: string): 'success' | 'warning' | 'info' | 'default' {
    switch (status) {
      case 'confirmed': return 'success';
      case 'planning': return 'warning';
      case 'completed': return 'info';
      default: return 'default';
    }
=======
  ChevronRightIcon = ChevronRight;
  SearchIcon = Search;
  AwardIcon = Award;

  activeTab: string = "all";
  searchQuery: string = '';
  selectedDifficulty: string = '';
  searchResults: Trip[] = [];
  currentSessionId: string = "";
  difficultyStats = signal<any[]>([]);
  popularityStats = signal<any[]>([]);

  tabs = [
    { label: "My Portfolio", value: "all" },
    { label: "Discover Adventures", value: "discover" },
    { label: "Upcoming Missions", value: "upcoming" },
    { label: "History", value: "completed" },
  ];

  adminTemplates: Trip[] = [];

  get trips(): Trip[] {
    const rawTrips = this.tripService.trips() as any[];
    return rawTrips.map((t) => ({
      ...t,
      name: t.title || t.name,
      groupSize: t.participants || t.groupSize || 1,
      imageUrl: t.imageUrl
    })) as unknown as Trip[];
  }

  constructor(
    public router: Router,
    private tripService: TripService,
    private authService: AuthService,
    private transportationService: TransportationService,
  ) {}

  ngOnInit(): void {
    // Observe user to reload trips if user session rehydrates
    this.authService.getCurrentUser().pipe(takeUntil(this.destroy$)).subscribe(user => {
      if (user?.id) {
        this.currentSessionId = user.id;
        console.log("[MyTrips] Detected User ID for portfolio fetch:", user.id);
        this.tripService.loadUserTrips(user.id);
        this.loadAnalytics();
        
        // Debug: Watch the signal indirectly
        setTimeout(() => {
            const allTrips = this.trips;
            console.log("[MyTrips] Total trips loaded:", allTrips.length);
            const today = new Date(); today.setHours(0,0,0,0);
            allTrips.slice(0, 5).forEach(t => {
                console.log(`[MyTrips DATE DEBUG] "${t.name}" | startDate: "${t.startDate}" (type: ${typeof t.startDate}) | parsed: ${new Date(t.startDate)} | isPast: ${new Date(t.startDate) < today} | endDate: "${t.endDate}"`);
            });
        }, 2000);
      } else {
        console.warn("[MyTrips] No user ID detected in session!");
      }
    });
    
    this.loadAdminTemplates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAnalytics(): void {
    this.tripService.getDifficultyAnalytics().subscribe({
      next: (data) => this.difficultyStats.set(data),
      error: (err) => console.error('Analytics failed', err)
    });

    this.transportationService.getPopularity().subscribe({
        next: (data) => this.popularityStats.set(data),
        error: (err) => console.error('Transport analytics failed', err)
    });
  }

  loadUserTrips(): void {
    if (this.currentSessionId) {
      this.tripService.loadUserTrips(this.currentSessionId);
    }
  }
  loadAdminTemplates(): void {
    this.tripService.getAllTemplates().subscribe({
      next: (data) => {
        this.adminTemplates = data.map(t => ({
          id: t.id,
          name: t.title || t.name,
          destination: typeof t.destination === 'string' ? t.destination : (t.destination?.address || 'Destination unknown'),
          startDate: t.startDate,
          endDate: t.endDate,
          groupSize: t.participants || 1,
          status: 'planning',
          imageUrl: t.imageUrl,
          template: true
        }));
      },
      error: (err) => console.error('Failed to load admin templates', err)
    });
  }

  setActiveTab(value: string): void {
    this.activeTab = value;
  }

  getTabClasses(tabValue: string): string {
    if (this.activeTab === tabValue) {
      return "px-6 py-2.5 rounded-lg font-bold text-sm transition-all shadow-md bg-white text-indigo-600 border border-indigo-100";
    }
    return "px-6 py-2.5 rounded-lg font-medium text-sm transition-all text-slate-500 hover:text-indigo-600 hover:bg-white/60";
  }

  getFilteredTrips(): Trip[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (this.activeTab === "discover") {
      return this.searchResults.length > 0 ? this.searchResults : this.adminTemplates;
    }
    
    const baseList = this.searchResults.length > 0 ? this.searchResults : this.trips;

    // My Portfolio: only trips whose start date has NOT passed yet (upcoming/future)
    if (this.activeTab === "all") {
      return baseList.filter(t => {
        const start = t.startDate ? new Date(t.startDate) : null;
        if (!start || isNaN(start.getTime())) return true; // no date = show by default
        return start >= today;
      });
    }

    // Upcoming Missions: same as portfolio
    if (this.activeTab === "upcoming") {
      return baseList.filter(t => {
        const start = t.startDate ? new Date(t.startDate) : null;
        if (!start || isNaN(start.getTime())) return true;
        return start >= today;
      });
    }

    // History: only trips whose start date has ALREADY passed
    if (this.activeTab === "completed") {
      return baseList.filter(t => {
        const start = t.startDate ? new Date(t.startDate) : null;
        if (!start || isNaN(start.getTime())) return false; // no date = don't show in history
        return start < today;
      });
    }

    return baseList;
  }

  performSearch() {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }
    this.tripService.searchByKeywords(this.searchQuery).subscribe({
      next: (data) => {
        this.searchResults = this.mapBackendTrips(data);
      },
      error: (err) => console.error('Search failed', err)
    });
  }

  performAdvancedSearch() {
    if (!this.searchQuery.trim() || !this.selectedDifficulty) {
        alert("Please enter a destination and select a difficulty for Deep Scan.");
        return;
    }
    this.tripService.advancedSearch(this.selectedDifficulty, this.searchQuery).subscribe({
        next: (data) => {
            this.searchResults = this.mapBackendTrips(data);
            this.activeTab = 'discover';
        },
        error: (err) => console.error('Advanced search failed', err)
    });
  }

  private mapBackendTrips(data: any[]): Trip[] {
    return data.map(t => ({
        id: t.id || t._id || `id-${Math.random()}`,
        name: t.title || t.name || 'Expedition Mission',
        destination: typeof t.destination === 'string' ? t.destination : (t.destination?.address || 'Deep Wilderness'),
        startDate: t.startDate || new Date().toISOString(),
        endDate: t.endDate || new Date().toISOString(),
        groupSize: t.participants || t.groupSize || 1,
        status: (t.status?.toLowerCase() || 'planning') as any,
        imageUrl: t.imageUrl,
        template: t.template
    }));
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
<<<<<<< HEAD
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  viewTrip(id: string): void {
    this.router.navigate(['/trips', id]);
  }

  editTrip(id: string): void {
    console.log('Edit trip:', id);
  }

  deleteTrip(id: string): void {
    console.log('Delete trip:', id);
=======
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  viewTrip(id: string): void {
    this.router.navigate(["/trips", id]);
  }

  editTrip(id: string): void {
    this.router.navigate(["/plan-trip"], { queryParams: { tripId: id } });
  }

  deleteTrip(id: string): void {
    if (!confirm("Are you sure?")) return;
    this.tripService.deleteTrip(id).subscribe({
      next: () => {
        this.tripService.loadUserTrips(this.authService.currentUserValue?.id || '');
        this.loadAnalytics();
      },
      error: (err) => console.error("Failed", err)
    });
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
  }
}
