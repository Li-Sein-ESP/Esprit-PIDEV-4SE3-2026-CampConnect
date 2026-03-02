import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule, ChevronLeft, Calendar, Users, MapPin, Clock, List, Package, DollarSign, Map as MapIcon, Edit, Share2, Download, CheckCircle, Circle, ChevronRight } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { BadgeComponent } from '../../../shared/components/badge.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardDescriptionComponent, CardContentComponent } from '../../../shared/components/card.component';
import { TripService } from '../../../core/services/trip.service';

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
    styleUrls: []
})
export class TripDetailComponent implements OnInit {
    tripId: string | null = null;
    trip: any = null;
    loading: boolean = true;

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

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private tripService: TripService
    ) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.tripId = params.get('id');
            if (this.tripId) {
                this.loadTrip(this.tripId);
            }
        });
    }

    loadTrip(id: string) {
        this.loading = true;
        this.tripService.getTripById(id).subscribe({
            next: (trip) => {
                this.trip = {
                    ...trip,
                    name: trip.name || 'Adventure to ' + trip.destination,
                    status: 'planned', // Defaulting since backend DTO is simpler
                    adventureLevel: trip.difficulty || 'moderate',
                    comfortLevel: 'basic',
                    activities: ['hiking', 'camping'],
                    daysUntil: 0,
                    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
                    itineraryDays: 0,
                    packingItems: { total: 0, packed: 0 },
                    budget: { estimated: 0, actual: 0 },
                    nearbyPlaces: 0
                };
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading trip', err);
                this.loading = false;
            }
        });
    }

    get tripDuration(): number {
        if (!this.trip || !this.trip.startDate || !this.trip.endDate) return 0;
        return Math.ceil(
            (new Date(this.trip.endDate).getTime() - new Date(this.trip.startDate).getTime()) / (1000 * 60 * 60 * 24)
        );
    }

    get packingProgress(): number {
        if (!this.trip || !this.trip.packingItems?.total) return 0;
        return Math.round((this.trip.packingItems.packed / this.trip.packingItems.total) * 100);
    }

    get budgetProgress(): number {
        if (!this.trip || !this.trip.budget?.estimated) return 0;
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

