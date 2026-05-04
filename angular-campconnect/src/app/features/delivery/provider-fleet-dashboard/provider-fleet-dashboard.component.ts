import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WebSocketService } from '../services/websocket.service';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

interface DaySlot {
  date: string;
  orderCount: number;
  usedCapacityKg: number;
  capacityPercent: number;
  zonesServed: string[];
  deliveryIds: string[];
}

interface FleetSchedule {
  vehicleId: string;
  plateNumber: string;
  vehicleType: string;
  maxCapacityKg: number;
  status: string;
  days: DaySlot[];
}

interface ProviderAlert {
  deliveryId: string;
  message: string;
  timestamp: string;
  zone: string | null;
}

@Component({
  selector: 'app-provider-fleet-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './provider-fleet-dashboard.component.html',
  styleUrls: ['./provider-fleet-dashboard.component.scss']
})
export class ProviderFleetDashboardComponent implements OnInit, OnDestroy {

  loading = true;
  error: string | null = null;
  fleet: FleetSchedule[] = [];
  alerts: ProviderAlert[] = [];

  readonly today = new Date();
  fromDate: string;
  toDate: string;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private wsService: WebSocketService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    // Default to this week
    const start = new Date(this.today);
    start.setDate(start.getDate() - start.getDay()); // Sunday
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    this.fromDate = start.toISOString().split('T')[0];
    this.toDate = end.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadSchedule();

    // Real-time alert stream for unassigned deliveries
    const providerId = this.authService.currentUserValue?.id ?? '';
    this.wsService.connect();
    if (providerId) {
      this.wsService.subscribeToProviderAlerts(providerId);
    }
    this.wsService.providerAlerts
      .pipe(takeUntil(this.destroy$))
      .subscribe(alert => {
        this.alerts.unshift(alert);
        if (this.alerts.length > 20) this.alerts.pop();
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSchedule(): void {
    this.loading = true;
    this.error = null;
    const params = new HttpParams()
      .set('from', this.fromDate)
      .set('to', this.toDate);
    this.http.get<FleetSchedule[]>(`${environment.apiUrl}/vehicles/fleet-schedule`, { params })
      .subscribe({
        next: data => {
          this.fleet = data;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: err => {
          this.error = err?.error?.message ?? 'Failed to load fleet schedule.';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  getCapacityColor(pct: number): string {
    if (pct >= 90) return '#ef4444';  // red
    if (pct >= 70) return '#f97316';  // orange
    if (pct >= 40) return '#eab308';  // yellow
    return '#22c55e';                 // green
  }

  getStatusColor(status: string): string {
    switch (status?.toUpperCase()) {
      case 'AVAILABLE': return 'var(--cc-success, #22c55e)';
      case 'ON_DUTY': return 'var(--cc-accent, #f59e0b)';
      case 'MAINTENANCE': return '#ef4444';
      default: return '#94a3b8';
    }
  }

  getDates(): string[] {
    const dates: string[] = [];
    const from = new Date(this.fromDate);
    const to = new Date(this.toDate);
    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }

  getSlot(vehicle: FleetSchedule, date: string): DaySlot | null {
    return vehicle.days.find(d => d.date === date) ?? null;
  }

  dismissAlert(index: number): void {
    this.alerts.splice(index, 1);
  }
}
