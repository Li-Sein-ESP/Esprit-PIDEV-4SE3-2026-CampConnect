import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, Calendar, Users, MapPin, MoreVertical, Download, X, Edit, CheckCircle, Clock, AlertCircle, ChevronRight, Filter, Search } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { BadgeComponent } from '../../../shared/components/badge.component';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';

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

    mockBookings: Booking[] = [
        {
            id: 'BK7XQMK9P',
            campsite: {
                name: 'Upper Pines Campground',
                location: 'Yosemite National Park, CA',
                imageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80',
            },
            checkIn: '2026-03-15',
            checkOut: '2026-03-18',
            guests: 4,
            nights: 3,
            total: 118.47,
            status: 'confirmed',
            bookedAt: '2026-02-01T10:30:00',
            canCancel: true,
            refundEligible: true,
        },
        {
            id: 'BK5NWTR2L',
            campsite: {
                name: 'Big Sur Campground',
                location: 'Big Sur, CA',
                imageUrl: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600&q=80',
            },
            checkIn: '2026-04-10',
            checkOut: '2026-04-12',
            guests: 2,
            nights: 2,
            total: 103.18,
            status: 'pending',
            bookedAt: '2026-02-01T14:15:00',
            canCancel: true,
            refundEligible: true,
        },
        {
            id: 'BK3FLPM8D',
            campsite: {
                name: 'Joshua Tree Oasis',
                location: 'Joshua Tree National Park, CA',
                imageUrl: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=600&q=80',
            },
            checkIn: '2025-12-20',
            checkOut: '2025-12-23',
            guests: 3,
            nights: 3,
            total: 103.47,
            status: 'completed',
            bookedAt: '2025-11-15T09:00:00',
            canCancel: false,
            refundEligible: false,
        },
        {
            id: 'BK9HKYV4T',
            campsite: {
                name: 'Lake Tahoe Retreat',
                location: 'Lake Tahoe, CA',
                imageUrl: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600&q=80',
            },
            checkIn: '2026-01-10',
            checkOut: '2026-01-12',
            guests: 2,
            nights: 2,
            total: 124.58,
            status: 'cancelled',
            bookedAt: '2025-12-15T16:45:00',
            canCancel: false,
            refundEligible: false,
        },
    ];

    statusConfig = {
        confirmed: {
            label: 'Confirmed',
            variant: 'success' as const,
            icon: CheckCircle,
            color: 'text-green-600',
        },
        pending: {
            label: 'Pending',
            variant: 'warning' as const,
            icon: Clock,
            color: 'text-amber-600',
        },
        cancelled: {
            label: 'Cancelled',
            variant: 'default' as const,
            icon: X,
            color: 'text-[var(--color-text-tertiary)]',
        },
        completed: {
            label: 'Completed',
            variant: 'primary' as const,
            icon: CheckCircle,
            color: 'text-[var(--color-primary-600)]',
        },
    };

    constructor(private router: Router) { }

    get filteredBookings() {
        return this.mockBookings.filter((booking) => {
            const today = new Date();
            const checkIn = new Date(booking.checkIn);
            const checkOut = new Date(booking.checkOut);

            if (this.filter === 'upcoming') {
                return checkIn > today && booking.status !== 'cancelled';
            }
            if (this.filter === 'past') {
                return checkOut < today || booking.status === 'completed';
            }
            if (this.filter === 'cancelled') {
                return booking.status === 'cancelled';
            }
            return true;
        });
    }

    get upcomingCount() {
        return this.mockBookings.filter(
            (b) => new Date(b.checkIn) > new Date() && b.status !== 'cancelled'
        ).length;
    }

    get confirmedCount() {
        return this.mockBookings.filter((b) => b.status === 'confirmed').length;
    }

    get pendingCount() {
        return this.mockBookings.filter((b) => b.status === 'pending').length;
    }

    get completedCount() {
        return this.mockBookings.filter((b) => b.status === 'completed').length;
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

    cancelBooking(bookingId: string, booking: Booking) {
        this.closeMenu();
        this.router.navigate([`/booking/cancel/${bookingId}`], {
            state: { booking },
        });
    }

    viewDetails(bookingId: string, booking: Booking) {
        this.router.navigate([`/booking/details/${bookingId}`], {
            state: { booking },
        });
    }

    searchCampsites() {
        this.router.navigate(['/discover']);
    }
}
