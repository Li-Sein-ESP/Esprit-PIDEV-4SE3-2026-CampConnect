import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LucideAngularModule, ChevronLeft, MapPin, DollarSign, Users, Check, Plus, X, Loader2, Info } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardDescriptionComponent, CardContentComponent } from '../../../shared/components/card.component';
import { CampsiteService, Campsite } from '../../../core/services/campsite.service';

@Component({
  selector: 'app-campsite-create',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    LucideAngularModule,
    ButtonComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent
  ],
  template: `
    <div class="container py-8 max-w-4xl">
      <!-- Header -->
      <div class="mb-8">
        <button 
          routerLink="/campsites"
          class="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary-600)] transition-colors mb-4"
        >
          <lucide-icon [name]="ChevronLeftIcon" [size]="20"></lucide-icon>
          Back to Campsites
        </button>
        <h1 class="text-3xl font-bold text-[var(--color-text-heading)] mb-2">
          Create New Campsite
        </h1>
        <p class="text-[var(--color-text-secondary)]">
          List your campsite on CampConnect and reach thousands of campers.
        </p>
      </div>

      <form [formGroup]="campsiteForm" (ngSubmit)="onSubmit()">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main Info -->
          <div class="lg:col-span-2 space-y-6">
            <app-card>
              <app-card-header>
                <app-card-title>General Information</app-card-title>
                <app-card-description>Basic details about your campsite</app-card-description>
              </app-card-header>
              <app-card-content class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                    Campsite Name
                  </label>
                  <input
                    type="text"
                    formControlName="name"
                    placeholder="e.g. Pine Valley Retreat"
                    class="w-full px-4 py-2.5 rounded-lg bg-white border-2 border-[var(--color-border-light)] focus:border-[var(--color-primary-500)] focus:outline-none transition-all"
                  />
                  <div *ngIf="campsiteForm.get('name')?.touched && campsiteForm.get('name')?.invalid" class="text-red-500 text-xs mt-1">
                    Name is required (min 3 characters).
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                    Location
                  </label>
                  <div class="relative">
                    <lucide-icon [name]="MapPinIcon" [size]="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"></lucide-icon>
                    <input
                      type="text"
                      formControlName="location"
                      placeholder="e.g. Yosemite National Park, CA"
                      class="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border-2 border-[var(--color-border-light)] focus:border-[var(--color-primary-500)] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                    Description
                  </label>
                  <textarea
                    formControlName="description"
                    rows="5"
                    placeholder="Describe your campsite, what makes it unique, wildlife, terrain, etc."
                    class="w-full px-4 py-2.5 rounded-lg bg-white border-2 border-[var(--color-border-light)] focus:border-[var(--color-primary-500)] focus:outline-none transition-all resize-none"
                  ></textarea>
                </div>
              </app-card-content>
            </app-card>

            <app-card>
              <app-card-header>
                <app-card-title>Amenities & Features</app-card-title>
                <app-card-description>What does your campsite offer?</app-card-description>
              </app-card-header>
              <app-card-content>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <label *ngFor="let amenity of availableAmenities" class="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border-light)] cursor-pointer hover:bg-[var(--color-neutral-50)] transition-colors">
                    <input
                      type="checkbox"
                      [checked]="isAmenitySelected(amenity)"
                      (change)="toggleAmenity(amenity)"
                      class="w-4 h-4 text-[var(--color-primary-600)] rounded border-[var(--color-border-light)] focus:ring-[var(--color-primary-500)]"
                    />
                    <span class="text-sm text-[var(--color-text-primary)]">{{ amenity }}</span>
                  </label>
                </div>
              </app-card-content>
            </app-card>

            <app-card>
              <app-card-header>
                <app-card-title>Image URLs</app-card-title>
                <app-card-description>Add links to photos of your campsite</app-card-description>
              </app-card-header>
              <app-card-content class="space-y-4">
                <div *ngFor="let img of images; let i = index" class="flex gap-2">
                  <input
                    type="text"
                    [(ngModel)]="images[i]"
                    [ngModelOptions]="{standalone: true}"
                    placeholder="https://images.unsplash.com/..."
                    class="flex-1 px-4 py-2 rounded-lg bg-white border border-[var(--color-border-light)] focus:outline-none focus:border-[var(--color-primary-500)]"
                  />
                  <button type="button" (click)="removeImage(i)" class="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <lucide-icon [name]="XIcon" [size]="20"></lucide-icon>
                  </button>
                </div>
                <button type="button" (click)="addImage()" class="flex items-center gap-2 text-sm text-[var(--color-primary-600)] font-medium">
                  <lucide-icon [name]="PlusIcon" [size]="16"></lucide-icon>
                  Add another image URL
                </button>
              </app-card-content>
            </app-card>
          </div>

          <!-- Sidebar Info -->
          <div class="space-y-6">
            <app-card>
              <app-card-header>
                <app-card-title>Pricing & Capacity</app-card-title>
              </app-card-header>
              <app-card-content class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                    Price per Night ($)
                  </label>
                  <div class="relative">
                    <lucide-icon [name]="DollarSignIcon" [size]="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"></lucide-icon>
                    <input
                      type="number"
                      formControlName="price"
                      class="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border-2 border-[var(--color-border-light)] focus:border-[var(--color-primary-500)] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                    Max Capacity (People)
                  </label>
                  <div class="relative">
                    <lucide-icon [name]="UsersIcon" [size]="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"></lucide-icon>
                    <input
                      type="number"
                      formControlName="capacity"
                      class="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border-2 border-[var(--color-border-light)] focus:border-[var(--color-primary-500)] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div class="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="available"
                    formControlName="available"
                    class="w-5 h-5 text-[var(--color-primary-600)] rounded border-[var(--color-border-light)] focus:ring-[var(--color-primary-500)]"
                  />
                  <label for="available" class="text-sm font-medium text-[var(--color-text-primary)]">
                    Available for bookings now
                  </label>
                </div>
              </app-card-content>
            </app-card>

            <app-card class="bg-[var(--color-primary-50)] border-[var(--color-primary-100)]">
              <app-card-content class="p-6">
                <div class="flex gap-4">
                  <div class="w-10 h-10 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center shrink-0">
                    <lucide-icon [name]="InfoIcon" [size]="20" class="text-[var(--color-primary-600)]"></lucide-icon>
                  </div>
                  <div>
                    <h4 class="font-semibold text-[var(--color-primary-900)] mb-1">Tips for great listings</h4>
                    <ul class="text-sm text-[var(--color-primary-700)] space-y-2">
                      <li>• Provide clear, high-resolution images.</li>
                      <li>• Be specific about accessibility and local rules.</li>
                      <li>• Update your availability regularly.</li>
                    </ul>
                  </div>
                </div>
              </app-card-content>
            </app-card>

            <div class="flex flex-col gap-3">
              <button
                type="submit"
                [disabled]="campsiteForm.invalid || isSubmitting"
                class="w-full py-3 bg-[var(--color-primary-600)] text-white rounded-xl font-semibold hover:bg-[var(--color-primary-700)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-[var(--color-primary-200)]"
              >
                <lucide-icon *ngIf="isSubmitting" [name]="LoaderIcon" [size]="18" class="animate-spin"></lucide-icon>
                {{ isSubmitting ? 'Creating Listing...' : 'Publish Campsite' }}
              </button>
              <button
                type="button"
                routerLink="/campsites"
                class="w-full py-3 bg-white text-[var(--color-text-primary)] border border-[var(--color-border-light)] rounded-xl font-semibold hover:bg-[var(--color-neutral-50)] transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  `,
  styles: []
})
export class CampsiteCreateComponent {
  // Icons
  ChevronLeftIcon = ChevronLeft;
  MapPinIcon = MapPin;
  DollarSignIcon = DollarSign;
  UsersIcon = Users;
  CheckIcon = Check;
  PlusIcon = Plus;
  XIcon = X;
  LoaderIcon = Loader2;
  InfoIcon = Info;

