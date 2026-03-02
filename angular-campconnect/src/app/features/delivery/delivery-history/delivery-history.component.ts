import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

    history: DeliveryHistory[] = [
        {
            id: '#DEL-2024-001',
            orderId: '#ORD-8942',
            customerName: 'John Davidson',
            customerInitials: 'JD',
            date: 'Jan 15, 2024',
            distanceKm: 24.5,
            vehicleType: 'Van',
            earnings: 85.00,
            rating: 4.8,
            status: 'COMPLETED'
        },
        {
            id: '#DEL-2024-002',
            orderId: '#ORD-8943',
            customerName: 'Sarah Mitchell',
            customerInitials: 'SM',
            date: 'Jan 14, 2024',
            distanceKm: 18.2,
            vehicleType: 'Truck',
            earnings: 120.00,
            rating: 5.0,
            status: 'COMPLETED'
        },
        {
            id: '#DEL-2024-003',
            orderId: '#ORD-8944',
            customerName: 'Michael Kim',
            customerInitials: 'MK',
            date: 'Jan 14, 2024',
            distanceKm: 32.8,
            vehicleType: 'Van',
            earnings: 95.00,
            rating: 4.5,
            status: 'CANCELLED'
        },
        {
            id: '#DEL-2024-004',
            orderId: '#ORD-8945',
            customerName: 'Emily Watson',
            customerInitials: 'EW',
            date: 'Jan 13, 2024',
            distanceKm: 15.3,
            vehicleType: 'SUV',
            earnings: 65.00,
            rating: 4.9,
            status: 'COMPLETED'
        },
        {
            id: '#DEL-2024-005',
            orderId: '#ORD-8946',
            customerName: 'Robert Johnson',
            customerInitials: 'RJ',
            date: 'Jan 12, 2024',
            distanceKm: 45.6,
            vehicleType: 'Truck',
            earnings: 150.00,
            rating: 4.2,
            status: 'FAILED'
        },
        {
            id: '#DEL-2024-006',
            orderId: '#ORD-8947',
            customerName: 'Amanda Lee',
            customerInitials: 'AL',
            date: 'Jan 11, 2024',
            distanceKm: 28.4,
            vehicleType: 'Van',
            earnings: 92.00,
            rating: 5.0,
            status: 'COMPLETED'
        },
        {
            id: '#DEL-2024-007',
            orderId: '#ORD-8948',
            customerName: 'David Chen',
            customerInitials: 'DC',
            date: 'Jan 10, 2024',
            distanceKm: 19.7,
            vehicleType: 'SUV',
            earnings: 78.00,
            rating: 4.7,
            status: 'COMPLETED'
        },
        {
            id: '#DEL-2024-008',
            orderId: '#ORD-8949',
            customerName: 'Jessica Park',
            customerInitials: 'JP',
            date: 'Jan 9, 2024',
            distanceKm: 52.1,
            vehicleType: 'Truck',
            earnings: 175.00,
            rating: 4.6,
            status: 'COMPLETED'
        }
    ];

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

    ngOnInit(): void {
        this.applyFilters();
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
