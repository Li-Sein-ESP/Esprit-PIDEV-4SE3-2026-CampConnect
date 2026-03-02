import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

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

    activeTab = 'overview';

    products: ProviderProduct[] = [
        { id: 1, name: '4-Person Family Tent', category: 'Camping Essentials', pricePerDay: 45, available: 12, icon: '🏕️', rentals: 87 },
        { id: 2, name: 'Portable Camping Stove', category: 'Cooking Equipment', pricePerDay: 15, available: 8, icon: '🔥', rentals: 64 },
        { id: 3, name: 'Sleeping Bag Cold Weather', category: 'Sleeping Gear', pricePerDay: 20, available: 15, icon: '🛌', rentals: 52 },
        { id: 4, name: 'Hiking Backpack 65L', category: 'Backpacks', pricePerDay: 18, available: 6, icon: '🎒', rentals: 48 },
        { id: 5, name: 'LED Camping Lantern', category: 'Lighting', pricePerDay: 8, available: 20, icon: '🔦', rentals: 93 },
        { id: 6, name: 'GPS Navigation Device', category: 'Navigation', pricePerDay: 25, available: 4, icon: '🧭', rentals: 31 }
    ];

    rentals: ProviderRental[] = [
        { id: 1, customer: 'John Doe', customerInitials: 'JD', customerEmail: 'john@example.com', product: '4-Person Family Tent', dates: 'Jan 15 – Jan 18', total: 135, status: 'Active', avatarColor: '#8B7355' },
        { id: 2, customer: 'Sarah Miller', customerInitials: 'SM', customerEmail: 'sarah@example.com', product: 'Hiking Backpack 65L', dates: 'Jan 16 – Jan 20', total: 72, status: 'Pending', avatarColor: '#D4A574' },
        { id: 3, customer: 'Mike Johnson', customerInitials: 'MJ', customerEmail: 'mike@example.com', product: 'Portable Camping Stove', dates: 'Jan 14 – Jan 17', total: 45, status: 'Completed', avatarColor: '#9CA3AF' },
        { id: 4, customer: 'Emily Wilson', customerInitials: 'EW', customerEmail: 'emily@example.com', product: 'Sleeping Bag Cold Weather', dates: 'Jan 18 – Jan 22', total: 80, status: 'Active', avatarColor: '#8B7355' }
    ];

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

    constructor(private authService: AuthService) { }

    ngOnInit(): void {
        // Fetch real provider username if available
        this.authService.getCurrentUser().subscribe(user => {
            if (user?.username) {
                this.providerName = user.username;
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
