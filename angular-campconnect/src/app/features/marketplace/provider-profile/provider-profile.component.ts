import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { GearApiService } from '../../gear/services/gear-api.service';
import { RentalApiService } from '../../gear/services/rental-api.service';
import { GearResponse } from '../../gear/models/gear.model';

interface ProviderProduct {
    id: number;
    name: string;
    category: string;
    pricePerDay: number;
    available: number;
    icon: string;
    rentals: number;
}

interface ProviderRental {
    id: number;
    customer: string;
    customerInitials: string;
    customerEmail: string;
    product: string;
    dates: string;
    total: number;
    status: 'Active' | 'Pending' | 'Completed';
    avatarColor: string;
}

interface ProviderReview {
    id: number;
    customer: string;
    customerInitials: string;
    date: string;
    rating: number;
    text: string;
    product: string;
    avatarColor: string;
    showResponse: boolean;
}

interface RatingBreakdown {
    stars: number;
    count: number;
    pct: number;
}

@Component({
    selector: 'app-provider-profile',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './provider-profile.component.html',
    styleUrl: './provider-profile.component.scss'
})
export class ProviderProfileComponent implements OnInit {

    providerName = 'Alpine Gear Co.';
    bio = 'Premium outdoor equipment rentals for camping, hiking, and adventure sports. Serving outdoor enthusiasts since 2018 with top-quality gear and exceptional service.';
    rating = 4.9;
    reviewCount = 324;
    memberSince = '2018';
    location = 'Portland, Oregon';
    verified = true;

    stats = {
        totalProducts: 156,
        activeRentals: 42,
        totalRevenue: '$48.2k',
        avgRating: 4.9,
        avgDuration: '3.2 days',
        repeatCustomers: '68%',
        responseTime: '< 2 hrs'
    };

    loading = true;

    activeTab = 'overview';

    products: any[] = [];

    rentals: any[] = [];

    reviews: ProviderReview[] = [
        { id: 1, customer: 'John Doe', customerInitials: 'JD', date: '2 days ago', rating: 5, text: 'Excellent service! The tent was in perfect condition and the pickup process was seamless. Will definitely rent again.', product: '4-Person Family Tent', avatarColor: '#8B7355', showResponse: false },
        { id: 2, customer: 'Sarah Miller', customerInitials: 'SM', date: '5 days ago', rating: 5, text: 'Great quality gear and very reasonable prices. The staff was helpful in recommending the right equipment for our hiking trip.', product: 'Hiking Backpack 65L', avatarColor: '#D4A574', showResponse: false },
        { id: 3, customer: 'Mike Johnson', customerInitials: 'MJ', date: '1 week ago', rating: 4, text: 'Good experience overall. The camping stove worked well, though it could have been cleaner. Fast response time and easy pickup/dropoff.', product: 'Portable Camping Stove', avatarColor: '#9CA3AF', showResponse: false },
        { id: 4, customer: 'Emily Wilson', customerInitials: 'EW', date: '2 weeks ago', rating: 5, text: 'Absolutely loved the sleeping bag! Kept me warm during a cold night in the mountains. The gear quality is top-notch.', product: 'Sleeping Bag Cold Weather', avatarColor: '#8B7355', showResponse: false }
    ];

    ratingBreakdown: RatingBreakdown[] = [
        { stars: 5, count: 298, pct: 92 },
        { stars: 4, count: 20, pct: 6 },
        { stars: 3, count: 4, pct: 2 },
        { stars: 2, count: 1, pct: 0 },
        { stars: 1, count: 1, pct: 0 }
    ];

    starArray = [1, 2, 3, 4, 5];

    constructor(
        private authService: AuthService,
        private gearApi: GearApiService,
        private rentalApi: RentalApiService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        // Fetch real provider username if available
        this.authService.getCurrentUser().subscribe(user => {
            if (user?.username) {
                this.providerName = user.username;
                this.cdr.detectChanges();
            }
        });

        this.gearApi.getMyGear({ size: 50 }).subscribe({
            next: (page) => {
                this.products = page.content.map((g: GearResponse) => ({
                    id: g.id,
                    name: g.name,
                    category: g.category,
                    pricePerDay: g.price,
                    available: g.quantity,
                    icon: '📦',
                    rentals: 0
                }));
                this.loading = false;
                this.stats.totalProducts = this.products.length;
                this.cdr.detectChanges();
            },
            error: () => {
                this.loading = false;
                this.cdr.detectChanges();
            }
        });

        this.rentalApi.getAll(0, 10).subscribe({
            next: (page) => {
                this.rentals = page.content.map(r => ({
                    id: r.id,
                    customer: r.renterName,
                    customerInitials: r.renterName.split(' ').map((n: string) => n[0]).join(''),
                    customerEmail: '',
                    product: r.gearName,
                    dates: `${r.startDate} – ${r.endDate}`,
                    total: 0,
                    status: r.status === 'ACTIVE' ? 'Active' : r.status === 'PENDING' ? 'Pending' : 'Completed',
                    avatarColor: '#8B7355'
                }));

                this.stats.activeRentals = this.rentals.filter((r: any) => r.status === 'Active').length;
                this.stats.totalRevenue = `$${this.rentals.reduce((sum: number, r: any) => sum + r.total, 0)}`;
                this.cdr.detectChanges();
            },
            error: () => {
                this.cdr.detectChanges();
            }
        });
    }

    setActiveTab(tab: string): void {
        this.activeTab = tab;
    }

    toggleResponse(review: ProviderReview): void {
        review.showResponse = !review.showResponse;
    }

    statusClass(status: string): string {
        switch (status) {
            case 'Active': return 'status--active';
            case 'Pending': return 'status--pending';
            case 'Completed': return 'status--completed';
            default: return '';
        }
    }

    trackById(_: number, item: { id: number }): number {
        return item.id;
    }
}
