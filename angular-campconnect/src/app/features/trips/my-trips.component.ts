import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, Compass, Map, Info, Clock, ChevronRight, PlusCircle, History } from 'lucide-angular';

import { StatCardComponent } from './my-trips-components/stat-card.component';
import { FilterChipComponent } from './my-trips-components/filter-chip.component';
import { TripCardComponent, TripData } from './my-trips-components/trip-card.component';
import { TripService } from './services/trip.service';
import { AuthService } from '../../core/services/auth.service';
import { Trip } from './models/trip.model';

type FilterType = "all" | TripData["status"];

@Component({
  selector: 'app-my-my-trips',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    StatCardComponent,
    FilterChipComponent,
    TripCardComponent
  ],
  templateUrl: './my-trips.component.html',
  styles: [`
    :host { display: block; }
  `]
})
export class MyTripsComponent {
  // Lucide Icons
  readonly CompassIcon = Compass;
  readonly MapIcon = Map;
  readonly InfoIcon = Info;
  readonly ClockIcon = Clock;
  readonly ChevronRightIcon = ChevronRight;
  readonly PlusCircleIcon = PlusCircle;
  readonly HistoryIcon = History;

  activeFilter = "all" as FilterType;

  constructor(
    public router: Router,
    private tripService: TripService,
    private authService: AuthService
  ) { }

  get currentUserName(): string {
    const user = this.authService.getUserValue();
    return user?.username || user?.email || 'Camper';
  }

  get currentUserInitials(): string {
    const name = this.currentUserName;
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  get trips(): TripData[] {
    return this.tripService.getTrips().map(t => this.mapToTripData(t));
  }

  private mapToTripData(t: Trip): TripData {
    const start = new Date(t.startDate);
    const today = new Date();
    const diff = start.getTime() - today.getTime();
    const daysUntil = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));

    let timelineLabel = '';
    if (t.status === 'completed') {
      timelineLabel = 'Completed';
    } else if (t.status === 'planning' || t.status === 'upcoming') {
      timelineLabel = `Departing in ${daysUntil} days`;
    } else {
      timelineLabel = 'In Progress';
    }

    const dest = t.destination || '';
    const parts = dest.includes(',') ? dest.split(',') : [dest, ''];

    return {
      id: t.id,
      title: t.name,
      location: parts[0].trim(),
      governorate: parts[1]?.trim() || '',
      status: this.mapStatus(t.status),
      imageUrl: t.imageUrl || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
      startDate: t.startDate ? new Date(t.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD',
      endDate: t.endDate ? new Date(t.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD',
      durationLabel: `${t.duration || 1} days`,
      groupSize: t.participants,
      difficulty: (t.adventureLevel?.charAt(0).toUpperCase() + (t.adventureLevel?.slice(1).toLowerCase() || '')) as any || 'Moderate',
      difficultyTone: this.mapDifficultyTone(t.adventureLevel),
      totalCost: `${t.budget?.estimated || 0} TND`,
      timelineLabel: timelineLabel
    };
  }

  private mapStatus(status: string): any {
    if (status === 'planning') return 'planned';
    if (status === 'active') return 'planned'; // closest match for now
    return status;
  }

  private mapDifficultyTone(level: string | undefined): any {
    const l = level?.toLowerCase();
    if (l === 'easy') return 'green';
    if (l === 'challenging' || l === 'advanced') return 'red';
    return 'amber';
  }

  get filteredTrips(): TripData[] {
    if (this.activeFilter === "all") {
      return this.trips;
    }
    return this.trips.filter((t) => t.status === this.activeFilter);
  }

  get stats() {
    const trips = this.trips;
    return {
      upcoming: trips.filter((t) => t.status !== "completed").length.toString(),
      completed: trips.filter((t) => t.status === "completed").length.toString(),
      destinations: new Set(trips.map(t => t.location)).size.toString(),
      nextTripIn: this.getNextTripIn(trips),
    };
  }

  private getNextTripIn(trips: TripData[]): string {
    const upcoming = trips.filter(t => t.status !== 'completed' && t.timelineLabel.includes('days'));
    if (upcoming.length === 0) return 'N/A';
    const days = upcoming.map(t => parseInt(t.timelineLabel.match(/\d+/)?.[0] || '999'));
    return Math.min(...days) + 'd';
  }

  setFilter(filterName: FilterType) {
    this.activeFilter = filterName;
  }
}
