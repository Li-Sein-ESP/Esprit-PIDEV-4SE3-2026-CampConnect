import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, BarChart2, BellRing, AlertTriangle, MapPin, Flame } from 'lucide-angular';
import { SafetyAlert } from '../models/safety.model';
import { SafetyService } from '../services/safety.service';

@Component({
    selector: 'app-safety-analytics',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule],
    providers: [DatePipe],
    templateUrl: './safety-analytics.component.html',
    styleUrls: ['./safety-analytics.component.scss']
})
export class SafetyAnalyticsComponent implements OnInit {
    BarChartIcon = BarChart2;
    BellIcon = BellRing;
    AlertIcon = AlertTriangle;
    MapPinIcon = MapPin;
    FlameIcon = Flame;

    // KPIs
    totalAlerts = 0;
    highCriticalAlerts = 0;
    mostAffectedRegion = 'N/A';
    mostFrequentRisk = 'N/A';

    // Chart Data
    riskDistribution = {
        info: 0,
        warning: 0,
        danger: 0,
        critical: 0
    };

    alertTypes = {
        wildfire: 0,
        flood: 0,
        wildlife: 0,
        weather: 0,
        closure: 0,
        advisory: 0
    };

    // Monthly Data Array for the line chart (12 months mock)
    monthlyAlerts = [12, 18, 15, 25, 32, 45, 60, 52, 38, 22, 14, 10]; // Mocking past year

    topRegions: { region: string, count: number, highestRisk: string, lastDate: string }[] = [];

    alerts: any[] = [];
    loading: boolean = true;

    constructor(private datePipe: DatePipe, private safetyService: SafetyService) { }

    ngOnInit() {
        this.loadAlerts();
    }

    loadAlerts() {
        this.loading = true;
        this.safetyService.getAlerts().subscribe({
            next: (alerts) => {
                this.alerts = alerts;
                this.computeAnalytics();
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading alerts', err);
                this.loading = false;
            }
        });
    }

    computeAnalytics() {
        this.totalAlerts = this.alerts.length;

        // Reset stats
        this.riskDistribution = { info: 0, warning: 0, danger: 0, critical: 0 };
        this.alertTypes = { wildfire: 0, flood: 0, wildlife: 0, weather: 0, closure: 0, advisory: 0 };
        this.highCriticalAlerts = 0;

        this.alerts.forEach(alert => {
            const severity = (alert.severity || 'info').toLowerCase();
            if (this.riskDistribution.hasOwnProperty(severity)) {
                (this.riskDistribution as any)[severity]++;
            }

            if (severity === 'danger' || severity === 'critical') {
                this.highCriticalAlerts++;
            }

            // Type mapping - Map message keyword to type since dummy DTO doesn't have type
            const message = (alert.message || '').toLowerCase();
            if (message.includes('fire')) this.alertTypes.wildfire++;
            else if (message.includes('flood')) this.alertTypes.flood++;
            else if (message.includes('wildlife') || message.includes('bear')) this.alertTypes.wildlife++;
            else if (message.includes('weather')) this.alertTypes.weather++;
            else if (message.includes('close')) this.alertTypes.closure++;
            else this.alertTypes.advisory++;
        });

        // Regions - Mocking region as 'Global' or 'Backend' for now
        this.topRegions = [{ region: 'Backend', count: this.totalAlerts, highestRisk: 'danger', lastDate: new Date().toISOString() }];
        this.mostAffectedRegion = 'Backend';

        // Most frequent risk
        let maxRisk = '';
        let maxRiskCount = 0;
        Object.entries(this.alertTypes).forEach(([key, val]) => {
            if (val > maxRiskCount) {
                maxRiskCount = val;
                maxRisk = key;
            }
        });
        this.mostFrequentRisk = maxRisk ? maxRisk.charAt(0).toUpperCase() + maxRisk.slice(1) : 'N/A';
    }

    // Helper for dynamic pie chart based on CSS var mappings
    getPieGradient(): string {
        const total = this.totalAlerts || 1;
        const critical = (this.riskDistribution.critical / total) * 360;
        const danger = (this.riskDistribution.danger / total) * 360;
        const warning = (this.riskDistribution.warning / total) * 360;
        const info = (this.riskDistribution.info / total) * 360;

        let currentAngle = 0;
        const stops = [
            `var(--risk-critical) ${currentAngle}deg ${currentAngle += critical}deg`,
            `var(--risk-high) ${currentAngle}deg ${currentAngle += danger}deg`,
            `var(--risk-medium) ${currentAngle}deg ${currentAngle += warning}deg`,
            `var(--accent-blue) ${currentAngle}deg ${currentAngle += info}deg`
        ];

        return `conic-gradient(${stops.join(', ')})`;
    }

    // Calculate generic heights for bar charts
    getBarHeight(typeKey: 'wildfire' | 'flood' | 'wildlife' | 'weather' | 'closure' | 'advisory'): number {
        const max = Math.max(...Object.values(this.alertTypes)) || 1;
        return (this.alertTypes[typeKey] / max) * 100;
    }
}

