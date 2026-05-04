import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';

interface AdminSafetyAlert {
  id: string;
  title: string;
  description: string;
  severity: string;
  status?: string;
  locationName?: string;
  regionName?: string;
}

interface AdminIncident {
  id: string;
  title: string;
  description: string;
  status: string;
  level?: string;
  severity?: string;
  regionName?: string;
}

interface SchedulerImpact {
  reviewedIncidentsLast24h: number;
  autoAlertsCreatedLast24h: number;
  stalePendingIncidents: number;
}

interface OpenIncidentSummary {
  region: string;
  tripId: string;
  reporterId: string;
  openIncidentCount: number;
}

@Component({
  selector: 'app-admin-incident-management-component',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonComponent,
    CardComponent,
    CardContentComponent,
    FormsModule
  ],
  templateUrl: './admin-incident-management.component.html',
  styles: []
})
export class AdminIncidentManagementComponent implements OnInit {
  private readonly baseUrl = `${environment.apiUrl}/admin/safety`;
  private readonly analyticsUrl = `${environment.apiUrl}/safety/analytics`;

  loading = false;
  error: string | null = null;
  analyticsError: string | null = null;
  analyticsAccessDenied = false;

  pendingAlerts: AdminSafetyAlert[] = [];
  pendingIncidents: AdminIncident[] = [];
  schedulerImpact: SchedulerImpact = {
    reviewedIncidentsLast24h: 0,
    autoAlertsCreatedLast24h: 0,
    stalePendingIncidents: 0
  };
  openSummary: OpenIncidentSummary[] = [];

  creatorIdSearch: string = '';
  creatorIncidents: AdminIncident[] = [];
  isSearchingCreator = false;
  searchCreatorError: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadModerationQueues();
  }

  loadModerationQueues(): void {
    this.loading = true;
    this.error = null;
    this.analyticsError = null;
    this.analyticsAccessDenied = false;

    const pendingAlerts$ = this.http.get<AdminSafetyAlert[]>(`${this.baseUrl}/alerts/pending`);
    const pendingIncidents$ = this.http.get<AdminIncident[]>(`${this.baseUrl}/incidents/pending`);
    const schedulerImpact$ = this.http
      .get<SchedulerImpact>(`${this.analyticsUrl}/scheduler-impact`)
      .pipe(catchError((err) => this.handleAnalyticsError(err, {
        reviewedIncidentsLast24h: 0,
        autoAlertsCreatedLast24h: 0,
        stalePendingIncidents: 0
      })));
    const openSummary$ = this.http
      .get<OpenIncidentSummary[]>(`${this.analyticsUrl}/open-incidents-summary`)
      .pipe(catchError((err) => this.handleAnalyticsError(err, [] as OpenIncidentSummary[])));

    forkJoin({
      alerts: pendingAlerts$,
      incidents: pendingIncidents$,
      schedulerImpact: schedulerImpact$,
      openSummary: openSummary$
    })
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: ({ alerts, incidents, schedulerImpact, openSummary }) => {
          this.pendingAlerts = Array.isArray(alerts) ? alerts : [];
          this.pendingIncidents = Array.isArray(incidents) ? incidents : [];
          this.schedulerImpact = schedulerImpact;
          this.openSummary = Array.isArray(openSummary)
            ? [...openSummary].sort((a, b) => b.openIncidentCount - a.openIncidentCount)
            : [];
        },
        error: () => {
          this.error = 'Failed to load moderation queues.';
        }
      });
  }

  private handleAnalyticsError<T>(err: any, fallback: T) {
    if (err?.status === 403) {
      this.analyticsAccessDenied = true;
      this.analyticsError = 'Acces administrateur requis';
      return of(fallback);
    }

    this.analyticsError = this.analyticsError ?? 'Failed to load safety analytics.';
    return of(fallback);
  }

  approveAlert(id: string): void {
    this.http.put<AdminSafetyAlert>(`${this.baseUrl}/alerts/${id}/approve`, {}).subscribe({
      next: (updated) => {
        this.pendingAlerts = this.pendingAlerts.filter(a => a.id !== id);
        if ((updated.status || '').toUpperCase() === 'PENDING') {
          this.pendingAlerts.unshift(updated);
        }
      }
    });
  }

  rejectAlert(id: string): void {
    this.http.put<AdminSafetyAlert>(`${this.baseUrl}/alerts/${id}/reject`, {}).subscribe({
      next: () => {
        this.pendingAlerts = this.pendingAlerts.filter(a => a.id !== id);
      }
    });
  }

  updateIncidentStatus(id: string, status: 'reviewed' | 'resolved'): void {
    this.http.put<AdminIncident>(`${this.baseUrl}/incidents/${id}/status?status=${status}`, {}).subscribe({
      next: () => {
        this.pendingIncidents = this.pendingIncidents.filter(i => i.id !== id);
      }
    });
  }

  searchIncidentsByCreator(): void {
    if (!this.creatorIdSearch.trim()) return;

    this.isSearchingCreator = true;
    this.searchCreatorError = null;

    const url = `${this.analyticsUrl}/incidents/by-creator?creatorId=${this.creatorIdSearch}&status=pending&severities=HIGH&severities=CRITICAL`;

    this.http.get<AdminIncident[]>(url).subscribe({
      next: (data) => {
        this.creatorIncidents = Array.isArray(data) ? data : [];
        this.isSearchingCreator = false;
      },
      error: (err) => {
        console.error("Search failed:", err);
        this.searchCreatorError = 'Failed to load incidents. Please check console (F12).';
        this.creatorIncidents = [];
        this.isSearchingCreator = false;
      }
    });
  }
}
