import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Tent, Search, MoreVertical, MapPin, Calendar, Users, Eye, Trash2, Edit2, Filter, X, Plus, Clock, ShieldCheck, AlertCircle } from 'lucide-angular';
import { TripService } from '../../trips/services/trip.service';
import { Trip } from '../../trips/models/trip.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-trips',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
  template: `
    <div class="space-y-8 p-6 lg:p-8 bg-slate-50/50 min-h-screen">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <div class="p-2 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-200">
               <lucide-icon [img]="TentIcon" [size]="28" class="text-white"></lucide-icon>
            </div>
            Trip Management
          </h1>
          <p class="text-slate-500 mt-2 font-medium">Create template trips for users and manage platform expeditions.</p>
        </div>
        
        <div class="flex flex-wrap items-center gap-3">
          <div class="relative group">
            <lucide-icon [img]="SearchIcon" [size]="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"></lucide-icon>
            <input type="text" 
                   [(ngModel)]="searchQuery" 
                   (input)="filterTrips()"
                   placeholder="Search destinations..." 
                   class="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm w-full md:w-64 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm">
          </div>
          
          <button (click)="openCreateModal()" class="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center gap-2">
            <lucide-icon [img]="PlusIcon" [size]="18"></lucide-icon>
            Add Trip Template
          </button>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <lucide-icon [img]="TentIcon" [size]="24"></lucide-icon>
          </div>
          <div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Trips</p>
            <p class="text-2xl font-black text-slate-900">{{ trips().length }}</p>
          </div>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <lucide-icon [img]="ShieldCheckIcon" [size]="24"></lucide-icon>
          </div>
          <div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Template Trips</p>
            <p class="text-2xl font-black text-slate-900">{{ getTemplateCount() }}</p>
          </div>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
            <lucide-icon [img]="ClockIcon" [size]="24"></lucide-icon>
          </div>
          <div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Upcoming</p>
            <p class="text-2xl font-black text-slate-900">{{ getUpcomingCount() }}</p>
          </div>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
             <lucide-icon [img]="UsersIcon" [size]="24"></lucide-icon>
          </div>
          <div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Group</p>
            <p class="text-2xl font-black text-slate-900">{{ getAvgParticipants() }}</p>
          </div>
        </div>
      </div>

      <!-- Main Content Table -->
      <div class="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/50 border-b border-slate-100">
                <th class="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">General Info</th>
                <th class="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Location & Logistics</th>
                <th class="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Participants</th>
                <th class="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th class="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr *ngIf="isLoading()">
                 <td colspan="5" class="px-8 py-12 text-center">
                    <div class="flex flex-col items-center gap-3">
                       <div class="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                       <p class="text-slate-500 font-medium animate-pulse">Syncing trip registry...</p>
                    </div>
                 </td>
              </tr>
              <tr *ngIf="!isLoading() && filteredTrips().length === 0">
                 <td colspan="5" class="px-8 py-16 text-center text-slate-400">
                    <div class="flex flex-col items-center gap-4 grayscale opacity-60">
                       <lucide-icon [img]="SearchIcon" [size]="48"></lucide-icon>
                       <div>
                          <p class="text-lg font-bold text-slate-600">No matching trips found</p>
                          <p class="text-sm">Try adjusting your search criteria</p>
                       </div>
                    </div>
                 </td>
              </tr>
              <tr *ngFor="let trip of filteredTrips()" class="hover:bg-emerald-50/30 transition-all group">
                <td class="px-8 py-5 text-sm">
                  <div class="flex items-center gap-4">
                    <div class="w-14 h-14 rounded-2xl overflow-hidden ring-4 ring-slate-100 group-hover:ring-emerald-100 transition-all shadow-sm">
                      <img [src]="trip.imageUrl || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80'" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div>
                      <p class="font-black text-slate-900 group-hover:text-emerald-700 transition-colors">{{ trip.name }}</p>
                      <div class="flex items-center gap-2 mt-1">
                        <span class="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded uppercase tracking-tighter" [class.bg-emerald-100]="trip.template" [class.text-emerald-700]="trip.template">
                          {{ trip.template ? 'Template' : 'User Trip' }}
                        </span>
                        <span class="text-[10px] text-slate-400 font-mono">#{{ trip.id.substring(0, 8) }}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-8 py-5">
                  <div class="space-y-1.5">
                    <div class="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <lucide-icon [img]="MapPinIcon" [size]="14" class="text-emerald-500"></lucide-icon>
                      {{ trip.destination }}
                    </div>
                    <div class="flex items-center gap-2 text-xs text-slate-400 font-medium">
                      <lucide-icon [img]="CalendarIcon" [size]="14"></lucide-icon>
                      {{ trip.startDate | date:'MMM d, y' }} — {{ trip.endDate | date:'MMM d, y' }}
                    </div>
                  </div>
                </td>
                <td class="px-8 py-5">
                   <div class="flex items-center gap-3">
                      <div class="flex -space-x-2">
                        <div *ngFor="let i of [1,2,3]" class="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500 overflow-hidden">
                           <img [src]="'https://i.pravatar.cc/100?u=' + trip.id + i" />
                        </div>
                        <div class="w-7 h-7 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-emerald-600">
                           +{{ trip.participants - 3 > 0 ? trip.participants - 3 : 0 }}
                        </div>
                      </div>
                      <span class="text-xs font-bold text-slate-600">{{ trip.participants }} members</span>
                   </div>
                </td>
                <td class="px-8 py-5 text-center">
                   <span class="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border"
                         [ngClass]="getStatusStyles(trip.status)">
                     {{ trip.status }}
                   </span>
                </td>
                <td class="px-8 py-5 text-right">
                  <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                    <button (click)="openEditModal(trip)" class="p-2.5 bg-white text-slate-400 hover:text-emerald-600 border border-slate-200 hover:border-emerald-200 rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-500/10 active:scale-95" title="Edit Trip">
                      <lucide-icon [img]="EditIcon" [size]="18"></lucide-icon>
                    </button>
                    <button (click)="deleteTrip(trip.id)" class="p-2.5 bg-white text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl transition-all hover:shadow-lg hover:shadow-rose-500/10 active:scale-95" title="Delete Trip">
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

    <!-- Triple-layered Modal Overlay -->
    <div *ngIf="isModalOpen()" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <!-- Modal Header -->
        <div class="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-gradient-to-r from-emerald-600 to-emerald-500 text-white">
          <div class="flex items-center gap-4">
             <div class="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <lucide-icon [img]="isEditMode() ? EditIcon : TentIcon" [size]="24"></lucide-icon>
             </div>
             <div>
                <h2 class="text-xl font-black tracking-tight">{{ isEditMode() ? 'Edit Trip Template' : 'New Trip Template' }}</h2>
                <p class="text-emerald-100 text-xs font-medium">{{ isEditMode() ? 'Updating existing itinerary configuration' : 'Create a curated experience for campers' }}</p>
             </div>
          </div>
          <button (click)="closeModal()" class="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/80 hover:text-white">
            <lucide-icon [img]="XIcon" [size]="24"></lucide-icon>
          </button>
        </div>

        <form (ngSubmit)="submitForm()" class="px-8 py-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <!-- Main Grid -->
          <div class="grid grid-cols-2 gap-6">
             <div class="col-span-2">
                <label class="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Trip Designation</label>
                <input type="text" [(ngModel)]="formData.name" name="name" required minlength="3" 
                       placeholder="e.g. Atlas Range Midnight Trek" 
                       class="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-300">
             </div>

             <div class="col-span-2">
                <label class="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Destination Hub</label>
                <div class="relative">
                  <lucide-icon [img]="MapPinIcon" [size]="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500"></lucide-icon>
                  <input type="text" [(ngModel)]="formData.destination" name="destination" required 
                         placeholder="e.g. Matmata, Ouaraa" 
                         class="w-full pl-12 pr-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-300">
                </div>
             </div>

             <div>
                <label class="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Difficulty</label>
                <select [(ngModel)]="formData.difficulty" name="difficulty" required 
                        class="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all">
                   <option value="EASY">Easy Walk</option>
                   <option value="MODERATE">Moderate Trail</option>
                   <option value="HARD">Expert Expedition</option>
                </select>
             </div>

             <div>
                <label class="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Budget (TND)</label>
                <input type="number" [(ngModel)]="formData.totalBudget" name="totalBudget" required min="0" 
                       class="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all">
             </div>

             <div>
                <label class="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Start Date</label>
                <input type="date" [(ngModel)]="formData.startDate" name="startDate" required 
                       class="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all">
             </div>

             <div>
                <label class="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">End Date</label>
                <input type="date" [(ngModel)]="formData.endDate" name="endDate" required 
                       class="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all">
             </div>

             <div class="col-span-2">
                <label class="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Hero Image URL</label>
                <input type="text" [(ngModel)]="formData.imageUrl" name="imageUrl" 
                       placeholder="https://images.unsplash.com/..." 
                       class="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-300">
                <div *ngIf="formData.imageUrl" class="mt-4 aspect-video rounded-2xl overflow-hidden ring-4 ring-slate-50 shadow-inner group">
                   <img [src]="formData.imageUrl" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
                </div>
             </div>
          </div>

          <div *ngIf="submitMessage()" 
               class="p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300" 
               [ngClass]="submitSuccess() ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'">
            <lucide-icon [img]="submitSuccess() ? ShieldCheckIcon : AlertCircleIcon" [size]="20"></lucide-icon>
            <span class="text-sm font-bold">{{ submitMessage() }}</span>
          </div>
          
          <div class="pt-6 flex gap-4">
            <button type="button" (click)="closeModal()" class="flex-1 px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-sm font-black transition-all active:scale-95">
              Discard Changes
            </button>
            <button type="submit" 
                    [disabled]="!formData.name || !formData.destination" 
                    class="flex-[2] px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-black shadow-xl shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed">
              {{ isEditMode() ? 'Overwrite Template' : 'Initialize Template' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
  `]
})
export class AdminTripsComponent implements OnInit {
  // Lucide Icons
  TentIcon = Tent;
  SearchIcon = Search;
  MoreVerticalIcon = MoreVertical;
  MapPinIcon = MapPin;
  CalendarIcon = Calendar;
  UsersIcon = Users;
  EyeIcon = Eye;
  Trash2Icon = Trash2;
  EditIcon = Edit2;
  FilterIcon = Filter;
  XIcon = X;
  PlusIcon = Plus;
  ClockIcon = Clock;
  ShieldCheckIcon = ShieldCheck;
  AlertCircleIcon = AlertCircle;