  campsiteForm: FormGroup;
  isSubmitting = false;
  selectedAmenities: string[] = [];
  images: string[] = [''];

  availableAmenities = [
    'WiFi', 'Fire Pit', 'Potable Water', 'Restrooms', 'Showers',
    'Picnic Table', 'Power Outlets', 'Hiking Trails', 'Pet Friendly',
    'Lake Access', 'Beach Access', 'Trash Disposal'
  ];

  constructor(
    private fb: FormBuilder,
    private campsiteService: CampsiteService,
    private router: Router
  ) {
    this.campsiteForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      location: ['', Validators.required],
      description: ['', Validators.required],
      price: [50, [Validators.required, Validators.min(0)]],
      capacity: [4, [Validators.required, Validators.min(1)]],
      available: [true]
    });
  }

  toggleAmenity(amenity: string): void {
    const index = this.selectedAmenities.indexOf(amenity);
    if (index >= 0) {
      this.selectedAmenities.splice(index, 1);
    } else {
      this.selectedAmenities.push(amenity);
    }
  }

  isAmenitySelected(amenity: string): boolean {
    return this.selectedAmenities.includes(amenity);
  }

  addImage(): void {
    this.images.push('');
  }

  removeImage(index: number): void {
    if (this.images.length > 1) {
      this.images.splice(index, 1);
    } else {
      this.images[0] = '';
    }
  }

  onSubmit(): void {
    if (this.campsiteForm.valid) {
      this.isSubmitting = true;
      const formValue = this.campsiteForm.value;
      
      const newCampsite: Campsite = {
        id: '', // Will be generated by backend
        ...formValue,
        amenities: this.selectedAmenities,
        images: this.images.filter(img => img.trim() !== ''),
        rating: 0,
        reviewCount: 0
      };

      this.campsiteService.createCampsite(newCampsite).subscribe({
        next: (created) => {
          console.log('Campsite created:', created);
          this.isSubmitting = false;
          this.router.navigate(['/campsites']);
        },
        error: (err) => {
          console.error('Error creating campsite:', err);
          this.isSubmitting = false;
          // You could add a toast notification here
          alert('Failed to create campsite. Please check your backend connection.');
        }
      });
    }
  }
}
