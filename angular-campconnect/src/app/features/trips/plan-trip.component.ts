import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Calendar, MapPin, Compass, Briefcase, Wallet, Plus, ChevronRight, Moon, ChevronDown, Waves, Trees, Sun, Calculator, Plane } from 'lucide-angular';

import { StepCardComponent } from './trip-planner-components/step-card.component';
import { TemplateCardComponent } from './trip-planner-components/template-card.component';
import { DestinationCardComponent } from './trip-planner-components/destination-card.component';
import { ResourceCardComponent } from './trip-planner-components/resource-card.component';
import { TripService } from './services/trip.service';
import { Trip } from './models/trip.model';

@Component({
  selector: 'app-plan-trip',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LucideAngularModule,
    StepCardComponent,
    TemplateCardComponent,
    DestinationCardComponent,
    ResourceCardComponent
  ],
  templateUrl: './plan-trip.component.html',
  styles: []
})
export class PlanTripComponent {
  CalendarIcon = Calendar;
  MapPinIcon = MapPin;
  CompassIcon = Compass;
  BriefcaseIcon = Briefcase;
  WalletIcon = Wallet;
  PlusIcon = Plus;
  ChevronRightIcon = ChevronRight;
  MoonIcon = Moon;
  ChevronDownIcon = ChevronDown;
  WavesIcon = Waves;
  TreesIcon = Trees;
  SunIcon = Sun;
  CalculatorIcon = Calculator;
  PlaneIcon = Plane;

  templateTrips = signal<Trip[]>([]);
  isLoadingTemplates = signal<boolean>(true);

  constructor(
      public router: Router,
      private tripService: TripService
  ) { }

  ngOnInit(): void {
      this.tripService.getTemplateTrips().subscribe({
          next: (trips) => {
              this.templateTrips.set(trips);
              this.isLoadingTemplates.set(false);
          },
          error: (err) => {
              console.error('Failed to load template trips', err);
              this.isLoadingTemplates.set(false);
          }
      });
  }

  getDifficultyIcon(level: string | undefined) {
    const l = level?.toLowerCase();
    if (l === 'hard' || l === 'advanced') return this.SunIcon;
    if (l === 'moderate') return this.TreesIcon;
    return this.WavesIcon;
  }

  mapDifficulty(level: string | undefined): 'Easy' | 'Moderate' | 'Advanced' {
    const l = level?.toLowerCase();
    if (l === 'hard' || l === 'advanced') return 'Advanced';
    if (l === 'moderate') return 'Moderate';
    return 'Easy';
  }
}
