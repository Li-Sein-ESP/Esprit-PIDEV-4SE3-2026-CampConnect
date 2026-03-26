import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import {
  LucideAngularModule,
  MapPin,
  Calendar,
  Users,
  Briefcase,
  AlertTriangle,
  Info,
  Car,
  ChevronRight,
  Clock,
  DollarSign,
  Leaf,
  Footprints,
  Bus,
  ArrowUpDown,
  Navigation
} from 'lucide-angular';
import { TransportationService } from '../services/transportation.service';
import { TripService } from '../../trips/services/trip.service';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';

export interface TransportOption {
  id: string;
  title: string;
  subtitle: string;
  isRecommended: boolean;
  duration: string;
  cost: string;
  costValue: number;
  impact: 'High' | 'Medium' | 'Low';
  accessibility: 'Accessible' | 'Limited Access' | 'Not Accessible';
  considerations: string[];
  icon: any;
}

export type SortOption = 'time' | 'cost' | 'impact';

@Component({
  selector: 'app-transportation-overview',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    CardComponent,
    CardContentComponent
  ],
  templateUrl: './transportation-overview.component.html'
})
export class TransportationOverviewComponent implements OnInit {
  readonly MapPin = MapPin;
  readonly Calendar = Calendar;
  readonly Users = Users;
  readonly Briefcase = Briefcase;
  readonly AlertTriangle = AlertTriangle;
  readonly Info = Info;
  readonly Car = Car;
  readonly ChevronRight = ChevronRight;
  readonly Navigation = Navigation;

  tripId: string | null = null;
  selectedTripId = signal<string>('');
  trip: any = null;
  destination = '';
  userTrips = computed(() => this.tripService.getTrips());

  // State to simulate showing transportation options
  showOptions = signal(false);

  constructor(
    private transportationService: TransportationService,
    private tripService: TripService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) { }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.tripId = params.get('tripId');
      if (this.tripId) {
        this.selectedTripId.set(this.tripId);
        this.loadTrip();
      } else {
        // Auto-select first trip if available
        const trips = this.userTrips();
        if (trips.length > 0) {
          this.selectedTripId.set(trips[0].id);
          this.tripId = trips[0].id;
          this.loadTrip();
        }
      }
    });

    // Also watch userTrips in case they load later
    this.tripService.getTripsObservable().subscribe((trips: any[]) => {
      if (!this.tripId && trips.length > 0) {
        this.selectedTripId.set(trips[0].id);
        this.tripId = trips[0].id;
        this.loadTrip();
      }
    });
  }

  loadTrip() {
    if (!this.tripId) return;
    this.tripService.getTripById(this.tripId).subscribe(trip => {
      this.trip = trip;
      if (trip.destination) {
        this.destination = trip.destination;
      }
    });
  }

  viewOptions() {
    this.router.navigate(['/transportation/options'], {
      queryParams: { tripId: this.tripId }
    });
  }

  onTripChange(id: string) {
    this.selectedTripId.set(id);
    this.tripId = id;
    this.loadTrip();
    // Update URL without reloading
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tripId: id },
      queryParamsHandling: 'merge'
    });
  }

  changeTrip() {
    // Scroll to trip selector or toggle it
    const selector = document.getElementById('trip-selector');
    if (selector) {
      selector.focus();
    }
  }
}
