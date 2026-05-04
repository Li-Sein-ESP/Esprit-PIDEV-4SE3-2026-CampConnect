import {
    Component,
    OnInit,
    OnDestroy,
    NgZone,
    ChangeDetectionStrategy,
    ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, switchMap, catchError, of, startWith } from 'rxjs';
import { GearApiService } from '../services/gear-api.service';
import { GearResponse, PagedResponse, GearParams } from '../models/gear.model';
import { AuthService } from '../../../core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentApiService } from '../services/payment-api.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
    selector: 'app-gear-list',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './gear-list.component.html',
    styleUrl: './gear-list.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GearListComponent implements OnInit, OnDestroy {

    // ─── State ──────────────────────────────────────────────────────────────────
    gearPage: PagedResponse<GearResponse> | null = null;
    loading = false;
    error: string | null = null;

    // ─── Filter / Pagination params ─────────────────────────────────────────────
    currentPage = 0;
    pageSize = 12;
    sortField = 'createdAt,desc';
    categoryFilter = '';
    searchQuery = '';
    availableOnly = false;

    // ─── Internal ───────────────────────────────────────────────────────────────
    private readonly destroy$ = new Subject<void>();
    private readonly reload$ = new Subject<void>();

    readonly PAGE_SIZES = [6, 12, 24];
    readonly SORT_OPTIONS = [
        { label: 'Newest first', value: 'createdAt,desc' },
        { label: 'Oldest first', value: 'createdAt,asc' },
        { label: 'Price: low → high', value: 'price,asc' },
        { label: 'Price: high → low', value: 'price,desc' },
        { label: 'Name A–Z', value: 'name,asc' }
    ];
    readonly CATEGORIES = [
        '', 'Tents', 'Sleeping Bags', 'Backpacks', 'Cooking',
        'Lighting', 'Navigation', 'Safety', 'Water', 'Other'
    ];

    constructor(
        private gearApi: GearApiService,
        private cdr: ChangeDetectorRef,
        private zone: NgZone,
        private authService: AuthService,
        private route: ActivatedRoute,
        private router: Router,
        private paymentApi: PaymentApiService,
        private toastService: ToastService
    ) { }

    get isProvider(): boolean {
        return this.authService.hasRole('ROLE_EQUIPMENT_PROVIDER');
    }

    // ─── Lifecycle ──────────────────────────────────────────────────────────────

    ngOnInit(): void {
        this.reload$
            .pipe(
                startWith(undefined),           // trigger immediately on component init
                debounceTime(180),              // slight debounce for filter changes
                switchMap(() => {
                    this.loading = true;
                    this.error = null;
                    this.cdr.markForCheck();

                    const params: GearParams = {
                        page: this.currentPage,
                        size: this.pageSize,
                        sort: this.sortField
                    };
                    if (this.categoryFilter) params.category = this.categoryFilter;
                    if (this.searchQuery) params.query = this.searchQuery;
                    if (this.availableOnly) params.status = 'AVAILABLE';

                    return this.gearApi.getGear(params).pipe(
                        catchError(err => {
                            this.error = this.extractErrorMessage(err);
                            return of(null);
                        })
                    );
                }),
                takeUntil(this.destroy$)
            )
            .subscribe(page => {
                // Run inside zone so OnPush CD fires immediately
                this.zone.run(() => {
                    this.loading = false;
                    if (page !== null) {
                        this.gearPage = page;
                    }
                    this.cdr.detectChanges();
                });
            });

        // Handle payment status from query params (e.g. from cart checkout)
        this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe(qParams => {
            const sessionId = qParams.get('session_id');
            const checkoutStatus = qParams.get('checkout');
            
            if (sessionId) {
                this.router.navigate(['/payment/receipt'], {
                    queryParams: { session_id: sessionId, source: 'gear-list' }
                });
                // Remove query params from URL
                this.router.navigate([], {
                    relativeTo: this.route,
                    queryParams: { session_id: null },
                    queryParamsHandling: 'merge'
                });
            } else if (checkoutStatus === 'success') {
                this.toastService.success('Order placed successfully!');
                this.router.navigate([], {
                    relativeTo: this.route,
                    queryParams: { checkout: null },
                    queryParamsHandling: 'merge'
                });
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // ─── Pagination ──────────────────────────────────────────────────────────────

    goToPage(page: number): void {
        if (page < 0 || (this.gearPage && page >= this.gearPage.totalPages)) return;
        this.currentPage = page;
        this.reload$.next();
    }

    get isFirstPage(): boolean {
        return !this.gearPage || this.gearPage.page === 0;
    }

    onPageSizeChange(size: number): void {
        this.pageSize = size;
        this.currentPage = 0;
        this.reload$.next();
    }

    /** Returns an array of page indices to display in the paginator. */
    get pageNumbers(): number[] {
        if (!this.gearPage) return [];
        const total = this.gearPage.totalPages;
        const current = this.gearPage.page;
        const range: number[] = [];
        const start = Math.max(0, current - 2);
        const end = Math.min(total - 1, current + 2);
        for (let i = start; i <= end; i++) range.push(i);
        return range;
    }

    // ─── Filters ─────────────────────────────────────────────────────────────────

    onFilterChange(): void {
        this.currentPage = 0;
        this.reload$.next();
    }

    onSortChange(sort: string): void {
        this.sortField = sort;
        this.currentPage = 0;
        this.reload$.next();
    }

    clearFilters(): void {
        this.categoryFilter = '';
        this.searchQuery = '';
        this.availableOnly = false;
        this.sortField = 'createdAt,desc';
        this.currentPage = 0;
        this.reload$.next();
    }

    retry(): void {
        this.reload$.next();
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────────

    trackById(_: number, item: GearResponse): string {
        return item.id;
    }

    conditionLabel(condition: GearResponse['condition']): string {
        const map: Record<string, string> = {
            NEW: 'New', LIKE_NEW: 'Like New', GOOD: 'Good', FAIR: 'Fair'
        };
        return map[condition] ?? condition;
    }

    conditionClass(condition: GearResponse['condition']): string {
        const map: Record<string, string> = {
            NEW: 'badge--new', LIKE_NEW: 'badge--like-new',
            GOOD: 'badge--good', FAIR: 'badge--fair'
        };
        return map[condition] ?? '';
    }

    firstImage(gear: GearResponse): string {
        return gear.images?.[0]?.imageUrl ?? 'assets/images/gear-placeholder.jpg';
    }

    isAvailable(gear: GearResponse): boolean {
        return gear.status === 'AVAILABLE' && gear.quantity > 0;
    }

    get resultSummary(): string {
        if (!this.gearPage) return '';
        const { page, size, totalElements } = this.gearPage;
        const count = this.gearPage.content.length;
        const from = page * size + 1;
        const to = page * size + count;
        return `Showing ${from}–${to} of ${totalElements} items`;
    }

    private extractErrorMessage(err: unknown): string {
        if (err && typeof err === 'object') {
            const e = err as Record<string, unknown>;
            if (typeof e['error'] === 'object' && e['error'] !== null) {
                const inner = e['error'] as Record<string, unknown>;
                if (typeof inner['message'] === 'string') return inner['message'];
            }
            if (typeof e['message'] === 'string') return e['message'];
            if (typeof e['status'] === 'number') {
                if (e['status'] === 401) return 'You must be logged in to view gear.';
                if (e['status'] === 403) return 'You are not authorized to view this content.';
                if (e['status'] === 0) return 'Cannot connect to the server. Is the backend running?';
            }
        }
        return 'An unexpected error occurred. Please try again.';
    }
}
