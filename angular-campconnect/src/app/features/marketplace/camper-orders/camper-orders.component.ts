import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-camper-orders',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './camper-orders.component.html',
    styleUrls: ['./camper-orders.component.scss']
})
export class CamperOrdersComponent implements OnInit {

    currentFilter: 'all' | 'active' | 'delivered' | 'cancelled' = 'all';

    orders = [
        {
            id: 'CC-20250117-001',
            date: 'Jan 17, 2025',
            status: 'on-the-way',
            statusLabel: 'On the Way',
            totalAmount: 189.00,
            rentalDuration: '5 nights',
            eta: 'Today, 4:30 PM',
            progress: 72,
            items: [
                { name: 'Alpine Tent 4P', icon: 'tent' },
                { name: 'Sleeping Bag', icon: 'sleeping-bag' },
                { name: 'Camp Stove', icon: 'stove' },
            ]
        },
        {
            id: 'CC-20250112-002',
            date: 'Jan 12, 2025',
            status: 'preparing',
            statusLabel: 'Preparing',
            totalAmount: 94.50,
            rentalDuration: '3 nights',
            eta: 'Jan 20, 10:00 AM',
            progress: 25,
            items: [
                { name: 'Hiking Backpack', icon: 'backpack' },
                { name: 'Trekking Poles', icon: 'poles' },
            ]
        },
        {
            id: 'CC-20250105-003',
            date: 'Jan 5, 2025',
            status: 'delivered',
            statusLabel: 'Delivered',
            totalAmount: 256.00,
            rentalDuration: '7 nights',
            eta: '',
            progress: 100,
            items: [
                { name: 'Family Tent 6P', icon: 'tent' },
                { name: 'Lantern Set', icon: 'lantern' },
                { name: 'Cooler Box', icon: 'cooler' },
                { name: 'Camp Chairs x2', icon: 'chair' },
            ]
        },
        {
            id: 'CC-20241228-004',
            date: 'Dec 28, 2024',
            status: 'delivered',
            statusLabel: 'Delivered',
            totalAmount: 62.00,
            rentalDuration: '2 nights',
            eta: '',
            progress: 100,
            items: [
                { name: 'Hammock', icon: 'hammock' },
                { name: 'Rain Fly', icon: 'tarp' },
            ]
        },
        {
            id: 'CC-20241220-005',
            date: 'Dec 20, 2024',
            status: 'cancelled',
            statusLabel: 'Cancelled',
            totalAmount: 135.00,
            rentalDuration: '4 nights',
            eta: '',
            progress: 0,
            items: [
                { name: 'Winter Tent 2P', icon: 'tent' },
                { name: 'Snow Shovel', icon: 'shovel' },
                { name: 'Thermal Mat', icon: 'mat' },
            ]
        }
    ];

    filteredOrders = this.orders;

    ngOnInit(): void {
        this.applyFilter('all');
    }

    applyFilter(filter: 'all' | 'active' | 'delivered' | 'cancelled') {
        this.currentFilter = filter;
        if (filter === 'all') {
            this.filteredOrders = this.orders;
        } else if (filter === 'active') {
            this.filteredOrders = this.orders.filter(o => o.status === 'preparing' || o.status === 'on-the-way');
        } else {
            this.filteredOrders = this.orders.filter(o => o.status === filter);
        }
    }

    get stats() {
        return {
            total: this.orders.length,
            active: this.orders.filter(o => o.status === 'preparing' || o.status === 'on-the-way').length,
            delivered: this.orders.filter(o => o.status === 'delivered').length,
            cancelled: this.orders.filter(o => o.status === 'cancelled').length
        };
    }

    getVisibleItems(items: any[]) {
        return items.slice(0, 3);
    }

    getRemainingItemsCount(items: any[]) {
        return items.length - 3;
    }

    isActive(status: string) {
        return status === 'preparing' || status === 'on-the-way';
    }

    getDeliverySteps(status: string, activeIdx: number) {
        const steps = ['Confirmed', 'Preparing', 'Shipped', 'Delivered'];
        return steps.map((s, i) => {
            let cls = 'cc-delivery-bar__step';
            if (i < activeIdx) cls += ' cc-delivery-bar__step--done';
            else if (i === activeIdx) cls += ' cc-delivery-bar__step--current';
            return { name: s, class: cls };
        });
    }

    getActiveStepIndex(status: string) {
        return status === 'preparing' ? 1 : 2;
    }
}
