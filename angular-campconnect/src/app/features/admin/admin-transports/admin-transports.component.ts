import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LucideAngularModule, Car, Search, Plus, MapPin, Bus, Plane, Train, Trash2, Link, Edit2, Bike, X, ShieldCheck, AlertCircle, Clock, Wallet, Navigation } from 'lucide-angular';
import { TransportationService } from '../../transportation/services/transportation.service';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-transports',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="space-y-8 p-6 lg:p-8 bg-slate-50/50 min-h-screen">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <div class="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
               <lucide-icon [img]="CarIcon" [size]="28" class="text-white"></lucide-icon>
            </div>
            Transport Hub
          </h1>
          <p class="text-slate-500 mt-2 font-medium">Configure transportation assets and link them to user expeditions.</p>
        </div>
        
        <div class="flex flex-wrap items-center gap-3">
          <div class="relative group">
            <lucide-icon [img]="SearchIcon" [size]="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"></lucide-icon>
            <input type="text" 
                   [(ngModel)]="searchQuery" 
                   (input)="filterTransports()"
                   placeholder="Search providers or modes..." 
                   class="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm w-full md:w-64 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm">
          </div>
          
          <button (click)="openCreateModal()" class="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center gap-2">
            <lucide-icon [img]="PlusIcon" [size]="18"></lucide-icon>
            Add Transport Node
          </button>
        </div>
      </div>

      <!-- Main Grid Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Left Column: Insights & Stats -->
        <div class="lg:col-span-3 space-y-6">
          <div class="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-2xl shadow-indigo-200 overflow-hidden relative group">
             <div class="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
             <h3 class="font-bold text-indigo-100 uppercase tracking-widest text-xs">Fleet Capacity</h3>
             <p class="text-5xl font-black mt-4 tracking-tighter">{{ transports().length }}</p>
             <div class="mt-8 flex items-center gap-2 text-indigo-100 bg-white/10 w-fit px-3 py-1.5 rounded-lg backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider">
                <lucide-icon [img]="ShieldCheckIcon" [size]="12"></lucide-icon>
                Active Assets
             </div>
          </div>

          <div class="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
             <h3 class="font-black text-slate-800 text-xs uppercase tracking-widest mb-6">Distribution</h3>
             <div class="space-y-6">
               <div *ngFor="let stat of modeStats()" class="group">
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-3">
                      <div class="p-2 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <lucide-icon [img]="getModeIcon(stat.mode)" [size]="16"></lucide-icon>
                      </div>
                      <span class="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{{ stat.mode }}</span>
                    </div>
                    <span class="text-xs font-black text-slate-900">{{ stat.count }}</span>
                  </div>
                  <div class="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full bg-indigo-500 rounded-full transition-all duration-1000" [style.width.%]="(stat.count / (transports().length || 1)) * 100"></div>
                  </div>
               </div>
             </div>
          </div>

          <!-- Top Providers analytics -->
          <div class="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
             <h3 class="font-black text-slate-800 text-xs uppercase tracking-widest mb-6">Top Transport Providers</h3>
             <div class="space-y-4">
                <div *ngFor="let p of topPopularity()" class="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                   <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
                         #{{ topPopularity().indexOf(p) + 1 }}
                      </div>
                      <span class="text-sm font-bold text-slate-700 truncate max-w-[80px]">{{ p._id }}</span>
                   </div>
                   <span class="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-[10px] font-black">{{ p.usageCount }} Trips</span>
                </div>
                <div *ngIf="topPopularity().length === 0" class="text-center py-4 text-slate-400 text-xs italic">
                    Analyzing historical usage...
                </div>
             </div>
          </div>
        </div>

        <!-- Right Column: Data Table -->
        <div class="lg:col-span-9 bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50/50 border-b border-slate-100">
                  <th class="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Transport Provider</th>
                  <th class="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Pricing & Time</th>
                  <th class="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Linked Expedition</th>
                  <th class="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr *ngIf="isLoading()">
                   <td colspan="4" class="px-8 py-12 text-center text-slate-500 font-medium animate-pulse">Syncing fleet registry...</td>
                </tr>
                <tr *ngIf="!isLoading() && filteredTransports().length === 0">
                   <td colspan="4" class="px-8 py-16 text-center text-slate-400">
                      <div class="flex flex-col items-center gap-4 opacity-60">
                         <lucide-icon [img]="NavigationIcon" [size]="48" class="text-slate-300"></lucide-icon>
                         <p class="text-lg font-bold">No transport nodes detected</p>
                      </div>
                   </td>
                </tr>
                <tr *ngFor="let t of filteredTransports()" class="hover:bg-slate-50/50 transition-all group">
                  <td class="px-8 py-5">
                    <div class="flex items-center gap-5">
                      <div class="relative w-16 h-16 rounded-2xl overflow-hidden ring-4 ring-slate-50 group-hover:ring-indigo-100 transition-all shadow-sm flex-shrink-0">
                        <img [src]="t.imageUrl || getDefaultImage(t.mode)" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div class="absolute inset-x-0 bottom-0 py-1 bg-black/40 backdrop-blur-sm text-[8px] font-black text-white text-center uppercase tracking-tighter">
                          {{ t.mode }}
                        </div>
                      </div>
                      <div>
                        <p class="font-black text-slate-900 group-hover:text-indigo-700 transition-colors">{{ t.provider || 'Independent' }}</p>
                        <p class="text-[10px] text-slate-400 font-mono mt-0.5" *ngIf="t.id">REF: {{ t.id.substring(0, 8) }}</p>
                        <div *ngIf="t.averageRating" class="flex items-center gap-1 mt-1">
                           <span class="text-xs font-bold text-amber-500">★ {{ t.averageRating | number:'1.1-1' }}</span>
                           <span class="text-[10px] text-slate-400">({{ t.reviewCount }} reviews)</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-8 py-5">
                    <div class="space-y-1.5">
                      <div class="flex items-center gap-2 text-sm font-black text-slate-900">
                         <lucide-icon [img]="WalletIcon" [size]="14" class="text-indigo-500"></lucide-icon>
                         {{ t.cost }} TND
                      </div>
                      <div class="flex items-center gap-2 text-xs text-slate-400 font-bold">
                         <lucide-icon [img]="ClockIcon" [size]="14"></lucide-icon>
                         {{ t.duration }} min traverse
                      </div>
                    </div>
                  </td>
                  <td class="px-8 py-5">
                     <div *ngIf="t.tripId" class="flex flex-col gap-1.5">
                        <div class="flex items-center gap-2">
                           <div class="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                              <lucide-icon [img]="LinkIcon" [size]="12"></lucide-icon>
                           </div>
                           <p class="text-sm font-black text-slate-800 truncate max-w-[170px]">{{ getTripName(t.tripId) }}</p>
                        </div>
                        <div class="pl-9 space-y-1">
                           <p class="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                              <lucide-icon [img]="MapPinIcon" [size]="10"></lucide-icon>
                              {{ getTripDestination(t.tripId) }}
                           </p>
                        </div>
                     </div>
                     <span *ngIf="!t.tripId" class="px-3 py-1.5 bg-slate-100/80 text-slate-400 text-[10px] font-black rounded-lg uppercase tracking-widest border border-dashed border-slate-200">
                        Standby Asset
                     </span>
                  </td>
                  <td class="px-8 py-5 text-right">
                    <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                      <button (click)="editTransport(t)" class="p-2.5 bg-white text-slate-400 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 rounded-xl transition-all shadow-sm active:scale-95" title="Edit Properties">
                        <lucide-icon [img]="EditIcon" [size]="18"></lucide-icon>
                      </button>
                      <button (click)="onDeleteTransport(t.id)" class="p-2.5 bg-white text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl transition-all shadow-sm active:scale-95" title="Decommission Node">
                        <lucide-icon [img]="Trash2Icon" [size]="18"></lucide-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Transport Modal -->
    <div *ngIf="isModalOpen()" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <!-- Modal Header -->
        <div class="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-gradient-to-r from-indigo-700 to-indigo-500 text-white relative overflow-hidden">
          <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div class="flex items-center gap-5">
             <div class="p-3 bg-white/20 rounded-[1.25rem] backdrop-blur-sm shadow-inner">
                <lucide-icon [img]="editingId() ? EditIcon : PlusIcon" [size]="28"></lucide-icon>
             </div>
             <div>
                <h2 class="text-2xl font-black tracking-tight">{{ editingId() ? 'Modify Transport' : 'New Transport Node' }}</h2>
                <p class="text-indigo-100 text-xs font-bold uppercase tracking-widest mt-1 opacity-80">{{ editingId() ? 'Update existing logistics' : 'Register a new fleet asset' }}</p>
             </div>
          </div>
          <button (click)="closeModal()" class="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/80 hover:text-white z-10">
            <lucide-icon [img]="XIcon" [size]="24"></lucide-icon>
          </button>
        </div>

        <form (ngSubmit)="submitTransport()" class="px-10 py-10 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
          
          <!-- Assignment Section -->
          <div class="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
            <div class="flex items-center gap-3 mb-2">
               <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <lucide-icon [img]="LinkIcon" [size]="14"></lucide-icon>
               </div>
               <label class="text-xs font-black text-slate-500 uppercase tracking-widest">Expedition Assignment</label>
            </div>
            <select [(ngModel)]="formData.tripId" name="tripId" class="w-full px-5 py-4 bg-white border-2 border-slate-200/50 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer appearance-none">
              <option value="">Global Fleet (Unassigned)</option>
              <option *ngFor="let trip of availableTrips()" [value]="trip.id">
                {{ trip.title || trip.name }}
              </option>
            </select>
          </div>
          
          <div class="grid grid-cols-2 gap-8">
             <div>
                <label class="block text-xs font-black text-slate-500 mb-2.5 uppercase tracking-widest">Transit Mode</label>
                <select [(ngModel)]="formData.mode" name="mode" required class="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer">
                   <option value="CAR">Personal Car</option>
                   <option value="BUS">Public Bus</option>
                   <option value="TRAIN">Railway</option>
                   <option value="SHARED_RIDE">Group carpool</option>
                   <option value="BIKE">Cycle Hub</option>
                </select>
             </div>
             <div>
                <label class="block text-xs font-black text-slate-500 mb-2.5 uppercase tracking-widest">Provider Label</label>
                <input type="text" [(ngModel)]="formData.provider" name="provider" required placeholder="e.g. SNTRI" class="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all">
             </div>

             <div>
                <label class="block text-xs font-black text-slate-500 mb-2.5 uppercase tracking-widest">Unit Cost (TND)</label>
                <div class="relative">
                   <lucide-icon [img]="WalletIcon" [size]="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></lucide-icon>
                   <input type="number" [(ngModel)]="formData.cost" name="cost" required min="0" class="w-full pl-11 pr-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all">
                </div>
             </div>
             <div>
                <label class="block text-xs font-black text-slate-500 mb-2.5 uppercase tracking-widest">Duration (min)</label>
                <div class="relative">
                   <lucide-icon [img]="ClockIcon" [size]="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></lucide-icon>
                   <input type="number" [(ngModel)]="formData.duration" name="duration" required min="1" class="w-full pl-11 pr-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all">
                </div>
             </div>

             <div class="col-span-2">
                <label class="block text-xs font-black text-slate-500 mb-2.5 uppercase tracking-widest">Visual Representative (URL)</label>
                <input type="text" [(ngModel)]="formData.imageUrl" name="imageUrl" placeholder="https://example.com/image.jpg" class="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all">
                <div *ngIf="formData.imageUrl" class="mt-4 aspect-[21/9] rounded-3xl overflow-hidden ring-8 ring-slate-50 shadow-inner group relative">
                   <img [src]="formData.imageUrl" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
                </div>
             </div>
          </div>

          <!-- Alert Messaging -->
          <div *ngIf="submitMessage()" class="p-5 rounded-3xl flex items-center gap-4 animate-in slide-in-from-bottom-2 duration-300" [ngClass]="submitSuccess() ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'">
            <lucide-icon [img]="submitSuccess() ? ShieldCheckIcon : AlertCircleIcon" [size]="20"></lucide-icon>
            <span class="text-sm font-black">{{ submitMessage() }}</span>
          </div>
          
          <div class="pt-4 flex gap-5">
            <button type="button" (click)="closeModal()" class="flex-1 px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-sm font-black transition-all active:scale-95">
              Discard
            </button>
            <button type="submit" [disabled]="!formData.mode || !formData.provider" class="flex-[2] px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-black shadow-2xl shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed">
              {{ editingId() ? 'Update Fleet Record' : 'Deploy To Registry' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 5px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
  `]
})
export class AdminTransportsComponent implements OnInit {
  CarIcon = Car;
  SearchIcon = Search;
  PlusIcon = Plus;
  MapPinIcon = MapPin;
  BusIcon = Bus;
  PlaneIcon = Plane;
  TrainIcon = Train;
  Trash2Icon = Trash2;
  LinkIcon = Link;
  EditIcon = Edit2;
  BikeIcon = Bike;
  XIcon = X;
  ShieldCheckIcon = ShieldCheck;
  AlertCircleIcon = AlertCircle;
  ClockIcon = Clock;
  WalletIcon = Wallet;
  NavigationIcon = Navigation;

  isModalOpen = signal(false);
  editingId = signal<string | null>(null);
  availableTrips = signal<any[]>([]);
  transports = signal<any[]>([]);
  filteredTransports = signal<any[]>([]);
  isLoading = signal(true);
  submitMessage = signal('');
  submitSuccess = signal(false);
  searchQuery = '';

  modeStats = signal<{ mode: string, count: number }[]>([]);
  topPopularity = signal<any[]>([]);

  formData = {
    tripId: '',
    mode: 'BUS',
    provider: '',
    duration: 120,
    cost: 0,
    imageUrl: ''
  };

  constructor(
    private transportService: TransportationService,
    private authService: AuthService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.loadAllTripsFromBackend();
    this.loadAllTransports();
    this.loadPopularityAnalytics();
  }

  loadPopularityAnalytics() {
    this.transportService.getPopularity().subscribe({
      next: (data) => {
        this.topPopularity.set(data);
        console.log('Popularity Data loaded:', data);
      },
      error: (err) => {
        console.error('Failed to load popularity analytics SERVER ERROR:', err);
        // Fallback for demo so user doesn't stay stuck
        this.topPopularity.set([{ _id: "DATABASE ERROR - Check Logs", usageCount: 0 }]);
      }
    });
  }

  private getHttpOptions() {
    const token = this.authService.getToken();
    if (token) {
      return {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        })
      };
    }
    return {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
  }

  loadAllTripsFromBackend() {
    this.http.get<any[]>(`${environment.apiUrl}/trips`, this.getHttpOptions()).subscribe({
      next: (trips) => {
        this.availableTrips.set(trips || []);
      },
      error: (err) => {
        console.error('Failed to load trips from backend', err);
        this.availableTrips.set([]);
      }
    });
  }

  loadAllTransports() {
    this.isLoading.set(true);
    this.transportService.getAllTransports().subscribe({
      next: (data) => {
        this.transports.set(data);
        this.filteredTransports.set(data);
        this.updateModeStats(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load transports', err);
        this.isLoading.set(false);
      }
    });
  }

  updateModeStats(data: any[]) {
    const counts: Record<string, number> = {};
    data.forEach(t => {
      const mode = t.mode || 'UNKNOWN';
      counts[mode] = (counts[mode] || 0) + 1;
    });
    this.modeStats.set(Object.entries(counts).map(([mode, count]) => ({ mode, count })));
  }

  filterTransports() {
    if (!this.searchQuery.trim()) {
      this.filteredTransports.set(this.transports());
    } else {
      const q = this.searchQuery.toLowerCase();
      this.filteredTransports.set(
        this.transports().filter(t =>
          (t.provider || '').toLowerCase().includes(q) ||
          (t.mode || '').toLowerCase().includes(q)
        )
      );
    }
  }

  getModeIcon(mode: string) {
    switch (mode?.toUpperCase()) {
      case 'CAR': return Car;
      case 'BUS': return Bus;
      case 'TRAIN': return Train;
      case 'SHARED_RIDE': return Car;
      case 'BIKE': return Bike;
      default: return Car;
    }
  }

  getDefaultImage(mode: string): string {
    switch (mode?.toUpperCase()) {
      case 'CAR': return 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=200&h=200&fit=crop&q=80';
      case 'BUS': return 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=200&h=200&fit=crop&q=80';
      case 'TRAIN': return 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=200&h=200&fit=crop&q=80';
      case 'SHARED_RIDE': return 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=200&fit=crop&q=80';
      case 'BIKE': return 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=200&h=200&fit=crop&q=80';
      default: return 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=200&h=200&fit=crop&q=80';
    }
  }

  getTripName(tripId: string): string {
    const trip = this.availableTrips().find(t => t.id === tripId);
    return trip ? (trip.title || trip.name || 'Expedition') : 'Assigned Trip';
  }

  getTripDestination(tripId: string): string {
    const trip = this.availableTrips().find(t => t.id === tripId);
    return trip?.destination?.address || 'Location Unspecified';
  }

  openCreateModal() {
    this.editingId.set(null);
    this.submitMessage.set('');
    this.resetForm();
    this.isModalOpen.set(true);
  }

  editTransport(transport: any) {
    this.editingId.set(transport.id);
    this.submitMessage.set('');
    this.formData = {
      tripId: transport.tripId || '',
      mode: transport.mode || 'BUS',
      provider: transport.provider || '',
      duration: transport.duration || 120,
      cost: transport.cost || 0,
      imageUrl: transport.imageUrl || ''
    };
    this.isModalOpen.set(true);
  }

  onDeleteTransport(id: string) {
    if (confirm('Strategic Action: Decommission this transport node? This cannot be reversed.')) {
      this.transportService.deleteTransport(id).subscribe({
        next: () => {
          this.loadAllTransports();
        },
        error: (err) => {
          console.error('Delete failed', err);
        }
      });
    }
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingId.set(null);
    this.submitMessage.set('');
    this.resetForm();
  }

  resetForm() {
    this.formData = {
      tripId: '', mode: 'BUS', provider: '', duration: 120, cost: 0, imageUrl: ''
    };
  }

  submitTransport() {
    const tripId = this.formData.tripId || null;
    const payload = {
      tripId: tripId,
      mode: this.formData.mode,
      provider: this.formData.provider,
      duration: this.formData.duration,
      cost: this.formData.cost,
      imageUrl: this.formData.imageUrl
    };

    const action = this.editingId() 
      ? this.transportService.updateTransport(this.editingId()!, payload)
      : this.transportService.createTransport(payload);

    action.subscribe({
      next: () => {
        this.submitMessage.set(this.editingId() ? 'Transport configurations updated!' : 'New transport node deployed!');
        this.submitSuccess.set(true);
        this.loadAllTransports();
        this.loadPopularityAnalytics();
        setTimeout(() => this.closeModal(), 1500);
      },
      error: (err) => {
        console.error('Operation failed', err);
        this.submitMessage.set('Registry sync failure: Check input constraints.');
        this.submitSuccess.set(false);
      }
    });
  }
}
