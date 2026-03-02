import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface DeliveryStat {
    activeDeliveries: number;
    pendingRequests: number;
    todaysEarnings: number;
    averageRating: number;
}

interface Delivery {
    id: string;
    orderNumber: string;
    pickupLocation: string;
    dropoffLocation: string;
    vehicleType: string;
    weight: number;
    urgency: 'Standard' | 'Urgent';
    status: string;
    dueIn: string;
}

@Component({
    selector: 'app-delivery-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './delivery-dashboard.component.html',
    styleUrls: ['./delivery-dashboard.component.scss']
})
export class DeliveryDashboardComponent {
    isSidebarOpen = false;

    stats: DeliveryStat = {
        activeDeliveries: 12,
        pendingRequests: 5,
        todaysEarnings: 284.50,
        averageRating: 4.9
    };

    deliveries: Delivery[] = [
        {
            id: '7782',
            orderNumber: '#ORD-7782',
            pickupLocation: 'Camping World, 4500 E Speedway Blvd',
            dropoffLocation: 'Yosemite Pines RV Resort, Site 42',
            vehicleType: 'Van Required',
            weight: 45,
            urgency: 'Urgent',
            status: 'active',
            dueIn: '2h 15m'
        },
        {
            id: '7785',
            orderNumber: '#ORD-7785',
            pickupLocation: 'REI Co-op, 2455 E Tamarack Ave',
            dropoffLocation: 'Lake Tahoe State Park, North Entrance',
            vehicleType: 'SUV / Car',
            weight: 12,
            urgency: 'Standard',
            status: 'active',
            dueIn: '4h 30m'
        }
    ];

    toggleSidebar(): void {
        this.isSidebarOpen = !this.isSidebarOpen;
    }
}
