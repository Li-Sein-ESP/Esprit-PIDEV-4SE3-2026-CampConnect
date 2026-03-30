import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RentalApiService, RentalResponse, RentalStatus } from '../../gear/services/rental-api.service';

export interface RentalItem {
    id: string;
    productName: string;
    productImage: string;
    renterName: string;
    startDate: string;
    endDate: string;
    duration: string;
    deliveryStatus: string;
    paymentStatus: string;
    totalAmount: number;
    isLate: boolean;
    lateDays?: number;
    baseStatus: 'active' | 'upcoming' | 'completed' | 'late';
    avatarIndex?: number;
    rentalStatus: RentalStatus;
}

function daysBetween(start: string, end: string): number {
    const s = new Date(start + 'T00:00:00');
    const e = new Date(end + 'T00:00:00');
    return Math.max(1, Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)));
}

function toRentalItem(r: RentalResponse, index: number): RentalItem {
    const now = new Date();
    const endDate = new Date(r.endDate + 'T00:00:00');
    let baseStatus: 'active' | 'upcoming' | 'completed' | 'late';

    switch (r.status) {
        case 'ACTIVE':
            baseStatus = endDate < now ? 'late' : 'active';
            break;
        case 'PENDING':
        case 'APPROVED':
            baseStatus = 'upcoming';
            break;
        default:
            baseStatus = 'completed';
    }

    const lateDays = baseStatus === 'late'
        ? Math.ceil((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    const days = daysBetween(r.startDate, r.endDate);

    return {
        id: r.id,
        productName: r.gearName,
        productImage: '📦',
        renterName: r.renterName,
        startDate: r.startDate,
        endDate: r.endDate,
        duration: `${days} day${days !== 1 ? 's' : ''}`,
        deliveryStatus: '—',
        paymentStatus: '—',
        totalAmount: 0,
        isLate: baseStatus === 'late',
        lateDays: lateDays || undefined,
        baseStatus,
        avatarIndex: index % 6,
        rentalStatus: r.status
    };
}

@Component({
    selector: 'app-provider-rentals',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './provider-rentals.component.html',
    styleUrls: ['./provider-rentals.component.scss']
})
export class ProviderRentalsComponent implements OnInit {
    filterStatus: string = 'all';
    searchQuery: string = '';
    loading = true;
    error: string | null = null;

    rentals: RentalItem[] = [];
    filteredRentals: RentalItem[] = [];

    constructor(private router: Router, private rentalApi: RentalApiService) { }

    ngOnInit(): void {
        this.loadRentals();
    }

    loadRentals(): void {
        this.loading = true;
        this.error = null;
        this.rentalApi.getAll(0, 100).subscribe({
            next: (page) => {
                this.rentals = page.content.map((r, i) => toRentalItem(r, i));
                this.loading = false;
                this.applyFilters();
            },
            error: (err) => {
                this.error = err?.status === 403
                    ? 'Access denied. Equipment Provider role required.'
                    : 'Failed to load rentals. Please try again.';
                this.loading = false;
            }
        });
    }

    /* ---- HELPERS ---- */
    formatDate(dateStr: string): string {
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    getInitials(name: string): string {
        return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
    }

    getAvatarClass(index?: number): string {
        return 'cc-renter-avatar--' + (index || 0);
    }

    getStatusBadge(status: string) {
        const map: { [key: string]: { cls: string; label: string } } = {
            active: { cls: 'cc-badge--active', label: 'Active' },
            upcoming: { cls: 'cc-badge--upcoming', label: 'Upcoming' },
            completed: { cls: 'cc-badge--completed', label: 'Completed' },
            late: { cls: 'cc-badge--late', label: 'Late Return' },
        };
        return map[status] || map['active'];
    }

    getDeliveryBadge(delivery: string): string {
        const map: { [key: string]: string } = {
            'Delivered': 'cc-badge--delivered',
            'In Transit': 'cc-badge--in-transit',
            'Pickup': 'cc-badge--pickup',
        };
        return map[delivery] || 'cc-badge--delivered';
    }

    getPaymentBadge(payment: string): string {
        const map: { [key: string]: string } = {
            'Paid': 'cc-badge--paid',
            'Pending': 'cc-badge--pending',
            'Partial': 'cc-badge--partial',
        };
        return map[payment] || 'cc-badge--paid';
    }

    /* ---- RENDER LOGIC ---- */
    applyFilters(): void {
        const query = this.searchQuery.toLowerCase().trim();
        this.filteredRentals = this.rentals.filter(r => {
            const matchStatus = (this.filterStatus === 'all') || (r.baseStatus === this.filterStatus);
            const matchQuery = !query ||
                r.id.toLowerCase().includes(query) ||
                r.productName.toLowerCase().includes(query) ||
                r.renterName.toLowerCase().includes(query);
            return matchStatus && matchQuery;
        });
    }

    markAsReturned(rental: RentalItem): void {
        if (confirm(`Mark rental ${rental.id} as COMPLETED?`)) {
            this.rentalApi.updateStatus(rental.id, 'COMPLETED').subscribe({
                next: () => this.loadRentals(),
                error: () => alert('Failed to update rental status.')
            });
        }
    }

    viewDetails(rentalId: string): void {
        this.router.navigate(['/provider/rentals', rentalId]);
    }

    contactRenter(renterName: string): void {
        alert(`Contacting ${renterName}`);
    }

    // Key stats computations
    get activeCount(): number {
        return this.rentals.filter(r => r.baseStatus === 'active').length;
    }

    get upcomingCount(): number {
        return this.rentals.filter(r => r.baseStatus === 'upcoming').length;
    }

    get lateCount(): number {
        return this.rentals.filter(r => r.isLate).length;
    }

    get totalRevenue(): number {
        return this.rentals.reduce((sum, current) => sum + current.totalAmount, 0);
    }
}