  trips = signal<any[]>([]);
  filteredTrips = signal<any[]>([]);
  isLoading = signal<boolean>(true);
  searchQuery = '';

  isModalOpen = signal(false);
  isEditMode = signal(false);
  editingId = signal<string | null>(null);
  submitMessage = signal('');
  submitSuccess = signal(false);

  formData = {
    name: '',
    destination: '',
    difficulty: 'MODERATE',
    totalBudget: 150,
    startDate: '',
    endDate: '',
    imageUrl: '',
    participants: 4
  };

  constructor(private tripService: TripService, private authService: AuthService) { }

  ngOnInit(): void {
    this.loadTrips();
  }

  loadTrips() {
    this.isLoading.set(true);
    this.tripService.getAllTripsAdmin().subscribe({
      next: (data) => {
        // Map backend data to frontend trip model if needed
        const mappedData = data.map(t => ({
          ...t,
          name: t.title || t.name,
          destination: typeof t.destination === 'string' ? t.destination : (t.destination?.address || 'Tunisia'),
        }));
        this.trips.set(mappedData);
        this.filterTrips();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching trips for admin', err);
        this.isLoading.set(false);
      }
    });
  }

  filterTrips() {
    if (!this.searchQuery.trim()) {
      this.filteredTrips.set(this.trips());
      return;
    }
    const query = this.searchQuery.toLowerCase();
    this.filteredTrips.set(
      this.trips().filter(t => 
        t.name.toLowerCase().includes(query) || 
        t.destination.toLowerCase().includes(query)
      )
    );
  }

