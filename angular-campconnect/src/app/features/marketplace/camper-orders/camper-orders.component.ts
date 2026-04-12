import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GearApiService } from '../../gear/services/gear-api.service';
import { PurchaseResponse, PagedResponse } from '../../gear/models/gear.model';

@Component({
    selector: 'app-camper-orders',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './camper-orders.component.html',
    styleUrls: ['./camper-orders.component.scss']
})
export class CamperOrdersComponent implements OnInit {

    currentFilter: 'all' | 'active' | 'delivered' | 'cancelled' = 'all';

    loading = true;
    error: string | null = null;

    orders: any[] = [];

    filteredOrders = this.orders;

    constructor(private gearApi: GearApiService) { }

    ngOnInit(): void {
        this.gearApi.getMyPurchases(0, 20).subscribe({
            next: (page: PagedResponse<PurchaseResponse>) => {
                this.orders = page.content.map((p: any) => ({
                    id: p.id,
                    date: new Date(p.purchaseDate || p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    status: p.status === 'CONFIRMED' ? 'delivered' : p.status === 'PENDING' ? 'preparing' : 'cancelled',
                    statusLabel: p.status === 'CONFIRMED' ? 'Delivered' : p.status === 'PENDING' ? 'Preparing' : 'Cancelled',
                    totalAmount: p.totalPrice,
                    rentalDuration: '',
                    eta: '',
                    progress: p.status === 'CONFIRMED' ? 100 : p.status === 'PENDING' ? 25 : 0,
                    items: [{ name: p.gearName, icon: 'gear' }]
                }));
                this.filteredOrders = this.orders;
                this.loading = false;
                this.applyFilter(this.currentFilter);
            },
            error: () => {
                this.error = 'Failed to load orders.';
                this.loading = false;
            }
        });
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
