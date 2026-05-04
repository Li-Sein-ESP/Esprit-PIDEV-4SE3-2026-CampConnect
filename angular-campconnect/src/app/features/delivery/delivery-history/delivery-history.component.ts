import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeliveryApiService, DeliveryResponse } from '../services/delivery-api.service';

export interface DeliveryHistory {
    id: string;
    orderId: string;
    customerName: string;
    customerInitials: string;
    date: string;
    distanceKm: number;
    vehicleType: string;
    earnings: number;
    rating: number | null;
    status: 'COMPLETED' | 'CANCELLED' | 'FAILED';
}

@Component({
    selector: 'app-delivery-history',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './delivery-history.component.html',
    styleUrls: ['./delivery-history.component.scss']
})
export class DeliveryHistoryComponent implements OnInit {

    history: DeliveryHistory[] = [];

    filteredHistory: DeliveryHistory[] = [];

    // Filters
    statusFilter: string = 'all';
    dateFilter: string = '7';
    searchTerm: string = '';

    // Modal State
    selectedDelivery: DeliveryHistory | null = null;

    // Pagination State
    currentPage: number = 1;
    itemsPerPage: number = 5;
    totalPages: number = 1;
    paginatedHistory: DeliveryHistory[] = [];

    loading = true;
    error: string | null = null;

    constructor(
        private deliveryApi: DeliveryApiService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loading = true;
        this.deliveryApi.getMyDeliveries(0, 50).subscribe({
            next: (page) => {
                this.history = page.content
                    .filter(d => d.status === 'DELIVERED' || d.status === 'CANCELLED' || d.status === 'FAILED')
                    .map((d, i) => this.mapToHistory(d));
                this.loading = false;
                this.applyFilters();
                this.cdr.detectChanges();
            },
            error: () => {
                this.error = 'Failed to load delivery history.';
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    private mapToHistory(d: DeliveryResponse): DeliveryHistory {
        const name = d.driverName || 'Unknown';
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
        const date = d.deliveredDate
            ? new Date(d.deliveredDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : d.scheduledDate;

        return {
            id: '#' + d.id.substring(0, 12),
            orderId: d.rentalId || d.purchaseId || '—',
            customerName: d.deliveryAddress.substring(0, 20),
            customerInitials: d.deliveryAddress.substring(0, 2).toUpperCase(),
            date,
            distanceKm: 0, // No distance data in Delivery model
            vehicleType: 'Van', // No vehicle type in Delivery model
            earnings: 15.00, // Flat rate
            rating: null, // No rating system yet
            status: d.status === 'DELIVERED' ? 'COMPLETED' : d.status as 'CANCELLED' | 'FAILED'
        };
    }

    get totalCompleted(): number {
        return this.history.filter(h => h.status === 'COMPLETED').length;
    }

    get totalDistance(): number {
        return this.history.reduce((sum, h) => sum + h.distanceKm, 0);
    }

    get totalEarnings(): number {
        return this.history.filter(h => h.status === 'COMPLETED').reduce((sum, h) => sum + h.earnings, 0);
    }

    get averageRating(): number {
        const rated = this.history.filter(h => h.rating !== null && h.status === 'COMPLETED');
        if (rated.length === 0) return 0;
        const sum = rated.reduce((s, h) => s + (h.rating || 0), 0);
        return Number((sum / rated.length).toFixed(1));
    }

    applyFilters(): void {
        let result = this.history;

        // Apply Status Filter
        if (this.statusFilter !== 'all') {
            result = result.filter(h => h.status.toLowerCase() === this.statusFilter);
        }

        // Apply Search Filter
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            result = result.filter(h =>
                h.id.toLowerCase().includes(term) ||
                h.orderId.toLowerCase().includes(term) ||
                h.customerName.toLowerCase().includes(term)
            );
        }

        // For date filter, we'd normally parse dates, but passing it through dynamically based on mock
        // if '7', could mock filter, but keeping it simple for now passing all if not custom

        this.filteredHistory = result;
        this.updatePagination();
    }

    onFilterChange(): void {
        this.currentPage = 1; // Reset to first page
        this.applyFilters();
    }

    updatePagination(): void {
        this.totalPages = Math.ceil(this.filteredHistory.length / this.itemsPerPage);
        if (this.totalPages === 0) this.totalPages = 1;
        this.setPage(this.currentPage);
    }

    setPage(page: number): void {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        this.paginatedHistory = this.filteredHistory.slice(startIndex, endIndex);
    }

    openModal(delivery: DeliveryHistory): void {
        this.selectedDelivery = delivery;
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    closeModal(): void {
        this.selectedDelivery = null;
        document.body.style.overflow = '';
    }

    // Template Helpers
    getVehicleBadgeClass(type: string): string {
        const t = type.toLowerCase();
        return t === 'truck' ? 'truck' : t === 'suv' ? 'suv' : 'van';
    }

    getStatusBadgeClass(status: string): string {
        const s = status.toLowerCase();
        return s === 'completed' ? 'completed' : s === 'cancelled' ? 'cancelled' : 'failed';
    }
}
