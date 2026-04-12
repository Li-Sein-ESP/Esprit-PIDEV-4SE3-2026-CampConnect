import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
    selector: 'app-camper-order-details',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './camper-order-details.component.html',
    styleUrls: ['./camper-order-details.component.scss']
})
export class CamperOrderDetailsComponent implements OnInit {
    orderId: string = '';

    order = {
        id: 'CC-2025-01247',
        date: 'January 18, 2025 at 2:34 PM',
        status: 'on-the-way',
        statusLabel: 'On the Way',
        totalAmount: 347.50,
        rentalStart: 'Jan 20, 2025',
        rentalStartTime: '10:00 AM',
        rentalEnd: 'Jan 24, 2025',
        rentalEndTime: '6:00 PM',
        duration: '4 days, 8 hours',
        deliveryMethod: 'Standard Drop-off',
        items: [
            {
                name: 'Mountain Pro Tent 4P',
                brand: 'AlpineGear',
                condition: 'Excellent Condition',
                pricePerDay: 45.00,
                quantity: 1,
                days: 4,
                totalPrice: 180.00,
                image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=200&h=200&fit=crop'
            },
            {
                name: 'Sleeping Bag -20°C',
                brand: 'NorthFace',
                condition: 'New',
                pricePerDay: 25.00,
                quantity: 2,
                days: 4,
                totalPrice: 200.00,
                image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200&h=200&fit=crop'
            },
            {
                name: 'Camping Stove Pro',
                brand: 'MSR',
                condition: 'Good Condition',
                pricePerDay: 15.00,
                quantity: 1,
                days: 4,
                totalPrice: 60.00,
                image: 'https://images.unsplash.com/photo-1533235333150-35b370ff19d0?w=200&h=200&fit=crop'
            }
        ],
        payment: {
            subtotal: 440.00,
            deliveryFee: 25.00,
            deposit: 350.00,
            taxes: 37.40,
            discount: 104.90,
            method: 'Visa ending in 4242'
        },
        delivery: {
            address: '1245 Pine Ridge Campground',
            details: 'Site 42, Yosemite National Park, CA 95389',
            estimatedArrival: 'Jan 20, 9:30 AM',
            vehicle: 'Van - Medium',
            provider: 'CampConnect',
            timeline: [
                { status: 'completed', label: 'Order Confirmed', time: 'Jan 18, 2:34 PM' },
                { status: 'completed', label: 'Items Prepared', time: 'Jan 19, 10:15 AM' },
                { status: 'active', label: 'Out for Delivery', time: 'Jan 20, 7:00 AM • Driver: Mike R.' },
                { status: 'pending', label: 'Delivered', time: 'Expected by 9:30 AM' }
            ]
        },
        customer: {
            name: 'Sarah Johnson',
            email: 'sarah.j@email.com',
            phone: '+1 (555) 123-4567'
        }
    };

    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        // In a real app, this would fetch from a service using the ID
        this.orderId = this.route.snapshot.paramMap.get('orderId') || 'CC-2025-01247';
        // Overriding the mock id if passed via route (demo only)
        if (this.orderId && this.orderId !== 'mock') {
            this.order.id = this.orderId;
        }
    }

    goBack(): void {
        this.router.navigate(['/profile/orders']);
    }

    get isDeliveryActive(): boolean {
        return this.order.status === 'preparing' || this.order.status === 'on-the-way';
    }

    get isDelivered(): boolean {
        return this.order.status === 'delivered';
    }
}
