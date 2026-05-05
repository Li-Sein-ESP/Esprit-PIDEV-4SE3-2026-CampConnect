import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LucideAngularModule, CheckCircle, Calendar, MapPin, Download, Mail, ArrowRight, Share2, Clock, X, RefreshCw } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';
import { BadgeComponent } from '../../../shared/components/badge.component';
import { ReservationTimeline } from '../../../shared/components/reservation-timeline/reservation-timeline';
import { ReservationService } from '../../../core/services/reservation.service';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, ButtonComponent, CardComponent, CardContentComponent, BadgeComponent, ReservationTimeline],
  templateUrl: './booking-confirmation.component.html'
})
export class BookingConfirmationComponent implements OnInit, OnDestroy {
  readonly CheckCircle = CheckCircle;
  readonly Calendar = Calendar;
  readonly MapPin = MapPin;
  readonly Download = Download;
  readonly Mail = Mail;
  readonly ArrowRight = ArrowRight;
  readonly Share2 = Share2;
  readonly Clock = Clock;
  readonly X = X;
  readonly RefreshCw = RefreshCw;

  reservation: any;
  bookingId: string | null = null;
  campsite: any = null;
  campsiteName: string = '';
  isRefreshing = false;
  lastChecked: Date | null = null;

  private pollingInterval: any = null;

  constructor(private route: ActivatedRoute, private reservationService: ReservationService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('bookingId');
    this.bookingId = id;
    const state = window.history.state;

    // Use campsite info from navigation state (doesn't change)
    if (state?.campsite) {
      this.campsite = state.campsite;
      this.campsiteName = state.campsite?.name || 'Campsite';
    }

    // Determine reservation ID
    const reservationId = state?.reservation?.id || state?.reservation?._id || id;
    if (reservationId) {
      this.bookingId = reservationId;
      // Initial load
      this.fetchReservation(reservationId);
      // Start polling every 10s while status is PENDING
      this.pollingInterval = setInterval(() => {
        if (this.reservation?.status?.toUpperCase() !== 'PENDING') {
          this.stopPolling();
          return;
        }
        this.fetchReservation(reservationId, false);
      }, 10000);
    }
  }

  fetchReservation(id: string, showSpinner = true) {
    if (showSpinner) this.isRefreshing = true;
    this.reservationService.getReservationById(id).subscribe({
      next: (res) => {
        this.reservation = res;
        this.bookingId = res.id || (res as any)._id || id;
        this.lastChecked = new Date();
        this.isRefreshing = false;
        // Stop polling if no longer PENDING
        if (res.status?.toUpperCase() !== 'PENDING') {
          this.stopPolling();
        }
      },
      error: () => {
        this.isRefreshing = false;
        console.warn('Could not fetch latest reservation status');
      }
    });
  }

  refreshStatus() {
    if (this.bookingId) {
      this.fetchReservation(this.bookingId, true);
    }
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  ngOnDestroy() {
    this.stopPolling();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getCurrentStep(): number {
    if (!this.reservation || !this.reservation.status) return 1;
    const status = this.reservation.status.toUpperCase();
    switch (status) {
      case 'PENDING':   return 1;
      case 'CONFIRMED': return 2;
      case 'ACTIVE':    return 3;
      case 'COMPLETED': return 4;
      default:          return 1;
    }
  }

  getStatusConfig() {
    const status = (this.reservation?.status || 'PENDING').toUpperCase();
    if (status === 'CONFIRMED' || status === 'ACTIVE') {
      return { title: 'Booking Confirmed!', description: 'Your reservation has been approved by the administrator.', badgeVariant: 'success', badgeLabel: 'Confirmed', icon: CheckCircle };
    }
    if (status === 'COMPLETED') {
      return { title: 'Adventure Completed!', description: 'We hope you had an amazing experience!', badgeVariant: 'info', badgeLabel: 'Completed', icon: CheckCircle };
    }
    if (status === 'CANCELLED') {
      return { title: 'Booking Cancelled', description: 'This reservation has been cancelled.', badgeVariant: 'danger', badgeLabel: 'Cancelled', icon: X };
    }
    return { title: 'Booking Requested!', description: 'Your reservation has been submitted and is currently pending admin approval.', badgeVariant: 'warning', badgeLabel: 'Pending Approval', icon: Clock };
  }

  getStatusClasses() {
    const status = (this.reservation?.status || 'PENDING').toUpperCase();
    switch (status) {
      case 'CONFIRMED': case 'ACTIVE':  return { bg: 'bg-emerald-100', text: 'text-emerald-600' };
      case 'COMPLETED':                 return { bg: 'bg-blue-100',    text: 'text-blue-600'    };
      case 'CANCELLED':                 return { bg: 'bg-red-100',     text: 'text-red-600'     };
      default:                          return { bg: 'bg-amber-100',   text: 'text-amber-600'   };
    }
  }
}

