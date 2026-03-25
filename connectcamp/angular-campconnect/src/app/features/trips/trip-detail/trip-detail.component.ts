import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule, ChevronLeft, Calendar, Users, MapPin, Clock, List, Package, DollarSign, Map as MapIcon, Edit, Share2, Download, CheckCircle, Circle, ChevronRight } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { BadgeComponent } from '../../../shared/components/badge.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardDescriptionComponent, CardContentComponent } from '../../../shared/components/card.component';

@Component({
    selector: 'app-trip-detail',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        LucideAngularModule,
        ButtonComponent,
        BadgeComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardDescriptionComponent,
        CardContentComponent
    ],
    templateUrl: './trip-detail.component.html',
    styles: [`
    :host {
      display: block;
    }
  `]
})
export class TripDetailComponent implements OnInit {
    tripId: string | null = null;
    trip: any = null;

    // Icons
    readonly ChevronLeft = ChevronLeft;
    readonly Calendar = Calendar;
    readonly Users = Users;
    readonly MapPin = MapPin;
    readonly Clock = Clock;
    readonly List = List;
    readonly Package = Package;
    readonly DollarSign = DollarSign;
    readonly MapIcon = MapIcon;
    readonly Edit = Edit;
    readonly Share2 = Share2;
    readonly Download = Download;
    readonly CheckCircle = CheckCircle;
    readonly Circle = Circle;
    readonly ChevronRight = ChevronRight;

    statusConfig: any = {
        draft: { label: 'Draft', variant: 'default', color: 'var(--color-neutral-600)' },
        planned: { label: 'Planned', variant: 'primary', color: 'var(--color-primary-600)' },
        completed: { label: 'Completed', variant: 'success', color: 'var(--color-success)' },
    };

    // Mock Data
    mockTripData: any = {
        '1': {
            id: '1',
            name: 'Yosemite Valley Adventure',
            destination: 'Yosemite National Park, CA',
            startDate: '2026-03-15',
            endDate: '2026-03-18',
            groupSize: 4,
            status: 'planned',
            adventureLevel: 'moderate',
            comfortLevel: 'comfortable',
            activities: ['hiking', 'photography', 'camping', 'wildlife'],
            daysUntil: 42,
            imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
            itineraryDays: 4,
            packingItems: { total: 42, packed: 28 },
            budget: { estimated: 850, actual: 320 },
            nearbyPlaces: 5,
        },
        'new-trip-id': {
            id: 'new-trip-id',
            name: 'New Adventure',
            destination: 'Custom Location',
            startDate: '2026-04-01',
            endDate: '2026-04-05',
            groupSize: 2,
            status: 'draft',
            adventureLevel: 'moderate',
            comfortLevel: 'basic',
            activities: ['hiking', 'camping'],
            daysUntil: 59,
            imageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=80',
            itineraryDays: 5,
            packingItems: { total: 35, packed: 0 },
            budget: { estimated: 600, actual: 0 },
            nearbyPlaces: 8,
        },
    };

    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.tripId = params.get('id');
            this.loadTrip();
        });
    }

    loadTrip() {
        this.trip = this.mockTripData[this.tripId || '1'];
    }

    get tripDuration(): number {
        if (!this.trip) return 0;
        return Math.ceil(
            (new Date(this.trip.endDate).getTime() - new Date(this.trip.startDate).getTime()) / (1000 * 60 * 60 * 24)
        );
    }

    get packingProgress(): number {
        if (!this.trip) return 0;
        return Math.round((this.trip.packingItems.packed / this.trip.packingItems.total) * 100);
    }

    get budgetProgress(): number {
        if (!this.trip) return 0;
        return this.trip.budget.estimated > 0
            ? Math.round((this.trip.budget.actual / this.trip.budget.estimated) * 100)
            : 0;
    }

    getStatusVariant(status: string): 'default' | 'primary' | 'success' | 'error' | 'warning' {
        return this.statusConfig[status]?.variant || 'default';
    }

    getStatusLabel(status: string): string {
        return this.statusConfig[status]?.label || status;
    }

    navigate(path: string) {
        this.router.navigate([path]);
    }
}
