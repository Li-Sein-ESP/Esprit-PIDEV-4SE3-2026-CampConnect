import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule, Calendar, MapPin, ChevronLeft, Edit, Trash2, XCircle, CheckCircle, Clock } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card.component';
import { BadgeComponent } from '../../../shared/components/badge.component';
import { ReservationService } from '../../../core/services/reservation.service';
import { Reservation, ReservationStatus } from '../../../core/models/reservation.model';

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    ButtonComponent,
    BadgeComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent
  ],
  template: `
    <div class="min-h-screen bg-[var(--color-background)] py-12">
      <div class="container max-w-4xl">
        <button (click)="goBack()" class="flex items-center text-[var(--color-text-secondary)] hover:text-[var(--color-primary-600)] mb-8 transition-colors">
          <lucide-icon [img]="ChevronLeft" class="w-5 h-5 mr-1"></lucide-icon>
          Back to My Bookings
        </button>

        <div *ngIf="isLoading" class="flex justify-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary-600)]"></div>
        </div>

        <div *ngIf="!isLoading && reservation" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <app-card variant="elevated">
              <app-card-header>
                <div class="flex justify-between items-start">
                  <div>
                    <app-card-title class="text-2xl mb-2">Reservation Details</app-card-title>
                    <p class="text-sm text-[var(--color-text-tertiary)]">ID: {{ reservation.id || reservation._id }}</p>
                  </div>
                  <app-badge [variant]="getStatusVariant(reservation.status)">
                    {{ reservation.status }}
                  </app-badge>
                </div>
              </app-card-header>
              <app-card-content class="space-y-8">
                <!-- Dates Section -->
                <div class="grid grid-cols-2 gap-8 py-6 border-y border-[var(--color-border-light)]">
                  <div>
                    <div class="text-sm text-[var(--color-text-tertiary)] mb-2 uppercase tracking-wider">Check-in</div>
                    <div class="flex items-center gap-3">
                      <div class="p-2 bg-[var(--color-primary-50)] rounded-lg text-[var(--color-primary-600)]">
                        <lucide-icon [img]="Calendar" class="w-5 h-5"></lucide-icon>
                      </div>
                      <div>
                        <div class="font-semibold text-lg">{{ formatDate(reservation.startDate) }}</div>
                        <div class="text-xs text-[var(--color-text-tertiary)] font-medium">After 2:00 PM</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div class="text-sm text-[var(--color-text-tertiary)] mb-2 uppercase tracking-wider">Check-out</div>
                    <div class="flex items-center gap-3">
                      <div class="p-2 bg-[var(--color-primary-50)] rounded-lg text-[var(--color-primary-600)]">
                        <lucide-icon [img]="Calendar" class="w-5 h-5"></lucide-icon>
                      </div>
                      <div>
                        <div class="font-semibold text-lg">{{ formatDate(reservation.endDate) }}</div>
                        <div class="text-xs text-[var(--color-text-tertiary)] font-medium">Before 11:00 AM</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Info Section -->
                <div>
                  <h5 class="mb-4 flex items-center gap-2">
                    <lucide-icon [img]="MapPin" class="w-5 h-5 text-[var(--color-primary-600)]"></lucide-icon>
                    Location Information
                  </h5>
                  <div class="bg-[var(--color-background-soft)] p-4 rounded-xl border border-[var(--color-border-light)]">
                    <div class="font-medium mb-1">Target ID: {{ reservation.targetId }}</div>
                    <p class="text-sm text-[var(--color-text-secondary)]">
                      The reservation is placed for campsite/event with ID {{ reservation.targetId }}.
                    </p>
                  </div>
                </div>
              </app-card-content>
            </app-card>

            <!-- Actions -->
            <div class="flex flex-wrap gap-4" *ngIf="canModify()">
              <app-button variant="primary" (click)="editReservation()">
                <lucide-icon [img]="Edit" class="w-5 h-5 mr-2"></lucide-icon>
                Modify Reservation
              </app-button>
              <app-button variant="outline" class="text-red-600 border-red-200 hover:bg-red-50" (click)="deleteReservation()">
                <lucide-icon [img]="Trash2" class="w-5 h-5 mr-2"></lucide-icon>
                Delete Reservation
              </app-button>
            </div>
          </div>

          <!-- Summary Sidebar -->
          <div class="space-y-6">
            <app-card>
              <app-card-content class="p-6">
                <h5 class="mb-4">Need Help?</h5>
                <p class="text-sm text-[var(--color-text-secondary)] mb-6">
                  If you have any questions regarding your reservation, please contact our support or the campsite owner.
                </p>
                <app-button variant="outline" class="w-full">Contact Support</app-button>
              </app-card-content>
            </app-card>
          </div>
        </div>

        <div *ngIf="!isLoading && !reservation" class="text-center py-20">
          <lucide-icon [img]="XCircle" class="w-16 h-16 text-red-400 mx-auto mb-4"></lucide-icon>
          <h3 class="mb-2">Reservation Not Found</h3>
          <p class="text-[var(--color-text-secondary)] mb-8">We couldn't find the reservation details you're looking for.</p>
          <app-button routerLink="/dashboard/bookings">Return to Bookings</app-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class BookingDetailComponent implements OnInit {
  readonly Calendar = Calendar;
  readonly MapPin = MapPin;
  readonly ChevronLeft = ChevronLeft;
  readonly Edit = Edit;
  readonly Trash2 = Trash2;
  readonly XCircle = XCircle;

  reservation: Reservation | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reservationService: ReservationService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('DEBUG: Detail page loaded for Reservation ID:', id);

    // Try to get from router state first (fast)
    const state = window.history.state;
    if (state && state.booking) {
      console.log('DEBUG: Found booking in router state:', state.booking);
      this.reservation = state.booking;
      this.isLoading = false;
    } else if (id) {
      this.loadReservation(id);
    } else {
      this.isLoading = false;
    }
  }

  loadReservation(id: string) {
    this.isLoading = true;
    console.log('DEBUG: Fetching reservation from server for ID:', id);
    this.reservationService.getReservationById(id).subscribe({
      next: (res) => {
        console.log('DEBUG: Received reservation from server:', res);
        this.reservation = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('DEBUG: Error loading reservation details from server', err);
        // Important: if it's 404 or something, the template will show "Not Found"
        this.isLoading = false;
      }
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getStatusVariant(status: ReservationStatus): 'success' | 'warning' | 'error' | 'primary' | 'default' {
    switch (status) {
      case ReservationStatus.CONFIRMED: return 'success';
      case ReservationStatus.PENDING: return 'warning';
      case ReservationStatus.CANCELLED: return 'default';
      case ReservationStatus.COMPLETED: return 'primary';
      default: return 'default';
    }
  }

  canModify(): boolean {
    return this.reservation?.status === ReservationStatus.PENDING;
  }

  goBack() {
    this.router.navigate(['/dashboard/bookings']);
  }

  editReservation() {
    const id = this.reservation?.id || this.reservation?._id;
    if (id) {
      this.router.navigate(['/booking/edit', id], {
        state: { booking: this.reservation }
      });
    }
  }

  deleteReservation() {
    const id = this.reservation?.id || this.reservation?._id;
    if (id && confirm('DANGER: This will permanently delete this reservation record. Continue?')) {
      this.reservationService.deleteReservation(id).subscribe({
        next: () => this.router.navigate(['/dashboard/bookings']),
        error: (err) => console.error('Error deleting reservation', err)
      });
    }
  }
}
