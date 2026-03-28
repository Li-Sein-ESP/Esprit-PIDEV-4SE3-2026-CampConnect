import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, AlertTriangle, ShieldCheck, MapPin, Calendar, Clock, ArrowLeft, Share2, Info, Flame, CloudRain, AlertCircle, ExternalLink, Search } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardContentComponent, CardHeaderComponent, CardTitleComponent } from '../../../shared/components/card.component';
import { BadgeComponent } from '../../../shared/components/badge.component';
import { SafetyAlert } from '../models/safety.model';
import { SafetyService } from '../services/safety.service';

@Component({
    selector: 'app-safety-alert-details',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        LucideAngularModule,
        ButtonComponent,
        CardComponent,
        CardContentComponent,
        CardHeaderComponent,
        CardTitleComponent,
        BadgeComponent
    ],
    templateUrl: './safety-alert-details.component.html',
    styles: []
})
export class SafetyAlertDetailsComponent implements OnInit {
    // Icons
    readonly AlertTriangle = AlertTriangle;
    readonly ShieldCheck = ShieldCheck;
    readonly MapPin = MapPin;
    readonly Calendar = Calendar;
    readonly Clock = Clock;
    readonly ArrowLeft = ArrowLeft;
    readonly Share2 = Share2;
    readonly InfoIcon = Info;
    readonly Flame = Flame;
    readonly CloudRain = CloudRain;
    readonly AlertCircle = AlertCircle;
    readonly ExternalLink = ExternalLink;
    readonly SearchIcon = Search;

    alertId = '';
    alert?: SafetyAlert;
    loading = false;
    error: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private safetyService: SafetyService
    ) { }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.alertId = params['id'];
            if (this.alertId) {
                this.loadAlertDetails(this.alertId);
            }
        });
    }

    loadAlertDetails(id: string): void {
        this.loading = true;
        this.safetyService.getAlertById(id).subscribe({
            next: (data) => {
                this.alert = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error fetching alert details:', err);
                this.error = 'Failed to load alert details. Please try again later.';
                this.loading = false;
            }
        });
    }

    getSeverityClasses(severity: string): string {
        switch (severity) {
            case 'critical': return 'bg-red-600 text-white';
            case 'danger': return 'bg-orange-600 text-white';
            case 'warning': return 'bg-amber-500 text-white';
            case 'info': return 'bg-blue-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    }

    getSeverityBorder(severity: string): string {
        switch (severity) {
            case 'critical': return 'border-red-600';
            case 'danger': return 'border-orange-600';
            case 'warning': return 'border-amber-500';
            case 'info': return 'border-blue-500';
            default: return 'border-gray-500';
        }
    }

    getTypeIcon(type: string): any {
        switch (type) {
            case 'weather': return this.CloudRain;
            case 'fire': return this.Flame;
            case 'wildlife': return this.AlertTriangle;
            case 'closure': return this.AlertCircle;
            default: return this.InfoIcon;
        }
    }

    formatDate(isoDate: string): string {
        return new Date(isoDate).toLocaleString();
    }

    goBack(): void {
        this.router.navigate(['/safety/alerts']);
    }
}
