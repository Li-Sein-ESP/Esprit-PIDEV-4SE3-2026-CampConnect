import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, Calendar, Users, MapPin, MoreVertical, Download, X, Edit, CheckCircle, Clock, AlertCircle, ChevronRight, Filter, Search, LayoutDashboard } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { BadgeComponent } from '../../../shared/components/badge.component';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';
import { ReservationService } from '../../../core/services/reservation.service';
import { AuthService } from '../../../core/services/auth.service';
import { Reservation, ReservationStatus } from '../../../core/models/reservation.model';
import { take } from 'rxjs';
import { CampsiteService } from '../../../core/services/campsite.service';

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
    styleUrls: ['./booking-management.component.css']
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
    readonly LayoutDashboard = LayoutDashboard;

    filter: 'all' | 'upcoming' | 'pending' | 'confirmed' | 'cancelled' = 'all';
    searchTerm: string = '';
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
    campsiteMap: Map<string, any> = new Map();
    isLoading = true;
    currentUser: any = null;

    constructor(
        private router: Router,
        private reservationService: ReservationService,
        private authService: AuthService,
        private campsiteService: CampsiteService
    ) { }

    ngOnInit() {
        this.loadCampsites();
        this.loadReservations();
    }

    loadCampsites() {
        this.campsiteService.getAllCampsites().subscribe({
            next: (campsites: any[]) => {
                campsites.forEach(c => {
                    if (c.id) this.campsiteMap.set(c.id, c);
                });
            },
            error: (err) => console.error('Error loading campsites for bookings', err)
        });
    }

    getCampsiteName(targetId: string): string {
        const campsite = this.campsiteMap.get(targetId);
        return campsite ? campsite.name : 'Unknown Destination';
    }

    getCampsiteImage(targetId: string): string {
        const campsite = this.campsiteMap.get(targetId);
        return campsite && campsite.images && campsite.images.length > 0 ? campsite.images[0] : 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80';
    }

    loadReservations() {
        this.isLoading = true;
        const user = this.authService.currentUserValue;
        
        if (user) {
            this.currentUser = user;
            this.reservationService.getUserReservations(user.id).subscribe({
                next: (data) => {
                    this.reservations = data;
                    this.isLoading = false;
                },
                error: (err) => {
                    console.error('Error loading reservations', err);
                    this.isLoading = false;
                }
            });
        } else {
            // Fallback to observable if not immediately available
            this.authService.getCurrentUser().pipe(take(1)).subscribe(u => {
                if (u) {
                    this.currentUser = u;
                    this.loadReservations(); // Recursive call with user now set
                } else {
                    this.isLoading = false;
                    this.router.navigate(['/login']);
                }
            });
        }
    }

    get filteredBookings() {
        // Create a 'today' date at 00:00:00 for accurate day comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return this.reservations.filter((res) => {
            const checkIn = new Date(res.startDate);
            checkIn.setHours(0, 0, 0, 0);
            const checkOut = new Date(res.endDate);
            checkOut.setHours(0, 0, 0, 0);

            // 1. Status/Date Filtering
            let matchesTab = true;
            if (this.filter === 'upcoming') {
                // Upcoming: End date is today or in the future AND not cancelled
                matchesTab = checkOut >= today && res.status !== ReservationStatus.CANCELLED;
            } else if (this.filter === 'pending') {
                matchesTab = res.status === ReservationStatus.PENDING;
            } else if (this.filter === 'confirmed') {
                matchesTab = res.status === ReservationStatus.CONFIRMED;
            } else if (this.filter === 'cancelled') {
                matchesTab = res.status === ReservationStatus.CANCELLED;
            }

            // 2. Search Filtering
            const searchLower = this.searchTerm.toLowerCase().trim();
            const campsite = this.campsiteMap.get(res.targetId);
            const matchesSearch = !searchLower || 
                (campsite?.name || '').toLowerCase().includes(searchLower) ||
                (res.id || '').toLowerCase().includes(searchLower);

            return matchesTab && matchesSearch;
        });
    }

    onSearch(event: any) {
        this.searchTerm = event.target.value;
    }

    get upcomingCount() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return this.reservations.filter(
            (b) => new Date(b.endDate) >= today && b.status !== ReservationStatus.CANCELLED
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

    generateEntryPass(booking: any) {
        // For now, we simulate a PDF generation or a printable ticket
        // In a real app, this would call a backend service or generate a client-side PDF
        const campsite = this.campsiteMap.get(booking.targetId);
        const passInfo = `
          --- CAMPCONNECT ENTRY PASS ---
          Booking ID: ${booking.id}
          Camper: ${this.currentUser?.name || this.currentUser?.username}
          Destination: ${campsite?.name || 'Campsite'}
          Dates: ${this.formatDate(booking.startDate)} - ${this.formatDate(booking.endDate)}
          Status: CONFIRMED
        `;
        alert('Generating your Entry Pass...\n' + passInfo);
        // In the future: this.router.navigate(['/booking/pass', booking.id]);
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
        if (confirm('Are you sure you want to cancel this reservation? It will be preserved in your history.')) {
            this.reservationService.cancelReservation(bookingId).subscribe({
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
