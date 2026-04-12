import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { GearApiService } from '../../gear/services/gear-api.service';
import { GearAnalyticsResponse } from '../models/provider-stats.model';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-provider-product-analytics',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './provider-product-analytics.component.html',
    styleUrls: ['./provider-product-analytics.component.scss']
})
export class ProviderProductAnalyticsComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    productId: string = '';

    analytics: GearAnalyticsResponse | null = null;
    loading = true;
    error: string | null = null;

    rentalsTrend = [
        { label: 'W1', value: 142 },
        { label: 'W2', value: 168 },
        { label: 'W3', value: 155 },
        { label: 'W4', value: 189 },
        { label: 'W5', value: 210 },
        { label: 'W6', value: 198 },
        { label: 'W7', value: 234 },
        { label: 'W8', value: 256 }
    ];

    ratingBreakdown = [
        { stars: 5, percentage: 62, count: 194 },
        { stars: 4, percentage: 23, count: 72 },
        { stars: 3, percentage: 9, count: 28 },
        { stars: 2, percentage: 4, count: 12 },
        { stars: 1, percentage: 2, count: 6 }
    ];

    insights = [
        {
            icon: 'weekend',
            title: 'Most rented on weekends',
            desc: '68% of bookings occur Friday through Sunday. Consider premium weekend pricing.',
            type: 'Pattern',
            colorClass: 'info'
        },
        {
            icon: 'summer',
            title: 'High demand in summer',
            desc: 'June–August accounts for 45% of annual revenue. Prepare inventory early.',
            type: 'Seasonal',
            colorClass: 'warning'
        },
        {
            icon: 'stock',
            title: 'Low stock warning',
            desc: 'Only 2 units available next weekend. 5 pending requests may go unfulfilled.',
            type: 'Action',
            colorClass: 'alert'
        },
        {
            icon: 'growth',
            title: 'Growth trajectory positive',
            desc: 'Bookings up 12.5% month-over-month. This product ranks #3 in your catalog.',
            type: 'Trend',
            colorClass: 'trend'
        }
    ];

    maxRentals = 300;
    maxRevenue = 2000;

    constructor(private route: ActivatedRoute, private gearApi: GearApiService) { }

    ngOnInit() {
        this.route.paramMap.pipe(
            takeUntil(this.destroy$),
            switchMap(params => {
                this.productId = params.get('id') || '';
                return this.gearApi.getGearAnalytics(this.productId);
            })
        ).subscribe({
            next: (data) => {
                this.analytics = data;
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Failed to load analytics.';
                this.loading = false;
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    getRentalsHeight(value: number): string {
        return (value / this.maxRentals * 100) + '%';
    }

    generateRevenuePolygon(): string {
        // Generate an SVG polygon points string from revenueTrend
        const width = 800; // viewBox width
        const height = 250; // viewBox height
        const data: number[] = [];
        const max = this.maxRevenue;

        let points = `0,${height} `;
        data.forEach((val, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - (val / max * height);
            points += `${x},${y} `;
        });
        points += `${width},${height}`;

        return points;
    }
}
