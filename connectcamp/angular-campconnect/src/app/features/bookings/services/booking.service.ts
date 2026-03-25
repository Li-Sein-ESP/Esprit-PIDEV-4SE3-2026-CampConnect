import { Injectable, signal } from '@angular/core';
import { Booking, SearchParams, GuestInfo, Pricing } from '../models/booking.model';

@Injectable({
    providedIn: 'root'
})
export class BookingService {
    private bookings = signal<Booking[]>([]);

    getMockBookings(): Booking[] {
        return [
            {
                id: 'BK001',
                campsiteId: 'site-1',
                campsite: {
                    name: 'Upper Pines Campground',
                    location: 'Yosemite National Park, CA',
                    imageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80'
                },
                checkIn: '2024-07-15',
                checkOut: '2024-07-18',
                guests: 4,
                nights: 3,
                total: 315.50,
                status: 'confirmed',
                bookedAt: '2024-06-01T10:30:00Z',
                canCancel: true,
                refundEligible: true
            }
        ];
    }

    createBooking(booking: Partial<Booking>): Booking {
        const newBooking: Booking = {
            id: 'BK' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            campsiteId: booking.campsiteId || '',
            campsite: booking.campsite || { name: '', location: '', imageUrl: '' },
            checkIn: booking.checkIn || '',
            checkOut: booking.checkOut || '',
            guests: booking.guests || 1,
            nights: booking.nights || 1,
            total: booking.total || 0,
            status: 'confirmed',
            bookedAt: new Date().toISOString(),
            canCancel: true,
            refundEligible: true
        };

        this.bookings.update(bookings => [...bookings, newBooking]);
        return newBooking;
    }

    cancelBooking(bookingId: string): boolean {
        // Simulate cancellation
        return true;
    }

    calculatePricing(basePrice: number, nights: number, addOns: number = 0): Pricing {
        const subtotal = (basePrice * nights) + addOns;
        const tax = Math.round(subtotal * 0.08 * 100) / 100;
        const serviceFee = 5.99;

        return {
            basePrice: basePrice * nights,
            addOns,
            subtotal,
            tax,
            serviceFee,
            total: subtotal + tax + serviceFee
        };
    }
}
