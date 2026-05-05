import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule, Plus, Users, Calendar, MapPin, DollarSign, Target, ListFilter, Flame, Check, Search } from 'lucide-angular';
import { TripIntentService } from '../services/trip-intent.service';
import { GroupService } from '../../groups/services/group';
import { AuthService } from '../../../core/services/auth.service';
import { TripIntent } from '../models/trip-intent.model';
import { CardComponent, CardContentComponent, CardHeaderComponent, CardTitleComponent } from '../../../shared/components/card.component';
import { BadgeComponent } from '../../../shared/components/badge.component';
import { FormsModule } from '@angular/forms';

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
        BadgeComponent,
        FormsModule
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
    readonly Flame = Flame;
    readonly Check = Check;
    readonly Search = Search;

    allIntents: TripIntent[] = [];
    filteredIntents: TripIntent[] = [];
    selectedStyle: string = 'ALL';
    searchQuery: string = '';
    loading = true;
    errorMessage: string | null = null;
    currentUserId: string | null = null;
    joinedTripIds: Set<string> = new Set();

    constructor(
        private tripIntentService: TripIntentService,
        private groupService: GroupService,
        private authService: AuthService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }

    navigateToDetail(intentId: string) {
        if (intentId) {
            this.router.navigate(['/trip-intents', intentId]);
        }
    }

    ngOnInit(): void {
        this.authService.getCurrentUser().subscribe(user => {
            if (user) {
                this.currentUserId = user.id;
                this.loadUserMemberships();
            }
            this.loadOpenIntents();
        });
    }

    loadUserMemberships() {
        if (!this.currentUserId) return;
        this.groupService.getMyGroups(this.currentUserId).subscribe(groups => {
            this.joinedTripIds = new Set(groups.map(g => g.tripId).filter(id => !!id) as string[]);
            this.cdr.detectChanges();
        });
    }

    isMember(tripId: string): boolean {
        return this.joinedTripIds.has(tripId);
    }

    loadOpenIntents() {
        this.loading = true;
        this.errorMessage = null;
        this.tripIntentService.getOpenIntents().subscribe({
            next: (data) => {
                this.allIntents = data || [];
                this.applyFilter();
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error fetching trip intents', err);
                this.errorMessage = 'Impossible de charger le fil d\'actualité.';
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    setFilter(style: string) {
        this.selectedStyle = style;
        this.applyFilter();
    }

    applyFilter() {
        this.filteredIntents = this.allIntents.filter(intent => {
            const matchesStyle = this.selectedStyle === 'ALL' || intent.campingStyle === this.selectedStyle;
            const query = this.searchQuery.toLowerCase();
            const matchesSearch = !this.searchQuery || 
                (intent.title && intent.title.toLowerCase().includes(query)) ||
                (intent.preferredZone && intent.preferredZone.toLowerCase().includes(query)) ||
                (intent.creatorName && intent.creatorName.toLowerCase().includes(query));
            
            return matchesStyle && matchesSearch;
        });
    }

    formatDate(dateString: string): string {
        const d = new Date(dateString);
        return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }

    getStyleLabel(style: string): string {
        const map: Record<string, string> = {
            WILD: 'Wild',
            GLAMPING: 'Glamping',
            CABIN: 'Cabin',
            CAR_CAMPING: 'Car Camping',
            BACKPACKING: 'Backpacking',
            RV: 'RV',
            TRADITIONAL: 'Traditional'
        };
        return map[style] || style;
    }

    getFallbackImage(style: string): string {
        const fallbacks: Record<string, string> = {
            WILD: 'https://images.unsplash.com/photo-1517823382935-51bfcb0ec6bc?auto=format&fit=crop&q=80&w=600',
            GLAMPING: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80&w=600',
            CAR_CAMPING: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&q=80&w=600',
            TRADITIONAL: 'https://images.unsplash.com/photo-1486915307817-2d5fc41b31f2?auto=format&fit=crop&q=80&w=600',
            BACKPACKING: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=600'
        };
        return fallbacks[style] || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=600';
    }
}
