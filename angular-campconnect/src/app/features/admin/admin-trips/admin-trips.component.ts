import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Tent, Search, MoreVertical, MapPin, Calendar, Users, Eye, Trash2 } from 'lucide-angular';
import { TripService } from '../../trips/services/trip.service';
import { Trip } from '../../trips/models/trip.model';

@Component({
    selector: 'app-admin-trips',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
    template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">User Trips Management</h1>
          <p class="text-sm text-slate-500 mt-1">Monitor and manage trips created by users across the platform.</p>
        </div>
        
        <div class="flex items-center gap-3 w-full sm:w-auto">
          <button (click)="openCreateModal()" class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 shadow-sm transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap">
            <lucide-icon [img]="TentIcon" [size]="16"></lucide-icon>
            Add Template Trip
          </button>
          <div class="relative w-full sm:w-64">
            <lucide-icon [img]="SearchIcon" [size]="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></lucide-icon>
            <input type="text" placeholder="Search trips..." class="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all">
          </div>
          <button class="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
            <lucide-icon [img]="TentIcon" [size]="16"></lucide-icon>
            Filter
          </button>
        </div>
      </div>

      <!-- Data Table -->
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th class="px-6 py-4 font-semibold">Trip Name</th>
                <th class="px-6 py-4 font-semibold">Destination</th>
                <th class="px-6 py-4 font-semibold">Dates</th>
                <th class="px-6 py-4 font-semibold">Participants</th>
                <th class="px-6 py-4 font-semibold">Status</th>
                <th class="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngIf="isLoading()" class="animate-pulse">
                 <td colspan="6" class="px-6 py-8 text-center text-slate-500">Loading trips data...</td>
              </tr>
              <tr *ngIf="!isLoading() && trips().length === 0">
                 <td colspan="6" class="px-6 py-8 text-center text-slate-500">No trips found in the system.</td>
              </tr>
              <tr *ngFor="let trip of trips()" class="hover:bg-slate-50 transition-colors group">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <lucide-icon [img]="TentIcon" [size]="20"></lucide-icon>
                    </div>
                    <div>
                      <p class="text-sm font-bold text-slate-900">{{ trip.name }}</p>
                      <p class="text-[11px] text-slate-400 font-mono">ID: {{ trip.id.substring(0, 8) }}...</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2 text-sm text-slate-600">
                    <lucide-icon [img]="MapPinIcon" [size]="14" class="text-slate-400"></lucide-icon>
                    {{ trip.destination }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-col text-sm text-slate-600">
                    <span class="flex items-center gap-1.5"><lucide-icon [img]="CalendarIcon" [size]="12" class="text-slate-400"></lucide-icon> {{ trip.startDate | date:'MMM d, y' }}</span>
                    <span class="text-xs text-slate-400 mt-0.5">{{ trip.duration }} days total</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2 text-sm text-slate-600">
                    <lucide-icon [img]="UsersIcon" [size]="14" class="text-slate-400"></lucide-icon>
                    {{ trip.participants }} members
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                        [ngClass]="{
                          'bg-emerald-100 text-emerald-700': isUpcoming(trip.startDate),
                          'bg-amber-100 text-amber-700': !isUpcoming(trip.startDate)
                        }">
                    {{ isUpcoming(trip.startDate) ? 'Upcoming' : 'Past' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a [routerLink]="['/trips', trip.id]" target="_blank" class="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="View Trip">
                      <lucide-icon [img]="EyeIcon" [size]="18"></lucide-icon>
                    </a>
                    <button (click)="deleteTrip(trip.id)" class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                      <lucide-icon [img]="Trash2Icon" [size]="18"></lucide-icon>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Pagination Mock -->
        <div class="px-6 py-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-slate-50">
          <span>Showing <strong>{{ trips().length }}</strong> trips</span>
          <div class="flex gap-1">
            <button class="px-3 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50">Prev</button>
            <button class="px-3 py-1 rounded border border-slate-200 bg-emerald-50 text-emerald-700 font-medium">1</button>
            <button class="px-3 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Template Trip Modal -->
    <div *ngIf="isModalOpen()" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        <div class="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
            <lucide-icon [img]="TentIcon" [size]="20" class="text-emerald-600"></lucide-icon>
            Add New Template Trip
          </h2>
          <button (click)="closeModal()" class="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-400 hover:text-slate-600">
            &times;
          </button>
        </div>

        <form (ngSubmit)="submitTemplateTrip()" class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
             <div class="col-span-2">
                <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Trip Title <span class="text-rose-500">*</span></label>
                <input type="text" [(ngModel)]="formData.name" name="name" required placeholder="e.g. Sahara Desert Expedition" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all">
             </div>
             <div class="col-span-2">
                <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Destination <span class="text-rose-500">*</span></label>
                <input type="text" [(ngModel)]="formData.destination" name="destination" required placeholder="e.g. Douz, Kebili" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all">
             </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
             <div>
                <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Difficulty <span class="text-rose-500">*</span></label>
                <select [(ngModel)]="formData.adventureLevel" name="adventureLevel" required class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all">
                   <option value="easy">Easy</option>
                   <option value="moderate">Moderate</option>
                   <option value="hard">Hard / Advanced</option>
                </select>
             </div>
             <div>
                <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Est. Budget (TND) <span class="text-rose-500">*</span></label>
                <input type="number" [(ngModel)]="formData.estimatedBudget" name="estimatedBudget" required min="0" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all">
             </div>
          </div>

          <div class="col-span-2">
            <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Cover Image URL</label>
            <input type="text" [(ngModel)]="formData.imageUrl" name="imageUrl" placeholder="https://images.unsplash.com/..." class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all">
            <div *ngIf="formData.imageUrl" class="mt-2 w-full h-24 rounded-lg overflow-hidden border border-slate-200 shadow-inner bg-slate-100 flex items-center justify-center">
               <img [src]="formData.imageUrl" class="h-full w-full object-cover">
            </div>
            <p class="text-[10px] text-slate-400 mt-1">Leave empty for a default image based on destination.</p>
          </div>

          <div *ngIf="submitMessage()" class="p-3 rounded-lg text-sm" [ngClass]="submitSuccess() ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'">
            {{ submitMessage() }}
          </div>
          
          <div class="pt-4 border-t border-slate-100 flex justify-end gap-3 mt-4">
            <button type="button" (click)="closeModal()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors">
              Cancel
            </button>
            <button type="submit" [disabled]="!formData.name || !formData.destination" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
              Create Template
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
    styles: []
})
export class AdminTripsComponent implements OnInit {
    TentIcon = Tent;
    SearchIcon = Search;
    MoreVerticalIcon = MoreVertical;
    MapPinIcon = MapPin;
    CalendarIcon = Calendar;
    UsersIcon = Users;
    EyeIcon = Eye;
    Trash2Icon = Trash2;

    trips = signal<Trip[]>([]);
    isLoading = signal<boolean>(true);

    isModalOpen = signal(false);
    submitMessage = signal('');
    submitSuccess = signal(false);
    formData = {
        name: '',
        destination: '',
        adventureLevel: 'moderate',
        estimatedBudget: 0,
        imageUrl: ''
    };

    constructor(private tripService: TripService) { }

    ngOnInit(): void {
        this.loadTrips();
    }

    loadTrips() {
        this.isLoading.set(true);
        this.tripService.getAllTripsAdmin().subscribe({
            next: (data) => {
                this.trips.set(data);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Error fetching trips for admin', err);
                this.isLoading.set(false);
            }
        });
    }

    deleteTrip(tripId: string) {
        if (confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
            this.tripService.deleteTrip(tripId).subscribe({
                next: () => {
                    this.trips.update(current => current.filter(t => t.id !== tripId));
                },
                error: (err) => console.error('Error deleting trip', err)
            });
        }
    }

    isUpcoming(dateStr: string): boolean {
        return new Date(dateStr) > new Date();
    }

    openCreateModal() {
        this.resetForm();
        this.submitMessage.set('');
        this.isModalOpen.set(true);
    }

    closeModal() {
        this.isModalOpen.set(false);
        this.resetForm();
    }

    resetForm() {
        this.formData = {
            name: '',
            destination: '',
            adventureLevel: 'moderate',
            estimatedBudget: 0,
            imageUrl: ''
        };
    }

    submitTemplateTrip() {
        const newTrip = {
            name: this.formData.name,
            destination: this.formData.destination,
            adventureLevel: this.formData.adventureLevel,
            budget: { estimated: this.formData.estimatedBudget || 0, actual: 0 },
            imageUrl: this.formData.imageUrl || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80',
            isTemplate: true // the key indicator
        };

        this.tripService.createTrip(newTrip).subscribe({
            next: (created) => {
                this.submitSuccess.set(true);
                this.submitMessage.set('Template Trip created successfully!');
                this.loadTrips(); // refresh list
                setTimeout(() => this.closeModal(), 1500);
            },
            error: (err) => {
                this.submitSuccess.set(false);
                this.submitMessage.set('Failed to create template trip.');
                console.error(err);
            }
        });
    }
}
