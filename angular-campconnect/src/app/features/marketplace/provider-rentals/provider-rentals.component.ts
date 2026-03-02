import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Required for ngModel on the search box and filter select

export interface RentalItem {
    id: string;
    productName: string;
    productImage: string; // Used in place of emoji for robust visual representation
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
    avatarIndex?: number; // Pre-calculated for avatar color
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

    rentals: RentalItem[] = [
        {
            id: 'RNT-4821',
            productName: '4-Person Expedition Tent',
            productImage: '⛺',
            renterName: 'Sarah Mitchell',
            startDate: '2025-06-01',
            endDate: '2025-06-08',
            duration: '7 days',
            deliveryStatus: 'Delivered',
            paymentStatus: 'Paid',
            totalAmount: 245.00,
            baseStatus: 'active',
            isLate: false,
        },
        {
            id: 'RNT-4819',
            productName: 'Ultralight Sleeping Bag (-10°C)',
            productImage: '🛏️',
            renterName: 'James Cooper',
            startDate: '2025-05-28',
            endDate: '2025-06-03',
            duration: '6 days',
            deliveryStatus: 'Delivered',
            paymentStatus: 'Paid',
            totalAmount: 132.00,
            baseStatus: 'late',
            isLate: true,
            lateDays: 3,
        },
        {
            id: 'RNT-4815',
            productName: 'Portable Camp Stove Pro',
            productImage: '🔥',
            renterName: 'Emily Zhang',
            startDate: '2025-06-03',
            endDate: '2025-06-10',
            duration: '7 days',
            deliveryStatus: 'In Transit',
            paymentStatus: 'Paid',
            totalAmount: 89.50,
            baseStatus: 'active',
            isLate: false,
        },
        {
            id: 'RNT-4812',
            productName: 'Trekking Backpack 65L',
            productImage: '🎒',
            renterName: 'David Okafor',
            startDate: '2025-05-25',
            endDate: '2025-06-01',
            duration: '7 days',
            deliveryStatus: 'Delivered',
            paymentStatus: 'Partial',
            totalAmount: 175.00,
            baseStatus: 'late',
            isLate: true,
            lateDays: 5,
        },
        {
            id: 'RNT-4808',
            productName: 'LED Lantern Set (3-Pack)',
            productImage: '🏕️',
            renterName: 'Rachel Evans',
            startDate: '2025-06-05',
            endDate: '2025-06-12',
            duration: '7 days',
            deliveryStatus: 'Delivered',
            paymentStatus: 'Paid',
            totalAmount: 54.00,
            baseStatus: 'active',
            isLate: false,
        },
        {
            id: 'RNT-4805',
            productName: 'Inflatable Kayak 2-Person',
            productImage: '🛶',
            renterName: 'Tom Nguyen',
            startDate: '2025-06-10',
            endDate: '2025-06-15',
            duration: '5 days',
            deliveryStatus: 'Pickup',
            paymentStatus: 'Pending',
            totalAmount: 320.00,
            baseStatus: 'upcoming',
            isLate: false,
        },
        {
            id: 'RNT-4800',
            productName: 'Camping Hammock Double',
            productImage: '🌲',
            renterName: 'Lisa Patel',
            startDate: '2025-05-20',
            endDate: '2025-05-27',
            duration: '7 days',
            deliveryStatus: 'Delivered',
            paymentStatus: 'Paid',
            totalAmount: 68.00,
            baseStatus: 'completed',
            isLate: false,
        },
        {
            id: 'RNT-4796',
            productName: 'Portable Water Filter System',
            productImage: '💧',
            renterName: 'Mark Sullivan',
            startDate: '2025-05-26',
            endDate: '2025-06-02',
            duration: '7 days',
            deliveryStatus: 'Delivered',
            paymentStatus: 'Paid',
            totalAmount: 95.00,
            baseStatus: 'late',
            isLate: true,
            lateDays: 4,
        },
    ];

    filteredRentals: RentalItem[] = [];

    constructor(private router: Router) { }

    ngOnInit(): void {
        // Generate avatar indices exactly matching JS logic
        this.rentals.forEach((r, idx) => {
            r.avatarIndex = idx % 6;
        });
        this.applyFilters();
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
        if (confirm(`Are you sure you want to mark rental ${rental.id} as returned?`)) {
            rental.baseStatus = 'completed';
            rental.isLate = false;
            rental.lateDays = 0;
            this.applyFilters();
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
