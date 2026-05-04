import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DemandPredictionService, DemandPredictionResponse } from '../demand-prediction.service';

interface CategoryPrediction {
  category: string;
  label: string;
  icon: string;
  prediction: DemandPredictionResponse | null;
  loading: boolean;
  error: boolean;
  baseViews: number;
  baseRentals: number;
  basePurchases: number;
  basePrice: number;
}

@Component({
  selector: 'app-provider-demand-prediction',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './provider-demand-prediction.component.html',
  styleUrls: ['./provider-demand-prediction.component.scss']
})
export class ProviderDemandPredictionComponent implements OnInit {

  categories: CategoryPrediction[] = [
    { category: 'tent',           label: 'Tents',           icon: '⛺', prediction: null, loading: false, error: false, baseViews: 450, baseRentals: 85, basePurchases: 12, basePrice: 120 },
    { category: 'sleeping_bag',   label: 'Sleeping Bags',   icon: '🛏️', prediction: null, loading: false, error: false, baseViews: 320, baseRentals: 65, basePurchases: 8,  basePrice: 45 },
    { category: 'backpack',       label: 'Backpacks',       icon: '🎒', prediction: null, loading: false, error: false, baseViews: 380, baseRentals: 70, basePurchases: 15, basePrice: 65 },
    { category: 'hiking_boots',   label: 'Hiking Boots',    icon: '🥾', prediction: null, loading: false, error: false, baseViews: 210, baseRentals: 25, basePurchases: 5,  basePrice: 85 },
    { category: 'stove',          label: 'Stoves',          icon: '🔥', prediction: null, loading: false, error: false, baseViews: 180, baseRentals: 40, basePurchases: 4,  basePrice: 55 },
    { category: 'lantern',        label: 'Lanterns',        icon: '🔦', prediction: null, loading: false, error: false, baseViews: 250, baseRentals: 55, basePurchases: 9,  basePrice: 25 },
    { category: 'cooler',         label: 'Coolers',         icon: '🧊', prediction: null, loading: false, error: false, baseViews: 290, baseRentals: 60, basePurchases: 6,  basePrice: 40 },
    { category: 'hammock',        label: 'Hammocks',        icon: '🪢', prediction: null, loading: false, error: false, baseViews: 310, baseRentals: 50, basePurchases: 11, basePrice: 35 },
    { category: 'rain_jacket',    label: 'Rain Jackets',    icon: '🧥', prediction: null, loading: false, error: false, baseViews: 150, baseRentals: 20, basePurchases: 3,  basePrice: 75 },
    { category: 'trekking_pole',  label: 'Trekking Poles',  icon: '🥢', prediction: null, loading: false, error: false, baseViews: 120, baseRentals: 15, basePurchases: 2,  basePrice: 30 },
  ];

  selectedMonth = 0; // 0 = next month
  selectedRegion = 'all';
  avgPrice = 50;
  globalLoading = false;
  predictedCount = 0;

  regions = ['all', 'north', 'south', 'east', 'west'];

  constructor(private demandService: DemandPredictionService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.runAllPredictions();
  }

  get nextMonthName(): string {
    const now = new Date();
    const m = this.targetMonth;
    return new Date(now.getFullYear(), m - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  }

  get targetMonth(): number {
    const now = new Date();
    let m = now.getMonth() + 2 + this.selectedMonth;
    return m > 12 ? m - 12 : m;
  }

  runAllPredictions() {
    this.globalLoading = true;
    this.predictedCount = 0;
    const total = this.categories.length;

    this.categories.forEach(cat => {
      cat.loading = true;
      cat.error = false;
      cat.prediction = null;

      const now = new Date();
      const payload = {
        year:            now.getFullYear(),
        month:           this.targetMonth,
        category:        cat.category,
        region:          this.selectedRegion,
        views:           cat.baseViews,
        rentals:         cat.baseRentals,
        purchases:       cat.basePurchases,
        avg_price:       cat.basePrice,
        avg_rating:      4.2,
        is_holiday:      [6, 7, 8, 12].includes(this.targetMonth) ? 1 : 0, // Summer & Dec holidays
        delivery_demand: Math.floor(cat.baseRentals * 0.4) // Roughly 40% of rentals need delivery
      };

      this.demandService.predictDemand(payload).subscribe({
        next: (result) => {
          cat.prediction = result;
          cat.loading = false;
          this.predictedCount++;
          if (this.predictedCount === total) this.globalLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          cat.loading = false;
          cat.error = true;
          this.predictedCount++;
          if (this.predictedCount === total) this.globalLoading = false;
          this.cdr.detectChanges();
        }
      });
    });
  }

  get sortedByDemand(): CategoryPrediction[] {
    return [...this.categories]
      .filter(c => c.prediction)
      .sort((a, b) => (b.prediction?.predicted_demand ?? 0) - (a.prediction?.predicted_demand ?? 0));
  }

  get highDemand(): CategoryPrediction[] {
    return this.sortedByDemand.filter(c => (c.prediction?.predicted_demand ?? 0) > 100);
  }

  get lowDemand(): CategoryPrediction[] {
    return this.sortedByDemand.filter(c => (c.prediction?.predicted_demand ?? 0) <= 100);
  }

  get topCategory(): CategoryPrediction | null {
    return this.sortedByDemand[0] ?? null;
  }

  get avgDemand(): number {
    const items = this.categories.filter(c => c.prediction);
    if (items.length === 0) return 0;
    return Math.round(items.reduce((sum, c) => sum + (c.prediction?.predicted_demand ?? 0), 0) / items.length);
  }

  getDemandLevel(demand: number): { label: string; class: string } {
    if (demand > 150) return { label: 'Very High', class: 'demand-very-high' };
    if (demand > 100) return { label: 'High', class: 'demand-high' };
    if (demand > 50)  return { label: 'Medium', class: 'demand-medium' };
    return { label: 'Low', class: 'demand-low' };
  }

  getDemandBarWidth(demand: number): number {
    const max = Math.max(...this.categories.filter(c => c.prediction).map(c => c.prediction?.predicted_demand ?? 0), 1);
    return (demand / max) * 100;
  }
}
