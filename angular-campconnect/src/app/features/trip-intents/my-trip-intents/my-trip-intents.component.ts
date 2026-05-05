import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TripIntentService } from '../services/trip-intent.service';
import { AuthService } from '../../../core/services/auth.service';
import { TripIntent, TripIntentStatus } from '../models/trip-intent.model';
import { LucideAngularModule, Plus, Calendar, Settings, Compass, Users } from 'lucide-angular';

@Component({
    selector: 'app-my-trip-intents',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        LucideAngularModule
    ],
    templateUrl: './my-trip-intents.component.html',
    styleUrl: './my-trip-intents.component.css'
})
export class MyTripIntentsComponent implements OnInit {
    // Icons
    readonly Plus = Plus;
    readonly Calendar = Calendar;
    readonly Settings = Settings;
    readonly Compass = Compass;
    readonly Users = Users;

    myIntents: TripIntent[] = [];
    loading = true;
    currentUserId: string | null = null;
    errorMessage: string | null = null;

    constructor(
        private tripIntentService: TripIntentService,
        private authService: AuthService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }

    navigateToDetail(intentId: string) {
        if (intentId) {
            this.router.navigate(['/trip-intents', intentId]);
        }
    }

    navigateToGroup(event: Event, groupId: string | undefined) {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        if (groupId) {
            this.router.navigate(['/groups', groupId]);
        }
    }

    ngOnInit(): void {
        this.authService.getCurrentUser().subscribe(user => {
            this.currentUserId = user?.id || null;
            if (this.currentUserId) {
                this.loadMyIntents();
            } else {
                this.loading = false;
                this.cdr.detectChanges();
            }
            this.cdr.detectChanges();
        });
    }

    loadMyIntents() {
        if (!this.currentUserId) return;

        this.loading = true;
        this.errorMessage = null;
        this.tripIntentService.getIntentsByCreator(this.currentUserId).subscribe({
            next: (data) => {
                this.myIntents = data || [];
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error fetching my intents', err);
                this.errorMessage = 'Impossible de charger vos projets.';
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'OPEN': return 'status-open';
            case 'DRAFT': return 'status-draft';
            case 'CLOSED': return 'status-closed';
            default: return '';
        }
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'OPEN': return 'Ouvert aux invités';
            case 'DRAFT': return 'Brouillon';
            case 'CLOSED': return 'Groupe Complet / Projet fermé';
            default: return status;
        }
    }
}