  deleteTrip(tripId: string) {
    if (confirm('Critical Action: Delete this trip? Data cannot be recovered.')) {
      this.tripService.deleteTrip(tripId).subscribe({
        next: () => {
          this.trips.update(current => current.filter(t => t.id !== tripId));
          this.filterTrips();
        },
        error: (err) => console.error('Error deleting trip', err)
      });
    }
  }

  getStatusStyles(status: string) {
    const s = (status || '').toUpperCase();
    if (s === 'PLANNED' || s === 'PLANNING') return 'bg-blue-100 text-blue-700 border-blue-200';
    if (s === 'ACTIVE' || s === 'ONGOING') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (s === 'COMPLETED') return 'bg-slate-100 text-slate-700 border-slate-200';
    if (s === 'CANCELLED') return 'bg-rose-100 text-rose-700 border-rose-200';
    return 'bg-amber-100 text-amber-700 border-amber-200';
  }

  getTemplateCount() {
    return this.trips().filter(t => t.template).length;
  }

  getUpcomingCount() {
    const now = new Date();
    return this.trips().filter(t => new Date(t.startDate) > now).length;
  }

  getAvgParticipants() {
    if (this.trips().length === 0) return 0;
    const total = this.trips().reduce((sum, t) => sum + (t.participants || 0), 0);
    return Math.round(total / this.trips().length);
  }

