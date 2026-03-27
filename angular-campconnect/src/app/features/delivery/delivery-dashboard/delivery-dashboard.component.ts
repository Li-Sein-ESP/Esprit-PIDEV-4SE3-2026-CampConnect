import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DeliveryApiService, DeliveryResponse } from '../services/delivery-api.service';

@Component({
    selector: 'app-delivery-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './delivery-dashboard.component.html',
    styleUrls: ['./delivery-dashboard.component.scss']
})
export class DeliveryDashboardComponent implements OnInit {
    isSidebarOpen = false;
    loading = true;
    error: string | null = null;

    deliveries: DeliveryResponse[] = [];

    get activeDeliveries(): DeliveryResponse[] {
        return this.deliveries.filter(d =>
            d.status === 'ASSIGNED' || d.status === 'PICKED_UP' || d.status === 'IN_TRANSIT'
        );
    }

    get pendingDeliveries(): DeliveryResponse[] {
        return this.deliveries.filter(d => d.status === 'CREATED' || d.status === 'PENDING');
    }

    get completedDeliveries(): DeliveryResponse[] {
        return this.deliveries.filter(d => d.status === 'DELIVERED');
    }

    constructor(private deliveryApi: DeliveryApiService) { }

    ngOnInit(): void {
        this.loadDeliveries();
    }

    loadDeliveries(): void {
        this.loading = true;
        this.error = null;
        this.deliveryApi.getMyDeliveries(0, 20).subscribe({
            next: (page) => {
                this.deliveries = page.content;
                this.loading = false;
            },
            error: (err) => {
                this.error = err?.status === 403
                    ? 'Access denied. Delivery provider role required.'
                    : 'Failed to load deliveries.';
                this.loading = false;
            }
        });
    }

    updateStatus(id: string, status: 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED'): void {
        this.deliveryApi.updateStatus(id, status).subscribe({
            next: (updated) => {
                const idx = this.deliveries.findIndex(d => d.id === id);
                if (idx !== -1) this.deliveries[idx] = updated;
            },
            error: () => alert('Failed to update delivery status.')
        });
    }

    toggleSidebar(): void {
        this.isSidebarOpen = !this.isSidebarOpen;
    }
}
