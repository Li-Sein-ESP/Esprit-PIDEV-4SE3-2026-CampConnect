import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, Calendar, Users, MapPin, MoreVertical, Download, X, Edit, CheckCircle, Clock, AlertCircle, ChevronRight, Filter, Search } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { BadgeComponent } from '../../../shared/components/badge.component';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';
import { ReservationService } from '../../../core/services/reservation.service';
import { AuthService } from '../../../core/services/auth.service';
import { Reservation, ReservationStatus } from '../../../core/models/reservation.model';
import { take } from 'rxjs';

interface Booking {
    id: string;
    campsite: {
        name: string;
        location: string;
        imageUrl: string;
    };
    checkIn: string;
    checkOut: string;
    guests: number;
    nights: number;
    total: number;
    status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
    bookedAt: string;
    canCancel: boolean;
    refundEligible: boolean;
}

@Component({
    selector: 'app-booking-management',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        LucideAngularModule,
        ButtonComponent,
        BadgeComponent,
        CardComponent,
        CardContentComponent
    ],
    templateUrl: './booking-management.component.html',
    styles: [`
    :host {
      display: block;
    }
  `]
})
export class BookingManagementComponent {
    readonly Calendar = Calendar;
    readonly Users = Users;
    readonly MapPin = MapPin;
    readonly MoreVertical = MoreVertical;
    readonly Download = Download;
    readonly X = X;
    readonly Edit = Edit;
    readonly CheckCircle = CheckCircle;
    readonly Clock = Clock;
    readonly AlertCircle = AlertCircle;
    readonly ChevronRight = ChevronRight;
    readonly Filter = Filter;
    readonly Search = Search;

    filter: 'all' | 'upcoming' | 'past' | 'cancelled' = 'all';
    showMenu: string | null = null;

    statusConfig = {
        [ReservationStatus.CONFIRMED]: {
            label: 'Confirmed',
            variant: 'success' as const,
            icon: CheckCircle,
            color: 'text-green-600',
        },
        [ReservationStatus.PENDING]: {
            label: 'Pending',
            variant: 'warning' as const,
            icon: Clock,
            color: 'text-amber-600',
        },
        [ReservationStatus.CANCELLED]: {
            label: 'Cancelled',
            variant: 'default' as const,
            icon: X,
            color: 'text-[var(--color-text-tertiary)]',
        },
        [ReservationStatus.COMPLETED]: {
            label: 'Completed',
            variant: 'primary' as const,
            icon: CheckCircle,
            color: 'text-[var(--color-primary-600)]',
        },
    };

    reservations: Reservation[] = [];
    isLoading = true;
    currentUser: any = null;

    constructor(
        private router: Router,
        private reservationService: ReservationService,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.loadReservations();
    }

    loadReservations() {
        this.isLoading = true;
        this.authService.getCurrentUser().pipe(take(1)).subscribe(user => {
            this.currentUser = user;
            if (user) {
                const targetId = user.id || user._id;
                console.log('DEBUG: Loading reservations for user:', targetId);

                // Use ALL reservations and filter locally to bypass backend query issues
                this.reservationService.getAllReservations().subscribe({
                    next: (allData) => {
                        console.log('DEBUG: All data from server:', allData);
                        // Filter locally
                        this.reservations = allData.filter(res =>
                            res.userId === targetId || res.userId === user.id || res.userId === user._id
                        );
                        console.log('DEBUG: Filtered reservations for user:', this.reservations);
                        this.isLoading = false;
                    },
                    error: (err) => {
                        console.error('Error loading reservations', err);
                        this.isLoading = false;
                    }
                });
            } else {
                this.isLoading = false;
                this.router.navigate(['/login']);
            }
        });
    }

    showAllReservations() {
        this.isLoading = true;
        this.reservationService.getAllReservations().subscribe({
            next: (data) => {
                console.log('DEBUG: ALL reservations in database:', data);
                this.reservations = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading all reservations', err);
                this.isLoading = false;
            }
        });
    }

    get filteredBookings() {
        return this.reservations.filter((res) => {
            const today = new Date();
            const checkIn = new Date(res.startDate);
            const checkOut = new Date(res.endDate);

            if (this.filter === 'upcoming') {
                return checkIn > today && res.status !== ReservationStatus.CANCELLED;
            }
            if (this.filter === 'past') {
                return checkOut < today || res.status === ReservationStatus.COMPLETED;
            }
            if (this.filter === 'cancelled') {
                return res.status === ReservationStatus.CANCELLED;
            }
            return true;
        });
    }

    get upcomingCount() {
        return this.reservations.filter(
            (b) => new Date(b.startDate) > new Date() && b.status !== ReservationStatus.CANCELLED
        ).length;
    }

    get confirmedCount() {
        return this.reservations.filter((b) => b.status === ReservationStatus.CONFIRMED).length;
    }

    get pendingCount() {
        return this.reservations.filter((b) => b.status === ReservationStatus.PENDING).length;
    }

    get completedCount() {
        return this.reservations.filter((b) => b.status === ReservationStatus.COMPLETED).length;
    }

    setFilter(filter: string) {
        this.filter = filter as any;
    }

    toggleMenu(bookingId: string) {
        this.showMenu = this.showMenu === bookingId ? null : bookingId;
    }

    closeMenu() {
        this.showMenu = null;
    }

    getDaysUntil(checkIn: string): number {
        return Math.ceil(
            (new Date(checkIn).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
    }

    formatDate(date: string): string {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    }

    cancelBooking(bookingId: string) {
        if (confirm('Are you sure you want to permanently delete this reservation?')) {
            this.reservationService.deleteReservation(bookingId).subscribe({
                next: () => {
                    this.loadReservations();
                    this.closeMenu();
                },
                error: (err) => console.error('Error deleting reservation', err)
            });
        }
    }

    viewDetails(bookingId: any, booking: any) {
        const id = bookingId || booking.id || booking._id;
        console.log('DEBUG: Navigating to details with ID:', id, 'and record:', booking);
        this.router.navigate([`/booking/details/${id}`], {
            state: { booking },
        });
    }

    editBooking(booking: any) {
        const id = booking.id || booking._id;
        console.log('DEBUG: Navigating to edit with ID:', id, 'and record:', booking);
        this.router.navigate([`/booking/edit/${id}`], {
            state: { booking },
        });
    }

    searchCampsites() {
        this.router.navigate(['/discover']);
    }
}
