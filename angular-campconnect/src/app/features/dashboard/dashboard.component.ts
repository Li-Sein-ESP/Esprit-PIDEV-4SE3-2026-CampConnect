import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../shared/components/card.component';
import { BadgeComponent } from '../../shared/components/badge.component';
import { LucideAngularModule, Calendar, MapPin, Package, Users, Bell } from 'lucide-angular';
import { GroupInviteService } from '../groups/services/group-invite.service';
import { AuthService } from '../../core/services/auth.service';
import { UserApiService } from '../auth/services/user-api.service';
import { switchMap, of } from 'rxjs';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardContentComponent,
        BadgeComponent,
        LucideAngularModule
    ],
    template: `
    <div class="container py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-[var(--color-text-heading)] mb-2">
          Welcome Back, Adventurer!
        </h1>
        <p class="text-[var(--color-text-secondary)]">
          Here's what's happening with your outdoor adventures
        </p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <app-card variant="elevated" padding="md">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-[var(--color-primary-100)] flex items-center justify-center">
              <lucide-icon [img]="CalendarIcon" [size]="24" class="text-[var(--color-primary-600)]"></lucide-icon>
            </div>
            <div>
              <div class="text-2xl font-bold text-[var(--color-text-heading)]">{{ upcomingTrips }}</div>
              <div class="text-sm text-[var(--color-text-secondary)]">Upcoming Trips</div>
            </div>
          </div>
        </app-card>

        <app-card variant="elevated" padding="md">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-[var(--color-success-100)] flex items-center justify-center">
              <lucide-icon [img]="MapPinIcon" [size]="24" class="text-[var(--color-success-600)]"></lucide-icon>
            </div>
            <div>
              <div class="text-2xl font-bold text-[var(--color-text-heading)]">{{ savedCampsites }}</div>
              <div class="text-sm text-[var(--color-text-secondary)]">Saved Campsites</div>
            </div>
          </div>
        </app-card>

        <app-card variant="elevated" padding="md">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-[var(--color-accent-100)] flex items-center justify-center">
              <lucide-icon [img]="PackageIcon" [size]="24" class="text-[var(--color-accent-600)]"></lucide-icon>
            </div>
            <div>
              <div class="text-2xl font-bold text-[var(--color-text-heading)]">{{ gearRentals }}</div>
              <div class="text-sm text-[var(--color-text-secondary)]">Gear Rentals</div>
            </div>
          </div>
        </app-card>

        <app-card variant="elevated" padding="md">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-[var(--color-info-100)] flex items-center justify-center">
              <lucide-icon [img]="UsersIcon" [size]="24" class="text-[var(--color-info-600)]"></lucide-icon>
            </div>
            <div>
              <div class="text-2xl font-bold text-[var(--color-text-heading)]">{{ tripCompanions }}</div>
              <div class="text-sm text-[var(--color-text-secondary)]">Trip Companions</div>
            </div>
          </div>
        </app-card>
      </div>

      <!-- Recent Activity -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <app-card variant="default" padding="md">
          <app-card-header>
            <app-card-title>Upcoming Trips</app-card-title>
          </app-card-header>
          <app-card-content>
            <div class="space-y-4">
              <div class="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--color-neutral-50)] transition-colors cursor-pointer">
                <div>
                  <div class="font-medium text-[var(--color-text-primary)]">Yosemite National Park</div>
                  <div class="text-sm text-[var(--color-text-secondary)]">June 15-18, 2026</div>
                </div>
                <app-badge variant="success">Confirmed</app-badge>
              </div>
              <div class="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--color-neutral-50)] transition-colors cursor-pointer">
                <div>
                  <div class="font-medium text-[var(--color-text-primary)]">Grand Canyon</div>
                  <div class="text-sm text-[var(--color-text-secondary)]">July 1-5, 2026</div>
                </div>
                <app-badge variant="warning">Pending</app-badge>
              </div>
              <div class="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--color-neutral-50)] transition-colors cursor-pointer">
                <div>
                  <div class="font-medium text-[var(--color-text-primary)]">Yellowstone</div>
                  <div class="text-sm text-[var(--color-text-secondary)]">August 10-14, 2026</div>
                </div>
                <app-badge variant="info">Planning</app-badge>
              </div>
            </div>
          </app-card-content>
        </app-card>

        <app-card variant="default" padding="md">
          <app-card-header>
            <app-card-title>Quick Actions</app-card-title>
          </app-card-header>
          <app-card-content>
            <div class="grid grid-cols-2 gap-3">
              <a routerLink="/plan-trip" class="p-4 rounded-lg border-2 border-[var(--color-border-light)] hover:border-[var(--color-primary-300)] hover:bg-[var(--color-primary-50)] transition-all text-center">
                <div class="text-2xl mb-2">🗺️</div>
                <div class="text-sm font-medium text-[var(--color-text-primary)]">Plan Trip</div>
              </a>
              <a routerLink="/campsites" class="p-4 rounded-lg border-2 border-[var(--color-border-light)] hover:border-[var(--color-primary-300)] hover:bg-[var(--color-primary-50)] transition-all text-center">
                <div class="text-2xl mb-2">⛺</div>
                <div class="text-sm font-medium text-[var(--color-text-primary)]">Find Sites</div>
              </a>
              <a routerLink="/gear" class="p-4 rounded-lg border-2 border-[var(--color-border-light)] hover:border-[var(--color-primary-300)] hover:bg-[var(--color-primary-50)] transition-all text-center">
                <div class="text-2xl mb-2">🎒</div>
                <div class="text-sm font-medium text-[var(--color-text-primary)]">Rent Gear</div>
              </a>
              <a routerLink="/community" class="p-4 rounded-lg border-2 border-[var(--color-border-light)] hover:border-[var(--color-primary-300)] hover:bg-[var(--color-primary-50)] transition-all text-center">
                <div class="text-2xl mb-2">👥</div>
                <div class="text-sm font-medium text-[var(--color-text-primary)]">Community</div>
              </a>
              <a routerLink="/invites" class="p-4 rounded-lg border-2 border-[var(--color-border-light)] hover:border-red-300 hover:bg-red-50 transition-all text-center relative group">
                <div class="text-2xl mb-2 group-hover:scale-110 transition-transform">📩</div>
                <div class="text-sm font-medium text-[var(--color-text-primary)]">Invitations</div>
                <span *ngIf="(pendingCount$ | async) || 0 > 0" class="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm animate-bounce">
                  {{ pendingCount$ | async }}
                </span>
              </a>
            </div>
          </app-card-content>
        </app-card>
      </div>
    </div>
  `,
    styles: []
})
export class DashboardComponent implements OnInit {
    CalendarIcon = Calendar;
    MapPinIcon = MapPin;
    PackageIcon = Package;
    UsersIcon = Users;
    BellIcon = Bell;

    // Dashboard stats
    upcomingTrips = 0;
    savedCampsites = 0;
    gearRentals = 0;
    tripCompanions = 0;

    pendingCount$ = this.authService.getCurrentUser().pipe(
        switchMap(user => user ? this.inviteService.getPendingInvitesCount(user.id) : of(0))
    );

    constructor(
        private inviteService: GroupInviteService,
        private authService: AuthService,
        private userApi: UserApiService
    ) {}

    ngOnInit(): void {
        this.loadDashboardStats();
    }

    loadDashboardStats(): void {
        this.userApi.getUserStats().subscribe({
            next: (stats) => {
                this.upcomingTrips = stats.activeReservations || 0;
                this.gearRentals = stats.activeRentals || 0;
                // savedCampsites and tripCompanions not yet in API - keep at 0 for now
                // TODO: Add favorites endpoint and friends/companions endpoint
            },
            error: (err) => {
                console.error('Failed to load dashboard stats:', err);
                // Stats remain at 0
            }
        });
    }
}
