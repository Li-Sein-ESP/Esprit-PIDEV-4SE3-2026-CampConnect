import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TripIntentService } from '../services/trip-intent.service';

import { AuthService } from '../../../core/services/auth.service';
import { TripIntent } from '../models/trip-intent.model';
import { LucideAngularModule, ArrowLeft, Calendar, MapPin, DollarSign, Target, Tent, Clock, Share2, Users, Trash2 } from 'lucide-angular';
import { BadgeComponent } from '../../../shared/components/badge.component';

@Component({
    selector: 'app-trip-intent-detail',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        LucideAngularModule,
        BadgeComponent
    ],
    templateUrl: './trip-intent-detail.component.html',
    styleUrl: './trip-intent-detail.component.css'
})
export class TripIntentDetailComponent implements OnInit {
    // Icons
    readonly ArrowLeft = ArrowLeft;
    readonly Calendar = Calendar;
    readonly MapPin = MapPin;
    readonly DollarSign = DollarSign;
    readonly Target = Target;
    readonly Tent = Tent;
    readonly Clock = Clock;
    readonly Share2 = Share2;
    readonly Users = Users;
    readonly Trash2 = Trash2;

    intentId: string | null = null;
    intent: TripIntent | null = null;
    loading = true;
    error = false;
    currentUserId: string | null = null;
    isCreator = false;
    isDeleting = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private tripIntentService: TripIntentService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.authService.getCurrentUser().subscribe(user => {
            this.currentUserId = user?.id || null;
            this.updateIsCreator();
        });

        this.route.paramMap.subscribe(params => {
            this.intentId = params.get('id');
            if (this.intentId) {
                this.loadIntentDetails(this.intentId);
            } else {
                this.error = true;
                this.loading = false;
            }
        });
    }

    loadIntentDetails(id: string) {
        this.loading = true;
        this.tripIntentService.getTripIntentById(id).subscribe({
            next: (data) => {
                this.intent = data;
                this.updateIsCreator();
                this.loading = false;
            },
            error: (err) => {
                console.error('Error fetching intent details', err);
                this.error = true;
                this.loading = false;
            }
        });
    }

    private updateIsCreator() {
        if (this.intent && this.currentUserId) {
            this.isCreator = this.intent.creatorUserId === this.currentUserId;
        } else {
            this.isCreator = false;
        }
    }

    // --- Formatting Helpers ---
    formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });
    }

    getDaysDifference(d1: string, d2: string): number {
        const diffTime = Math.abs(new Date(d2).getTime() - new Date(d1).getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive days
    }

    getStyleLabel(style: string): string {
        const map: Record<string, string> = {
            WILD: 'Sauvage', GLAMPING: 'Glamping', CABIN: 'Chalet',
            CAR_CAMPING: 'Camping Car', BACKPACKING: 'Backpacking',
            RV: 'Van', TRADITIONAL: 'Traditionnel'
        };
        return map[style] || style;
    }

    deleteIntent() {
        if (!this.intentId) return;
        if (confirm('Êtes-vous sûr de vouloir supprimer ce projet de voyage ? Cette action est irréversible.')) {
            this.isDeleting = true;
            this.tripIntentService.deleteTripIntent(this.intentId).subscribe({
                next: () => {
                    this.isDeleting = false;
                    this.router.navigate(['/my-trip-intents']);
                },
                error: (err) => {
                    console.error('Error deleting intent', err);
                    this.isDeleting = false;
                    alert('Erreur lors de la suppression.');
                }
            });
        }
    }
}