  openCreateModal() {
    this.isEditMode.set(false);
    this.editingId.set(null);
    this.resetForm();
    this.submitMessage.set('');
    this.isModalOpen.set(true);
  }

  openEditModal(trip: any) {
    this.isEditMode.set(true);
    this.editingId.set(trip.id);
    
    // Format dates for input[type="date"] (YYYY-MM-DD)
    const startDate = trip.startDate ? new Date(trip.startDate).toISOString().split('T')[0] : '';
    const endDate = trip.endDate ? new Date(trip.endDate).toISOString().split('T')[0] : '';
    
    this.formData = {
      name: trip.name,
      destination: trip.destination,
      difficulty: trip.difficulty || 'MODERATE',
      totalBudget: trip.totalBudget || trip.estimatedBudget || 0,
      startDate: startDate,
      endDate: endDate,
      imageUrl: trip.imageUrl || '',
      participants: trip.participants || 4
    };
    this.submitMessage.set('');
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.resetForm();
  }

  resetForm() {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    this.formData = {
      name: '',
      destination: '',
      difficulty: 'MODERATE',
      totalBudget: 150,
      startDate: now.toISOString().split('T')[0],
      endDate: nextWeek.toISOString().split('T')[0],
      imageUrl: '',
      participants: 4
    };
  }

  submitForm() {
    const adminId = this.authService.currentUserValue?.id || 'admin-user-id';
    
    // Find the original trip status if editing, otherwise default to PLANNED
    let currentStatus = 'PLANNED';
    if (this.isEditMode() && this.editingId()) {
      const originalTrip = this.trips().find(t => t.id === this.editingId());
      if (originalTrip && originalTrip.status) {
        currentStatus = originalTrip.status;
      }
    }

    const tripData = {
      title: this.formData.name,
      destination: {
        address: this.formData.destination,
        latitude: 0,
        longitude: 0
      },
      startDate: new Date(this.formData.startDate).toISOString(),
      endDate: new Date(this.formData.endDate).toISOString(),
      difficulty: this.formData.difficulty,
      totalBudget: this.formData.totalBudget,
      status: currentStatus, // Ensure status is never null/undefined
      participants: this.formData.participants,
      userId: adminId,
      imageUrl: this.formData.imageUrl || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80',
      template: true
    };

    const action = this.isEditMode() 
      ? this.tripService.updateTrip(this.editingId()!, tripData)
      : this.tripService.createTrip(tripData);

    action.subscribe({
      next: (result) => {
        this.submitSuccess.set(true);
        this.submitMessage.set(this.isEditMode() ? 'Trip Template updated successfully!' : 'Trip Template initialized successfully!');
        this.loadTrips();
        setTimeout(() => this.closeModal(), 1500);
      },
      error: (err) => {
        this.submitSuccess.set(false);
        this.submitMessage.set('Sync failed: Could not persist trip data.');
        console.error(err);
      }
    });
  }
}

