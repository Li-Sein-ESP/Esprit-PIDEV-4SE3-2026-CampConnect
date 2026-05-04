import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Bell, Plus, TrendingUp, DollarSign, CalendarCheck, Clock, Hourglass, Star, Tent, Backpack, Flame, Moon, Lamp, AlertTriangle, Truck, Wrench } from 'lucide-angular';
import { GearApiService } from '../../gear/services/gear-api.service';
import { ProviderStatsResponse } from '../models/provider-stats.model';
import { GearResponse } from '../../gear/models/gear.model';

@Component({
    selector: 'app-provider-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule],
    templateUrl: './provider-dashboard.component.html',
    styleUrls: ['./provider-dashboard.component.scss']
})
export class ProviderDashboardComponent implements OnInit {
    icons = {
        Bell, Plus, TrendingUp, DollarSign, CalendarCheck, Clock, Hourglass, Star, Tent, Backpack, Flame, Moon, Lamp, AlertTriangle, Truck, Wrench
    };

    stats: ProviderStatsResponse = { totalRevenue: 0, activeRentals: 0, pendingRequests: 0, totalProducts: 0, averageRating: 0 };
    loading = true;

    topProducts: any[] = [];

    constructor(private gearApi: GearApiService, private cdr: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.gearApi.getProviderStats().subscribe({
            next: (data) => { this.stats = data; this.loading = false; this.cdr.detectChanges(); },
            error: () => { this.loading = false; this.cdr.detectChanges(); }
        });
        this.gearApi.getMyGear({ size: 5, sort: 'createdAt,desc' }).subscribe({
            next: (page) => {
                this.topProducts = page.content.map(g => ({
                    id: g.id,
                    name: g.name,
                    category: g.category,
                    rentals: 0,
                    revenue: 0,
                    rating: 0,
                    icon: this.icons.Tent
                }));
                this.cdr.detectChanges();
            },
            error: () => { this.cdr.detectChanges(); }
        });
    }

    alerts = [
        {
            title: 'Low Stock Alert',
            message: '2-Person Tent only has 3 units left in stock.',
            action: 'Restock Now →',
            type: 'danger',
            icon: this.icons.AlertTriangle
        },
        {
            title: 'Pending Approvals',
            message: '5 new rental requests waiting for approval.',
            action: 'Review Requests →',
            type: 'warning',
            icon: this.icons.Clock
        },
        {
            title: 'Upcoming Deliveries',
            message: '8 deliveries scheduled for tomorrow.',
            action: 'View Schedule →',
            type: 'info',
            icon: this.icons.Truck
        },
        {
            title: 'Maintenance Due',
            message: '3 items require routine maintenance.',
            action: 'View Items →',
            type: 'default',
            icon: this.icons.Wrench
        }
    ];
}
