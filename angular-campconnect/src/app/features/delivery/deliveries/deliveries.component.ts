import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DeliveryApiService, DeliveryResponse, DeliveryStatus } from '../services/delivery-api.service';

@Component({
    selector: 'app-deliveries',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
<div class="min-h-screen bg-gray-50 py-10">
    <div class="max-w-4xl mx-auto px-4 sm:px-6">

        <div class="mb-8">
            <h1 class="text-2xl font-bold text-gray-900">My Deliveries</h1>
            <p class="text-gray-500 mt-1">Track all your gear delivery requests</p>
        </div>

        <!-- Loading -->
        <div *ngIf="loading" class="flex justify-center py-16">
            <div class="w-10 h-10 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>

        <!-- Error -->
        <div *ngIf="!loading && error"
            class="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-4 mb-6">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <p class="text-red-700 text-sm font-medium flex-1">{{ error }}</p>
            <button (click)="loadDeliveries()" class="text-sm text-red-600 underline">Retry</button>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && !error && deliveries.length === 0"
            class="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5"
                class="mx-auto mb-4">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">No deliveries yet</h3>
            <p class="text-gray-400 text-sm">Your delivery requests will appear here.</p>
        </div>

        <!-- Delivery List -->
        <div *ngIf="!loading && !error && deliveries.length > 0" class="space-y-4">
            <div *ngFor="let delivery of deliveries"
                class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

                <div class="flex items-start justify-between gap-4 flex-wrap mb-3">
                    <div>
                        <p class="font-semibold text-gray-900">{{ delivery.pickupAddress }}</p>
                        <p class="text-xs text-gray-400 mt-0.5">→ {{ delivery.deliveryAddress }}</p>
                    </div>
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                        [ngClass]="{
                            'bg-yellow-50 text-yellow-700':  delivery.status === 'PENDING',
                            'bg-blue-50 text-blue-700':      delivery.status === 'ASSIGNED',
                            'bg-indigo-50 text-indigo-700':  delivery.status === 'PICKED_UP' || delivery.status === 'IN_TRANSIT',
                            'bg-green-50 text-green-700':    delivery.status === 'DELIVERED',
                            'bg-red-50 text-red-600':        delivery.status === 'FAILED' || delivery.status === 'CANCELLED'
                        }">
                        <span class="w-1.5 h-1.5 rounded-full"
                            [ngClass]="{
                                'bg-yellow-500':  delivery.status === 'PENDING',
                                'bg-blue-500':    delivery.status === 'ASSIGNED',
                                'bg-indigo-500':  delivery.status === 'PICKED_UP' || delivery.status === 'IN_TRANSIT',
                                'bg-green-500':   delivery.status === 'DELIVERED',
                                'bg-red-500':     delivery.status === 'FAILED' || delivery.status === 'CANCELLED'
                            }"></span>
                        {{ statusLabel(delivery.status) }}
                    </span>
                </div>

                <div class="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                    <span *ngIf="delivery.priority !== 'NORMAL'" class="font-medium"
                        [class.text-red-600]="delivery.priority === 'URGENT' || delivery.priority === 'HIGH'">
                        {{ delivery.priority }} priority
                    </span>
                    <span *ngIf="delivery.scheduledDate">
                        Scheduled: {{ formatDate(delivery.scheduledDate) }}
                    </span>
                    <span class="text-gray-300">ID: {{ delivery.id | slice:0:8 }}</span>
                </div>
            </div>

            <!-- Pagination -->
            <div *ngIf="totalPages > 1" class="flex items-center justify-between pt-4">
                <p class="text-sm text-gray-500">Page {{ currentPage + 1 }} of {{ totalPages }}</p>
                <div class="flex gap-2">
                    <button (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 0"
                        class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
                        Previous
                    </button>
                    <button (click)="goToPage(currentPage + 1)" [disabled]="currentPage >= totalPages - 1"
                        class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
                        Next
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
`
})
export class DeliveriesComponent implements OnInit {
    deliveries: DeliveryResponse[] = [];
    loading = true;
    error: string | null = null;
    currentPage = 0;
    totalPages = 1;
    pageSize = 10;

    constructor(private deliveryApi: DeliveryApiService) { }

    ngOnInit(): void {
        this.loadDeliveries();
    }

    loadDeliveries(): void {
        this.loading = true;
        this.error = null;
        this.deliveryApi.getMyDeliveries(this.currentPage, this.pageSize).subscribe({
            next: (page) => {
                this.deliveries = page.content;
                this.totalPages = page.totalPages;
                this.loading = false;
            },
            error: (err) => {
                this.error = err?.status === 401
                    ? 'Please log in to view your deliveries.'
                    : 'Failed to load deliveries. Please try again.';
                this.loading = false;
            }
        });
    }

    goToPage(page: number): void {
        if (page < 0 || page >= this.totalPages) return;
        this.currentPage = page;
        this.loadDeliveries();
    }

    statusLabel(status: DeliveryStatus): string {
        const labels: Record<DeliveryStatus, string> = {
            CREATED: 'Created',
            PENDING: 'Pending',
            ASSIGNED: 'Assigned',
            PICKED_UP: 'Picked Up',
            IN_TRANSIT: 'In Transit',
            DELIVERED: 'Delivered',
            FAILED: 'Failed',
            CANCELLED: 'Cancelled'
        };
        return labels[status] ?? status;
    }

    formatDate(dateStr: string): string {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
}

