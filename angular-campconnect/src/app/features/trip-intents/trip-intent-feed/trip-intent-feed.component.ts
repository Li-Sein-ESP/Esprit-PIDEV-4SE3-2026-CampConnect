import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Plus, Users, Calendar, MapPin, DollarSign, Target, ListFilter } from 'lucide-angular';
import { TripIntentService } from '../services/trip-intent.service';
import { TripIntent } from '../models/trip-intent.model';
import { CardComponent, CardContentComponent, CardHeaderComponent, CardTitleComponent } from '../../../shared/components/card.component';
import { BadgeComponent } from '../../../shared/components/badge.component';

@Component({
    selector: 'app-trip-intent-feed',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        LucideAngularModule,
        CardComponent,
        CardContentComponent,
        CardHeaderComponent,
        CardTitleComponent,
        BadgeComponent
    ],
    templateUrl: './trip-intent-feed.component.html',
    styleUrl: './trip-intent-feed.component.css'
})
export class TripIntentFeedComponent implements OnInit {
    readonly Plus = Plus;
    readonly Users = Users;
    readonly Calendar = Calendar;
    readonly MapPin = MapPin;
    readonly DollarSign = DollarSign;
    readonly Target = Target;
    readonly ListFilter = ListFilter;

    intents: TripIntent[] = [];
    loading = true;
    errorMessage: string | null = null;

    constructor(private tripIntentService: TripIntentService) { }

    ngOnInit(): void {
        this.loadOpenIntents();
    }

    loadOpenIntents() {
        this.loading = true;
        this.errorMessage = null;
        this.tripIntentService.getOpenIntents().subscribe({
            next: (data) => {
                this.intents = data || [];
                this.loading = false;
            },
            error: (err) => {
                console.error('Error fetching trip intents', err);
                this.errorMessage = 'Impossible de charger le fil d\'actualité.';
                this.loading = false;
            }
        });
    }

    formatDate(dateString: string): string {
        const d = new Date(dateString);
        return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }

    getStyleLabel(style: string): string {
        const map: Record<string, string> = {
            WILD: 'Sauvage',
            GLAMPING: 'Glamping',
            CABIN: 'Chalet',
            CAR_CAMPING: 'Camping Car',
            BACKPACKING: 'Backpacking',
            RV: 'Van/RV',
            TRADITIONAL: 'Traditionnel'
        };
        return map[style] || style;
    }
}
