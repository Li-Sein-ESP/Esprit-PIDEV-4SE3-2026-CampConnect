import { Component, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { TripService } from '../services/trip.service';

interface SummaryCard {
  id: string;
  title: string;
  amount: string;
  label: string;
  tone: "blue" | "green" | "neutral";
}

interface BudgetItem {
  id: string | number;
  name: string;
  subtitle?: string;
  estimated: number;
  actual: number;
}

interface BudgetCategory {
  id: string;
  icon: string;
  name: string;
  remainingLabel: string;
  estimatedTotal: number;
  items: BudgetItem[];
}

interface CategoryBreakdownRow {
  id: string;
  name: string;
  color: string;
  amount: number;
  percentLabel: string;
}

@Component({
  selector: 'app-trip-budget',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './trip-budget.component.html'
})
export class TripBudgetComponent implements OnInit {
  summaryCards = signal<SummaryCard[]>([
    {
      id: "estimated",
      title: "Total Estimated",
      amount: "$985.00",
      label: "Budget planned",
      tone: "blue",
    },
    {
      id: "spent",
      title: "Total Spent",
      amount: "$440.00",
      label: "45% spent",
      tone: "green",
    },
    {
      id: "remaining",
      title: "Remaining",
      amount: "$545.00",
      label: "In Progress",
      tone: "neutral",
    },
  ]);

  budgetCategories = signal<BudgetCategory[]>([
    {
      id: "transportation",
      icon: "🚙",
      name: "Transportation",
      remainingLabel: "$40",
      estimatedTotal: 150,
      items: [
        { id: 1, name: "Gas", subtitle: "Round trip", estimated: 120, actual: 85 },
        { id: 2, name: "Vehicle rental", estimated: 0, actual: 0 },
        { id: 3, name: "Parking fees", estimated: 30, actual: 25 },
      ],
    },
    {
      id: "food",
      icon: "🍽️",
      name: "Food & Drinks",
      remainingLabel: "$180",
      estimatedTotal: 360,
      items: [
        { id: 4, name: "Groceries", estimated: 200, actual: 180 },
        { id: 5, name: "Restaurant meals", subtitle: "2 meals out", estimated: 100, actual: 0 },
        { id: 6, name: "Snacks & beverages", estimated: 60, actual: 0 },
      ],
    },
    {
      id: "camping",
      icon: "🏕️",
      name: "Camping & Sites",
      remainingLabel: "$5",
      estimatedTotal: 155,
      items: [
        { id: 7, name: "Campsite reservation", subtitle: "4 nights", estimated: 120, actual: 120 },
        { id: 8, name: "Park entrance fee", estimated: 35, actual: 30 },
      ],
    },
    {
      id: "gear",
      icon: "📦",
      name: "Gear & Equipment",
      remainingLabel: "$150",
      estimatedTotal: 150,
      items: [
        { id: 9, name: "New camping gear", subtitle: "Optional purchases", estimated: 150, actual: 0 },
        { id: 10, name: "Gear rental", estimated: 0, actual: 0 },
      ],
    },
    {
      id: "activities",
      icon: "📈",
      name: "Activities & Extras",
      remainingLabel: "$170",
      estimatedTotal: 170,
      items: [
        { id: 11, name: "Guided tours", estimated: 0, actual: 0 },
        { id: 12, name: "Activity permits", estimated: 20, actual: 0 },
        { id: 13, name: "Souvenirs", estimated: 50, actual: 0 },
        { id: 14, name: "Emergency fund", estimated: 100, actual: 0 },
      ],
    },
  ]);

  breakdownRows = signal<CategoryBreakdownRow[]>([
    { id: "transportation", name: "Transportation", color: "bg-sky-500", amount: 110, percentLabel: "25% of total spent" },
    { id: "food", name: "Food & Drinks", color: "bg-amber-500", amount: 180, percentLabel: "41% of total spent" },
    { id: "camping", name: "Camping & Sites", color: "bg-emerald-500", amount: 150, percentLabel: "34% of total spent" },
    { id: "gear", name: "Gear & Equipment", color: "bg-purple-500", amount: 0, percentLabel: "0% of total spent" },
    { id: "activities", name: "Activities & Extras", color: "bg-lime-500", amount: 0, percentLabel: "0% of total spent" },
  ]);

  totalEstimated = computed(() => {
    return this.budgetCategories().reduce((sum, cat) => sum + cat.estimatedTotal, 0);
  });

  totalSpent = computed(() => {
    return this.budgetCategories().reduce((sum, cat) =>
      sum + cat.items.reduce((itemSum, item) => itemSum + item.actual, 0), 0);
  });

  budgetProgress = computed(() => {
    const est = this.totalEstimated();
    if (est === 0) return 0;
    return Math.round((this.totalSpent() / est) * 100);
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tripService: TripService
  ) { }

  ngOnInit() {
    // Data is already set in signals for fidelity
  }

  formatMoney(value: number): string {
    return `$${value.toFixed(2)}`;
  }

  navigateBack() {
    const tripId = this.route.snapshot.paramMap.get('tripId') || '1';
    this.router.navigate(['/trips', tripId]);
  }

  getCategorySpent(category: BudgetCategory): number {
    return category.items.reduce((sum, item) => sum + item.actual, 0);
  }

  getItemDelta(item: BudgetItem): number {
    return item.actual - item.estimated;
  }
}
