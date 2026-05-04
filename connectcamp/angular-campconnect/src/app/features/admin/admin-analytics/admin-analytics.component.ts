import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';
import {
  AtRiskUserDto,
  CampGuardKpiDto,
  CampGuardService,
  TriggerActionsResponseDto
} from '../services/campguard.service';

@Component({
  selector: 'app-admin-analytics-component',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    FormsModule,
    CardComponent,
    CardContentComponent
  ],
  templateUrl: './admin-analytics.component.html',
  styles: []
})
export class AdminAnalyticsComponent implements OnInit {
  users: AtRiskUserDto[] = [];
  filteredUsers: AtRiskUserDto[] = [];
  selectedLevel = '';
  search = '';

  loading = false;
  triggering = false;
  errorMessage = '';
  triggerMessage = '';

  kpis: CampGuardKpiDto = {
    high: 0,
    medium: 0,
    low: 0,
    recall: 0,
    precision: 0,
    reengagementRate: 0,
    churnBefore: 0,
    churnAfter: 0
  };

  constructor(private campGuardService: CampGuardService) {}

  ngOnInit(): void {
    this.refreshAll();
  }

  refreshAll(): void {
    this.loadKpis();
    this.loadUsers();
  }

  loadKpis(): void {
    this.campGuardService.getKpis().subscribe({
      next: (kpis) => {
        this.kpis = kpis;
      },
      error: () => {
        this.errorMessage = 'Failed to load CampGuard KPIs.';
      }
    });
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.campGuardService.getAtRiskUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load at-risk users.';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const level = this.selectedLevel.trim().toLowerCase();
    const search = this.search.trim().toLowerCase();

    this.filteredUsers = this.users.filter((user) => {
      const matchLevel = !level || user.riskLevel?.toLowerCase() === level;
      const matchSearch =
        !search ||
        user.customerId?.toLowerCase().includes(search) ||
        user.action?.toLowerCase().includes(search);
      return matchLevel && matchSearch;
    });
  }

  triggerActions(): void {
    this.triggering = true;
    this.triggerMessage = '';

    this.campGuardService.triggerActions().subscribe({
      next: (response: TriggerActionsResponseDto) => {
        this.triggerMessage = `Run ${response.runDate}: queued=${response.queued}, skipped=${response.skippedAntiSpam}`;
        this.triggering = false;
        this.refreshAll();
      },
      error: () => {
        this.errorMessage = 'Failed to trigger CampGuard actions.';
        this.triggering = false;
      }
    });
  }

  riskBadgeClass(level: string | undefined): string {
    const normalized = (level || '').toLowerCase();
    if (normalized === 'high') {
      return 'bg-red-100 text-red-700 border border-red-200';
    }
    if (normalized === 'medium') {
      return 'bg-amber-100 text-amber-700 border border-amber-200';
    }
    return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
  }

  asPercent(value: number | undefined): string {
    if (value === null || value === undefined) {
      return '-';
    }
    return `${(value * 100).toFixed(2)}%`;
  }
}
