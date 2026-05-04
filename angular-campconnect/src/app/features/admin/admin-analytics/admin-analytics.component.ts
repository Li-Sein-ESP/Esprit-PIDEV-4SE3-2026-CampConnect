import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';
import { PricingAnalyticsService, CampsiteAudit } from '../../../core/services/pricing-analytics.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-analytics-component',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    ButtonComponent,
    CardComponent,
    CardContentComponent,
    FormsModule
  ],
  templateUrl: './admin-analytics.component.html',
  styles: [`
    .audit-card { transition: all 0.3s ease; }
    .audit-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
  `]
})
export class AdminAnalyticsComponent implements OnInit {
  audits: CampsiteAudit[] = [];
  loading = false;
  
  // Search params
  searchRegion = 'Bizerte';
  searchThreshold = 1.1;
  searchName = '';
  searchMinMultiplier = 1.0;

  constructor(private analyticsService: PricingAnalyticsService) {}

  ngOnInit(): void {
    this.loadAllAudits();
  }

  loadAllAudits(): void {
    this.loading = true;
    this.analyticsService.getAllAudits().subscribe({
      next: (data) => {
        this.audits = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  /**
   * Consumes JPQL Join Endpoint
   */
  fetchHighImpact(): void {
    this.loading = true;
    this.analyticsService.getHighImpactAudits(this.searchRegion, this.searchThreshold).subscribe({
      next: (data) => {
        this.audits = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  /**
   * Consumes Keywords Endpoint
   */
  fetchSearch(): void {
    this.loading = true;
    this.analyticsService.searchAudits(this.searchName, this.searchMinMultiplier).subscribe({
      next: (data) => {
        this.audits = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}
