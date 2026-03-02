import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Bell, Plus, TrendingUp, DollarSign, CalendarCheck, Clock, Hourglass, Star, Tent, Backpack, Flame, Moon, Lamp, AlertTriangle, Truck, Wrench } from 'lucide-angular';

@Component({
    selector: 'app-provider-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule],
    templateUrl: './provider-dashboard.component.html',
    styleUrls: ['./provider-dashboard.component.scss']
})
export class ProviderDashboardComponent {
    icons = {
        Bell, Plus, TrendingUp, DollarSign, CalendarCheck, Clock, Hourglass, Star, Tent, Backpack, Flame, Moon, Lamp, AlertTriangle, Truck, Wrench
    };

    stats = {
        totalRevenue: 48250,
        activeRentals: 127,
        pendingRequests: 23,
        averageRating: 4.8
    };

    topProducts = [
        {
            id: 'PROD-001',
            name: '4-Person Camping Tent',
            category: 'Outdoor Gear',
            rentals: 48,
            revenue: 4320,
            rating: 4.9,
            icon: this.icons.Tent
        },
        {
            id: 'PROD-002',
            name: 'Hiking Backpack 65L',
            category: 'Gear & Equipment',
            rentals: 42,
            revenue: 2940,
            rating: 4.8,
            icon: this.icons.Backpack
        },
        {
            id: 'PROD-003',
            name: 'Portable Camping Stove',
            category: 'Cooking Equipment',
            rentals: 38,
            revenue: 1900,
            rating: 4.7,
            icon: this.icons.Flame
        },
        {
            id: 'PROD-004',
            name: 'Sleeping Bag -20°C',
            category: 'Sleeping Gear',
            rentals: 35,
            revenue: 2450,
            rating: 4.9,
            icon: this.icons.Moon
        },
        {
            id: 'PROD-005',
            name: 'LED Camping Lantern',
            category: 'Lighting',
            rentals: 31,
            revenue: 930,
            rating: 4.6,
            icon: this.icons.Lamp
        }
    ];

    alerts = [
        {
            title: 'Low Stock Alert',
            message: '2-Person Tent only has 3 units left in stock.',
            action: 'Restock Now →',
            type: 'danger',
            icon: this.icons.AlertTriangle
        },
        {
            title: 'Pending Approvals',
            message: '5 new rental requests waiting for approval.',
            action: 'Review Requests →',
            type: 'warning',
            icon: this.icons.Clock
        },
        {
            title: 'Upcoming Deliveries',
            message: '8 deliveries scheduled for tomorrow.',
            action: 'View Schedule →',
            type: 'info',
            icon: this.icons.Truck
        },
        {
            title: 'Maintenance Due',
            message: '3 items require routine maintenance.',
            action: 'View Items →',
            type: 'default',
            icon: this.icons.Wrench
        }
    ];
}
