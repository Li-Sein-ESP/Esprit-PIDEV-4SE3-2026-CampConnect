<<<<<<< HEAD
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';
=======
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LucideAngularModule, Plus, Pencil, Trash2, MapPin, Users, DollarSign, Star, X, Check, AlertTriangle, Image as ImageIcon, Upload, Loader2 } from 'lucide-angular';
import { CampsiteService, Campsite } from '../../../core/services/campsite.service';
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)

@Component({
  selector: 'app-admin-sites-management-component',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
<<<<<<< HEAD
    LucideAngularModule,
    ButtonComponent,
    CardComponent,
    CardContentComponent
  ],
  templateUrl: './admin-sites-management.component.html',
  styles: []
})
export class AdminSitesManagementComponent {
  // Component logic will be implemented
}
=======
    FormsModule,
    ReactiveFormsModule,
    LucideAngularModule,
  ],
  template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4">
      <div class="max-w-7xl mx-auto">

        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">🏕️ Campsite Management</h1>
            <p class="text-gray-500 mt-1">Add, edit and remove campsites from the platform</p>
          </div>
          <button (click)="openCreateModal()"
            class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow transition-all">
            <lucide-icon [img]="Plus" size="18"></lucide-icon>
            Add Campsite
          </button>
        </div>

        <!-- Stats Bar -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <div class="text-2xl font-bold text-emerald-600">{{ campsites.length }}</div>
            <div class="text-xs text-gray-500 mt-1">Total Campsites</div>
          </div>
          <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <div class="text-2xl font-bold text-blue-600">{{ availableCount }}</div>
            <div class="text-xs text-gray-500 mt-1">Available</div>
          </div>
          <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <div class="text-2xl font-bold text-orange-500">{{ unavailableCount }}</div>
            <div class="text-xs text-gray-500 mt-1">Unavailable</div>
          </div>
          <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <div class="text-2xl font-bold text-purple-600">{{ avgRating | number:'1.1-1' }}</div>
            <div class="text-xs text-gray-500 mt-1">Avg Rating</div>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="mb-6">
          <input type="text" [(ngModel)]="searchQuery" placeholder="Search by name or location..."
            class="w-full sm:w-96 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white shadow-sm"/>
        </div>

        <!-- Loading -->
        <div *ngIf="isLoading" class="text-center py-16 text-gray-400">
          <div class="animate-spin text-4xl mb-3">⏳</div>
          <p>Loading campsites...</p>
        </div>

        <!-- Campsite Table Card -->
        <div *ngIf="!isLoading" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table class="w-full text-sm" *ngIf="filteredCampsites.length > 0">
            <thead>
              <tr class="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
                <th class="px-6 py-4 text-left">Name</th>
                <th class="px-6 py-4 text-left hidden sm:table-cell">Location</th>
                <th class="px-6 py-4 text-right hidden md:table-cell">Price</th>
                <th class="px-6 py-4 text-center hidden md:table-cell">Capacity</th>
                <th class="px-6 py-4 text-center">Status</th>
                <th class="px-6 py-4 text-center hidden sm:table-cell">Rating</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let site of filteredCampsites"
                class="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4">
                  <div class="font-semibold text-gray-900">{{ site.name }}</div>
                  <div class="text-xs text-gray-400">{{ site.description | slice:0:50 }}...</div>
                </td>
                <td class="px-6 py-4 hidden sm:table-cell">
                  <span class="flex items-center gap-1 text-gray-500">
                    <lucide-icon [img]="MapPin" size="14"></lucide-icon>
                    {{ site.location }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right hidden md:table-cell font-medium text-gray-700">
                  {{ '$' + site.price + '/night' }}
                </td>
                <td class="px-6 py-4 text-center hidden md:table-cell text-gray-600">
                  <span class="flex items-center justify-center gap-1">
                    <lucide-icon [img]="Users" size="14"></lucide-icon>
                    {{ site.capacity }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="px-2.5 py-1 rounded-full text-xs font-semibold"
                    [ngClass]="site.available ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'">
                    {{ site.available ? 'Available' : 'Unavailable' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center hidden sm:table-cell">
                  <span class="flex items-center justify-center gap-1 text-yellow-500 font-medium">
                    <lucide-icon [img]="Star" size="14"></lucide-icon>
                    {{ site.rating || '—' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button (click)="openEditModal(site)"
                      class="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                      <lucide-icon [img]="Pencil" size="16"></lucide-icon>
                    </button>
                    <button (click)="confirmDelete(site)"
                      class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                      <lucide-icon [img]="Trash2" size="16"></lucide-icon>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty State -->
          <div *ngIf="filteredCampsites.length === 0" class="text-center py-16">
            <div class="text-5xl mb-4">🏕️</div>
            <h3 class="text-lg font-semibold text-gray-700 mb-2">No campsites found</h3>
            <p class="text-gray-400 mb-6">{{ searchQuery ? 'Try a different search term.' : 'Start by adding your first campsite.' }}</p>
            <button *ngIf="!searchQuery" (click)="openCreateModal()"
              class="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all">
              Add First Campsite
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- CREATE / EDIT MODAL -->
    <div *ngIf="showModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between px-6 py-4 border-b">
          <h2 class="text-xl font-bold text-gray-900">
            {{ isEditing ? '✏️ Edit Campsite' : '➕ Add New Campsite' }}
          </h2>
          <button (click)="closeModal()" class="p-2 hover:bg-gray-100 rounded-lg transition-all">
            <lucide-icon [img]="X" size="20"></lucide-icon>
          </button>
        </div>

        <form [formGroup]="campsiteForm" (ngSubmit)="saveForm()" class="p-6 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <label class="block text-sm font-semibold text-gray-700 mb-1">Campsite Name *</label>
              <input type="text" formControlName="name" placeholder="e.g. Pine Valley Camping"
                class="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400">
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-semibold text-gray-700 mb-1">Location *</label>
              <input type="text" formControlName="location" placeholder="e.g. Colorado, USA"
                class="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400">
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
              <textarea formControlName="description" rows="3" placeholder="Describe the campsite..."
                class="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"></textarea>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Price / Night ($) *</label>
              <input type="number" formControlName="price" min="0" placeholder="25"
                class="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400">
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Capacity (persons) *</label>
              <input type="number" formControlName="capacity" min="1" placeholder="10"
                class="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400">
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Latitude</label>
              <input type="number" formControlName="latitude" step="0.000001" placeholder="36.7783"
                class="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400">
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Longitude</label>
              <input type="number" formControlName="longitude" step="0.000001" placeholder="-119.4179"
                class="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400">
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Status</label>
              <select formControlName="status"
                class="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>
            <div class="flex items-center gap-3 pt-6">
              <label class="text-sm font-semibold text-gray-700">Available</label>
              <button type="button" (click)="toggleAvailable()"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                [ngClass]="campsiteForm.get('available')?.value ? 'bg-emerald-500' : 'bg-gray-300'">
                <span class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                  [ngClass]="campsiteForm.get('available')?.value ? 'translate-x-6' : 'translate-x-1'"></span>
              </button>
              <span class="text-sm text-gray-500">{{ campsiteForm.get('available')?.value ? 'Yes' : 'No' }}</span>
            </div>
          </div>

          <!-- Amenities -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Amenities</label>
            <div class="flex flex-wrap gap-2 mb-2">
              <span *ngFor="let a of amenitiesList; let i = index"
                class="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm">
                {{ a }}
                <button type="button" (click)="removeAmenity(i)" class="text-emerald-400 hover:text-emerald-700">×</button>
              </span>
            </div>
            <div class="flex gap-2">
              <input type="text" [(ngModel)]="newAmenity" [ngModelOptions]="{standalone: true}"
                placeholder="e.g. WiFi, Parking, Showers..."
                class="flex-1 px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
              <button type="button" (click)="addAmenity()"
                class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-all">Add</button>
            </div>
          </div>

          <!-- Images Section -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Campsite Images</label>

            <!-- Preview Grid -->
            <div class="flex flex-wrap gap-3 mb-3" *ngIf="imagesList.length > 0">
              <div *ngFor="let img of imagesList; let i = index"
                class="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 group">
                <img [src]="getImageDisplayUrl(img)" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <button type="button" (click)="removeImage(i)" class="text-white">
                    <lucide-icon [img]="X" size="18"></lucide-icon>
                  </button>
                </div>
              </div>
            </div>

            <!-- Upload Button -->
            <label class="flex items-center gap-2 w-fit px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium cursor-pointer transition-all">
              <input type="file" accept="image/*" multiple class="hidden" (change)="onImagesSelected($event)" [disabled]="isUploading" />
              <lucide-icon [img]="isUploading ? Loader2 : Upload" size="16" [class.animate-spin]="isUploading"></lucide-icon>
              {{ isUploading ? 'Uploading...' : 'Upload Photos' }}
            </label>
          </div>

          <!-- Error -->
          <div *ngIf="errorMessage" class="flex items-center gap-2 bg-red-50 text-red-600 rounded-xl p-3 text-sm">
            <lucide-icon [img]="AlertTriangle" size="16"></lucide-icon>
            {{ errorMessage }}
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" (click)="closeModal()"
              class="px-5 py-2.5 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button type="submit" [disabled]="campsiteForm.invalid || isSaving"
              class="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all">
              <lucide-icon *ngIf="!isSaving" [img]="Check" size="18"></lucide-icon>
              {{ isSaving ? 'Saving...' : (isEditing ? 'Update Campsite' : 'Create Campsite') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- DELETE CONFIRM MODAL -->
    <div *ngIf="showDeleteConfirm" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div class="text-center mb-4">
          <div class="text-5xl mb-3">⚠️</div>
          <h3 class="text-lg font-bold text-gray-900">Delete Campsite?</h3>
          <p class="text-gray-500 mt-1 text-sm">
            "<strong>{{ siteToDelete?.name }}</strong>" will be permanently removed.
          </p>
        </div>
        <div class="flex gap-3">
          <button (click)="showDeleteConfirm = false" class="flex-1 px-4 py-2.5 border rounded-xl font-medium hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button (click)="executeDelete()" [disabled]="isDeleting"
            class="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50">
            {{ isDeleting ? 'Deleting...' : 'Yes, Delete' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AdminSitesManagementComponent implements OnInit {
  readonly Plus = Plus;
  readonly Pencil = Pencil;
  readonly Trash2 = Trash2;
  readonly MapPin = MapPin;
  readonly Users = Users;
  readonly DollarSign = DollarSign;
  readonly Star = Star;
  readonly X = X;
  readonly Check = Check;
  readonly AlertTriangle = AlertTriangle;
  readonly ImageIcon = ImageIcon;
  readonly Upload = Upload;
  readonly Loader2 = Loader2;

  readonly backendBase = 'http://localhost:8090';

  campsites: Campsite[] = [];
  isLoading = true;
  searchQuery = '';

  imagesList: string[] = [];
  isUploading = false;

  showModal = false;
  isEditing = false;
  isSaving = false;
  errorMessage = '';
  editingId: string | null = null;

  showDeleteConfirm = false;
  siteToDelete: Campsite | null = null;
  isDeleting = false;

  amenitiesList: string[] = [];
  newAmenity = '';

  campsiteForm: FormGroup;

  constructor(
    private campsiteService: CampsiteService,
    private fb: FormBuilder
  ) {
    this.campsiteForm = this.fb.group({
      name: ['', Validators.required],
      location: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      capacity: [1, [Validators.required, Validators.min(1)]],
      latitude: [null],
      longitude: [null],
      status: ['ACTIVE'],
      available: [true],
      rating: [0],
      reviewCount: [0]
    });
  }

  ngOnInit(): void {
    this.loadCampsites();
  }

  loadCampsites(): void {
    this.isLoading = true;
    this.campsiteService.getAllCampsites().subscribe({
      next: (data) => { this.campsites = data; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  get filteredCampsites(): Campsite[] {
    if (!this.searchQuery) return this.campsites;
    const q = this.searchQuery.toLowerCase();
    return this.campsites.filter(c =>
      c.name?.toLowerCase().includes(q) || c.location?.toLowerCase().includes(q)
    );
  }

  get availableCount(): number { return this.campsites.filter(c => c.available).length; }
  get unavailableCount(): number { return this.campsites.filter(c => !c.available).length; }
  get avgRating(): number {
    const rated = this.campsites.filter(c => c.rating);
    return rated.length ? rated.reduce((s, c) => s + c.rating, 0) / rated.length : 0;
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.editingId = null;
    this.amenitiesList = [];
    this.imagesList = [];
    this.campsiteForm.reset({ status: 'ACTIVE', available: true, price: 0, capacity: 1, rating: 0, reviewCount: 0 });
    this.errorMessage = '';
    this.showModal = true;
  }

  openEditModal(site: Campsite): void {
    this.isEditing = true;
    this.editingId = site.id;
    this.amenitiesList = [...(site.amenities || [])];
    this.imagesList = [...(site.images || [])];
    this.campsiteForm.patchValue({
      name: site.name,
      location: site.location,
      description: site.description,
      price: site.price,
      capacity: site.capacity,
      latitude: site.latitude,
      longitude: site.longitude,
      status: site.status || 'ACTIVE',
      available: site.available,
      rating: site.rating,
      reviewCount: site.reviewCount
    });
    this.errorMessage = '';
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  toggleAvailable(): void {
    const ctrl = this.campsiteForm.get('available');
    ctrl?.setValue(!ctrl.value);
  }

  addAmenity(): void {
    const val = this.newAmenity.trim();
    if (val && !this.amenitiesList.includes(val)) {
      this.amenitiesList.push(val);
      this.newAmenity = '';
    }
  }

  removeAmenity(index: number): void { this.amenitiesList.splice(index, 1); }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const files = Array.from(input.files);
    this.isUploading = true;
    this.errorMessage = '';
    let completed = 0;

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        completed++;
        if (completed === files.length) this.isUploading = false;
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) this.imagesList.push(dataUrl);
        completed++;
        if (completed === files.length) this.isUploading = false;
      };
      reader.onerror = () => {
        completed++;
        if (completed === files.length) this.isUploading = false;
      };
      reader.readAsDataURL(file);
    });

    input.value = '';
  }

  removeImage(index: number): void { this.imagesList.splice(index, 1); }

  getImageDisplayUrl(url: string): string {
    return url; // works for both data: URLs and http URLs
  }

  saveForm(): void {
    if (this.campsiteForm.invalid) return;
    this.isSaving = true;
    this.errorMessage = '';
    const payload: Campsite = { ...this.campsiteForm.value, amenities: this.amenitiesList, images: this.imagesList };

    const request$ = this.isEditing && this.editingId
      ? this.campsiteService.updateCampsite(this.editingId, { ...payload, id: this.editingId })
      : this.campsiteService.createCampsite(payload);

    request$.subscribe({
      next: () => { this.isSaving = false; this.closeModal(); this.loadCampsites(); },
      error: (err) => { this.isSaving = false; this.errorMessage = 'Failed to save campsite. Please try again.'; }
    });
  }

  confirmDelete(site: Campsite): void { this.siteToDelete = site; this.showDeleteConfirm = true; }

  executeDelete(): void {
    if (!this.siteToDelete?.id) return;
    this.isDeleting = true;
    this.campsiteService.deleteCampsite(this.siteToDelete.id).subscribe({
      next: () => { this.isDeleting = false; this.showDeleteConfirm = false; this.siteToDelete = null; this.loadCampsites(); },
      error: () => { this.isDeleting = false; }
    });
  }
}

>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
