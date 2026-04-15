import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MapViewComponent, MapMarker } from '../../../shared/components/map-view/map-view.component';
import { LucideAngularModule, MapPin, Save, X, Navigation, Home, CalendarRange, Info, DollarSign, Users, ShieldAlert, Check } from 'lucide-angular';
import { CampsiteService, Campsite } from '../../../core/services/campsite.service';

@Component({
  selector: 'app-campsite-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, MapViewComponent, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-stone-50 p-6 md:p-8 font-sans">
      
      <!-- Header -->
      <header class="mb-8 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-stone-900 tracking-tight">{{ isEditMode() ? 'Edit Campsite' : 'Add New Campsite' }}</h1>
          <p class="text-stone-500 mt-2 text-lg">Manage campsite information, amenities, and location.</p>
        </div>
        <div class="flex items-center gap-3">
          <button 
            type="button"
            (click)="cancel()"
            class="px-5 py-2.5 bg-white border border-stone-200 text-stone-700 font-semibold rounded-xl hover:bg-stone-50 transition-colors flex items-center gap-2"
          >
            <lucide-icon [img]="X" size="18"></lucide-icon>
            Cancel
          </button>
          <button 
            (click)="saveCampsite()"
            [disabled]="campsiteForm.invalid || isSaving()"
            class="px-5 py-2.5 bg-stone-900 text-white font-semibold rounded-xl hover:bg-stone-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-stone-900/10"
          >
            <lucide-icon *ngIf="!isSaving()" [img]="Save" size="18"></lucide-icon>
            <svg *ngIf="isSaving()" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isSaving() ? 'Saving...' : 'Save Campsite' }}
          </button>
        </div>
      </header>

      <!-- Main Layout -->
      <main class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Left: Form -->
        <section class="lg:col-span-7 space-y-8">
          
          <form [formGroup]="campsiteForm" class="space-y-8">
            
            <!-- Basic Details Card -->
            <div class="bg-white rounded-2xl p-6 md:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-stone-200">
              <h2 class="flex items-center gap-2 text-lg font-bold text-stone-800 mb-6 pb-4 border-b border-stone-100">
                <lucide-icon [img]="Info" size="20" class="text-stone-400"></lucide-icon>
                Basic Details
              </h2>
              
              <div class="space-y-5">
                <div>
                  <label class="block text-sm font-semibold text-stone-700 mb-1.5">Campsite Name <span class="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    formControlName="name"
                    class="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium text-stone-800 placeholder:font-normal placeholder:text-stone-400"
                    placeholder="e.g. Whispering Pines"
                  />
                </div>

                <div>
                  <label class="block text-sm font-semibold text-stone-700 mb-1.5">Location <span class="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    formControlName="location"
                    class="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium text-stone-800 placeholder:font-normal placeholder:text-stone-400"
                    placeholder="e.g. Zaghouan, Tunisia"
                  />
                </div>

                <div>
                  <label class="block text-sm font-semibold text-stone-700 mb-1.5">Description <span class="text-red-500">*</span></label>
                  <textarea 
                    formControlName="description"
                    rows="4"
                    class="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium text-stone-800 resize-none placeholder:font-normal placeholder:text-stone-400"
                    placeholder="Describe the environment, terrain, and vibe..."
                  ></textarea>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label class="block text-sm font-semibold text-stone-700 mb-1.5">Capacity (Guests) <span class="text-red-500">*</span></label>
                    <div class="relative">
                      <input 
                        type="number" 
                        min="1"
                        formControlName="capacity"
                        class="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium text-stone-800"
                      />
                      <lucide-icon [img]="Users" size="18" class="absolute left-3.5 top-3.5 text-stone-400"></lucide-icon>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-stone-700 mb-1.5">Price Per Night ($) <span class="text-red-500">*</span></label>
                    <div class="relative">
                      <input 
                        type="number" 
                        min="0"
                        formControlName="price"
                        class="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium text-stone-800"
                      />
                      <lucide-icon [img]="DollarSign" size="18" class="absolute left-3.5 top-3.5 text-stone-400"></lucide-icon>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Features & Status Card -->
            <div class="bg-white rounded-2xl p-6 md:p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-stone-200">
              <h2 class="flex items-center gap-2 text-lg font-bold text-stone-800 mb-6 pb-4 border-b border-stone-100">
                <lucide-icon [img]="Home" size="20" class="text-stone-400"></lucide-icon>
                Features & Status
              </h2>

              <div class="space-y-6">
                <div>
                  <label class="block text-sm font-semibold text-stone-700 mb-1.5">Operational Status <span class="text-red-500">*</span></label>
                  <select 
                    formControlName="status"
                    class="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium text-stone-800 appearance-none"
                  >
                    <option value="ACTIVE">Active / Available</option>
                    <option value="INACTIVE">Inactive / Closed</option>
                    <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                  </select>
                </div>

                <div class="flex items-center gap-3 p-4 bg-stone-50 rounded-xl border border-stone-100">
                  <input 
                    type="checkbox" 
                    formControlName="available"
                    id="available"
                    class="w-5 h-5 text-emerald-600 border-stone-300 rounded focus:ring-emerald-500 transition-all cursor-pointer"
                  />
                  <label for="available" class="text-sm font-semibold text-stone-700 cursor-pointer">
                    Open for Instant Booking
                  </label>
                </div>
              </div>
            </div>

          </form>

        </section>

        <!-- Right: Map Picker -->
        <section class="lg:col-span-5 relative">
          <div class="sticky top-8 bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-stone-200 overflow-hidden flex flex-col">
            <div class="p-6 border-b border-stone-100">
              <h2 class="flex items-center gap-2 text-lg font-bold text-stone-800 mb-1">
                <lucide-icon [img]="MapPin" size="20" class="text-emerald-500"></lucide-icon>
                Map Location
              </h2>
            </div>
            
            <div class="relative h-[400px] w-full">
               <app-map-view 
                  [center]="mapCenter()" 
                  [zoom]="mapZoom()"
                  [markers]="pickerMarker() ? [pickerMarker()!] : []"
                  height="100%"
                ></app-map-view>
            </div>

            <div class="p-4 bg-stone-50 border-t border-stone-200 grid grid-cols-2 gap-4">
              <div>
                <label class="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Latitude</label>
                <input 
                  type="number" 
                  step="any"
                  formControlName="latitude"
                  [formControl]="$any(campsiteForm.controls['latitude'])"
                  class="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm font-medium text-stone-800"
                />
              </div>
              <div>
                <label class="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Longitude</label>
                <input 
                  type="number" 
                  step="any"
                  formControlName="longitude"
                  [formControl]="$any(campsiteForm.controls['longitude'])"
                  class="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm font-medium text-stone-800"
                />
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  `
})
export class CampsiteFormComponent implements OnInit {
  // Icons
  readonly MapPin = MapPin;
  readonly Save = Save;
  readonly X = X;
  readonly Navigation = Navigation;
  readonly Home = Home;
  readonly CalendarRange = CalendarRange;
  readonly Info = Info;
  readonly DollarSign = DollarSign;
  readonly Users = Users;
  readonly ShieldAlert = ShieldAlert;
  readonly Check = Check;

  campsiteForm: FormGroup;
  isEditMode = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  campsiteId = signal<string | null>(null);

  // Map state
  mapCenter = signal<{ lat: number; lng: number }>({ lat: 34.7404, lng: 9.1025 });
  mapZoom = signal<number>(6);

  pickerMarker = computed<MapMarker | null>(() => {
    const lat = this.campsiteForm.get('latitude')?.value;
    const lng = this.campsiteForm.get('longitude')?.value;
    if (lat && lng) {
      return {
        id: 'picker',
        lat: Number(lat),
        lng: Number(lng),
        title: 'Selected Location',
        type: 'campsite'
      };
    }
    return null;
  });

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private campsiteService: CampsiteService
  ) {
    this.campsiteForm = this.fb.group({
      name: ['', Validators.required],
      location: ['', Validators.required],
      description: ['', Validators.required],
      capacity: [2, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]],
      status: ['ACTIVE', Validators.required],
      available: [true],
      latitude: [34.7, Validators.required],
      longitude: [9.1, Validators.required]
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode.set(true);
        this.campsiteId.set(params['id']);
        this.loadCampsite(params['id']);
      }
    });
  }

  loadCampsite(id: string) {
    this.campsiteService.getCampsiteById(id).subscribe(campsite => {
      if (campsite) {
        this.campsiteForm.patchValue(campsite);
        if (campsite.latitude && campsite.longitude) {
            this.mapCenter.set({ lat: campsite.latitude, lng: campsite.longitude });
            this.mapZoom.set(10);
        }
      }
    });
  }

  saveCampsite() {
    if (this.campsiteForm.invalid) return;

    this.isSaving.set(true);
    const campsite = this.campsiteForm.value;

    if (this.isEditMode()) {
      this.campsiteService.updateCampsite(this.campsiteId()!, campsite).subscribe({
        next: () => this.router.navigate(['/admin/sites']),
        error: () => this.isSaving.set(false)
      });
    } else {
      this.campsiteService.createCampsite(campsite).subscribe({
        next: () => this.router.navigate(['/admin/sites']),
        error: () => this.isSaving.set(false)
      });
    }
  }

  cancel() {
    this.router.navigate(['/admin/sites']);
  }
}
