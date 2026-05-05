import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule, Car, Users, Zap, MapPin, ShieldCheck, Clock, Wallet, Info, Star } from 'lucide-angular';
import { TransportationService } from '../services/transportation.service';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';
import { BadgeComponent } from '../../../shared/components/badge.component';

@Component({
  selector: 'app-transportation-options',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    LucideAngularModule, 
    ButtonComponent, 
    CardComponent, 
    CardContentComponent, 
    BadgeComponent
  ],
  template: `
    <div class="min-h-screen bg-slate-50/50 py-16 px-6 lg:px-12">
      <div class="max-w-7xl mx-auto">
        <!-- Intelligent Header Section -->
        <div class="mb-16 relative">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div class="space-y-4">
              <div class="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest">
                <lucide-icon [img]="ShieldCheckIcon" [size]="14"></lucide-icon> Verified Logistics
              </div>
              <h1 class="text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Logistics & <br/><span class="text-emerald-600">Travel Solutions</span>
              </h1>
              <p class="text-lg text-slate-500 max-w-2xl font-medium leading-relaxed">
                Explore a curated selection of transport nodes managed by our fleet registry. 
                From private rentals to group transit, find the perfect mission vehicle for your next expedition.
              </p>
            </div>
            
            <div class="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
               <button (click)="filterMode('ALL')" [class]="activeFilter === 'ALL' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'" class="px-6 py-2.5 rounded-xl text-sm font-bold transition-all">All Nodes</button>
               <button (click)="filterMode('CAR')" [class]="activeFilter === 'CAR' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'" class="px-6 py-2.5 rounded-xl text-sm font-bold transition-all">Private</button>
               <button (click)="filterMode('BUS')" [class]="activeFilter === 'BUS' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'" class="px-6 py-2.5 rounded-xl text-sm font-bold transition-all">Groups</button>
            </div>
          </div>

          <!-- Abstract background element -->
          <div class="absolute -top-20 -right-20 w-80 h-80 bg-emerald-200/20 rounded-full blur-[100px] -z-10"></div>
        </div>

        <!-- Refined Loading State -->
        <div *ngIf="isLoading()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           <div *ngFor="let i of [1,2,3]" class="bg-white rounded-[2.5rem] h-[500px] animate-pulse border border-slate-100"></div>
        </div>

        <!-- Intelligent Cards Grid -->
        <div *ngIf="!isLoading()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <div *ngFor="let transport of filteredTransports()" 
               class="group relative bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-emerald-200/40 transition-all duration-500 hover:-translate-y-2">
            
            <!-- Asset Pricing Tag -->
            <div class="absolute top-6 right-6 z-20 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-white/20">
               <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Asset Quote</p>
               <p class="text-xl font-black text-slate-900">{{ transport.cost }} <span class="text-xs text-emerald-600">TND</span></p>
            </div>

            <!-- Visualization Port -->
            <div class="h-64 relative overflow-hidden">
               <img [src]="transport.imageUrl || getDefaultImage(transport.mode)" 
                    class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
               <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
               
               <div class="absolute bottom-6 left-8">
                   <div class="flex items-center gap-2 mb-2">
                       <span class="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-lg uppercase tracking-tighter shadow-lg">
                           {{ transport.mode }}
                       </span>
                       <div *ngIf="transport.averageRating" class="flex items-center gap-1 bg-amber-400 text-slate-900 px-2.5 py-1 rounded-lg text-[10px] font-black shadow-lg">
                           <lucide-icon [img]="StarIcon" [size]="10"></lucide-icon>
                           {{ transport.averageRating | number:'1.1-1' }}
                       </div>
                   </div>
                   <h3 class="text-2xl font-black text-white leading-tight drop-shadow-md">
                       {{ transport.provider }}
                   </h3>
               </div>
            </div>

            <!-- Logistical Intel -->
            <div class="p-8 space-y-8">
              <div class="grid grid-cols-2 gap-4">
                 <div class="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div class="p-2 bg-white rounded-xl text-emerald-600 shadow-sm">
                       <lucide-icon [img]="ClockIcon" [size]="16"></lucide-icon>
                    </div>
                    <div>
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                        <p class="text-sm font-bold text-slate-900">{{ transport.duration }} min</p>
                    </div>
                 </div>
                 <div class="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div class="p-2 bg-white rounded-xl text-emerald-600 shadow-sm">
                       <lucide-icon [img]="UsersIcon" [size]="16"></lucide-icon>
                    </div>
                    <div>
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capacity</p>
                        <p class="text-sm font-bold text-slate-900">{{ transport.seats || 4 }} Seats</p>
                    </div>
                 </div>
              </div>

              <!-- Refined Action Section -->
              <div class="pt-4 flex items-center justify-between border-t border-slate-100">
                  <div class="flex flex-col">
                     <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Linked Expedition</span>
                     <span class="text-xs font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                        <lucide-icon [img]="MapPinIcon" [size]="12" class="text-emerald-500"></lucide-icon>
                        {{ transport.tripId ? 'Strategic Assignment' : 'Global Pool' }}
                     </span>
                  </div>
                  <button (click)="viewTransportDetail(transport.id)" class="px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-sm font-black shadow-xl shadow-slate-200 transition-all active:scale-95 hover:bg-emerald-600 hover:shadow-emerald-200">
                      Reserve
                  </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State (Intelligent Fallback) -->
        <div *ngIf="!isLoading() && transports().length === 0" class="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
            <div class="p-8 bg-slate-50 rounded-full mb-8">
               <lucide-icon [img]="CarIcon" [size]="64" class="text-slate-200"></lucide-icon>
            </div>
            <h2 class="text-3xl font-black text-slate-900 mb-4">No Registered Logistics Found</h2>
            <p class="text-slate-500 max-w-md font-medium px-6">The fleet registry is currently undergoing maintenance or no assets have been deployed yet. Contact fleet command for mission-critical logistics.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class TransportationOptionsComponent implements OnInit {
  CarIcon = Car;
  UsersIcon = Users;
  ZapIcon = Zap;
  MapPinIcon = MapPin;
  ShieldCheckIcon = ShieldCheck;
  ClockIcon = Clock;
  WalletIcon = Wallet;
  InfoIcon = Info;
  StarIcon = Star;

  transports = signal<any[]>([]);
  filteredTransports = signal<any[]>([]);
  isLoading = signal(true);
  activeFilter = 'ALL';

  constructor(
    private transportService: TransportationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadTransports();
  }

  loadTransports() {
    this.isLoading.set(true);
    this.transportService.getAllTransports().subscribe({
      next: (data) => {
        // Map and transform data if needed
        this.transports.set(data || []);
        this.filteredTransports.set(data || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load fleet assets', err);
        this.isLoading.set(false);
      }
    });
  }

  filterMode(mode: string) {
    this.activeFilter = mode;
    if (mode === 'ALL') {
      this.filteredTransports.set(this.transports());
    } else {
      this.filteredTransports.set(this.transports().filter(t => t.mode === mode));
    }
  }

  getDefaultImage(mode: string): string {
    switch (mode) {
      case 'CAR': return 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80';
      case 'BUS': return 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&q=80';
      case 'TRAIN': return 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&q=80';
      case 'BIKE': return 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80';
      default: return 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80';
    }
  }

  viewTransportDetail(id: string) {
    this.router.navigate(['/transportation/route', id]);
  }
}
