import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DeliveryApiService } from '../services/delivery-api.service';

interface DeliveryVehicle {
    id: number;
    name: string;
    type: string;
    capacity: string;
    status: 'Active' | 'Maintenance' | 'Idle';
    icon: string;
    trips: number;
}

interface DeliveryHistory {
    id: number;
    customer: string;
    customerInitials: string;
    pickup: string;
    dropoff: string;
    date: string;
    earnings: number;
    status: 'Completed' | 'Cancelled';
    avatarColor: string;
}

interface DeliveryReview {
    id: number;
    customer: string;
    customerInitials: string;
    date: string;
    rating: number;
    text: string;
    avatarColor: string;
    showResponse: boolean;
}

interface RatingBreakdown {
    stars: number;
    count: number;
    pct: number;
}

@Component({
    selector: 'app-delivery-profile',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './delivery-profile.component.html',
    styleUrl: './delivery-profile.component.scss'
})
export class DeliveryProfileComponent implements OnInit {

    providerName = 'Alex Morgan';
    bio = 'Professional gear delivery specialist. Ensuring your camping gear arrives safely and on time for your wilderness adventures. Over 5 years of logistics experience.';
    rating = 4.8;
    reviewCount = 184;
    memberSince = '2020';
    location = 'Denver, Colorado';
    verified = true;

    stats = {
        totalDeliveries: 0,
        activeJobs: 0,
        totalEarnings: '$0',
        avgRating: 0,
        onTimeRate: '0%',
        completionRate: '0%',
        repeatCustomers: '0%',  // Not yet in backend API
        avgDistance: '0 miles'  // Not yet in backend API
    };

    loading = true;

    activeTab = 'overview';

    vehicles: DeliveryVehicle[] = [
        { id: 1, name: 'Ford Transit Van', type: 'Cargo Van', capacity: 'Large Cargo', status: 'Active', icon: '🚐', trips: 312 },
        { id: 2, name: 'Toyota Tacoma', type: 'Pickup Truck', capacity: 'Medium Cargo', status: 'Active', icon: '🛻', trips: 140 },
        { id: 3, name: 'Chevy Express', type: 'Cargo Van', capacity: 'Large Cargo', status: 'Maintenance', icon: '🚐', trips: 0 }
    ];

    history: DeliveryHistory[] = [
        { id: 1, customer: 'John Doe', customerInitials: 'JD', pickup: 'Alpine Gear Co.', dropoff: 'Yosemite Valley', date: 'Oct 12, 2025', earnings: 45, status: 'Completed', avatarColor: '#10B981' },
        { id: 2, customer: 'Sarah Miller', customerInitials: 'SM', pickup: 'Wilderness Supply', dropoff: 'Crater Lake NP', date: 'Oct 10, 2025', earnings: 85, status: 'Completed', avatarColor: '#047857' },
        { id: 3, customer: 'Mike Johnson', customerInitials: 'MJ', pickup: 'REI Basecamp', dropoff: 'Joshua Tree NP', date: 'Oct 08, 2025', earnings: 60, status: 'Completed', avatarColor: '#34D399' },
        { id: 4, customer: 'Emily Wilson', customerInitials: 'EW', pickup: 'Mountain Outfitters', dropoff: 'Grand Canyon', date: 'Oct 05, 2025', earnings: 120, status: 'Completed', avatarColor: '#10B981' }
    ];

    reviews: DeliveryReview[] = [
        { id: 1, customer: 'John Doe', customerInitials: 'JD', date: '2 days ago', rating: 5, text: 'Alex was incredibly prompt and helped unload all the heavy gear exactly where we needed it at our campsite.', avatarColor: '#10B981', showResponse: false },
        { id: 2, customer: 'Sarah Miller', customerInitials: 'SM', date: '5 days ago', rating: 5, text: 'Fantastic service! Communication was clear and the gear arrived in perfect condition.', avatarColor: '#047857', showResponse: false },
        { id: 3, customer: 'Mike Johnson', customerInitials: 'MJ', date: '1 week ago', rating: 4, text: 'Delivery was slightly delayed due to traffic, but Alex kept me updated the whole time.', avatarColor: '#34D399', showResponse: false }
    ];

    ratingBreakdown: RatingBreakdown[] = [
        { stars: 5, count: 154, pct: 84 },
        { stars: 4, count: 22, pct: 12 },
        { stars: 3, count: 6, pct: 3 },
        { stars: 2, count: 2, pct: 1 },
        { stars: 1, count: 0, pct: 0 }
    ];

    starArray = [1, 2, 3, 4, 5];

    constructor(
        private authService: AuthService,
        private deliveryApiService: DeliveryApiService
    ) { }

    ngOnInit(): void {
        this.authService.getCurrentUser().subscribe(user => {
            if (user?.username) {
                this.providerName = user.username;
            }
        });
        
        this.loadProfileStats();
    }
    
    loadProfileStats(): void {
        this.loading = true;
        this.deliveryApiService.getProfileStats().subscribe({
            next: (response) => {
                this.stats = {
                    totalDeliveries: response.totalDeliveries,
                    activeJobs: response.activeJobs,
                    totalEarnings: `$${(response.totalEarnings / 1000).toFixed(1)}k`,
                    avgRating: response.rating,
                    onTimeRate: `${response.onTimeRate}%`,
                    completionRate: `${response.completionRate}%`,
                    repeatCustomers: '0%',  // Not yet in backend API
                    avgDistance: '0 miles'  // Not yet in backend API
                };
                this.rating = response.rating;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading profile stats:', error);
                this.loading = false;
            }
        });
    }

    setActiveTab(tab: string): void {
        this.activeTab = tab;
    }

    toggleResponse(review: DeliveryReview): void {
        review.showResponse = !review.showResponse;
    }

    statusClass(status: string): string {
        switch (status) {
            case 'Active':
            case 'Completed': return 'status--active';
            case 'Maintenance':
            case 'Cancelled': return 'status--pending';
            case 'Idle': return 'status--idle';
            default: return '';
        }
    }

    trackById(_: number, item: { id: number }): number {
        return item.id;
    }
}
