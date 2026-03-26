import { Component, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ChevronLeft, Calendar, Users, MapPin, Clock, List, Package, DollarSign, Map as MapIcon, Edit, Share2, Download, CheckCircle, Circle, ChevronRight, Info, Plane, Trash2 } from 'lucide-angular';
import { TripService } from '../services/trip.service';
import { TransportationService } from '../../transportation/services/transportation.service';
import { TransportRoute } from '../../transportation/models/transportation.model';

interface OverviewCard {
    id: string;
    title: string;
    subtitle: string;
    icon: any;
    progress?: number;
    imageUrl?: string;
}

@Component({
    selector: 'app-trip-detail',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        LucideAngularModule,
        FormsModule
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

    // Edit Modal State
    isEditModalOpen = false;
    editData: any = {};

    overviewCards: OverviewCard[] = [];
    assignedTransports = signal<TransportRoute[]>([]);

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
    readonly Info = Info;
    readonly Plane = Plane;
    readonly Trash2 = Trash2;

    statusConfig: any = {
        draft: { label: 'Draft', color: 'bg-slate-900/70 text-slate-100' },
        planned: { label: 'Planned', color: 'bg-emerald-900/70 text-emerald-100' },
        completed: { label: 'Completed', color: 'bg-emerald-700/70 text-emerald-50' },
    };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private tripService: TripService,
        private transportationService: TransportationService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe((params: any) => {
            this.tripId = params.get('id');
            console.log('TripDetail: ngOnInit with ID:', this.tripId);
            this.loadTrip();
        });
    }

    loadTrip() {
        if (this.tripId) {
            this.tripService.getTripById(this.tripId).subscribe({
                next: trip => {
                    this.trip = trip;
                    if (this.trip) {
                        this.setupOverviewCards();
                        this.loadTransportDetails();
                        this.cdr.detectChanges();
                    }
                },
                error: err => {
                    // Error fetching trip details
                    this.isLoading_manual = false;
                }
            });
        }
    }

    private isLoading_manual = true;
    get isLoading() {
        return this.isLoading_manual && !this.trip;
    }

    setupOverviewCards() {
        if (!this.trip) return;
        try {
            this.overviewCards = [
                {
                    id: `/plan-trip/${this.tripId}/itinerary`,
                    title: "Itinerary",
                    subtitle: `${this.trip.itineraryDays || this.tripDuration} days planned`,
                    icon: this.List || Info,
                },
                {
                    id: `/plan-trip/${this.tripId}/packing`,
                    title: "Packing List",
                    subtitle: `${this.trip.packingItems?.packed || 0} of ${this.trip.packingItems?.total || 0} packed`,
                    icon: this.Package || Info,
                    progress: this.packingProgress,
                },
                {
                    id: `/plan-trip/${this.tripId}/budget`,
                    title: "Budget",
                    subtitle: `$${this.trip.budget?.actual || 0} / $${this.trip.budget?.estimated || 0}`,
                    icon: this.DollarSign || Info,
                },
                {
                    id: `/plan-trip/${this.tripId}/nearby`,
                    title: "Nearby Places",
                    subtitle: `${this.trip.nearbyPlaces || 0} locations`,
                    icon: this.MapIcon || Info,
                },
                {
                    id: `/transportation/options?tripId=${this.tripId}`,
                    title: "Transportation",
                    subtitle: this.getTransportSubtitle(),
                    icon: this.Plane || Info,
                    imageUrl: this.assignedTransports()[0]?.imageUrl
                },
            ];
        } catch (err) {
            console.error('Error in setupOverviewCards:', err);
        }
    }

    private loadTransportDetails() {
        if (this.tripId) {
            this.transportationService.getTransportsByTrip(this.tripId).subscribe((transports: TransportRoute[]) => {
                this.assignedTransports.set(transports);
                this.setupOverviewCards(); // Refresh subtitle
                this.cdr.detectChanges();
            });
        }
    }

    private getTransportSubtitle(): string {
        const transports = this.assignedTransports();
        if (transports && transports.length > 0) {
            return transports[0].provider || 'Assigned';
        }
        return (this.trip.transportIds && this.trip.transportIds.length > 0) ? "Assigned" : "Not Selected";
    }

    get tripDuration(): number {
        if (!this.trip) return 0;
        if (!this.trip.startDate || !this.trip.endDate) return this.trip.duration || 1;

        return Math.ceil(
            (new Date(this.trip.endDate).getTime() - new Date(this.trip.startDate).getTime()) / (1000 * 60 * 60 * 24)
        );
    }

    get packingProgress(): number {
        if (!this.trip || !this.trip.packingItems || this.trip.packingItems.total === 0) return 0;
        return Math.round((this.trip.packingItems.packed / this.trip.packingItems.total) * 100);
    }

    get budgetProgress(): number {
        if (!this.trip || !this.trip.budget || this.trip.budget.estimated === 0) return 0;
        return Math.round((this.trip.budget.actual / this.trip.budget.estimated) * 100);
    }

    getStatusLabel(status: string): string {
        return this.statusConfig[status]?.label || status;
    }

    get daysUntilDeparture(): number {
        if (!this.trip || !this.trip.startDate) return 0;
        const start = new Date(this.trip.startDate);
        const today = new Date();
        const diff = start.getTime() - today.getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    get departureMessage(): string {
        if (!this.trip || !this.trip.startDate) return '';
        const date = new Date(this.trip.startDate);
        return `Your adventure starts on ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`;
    }

    navigate(path: string) {
        if (path.startsWith('/')) {
            this.router.navigateByUrl(path);
            return;
        }
        this.router.navigateByUrl('/' + path);
    }

    deleteTrip() {
        if (this.tripId && confirm('Are you sure you want to delete this trip?')) {
            this.tripService.deleteTrip(this.tripId).subscribe({
                next: () => {
                    this.router.navigate(['/trips']);
                },
                error: (err) => {
                    alert('Failed to delete trip: ' + (err.error?.message || 'Server error'));
                }
            });
        }
    }

    openEditModal() {
        if (!this.trip) return;
        this.editData = {
            name: this.trip.name,
            destination: this.trip.destination,
            startDate: this.trip.startDate ? new Date(this.trip.startDate).toISOString().split('T')[0] : '',
            endDate: this.trip.endDate ? new Date(this.trip.endDate).toISOString().split('T')[0] : '',
            participants: this.trip.participants || 1,
            description: this.trip.description || ''
        };
        this.isEditModalOpen = true;
    }

    closeEditModal() {
        this.isEditModalOpen = false;
    }

    saveTripEdits() {
        if (!this.tripId) return;

        // Basic validation
        if (!this.editData.name || !this.editData.destination) {
            alert('Name and Destination are required.');
            return;
        }

        const updatedTrip = {
            ...this.trip,
            ...this.editData
        };

        this.tripService.updateTrip(this.tripId, updatedTrip).subscribe({
            next: (updated) => {
                this.trip = updated;
                this.setupOverviewCards();
                this.isEditModalOpen = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed to update trip:', err);
                alert('Failed to update trip details.');
            }
        });
    }

    renameTrip() {
        this.openEditModal();
    }
}
