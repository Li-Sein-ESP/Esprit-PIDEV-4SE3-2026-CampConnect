import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, Plus, Edit, Trash2, MapPin, Star, Users, DollarSign } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';
import { BadgeComponent } from '../../../shared/components/badge.component';
import { CampsiteService, Campsite } from '../../../core/services/campsite.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-sites-management-component',
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
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Campsites Management</h1>
          <p class="text-gray-500">Manage all registered campsites in the platform</p>
        </div>
        <button [routerLink]="['/admin/sites/new']" class="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
          <lucide-icon [img]="Plus" size="18"></lucide-icon>
          Add New Campsite
        </button>
      </div>

      <div class="grid grid-cols-1 gap-6">
        <app-card *ngFor="let site of campsites" variant="default" padding="none" class="overflow-hidden">
          <app-card-content customClass="p-0">
            <div class="flex flex-col md:flex-row">
              <!-- Thumbnail -->
              <div class="w-full md:w-48 h-48 md:h-auto bg-gray-100 flex-shrink-0">
                <img *ngIf="site.images?.length" [src]="site.images[0]" class="w-full h-full object-cover">
                <div *ngIf="!site.images?.length" class="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              </div>

              <!-- Details -->
              <div class="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <div class="flex justify-between items-start mb-2">
                    <h2 class="text-xl font-bold">{{ site.name }}</h2>
                    <app-badge [variant]="site.status === 'ACTIVE' ? 'success' : 'warning'">
                      {{ site.status }}
                    </app-badge>
                  </div>
                  <div class="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span class="flex items-center gap-1"><lucide-icon [img]="MapPin" size="14"></lucide-icon> {{ site.location }}</span>
                    <span class="flex items-center gap-1"><lucide-icon [img]="Users" size="14"></lucide-icon> {{ site.capacity }} guests</span>
                    <span class="flex items-center gap-1"><lucide-icon [img]="DollarSign" size="14"></lucide-icon> {{ site.price }}/night</span>
                  </div>
                  <p class="text-gray-600 line-clamp-2 text-sm">{{ site.description }}</p>
                </div>

                <div class="flex justify-end gap-2 mt-4">
                  <button [routerLink]="['/admin/sites/edit', site.id]" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <lucide-icon [img]="Edit" size="18"></lucide-icon>
                  </button>
                  <button (click)="deleteCampsite(site.id)" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <lucide-icon [img]="Trash2" size="18"></lucide-icon>
                  </button>
                </div>
              </div>
            </div>
          </app-card-content>
        </app-card>
      </div>

      <div *ngIf="campsites.length === 0" class="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
        <p class="text-gray-500 font-medium">No campsites found. Add your first one!</p>
      </div>
    </div>
  `,
  styles: []
})
export class AdminSitesManagementComponent implements OnInit {
  readonly Plus = Plus;
  readonly Edit = Edit;
  readonly Trash2 = Trash2;
  readonly MapPin = MapPin;
  readonly Star = Star;
  readonly Users = Users;
  readonly DollarSign = DollarSign;

  campsites: Campsite[] = [];
  allCampsites: Campsite[] = [];

  constructor(
    private campsiteService: CampsiteService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCampsites();
  }

  loadCampsites(): void {
    this.campsiteService.getAllCampsites().subscribe((data: Campsite[]) => {
      this.allCampsites = data;
      const currentUser = this.authService.currentUserValue;
      
      // Filter: Admin only sees their own sites (or legacy sites without creator)
      this.campsites = data.filter(c => c.creatorUsername === currentUser?.username || !c.creatorUsername);
      
      this.cdr.detectChanges();
    });
  }

  deleteCampsite(id: string): void {
    if (confirm('Are you sure you want to delete this campsite?')) {
      this.campsiteService.deleteCampsite(id).subscribe(() => {
        this.loadCampsites();
      });
    }
  }
}
