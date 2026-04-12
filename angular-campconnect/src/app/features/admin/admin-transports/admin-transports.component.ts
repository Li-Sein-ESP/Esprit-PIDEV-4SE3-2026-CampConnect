import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LucideAngularModule, Car, Search, Plus, MapPin, Bus, Plane, Train, Trash2, Link, Edit, Bike } from 'lucide-angular';
import { TransportationService } from '../../transportation/services/transportation.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-transports',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Transports Management</h1>
          <p class="text-sm text-slate-500 mt-1">Manage transportation nodes and assign them directly to user trips.</p>
        </div>
        
        <button (click)="openCreateModal()" class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 shadow-sm transition-all active:scale-95 flex items-center gap-2">
          <lucide-icon [img]="PlusIcon" [size]="18"></lucide-icon>
          Add Transport
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div class="md:col-span-1 space-y-4">
            <div class="p-6 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl text-white shadow-lg">
               <h3 class="font-bold text-lg opacity-90">Total Managed</h3>
               <p class="text-4xl font-black mt-2">{{ transports().length }}</p>
               <p class="text-xs opacity-75 mt-2">Transportation links from database</p>
            </div>
            
            <div class="p-6 bg-white border border-slate-200 rounded-2xl">
               <h3 class="font-bold text-sm text-slate-900 mb-4">Transport Modes</h3>
               <div class="space-y-3">
                 <div *ngFor="let stat of modeStats()" class="flex items-center justify-between">
                    <div class="flex items-center gap-2 text-sm text-slate-600">
                      <lucide-icon [img]="getModeIcon(stat.mode)" [size]="16"></lucide-icon>
                      {{ stat.mode }}
                    </div>
                    <span class="text-xs font-bold text-slate-900">{{ stat.count }}</span>
                 </div>
               </div>
            </div>
         </div>

         <!-- Transports Table (Real data from backend) -->
         <div class="md:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
            <div class="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <h2 class="font-bold text-slate-800">All Transports</h2>
               <div class="relative w-48">
                 <lucide-icon [img]="SearchIcon" [size]="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></lucide-icon>
                 <input type="text" placeholder="Search..." [(ngModel)]="searchQuery" (ngModelChange)="filterTransports()" class="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500">
               </div>
            </div>
            
            <!-- Loading state -->
            <div *ngIf="isLoading()" class="p-8 text-center text-slate-400">
              <p>Loading transports from database...</p>
            </div>

            <!-- Empty state -->
            <div *ngIf="!isLoading() && filteredTransports().length === 0" class="p-8 text-center text-slate-400">
              <p class="text-lg mb-2">No transports found</p>
              <p class="text-sm">Click "Add Transport" to create one. It will be visible to users.</p>
            </div>
            
            <div *ngIf="!isLoading() && filteredTransports().length > 0" class="flex-1 overflow-auto">
              <table class="w-full text-left text-sm border-collapse">
                <thead class="bg-white sticky top-0 border-b border-slate-200 z-10">
                  <tr class="text-[11px] uppercase tracking-wider text-slate-400">
                    <th class="px-4 py-3 font-semibold">Transport</th>
                    <th class="px-4 py-3 font-semibold">Cost</th>
                    <th class="px-4 py-3 font-semibold">Duration</th>
                    <th class="px-4 py-3 font-semibold">Trip</th>
                    <th class="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr *ngFor="let t of filteredTransports()" class="hover:bg-slate-50/80 group transition-colors">
                    <td class="px-4 py-3">
                       <div class="flex items-center gap-4">
                          <!-- Image thumbnail -->
                          <div class="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200 shadow-sm">
                             <img [src]="t.imageUrl || getDefaultImage(t.mode)" class="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300">
                             <!-- Mode badge overlay -->
                             <div class="absolute bottom-0 left-0 right-0 px-1.5 py-0.5 bg-black/50 backdrop-blur-sm text-center">
                                <span class="text-[8px] font-black uppercase tracking-wider text-white">{{ t.mode }}</span>
                             </div>
                          </div>
                          <!-- Provider info -->
                          <div>
                            <p class="font-bold text-slate-900 text-sm">{{ t.provider || 'N/A' }}</p>
                            <p class="text-[11px] text-slate-400 mt-0.5">ID: {{ t.id | slice:0:8 }}...</p>
                          </div>
                       </div>
                    </td>
                    <td class="px-4 py-3">
                       <span class="font-bold text-slate-900">{{ t.cost }} TND</span>
                    </td>
                    <td class="px-4 py-3">
                       <span class="text-slate-600 font-medium">{{ t.duration }} min</span>
                    </td>
                    <td class="px-4 py-3">
                       <span *ngIf="t.tripId" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                          <lucide-icon [img]="LinkIcon" [size]="10"></lucide-icon>
                          {{ getTripName(t.tripId) }}
                       </span>
                       <span *ngIf="!t.tripId" class="text-[10px] text-slate-400 italic">Not assigned</span>
                    </td>
                    <td class="px-4 py-3">
                       <div class="flex gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                         <button (click)="editTransport(t)" class="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold text-xs transition-colors border border-emerald-100">Edit</button>
                         <button (click)="onDeleteTransport(t.id)" class="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg font-bold text-xs transition-colors border border-rose-100">Delete</button>
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
    <div *ngIf="isModalOpen()" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        <div class="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
            <lucide-icon [img]="PlusIcon" [size]="20" class="text-emerald-600"></lucide-icon>
            {{ editingId() ? 'Edit Transport' : 'Add New Transport' }}
          </h2>
          <button (click)="closeModal()" class="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-400 hover:text-slate-600">
            &times;
          </button>
        </div>

        <form (ngSubmit)="submitTransport()" class="p-6 space-y-4">
          
          <!-- Associated Trip (REQUIRED) -->
          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Link to Trip (Optional)</label>
            <select [(ngModel)]="formData.tripId" name="tripId" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all">
              <option value="">No specific trip (Available to all)</option>
              <option *ngFor="let trip of availableTrips()" [value]="trip.id">{{ trip.title || trip.name }} (ID: {{ trip.id | slice:0:8 }}...)</option>
            </select>
            <p *ngIf="availableTrips().length > 0" class="text-[10px] text-slate-500 mt-1">{{ availableTrips().length }} trip(s) available. Leave blank to make this a general option.</p>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
             <div>
                <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Mode <span class="text-rose-500">*</span></label>
                <select [(ngModel)]="formData.mode" name="mode" required class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all">
                   <option value="CAR">Car</option>
                   <option value="BUS">Bus</option>
                   <option value="TRAIN">Train</option>
                   <option value="SHARED_RIDE">Shared Ride</option>
                   <option value="BIKE">Bike</option>
                </select>
             </div>
             <div>
                <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Provider <span class="text-rose-500">*</span></label>
                <input type="text" [(ngModel)]="formData.provider" name="provider" required placeholder="e.g. Greyhound" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all">
             </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
             <div>
                <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Estimated Cost ($) <span class="text-rose-500">*</span></label>
                <input type="number" [(ngModel)]="formData.cost" name="cost" required min="0" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all">
             </div>
             <div>
                <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Duration (mins) <span class="text-rose-500">*</span></label>
                <input type="number" [(ngModel)]="formData.duration" name="duration" required min="1" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all">
             </div>
          </div>

          <!-- Image URL -->
          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Transport Image URL (Optional)</label>
            <input type="text" [(ngModel)]="formData.imageUrl" name="imageUrl" placeholder="https://example.com/bus.jpg" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all">
            <div *ngIf="formData.imageUrl" class="mt-2 relative w-full h-24 rounded-lg overflow-hidden border border-slate-200 shadow-inner bg-slate-100 flex items-center justify-center">
               <img [src]="formData.imageUrl" class="h-full w-full object-cover">
               <div class="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                 <span class="text-[10px] text-white font-bold bg-black/40 px-2 py-1 rounded">Preview</span>
               </div>
            </div>
            <p class="text-[10px] text-slate-400 mt-1">Recommended size: 400x300. Use a direct image link.</p>
          </div>

          <!-- Success/Error message -->
          <div *ngIf="submitMessage()" class="p-3 rounded-lg text-sm" [ngClass]="submitSuccess() ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'">
            {{ submitMessage() }}
          </div>
          
          <div class="pt-4 border-t border-slate-100 flex justify-end gap-3 mt-4">
            <button type="button" (click)="closeModal()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors">
              Cancel
            </button>
            <button type="submit" [disabled]="!formData.mode || !formData.provider" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
              {{ editingId() ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: []
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
  EditIcon = Edit;
  BikeIcon = Bike;

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

  formData = {
    tripId: '',
    mode: 'BUS',
    provider: '',
    duration: 120,
    cost: 0,
    imageUrl: ''
  };

  private readonly API_URL = 'http://localhost:8080/api';

  constructor(
    private transportService: TransportationService,
    private authService: AuthService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.loadAllTripsFromBackend();
    this.loadAllTransports();
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

  /** Load ALL trips directly from backend API (not from TripService which filters by user) */
  loadAllTripsFromBackend() {
    this.http.get<any[]>(`${this.API_URL}/trips`, this.getHttpOptions()).subscribe({
      next: (trips) => {
        console.log('Loaded trips for admin dropdown:', trips);
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

  getModeColor(mode: string) {
    switch (mode?.toUpperCase()) {
      case 'CAR': return 'bg-teal-50 text-teal-600';
      case 'BUS': return 'bg-indigo-50 text-indigo-600';
      case 'TRAIN': return 'bg-amber-50 text-amber-600';
      case 'SHARED_RIDE': return 'bg-purple-50 text-purple-600';
      case 'BIKE': return 'bg-lime-50 text-lime-600';
      default: return 'bg-slate-50 text-slate-600';
    }
  }

  getModeGradient(mode: string) {
    switch (mode?.toUpperCase()) {
      case 'CAR': return 'from-teal-500 to-emerald-600';
      case 'BUS': return 'from-indigo-500 to-blue-600';
      case 'TRAIN': return 'from-amber-500 to-orange-600';
      case 'SHARED_RIDE': return 'from-purple-500 to-fuchsia-600';
      case 'BIKE': return 'from-lime-500 to-green-600';
      default: return 'from-slate-400 to-slate-600';
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
    return trip ? (trip.title || trip.name || tripId.substring(0, 8)) : tripId.substring(0, 8) + '...';
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
    if (confirm('Are you sure you want to delete this transport?')) {
      this.transportService.deleteTransport(id).subscribe({
        next: () => {
          this.loadAllTransports();
        },
        error: (err) => {
          console.error('Delete failed', err);
          alert('Failed to delete transport.');
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
    // Trip ID is now optional for unassigned options
    const tripId = this.formData.tripId || null;

    // Build payload matching the backend TransportDTO exactly
    const payload = {
      tripId: tripId,
      mode: this.formData.mode,        // Must match TransportMode enum: CAR, BUS, TRAIN, SHARED_RIDE, BIKE
      provider: this.formData.provider,
      duration: this.formData.duration,
      cost: this.formData.cost,          // Backend expects BigDecimal, JSON number works
      imageUrl: this.formData.imageUrl
    };

    if (this.editingId()) {
      this.transportService.updateTransport(this.editingId()!, payload).subscribe({
        next: () => {
          this.submitMessage.set('Transport updated successfully!');
          this.submitSuccess.set(true);
          this.loadAllTransports();
          setTimeout(() => this.closeModal(), 1000);
        },
        error: (err) => {
          console.error('Update failed', err);
          const errorMsg = this.extractErrorMessage(err);
          this.submitMessage.set('Update failed: ' + errorMsg);
          this.submitSuccess.set(false);
        }
      });
    } else {
      this.transportService.createTransport(payload).subscribe({
        next: () => {
          this.submitMessage.set('Transport created! It is now visible to users.');
          this.submitSuccess.set(true);
          this.loadAllTransports();
          setTimeout(() => this.closeModal(), 1500);
        },
        error: (err) => {
          console.error('Create failed', err);
          const errorMsg = this.extractErrorMessage(err);
          this.submitMessage.set('Failed to create: ' + errorMsg);
          this.submitSuccess.set(false);
        }
      });
    }
  }

  private extractErrorMessage(err: any): string {
    if (err.error) {
      if (typeof err.error === 'string') return err.error;
      if (typeof err.error === 'object') {
        // Backend validation errors come as { field: message }
        const msgs = Object.entries(err.error).map(([k, v]) => `${k}: ${v}`);
        if (msgs.length > 0) return msgs.join(', ');
        if (err.error.message) return err.error.message;
      }
    }
    return err.message || 'Unknown error. Check backend logs.';
  }
}
