import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RentalApiService, RentalResponse, RentalStatus } from '../services/rental-api.service';
import { PagedResponse } from '../models/gear.model';

@Component({
    selector: 'app-rentals',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
<div class="min-h-screen bg-gray-50 py-10">
    <div class="max-w-4xl mx-auto px-4 sm:px-6">

        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-2xl font-bold text-gray-900">My Rentals</h1>
            <p class="text-gray-500 mt-1">Track and manage your gear rental requests</p>
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
            <button (click)="loadRentals()" class="text-sm text-red-600 underline">Retry</button>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && !error && rentals.length === 0"
            class="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5"
                class="mx-auto mb-4">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">No rentals yet</h3>
            <p class="text-gray-400 text-sm mb-6">Browse available gear and start renting for your next adventure.</p>
            <a routerLink="/gear" class="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                Browse Gear
            </a>
        </div>

        <!-- Rental List -->
        <div *ngIf="!loading && !error && rentals.length > 0" class="space-y-4">
            <div *ngFor="let rental of rentals"
                class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">

                <!-- Icon -->
                <div class="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="1.8">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                            <h3 class="font-semibold text-gray-900 truncate">{{ rental.gearName }}</h3>
                            <p class="text-xs text-gray-400 mt-0.5">ID: {{ rental.id | slice:0:12 }}</p>
                        </div>
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                            [ngClass]="{
                                'bg-yellow-50 text-yellow-700': rental.status === 'PENDING',
                                'bg-blue-50 text-blue-700':    rental.status === 'APPROVED',
                                'bg-green-50 text-green-700':  rental.status === 'ACTIVE',
                                'bg-gray-100 text-gray-500':   rental.status === 'COMPLETED' || rental.status === 'CANCELLED'
                            }">
                            <span class="w-1.5 h-1.5 rounded-full"
                                [ngClass]="{
                                    'bg-yellow-500': rental.status === 'PENDING',
                                    'bg-blue-500':   rental.status === 'APPROVED',
                                    'bg-green-500':  rental.status === 'ACTIVE',
                                    'bg-gray-400':   rental.status === 'COMPLETED' || rental.status === 'CANCELLED'
                                }"></span>
                            {{ statusLabel(rental.status) }}
                        </span>
                    </div>

                    <div class="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                        <span class="flex items-center gap-1">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            {{ formatDate(rental.startDate) }} – {{ formatDate(rental.endDate) }}
                        </span>
                        <span class="text-gray-400">{{ dayCount(rental.startDate, rental.endDate) }} days</span>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex-shrink-0" *ngIf="rental.status === 'PENDING'">
                    <button (click)="cancelRental(rental)"
                        class="text-sm text-red-500 hover:text-red-700 font-medium border border-red-200 hover:border-red-400 rounded-lg px-3 py-1.5 transition-colors">
                        Cancel
                    </button>
                </div>
            </div>

            <!-- Pagination -->
            <div *ngIf="totalPages > 1" class="flex items-center justify-between pt-4">
                <p class="text-sm text-gray-500">
                    Page {{ currentPage + 1 }} of {{ totalPages }}
                </p>
                <div class="flex gap-2">
                    <button (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 0"
                        class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">
                        Previous
                    </button>
                    <button (click)="goToPage(currentPage + 1)" [disabled]="currentPage >= totalPages - 1"
                        class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">
                        Next
                    </button>
                </div>
            </div>
        </div>

    </div>
</div>
`
})
export class RentalsComponent implements OnInit {
    rentals: RentalResponse[] = [];
    loading = true;
    error: string | null = null;
    currentPage = 0;
    totalPages = 1;
    pageSize = 10;

    constructor(private rentalApi: RentalApiService) { }

    ngOnInit(): void {
        this.loadRentals();
    }

    loadRentals(): void {
        this.loading = true;
        this.error = null;
        this.rentalApi.getMyRentals(this.currentPage, this.pageSize).subscribe({
            next: (page: PagedResponse<RentalResponse>) => {
                this.rentals = page.content;
                this.totalPages = page.totalPages;
                this.loading = false;
            },
            error: (err: any) => {
                this.error = err?.status === 401
                    ? 'Please log in to view your rentals.'
                    : 'Failed to load rentals. Please try again.';
                this.loading = false;
            }
        });
    }

    goToPage(page: number): void {
        if (page < 0 || page >= this.totalPages) return;
        this.currentPage = page;
        this.loadRentals();
    }

    cancelRental(rental: RentalResponse): void {
        if (!confirm(`Cancel rental for "${rental.gearName}"?`)) return;
        this.rentalApi.updateStatus(rental.id, 'CANCELLED').subscribe({
            next: () => this.loadRentals(),
            error: () => alert('Failed to cancel rental. Please try again.')
        });
    }

    statusLabel(status: RentalStatus): string {
        const labels: Record<RentalStatus, string> = {
            PENDING: 'Pending',
            APPROVED: 'Approved',
            ACTIVE: 'Active',
            COMPLETED: 'Completed',
            CANCELLED: 'Cancelled'
        };
        return labels[status] ?? status;
    }

    formatDate(dateStr: string): string {
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    dayCount(start: string, end: string): number {
        const s = new Date(start + 'T00:00:00');
        const e = new Date(end + 'T00:00:00');
        return Math.max(1, Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)));
    }
}

