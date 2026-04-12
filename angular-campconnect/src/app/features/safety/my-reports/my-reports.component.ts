import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafetyService } from '../services/safety.service';
import { IncidentReport } from '../models/safety.model';
import { RouterModule } from '@angular/router';

interface TimelineEvent {
    step: string;
    date: string | null;
    active: boolean;
    message?: string;
    rejected?: boolean;
}

interface Report {
    id: string;
    issueType: string;
    refType: string;
    refName: string;
    dateSubmitted: Date;
    status: 'pending' | 'review' | 'resolved' | 'rejected';
    adminMessage: string | null;
    description: string;
    evidence: string[];
    timeline: TimelineEvent[];
}

@Component({
    selector: 'app-my-reports',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './my-reports.component.html',
    styleUrls: ['./my-reports.component.scss']
})
export class MyReportsComponent implements OnInit {
    reports: Report[] = [];
    loading: boolean = true;
    error: string | null = null;
    activeFilter: string = 'all';

    constructor(private safetyService: SafetyService) {}

    ngOnInit() {
        this.loadReports();
    }

    loadReports() {
        this.loading = true;
        this.safetyService.getIncidents().subscribe({
            next: (incidents) => {
                this.reports = incidents.map(inc => this.mapIncidentToReport(inc));
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to load reports', err);
                this.error = 'Failed to load safety reports.';
                this.loading = false;
            }
        });
    }

    private mapIncidentToReport(inc: IncidentReport): Report {
        const dateObj = inc.createdAt ? new Date(inc.createdAt) : new Date();
        const dateStr = dateObj.toLocaleDateString();
        
        return {
            id: inc.id || 'INC-' + Math.floor(Math.random()*10000),
            issueType: inc.type || 'General Safety',
            refType: 'Location',
            refName: inc.regionName || 'Global',
            dateSubmitted: dateObj,
            status: (inc.status === 'reviewed' ? 'review' : inc.status) as any,
            adminMessage: null,
            description: inc.description || '',
            evidence: inc.mediaUrl ? [inc.mediaUrl] : [],
            timeline: [
                { step: 'Submitted', date: dateStr, active: true },
                { step: 'Under Review', date: null, active: inc.status === 'reviewed' || inc.status === 'resolved' },
                { step: 'Decision Made', date: null, active: inc.status === 'resolved' }
            ]
        };
    }
    selectedReport: Report | null = null;
    isModalOpen = false;

    get filterCounts() {
        const counts: Record<string, number> = { all: this.reports.length };
        for (const report of this.reports) {
            counts[report.status] = (counts[report.status] || 0) + 1;
        }
        return counts;
    }

    get filteredReports() {
        if (this.activeFilter === 'all') {
            return this.reports;
        }
        return this.reports.filter(r => r.status === this.activeFilter);
    }

    setFilter(filter: string) {
        this.activeFilter = filter;
    }

    getStatusLabel(status: string): string {
        const labels: Record<string, string> = {
            pending: 'Pending',
            review: 'Under Review',
            resolved: 'Resolved',
            rejected: 'Rejected'
        };
        return labels[status] || status;
    }

    openModal(report: Report) {
        this.selectedReport = report;
        this.isModalOpen = true;
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.isModalOpen = false;
        document.body.style.overflow = '';
        // Optional: wait for animation before clearing data
        setTimeout(() => {
            this.selectedReport = null;
        }, 300);
    }

    isImageEvi(filename: string): boolean {
        const ext = filename.split('.').pop()?.toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
    }
}
