import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule, Calendar, MapPin, ChevronLeft, Edit, Trash2, XCircle, CheckCircle, Clock } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card.component';
import { BadgeComponent } from '../../../shared/components/badge.component';
import { ReservationService } from '../../../core/services/reservation.service';
import { CampsiteService, Campsite } from '../../../core/services/campsite.service';
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
    <div class="booking-detail-wrapper" *ngIf="!isLoading && reservation">
      <!-- Hero Banner Section -->
      <div class="hero-section" [style.background-image]="'url(' + (campsite?.images?.[0] || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1200') + ')'">
        <div class="hero-overlay"></div>
        <div class="container relative z-10 h-full flex flex-col justify-end pb-12 px-6">
          <button (click)="goBack()" class="back-btn mb-6">
            <lucide-icon [img]="ChevronLeft" size="18"></lucide-icon>
            <span>Back to my bookings</span>
          </button>
          
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div class="animate-slide-up">
              <div class="flex items-center gap-3 mb-4">
                <app-badge [variant]="getStatusVariant(reservation.status)" class="status-badge">
                  {{ reservation.status }}
                </app-badge>
                <span class="text-white/60 text-[10px] font-black tracking-widest uppercase">Expedition #{{ (reservation.id || reservation._id)?.slice(-6) }}</span>
              </div>
              <h1 class="text-4xl md:text-6xl font-black text-white mb-2 leading-tight tracking-tighter">
                {{ campsite?.name || 'Loading Expedition...' }}
              </h1>
              <p class="text-lg text-white/80 font-medium flex items-center gap-2">
                <lucide-icon [img]="MapPin" size="18" class="text-[var(--color-primary-400)]"></lucide-icon>
                {{ campsite?.location || 'Wilderness Location' }}
              </p>
            </div>

            <div class="flex gap-3 animate-fade-in" *ngIf="canModify() || canCancel()">
              <button (click)="editReservation()" class="btn-premium secondary" *ngIf="canModify()">
                <lucide-icon [img]="Edit" size="18"></lucide-icon>
                Modify
              </button>
              <button (click)="deleteReservation()" class="btn-premium danger" *ngIf="canCancel()">
                <lucide-icon [img]="Trash2" size="18"></lucide-icon>
                Cancel Reservation
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="container py-16 px-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <!-- Left Column: Details -->
          <div class="lg:col-span-2 space-y-10">
            
            <!-- Dates Card -->
            <div class="glass-card animate-fade-in">
              <div class="p-10">
                <h3 class="section-title mb-10">
                  <lucide-icon [img]="Calendar" size="22"></lucide-icon>
                  Trip Timeline
                </h3>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-16 relative">
                  <div class="timeline-line hidden sm:block"></div>
                  
                  <div class="date-box">
                    <div class="label">Check-in</div>
                    <div class="value">{{ formatDate(reservation.startDate) }}</div>
                    <div class="sub-label">Access starts at 14:00</div>
                  </div>

                  <div class="date-box">
                    <div class="label">Check-out</div>
                    <div class="value">{{ formatDate(reservation.endDate) }}</div>
                    <div class="sub-label">Departure before 11:00</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Description Card -->
            <div class="glass-card animate-fade-in" style="animation-delay: 0.1s">
              <div class="p-10">
                <h3 class="section-title mb-8">
                  <lucide-icon [img]="XCircle" size="22"></lucide-icon>
                  Campsite Experience
                </h3>
                <p class="text-gray-600 leading-relaxed text-xl font-medium">
                  {{ campsite?.description || 'No description available for this campsite.' }}
                </p>
                
                <div class="mt-10 flex flex-wrap gap-4" *ngIf="campsite?.amenities">
                  <span *ngFor="let am of campsite?.amenities" class="amenity-tag">
                    {{ am }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Summary/Help -->
          <div class="space-y-8 animate-fade-in" style="animation-delay: 0.2s">
            <div class="sidebar-card">
              <div class="p-10 bg-[#064e3b] text-white rounded-[3rem] shadow-2xl shadow-emerald-900/20">
                <h4 class="text-[10px] font-black uppercase tracking-[0.3em] mb-8 opacity-50">Expedition Summary</h4>
                
                <div class="space-y-6 mb-10">
                  <div class="flex justify-between items-center py-4 border-b border-white/10">
                    <span class="text-sm opacity-70 font-medium">Guest</span>
                    <span class="font-bold">{{ reservation.username || 'Explorer' }}</span>
                  </div>
                  <div class="flex justify-between items-center py-4">
                    <span class="text-sm opacity-70 font-medium">Total Rate</span>
                    <span class="text-2xl font-black text-emerald-400">{{ campsite?.price || 0 }} DT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div *ngIf="isLoading" class="min-h-screen flex flex-col items-center justify-center bg-[#fdfcf8]">
      <div class="premium-loader"></div>
      <p class="mt-6 text-emerald-900 font-black tracking-[0.3em] uppercase text-[10px]">Assembling Expedition Details...</p>
    </div>

    <!-- Error State -->
    <div *ngIf="!isLoading && !reservation" class="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div class="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-8">
        <lucide-icon [img]="XCircle" size="48" class="text-red-500"></lucide-icon>
      </div>
      <h2 class="text-4xl font-black text-gray-900 mb-3 tracking-tighter">Reservation Lost?</h2>
      <p class="text-gray-500 max-w-md mb-10 font-medium">We couldn't find the details for this reservation. It might have been moved or the coordinates are incorrect.</p>
      <app-button routerLink="/dashboard/bookings" variant="primary">Return to Base Camp</app-button>
    </div>
  `,
  styles: [`
    .booking-detail-wrapper {
      background-color: #fdfdfd;
      min-height: 100vh;
    }

    .hero-section {
      height: 65vh;
      min-height: 550px;
      background-size: cover;
      background-position: center;
      position: relative;
    }

    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, #000 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.1) 100%);
    }

    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.8rem 1.5rem;
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 100px;
      color: white;
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .back-btn:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateX(-8px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.2);
    }

    .btn-premium {
      padding: 1.1rem 2.5rem;
      border-radius: 1.5rem;
      font-weight: 900;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: flex;
      align-items: center;
      gap: 0.8rem;
      transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .btn-premium.secondary {
      background: white;
      color: #064e3b;
      box-shadow: 0 15px 35px rgba(0,0,0,0.3);
    }

    .btn-premium.danger {
      background: rgba(220, 38, 38, 0.1);
      backdrop-filter: blur(15px);
      border: 1px solid rgba(220, 38, 38, 0.2);
      color: #fca5a5;
    }

    .btn-premium:hover {
      transform: translateY(-6px) scale(1.03);
    }

    .glass-card {
      background: white;
      border-radius: 3.5rem;
      border: 1px solid rgba(0,0,0,0.03);
      box-shadow: 0 30px 60px rgba(0,0,0,0.03);
      transition: transform 0.4s ease;
    }

    .section-title {
      font-size: 1.5rem;
      font-weight: 950;
      color: #064e3b;
      display: flex;
      align-items: center;
      gap: 1rem;
      letter-spacing: -0.02em;
    }

    .date-box .label {
      font-size: 0.7rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: #94a3b8;
      margin-bottom: 0.75rem;
    }

    .date-box .value {
      font-size: 2rem;
      font-weight: 950;
      color: #064e3b;
      line-height: 1.1;
      letter-spacing: -0.03em;
    }

    .date-box .sub-label {
      font-size: 0.75rem;
      color: #cbd5e1;
      margin-top: 0.5rem;
      font-weight: 500;
    }

    .timeline-line {
      position: absolute;
      top: 50%;
      left: 15%;
      right: 55%;
      height: 2px;
      background: repeating-linear-gradient(to right, #e2e8f0, #e2e8f0 6px, transparent 6px, transparent 12px);
    }

    .amenity-tag {
      padding: 0.7rem 1.4rem;
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 800;
      color: #059669;
      transition: all 0.3s ease;
    }

    .amenity-tag:hover {
      background: #059669;
      color: white;
      transform: scale(1.1);
    }

    .status-badge {
      font-size: 0.65rem;
      font-weight: 900;
      letter-spacing: 0.15em;
      padding: 0.4rem 1rem;
      border-radius: 100px;
    }

    .premium-loader {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(5, 150, 105, 0.1);
      border-top: 4px solid #059669;
      border-radius: 50%;
      animation: spin 1s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite;
    }

    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @keyframes slide-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }

    .animate-slide-up { animation: slide-up 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
    .animate-fade-in { animation: fade-in 1.2s ease forwards; }

    @media (max-width: 768px) {
      .date-box .value { font-size: 1.5rem; }
      .hero-section { height: 70vh; }
    }
  `]
})
export class BookingDetailComponent implements OnInit {
  readonly Calendar = Calendar;
  readonly MapPin = MapPin;
  readonly ChevronLeft = ChevronLeft;
  readonly Edit = Edit;
  readonly Trash2 = Trash2;
  readonly XCircle = XCircle;
  readonly Info = Clock; // Re-using Clock or any other icon if Info not imported

  reservation: Reservation | null = null;
  campsite: Campsite | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reservationService: ReservationService,
    private campsiteService: CampsiteService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('DEBUG: Detail page loaded for Reservation ID:', id);

    // Try to get from router state first (fast)
    const state = window.history.state;
    if (state && state.booking) {
      console.log('DEBUG: Found booking in router state:', state.booking);
      this.reservation = state.booking;
      if (this.reservation) this.loadCampsite(this.reservation.targetId);
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
        if (this.reservation) this.loadCampsite(this.reservation.targetId);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('DEBUG: Error loading reservation details from server', err);
        // Important: if it's 404 or something, the template will show "Not Found"
        this.isLoading = false;
      }
    });
  }

  loadCampsite(id: string) {
    if (!id) return;
    this.campsiteService.getCampsiteById(id).subscribe({
      next: (site) => this.campsite = site,
      error: (err) => console.error('Error loading campsite details', err)
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

  // Only PENDING reservations can be modified (dates changed)
  canModify(): boolean {
    return this.reservation?.status === ReservationStatus.PENDING;
  }

  // PENDING and CONFIRMED reservations can be cancelled
  canCancel(): boolean {
    return this.reservation?.status === ReservationStatus.PENDING ||
           this.reservation?.status === ReservationStatus.CONFIRMED;
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
    if (id && confirm('Are you sure you want to cancel this reservation? It will be preserved in your history.')) {
      this.reservationService.cancelReservation(id).subscribe({
        next: () => this.router.navigate(['/dashboard/bookings']),
        error: (err) => console.error('Error deleting reservation', err)
      });
    }
  }
}
