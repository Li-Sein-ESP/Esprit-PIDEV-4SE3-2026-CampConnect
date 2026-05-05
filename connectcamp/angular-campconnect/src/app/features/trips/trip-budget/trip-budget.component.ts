import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, DollarSign, Plus, Trash2 } from 'lucide-angular';
import { TripService } from '../services/trip.service';
import { TripBudget } from '../models/trip.model';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card.component';

@Component({
  selector: 'app-trip-budget',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent],
  templateUrl: './trip-budget.component.html'
})
export class TripBudgetComponent implements OnInit {
  readonly DollarSign = DollarSign;
  readonly Plus = Plus;
  readonly Trash2 = Trash2;

  budget = signal<TripBudget | null>(null);

  constructor(
    private route: ActivatedRoute,
    private tripService: TripService
  ) { }

  ngOnInit() {
    const tripId = this.route.snapshot.paramMap.get('id') || 'trip-1';
    this.budget.set(this.tripService.getMockBudget(tripId));
  }
}
