import {
    Component,
    OnInit,
    OnDestroy,
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
    availableOnly = false;

    // ─── Internal ───────────────────────────────────────────────────────────────
    private readonly destroy$ = new Subject<void>();
    private readonly reload$ = new Subject<void>();

    readonly PAGE_SIZES = [6, 12, 24];
    readonly SORT_OPTIONS = [
        { label: 'Newest first', value: 'createdAt,desc' },
        { label: 'Oldest first', value: 'createdAt,asc' },
        { label: 'Price: low → high', value: 'pricePerDay,asc' },
        { label: 'Price: high → low', value: 'pricePerDay,desc' },
        { label: 'Rating', value: 'rating,desc' }
    ];
    readonly CATEGORIES = [
        '', 'Tents', 'Sleeping Bags', 'Backpacks', 'Cooking',
        'Lighting', 'Navigation', 'Safety', 'Water', 'Other'
    ];

    constructor(
        private gearApi: GearApiService,
        private cdr: ChangeDetectorRef,
        private authService: AuthService
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
                this.loading = false;
                if (page !== null) {
                    this.gearPage = page;
                }
                this.cdr.markForCheck();
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

    onPageSizeChange(size: number): void {
        this.pageSize = size;
        this.currentPage = 0;
        this.reload$.next();
    }

    /** Returns an array of page indices to display in the paginator. */
    get pageNumbers(): number[] {
        if (!this.gearPage) return [];
        const total = this.gearPage.totalPages;
        const current = this.gearPage.number;
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
        return gear.imageUrls?.[0] ?? 'assets/images/gear-placeholder.jpg';
    }

    get resultSummary(): string {
        if (!this.gearPage) return '';
        const { number, size, totalElements, numberOfElements } = this.gearPage;
        const from = number * size + 1;
        const to = number * size + numberOfElements;
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
