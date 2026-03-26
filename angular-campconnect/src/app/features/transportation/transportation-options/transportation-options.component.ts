import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import {
  LucideAngularModule,
  ArrowUpDown,
  Car,
  Users,
  Bus,
  Footprints,
  Clock,
  Leaf,
  DollarSign,
  Info,
  ChevronRight,
  AlertTriangle,
  Trophy,
  Navigation,
  MapPin,
  Check
} from 'lucide-angular';
import { TransportationService } from '../services/transportation.service';
import { TripService } from '../../trips/services/trip.service';
import { Trip } from '../../trips/models/trip.model';
import { AuthService } from '../../../core/services/auth.service';

export interface TransportOption {
  id: string;
  title: string;
  segments: number;
  transfers?: number;
  time: string;
  cost: string;
  costValue: number;
  impact: 'High' | 'Medium' | 'Low';
  accessibility: string;
  considerations: string[];
  icon: any;
  isRecommended?: boolean;
  imageUrl?: string;
}

export type SortOption = 'time' | 'cost' | 'impact';

@Component({
  selector: 'app-transportation-options',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule
  ],
  templateUrl: './transportation-options.component.html'
})
export class TransportationOptionsComponent implements OnInit {
  readonly ArrowUpDown = ArrowUpDown;
  readonly Car = Car;
  readonly Users = Users;
  readonly Bus = Bus;
  readonly Footprints = Footprints;
  readonly Clock = Clock;
  readonly Leaf = Leaf;
  readonly DollarSign = DollarSign;
  readonly Info = Info;
  readonly ChevronRight = ChevronRight;
  readonly AlertTriangle = AlertTriangle;
  readonly Trophy = Trophy;
  readonly Navigation = Navigation;
  readonly MapPin = MapPin;
  readonly Check = Check;

  sortBy = signal<SortOption>('time');
  selectedOptionId = signal<string>('');
  tripId: string | null = null;
  selectedTripId = signal<string>('');
  userTrips = computed(() => this.tripService.getTrips());

  transportOptions = signal<TransportOption[]>([]);

  sortedOptions = computed(() => {
    return [...this.transportOptions()].sort((a, b) => {
      if (this.sortBy() === 'cost') return a.costValue - b.costValue;
      if (this.sortBy() === 'impact') {
        const impactScore = { Low: 1, Medium: 2, High: 3 };
        return impactScore[a.impact] - impactScore[b.impact];
      }
      // Simple parser for duration "X hour Y minutes"
      const getMinutes = (d: string) => {
        const hours = d.match(/(\d+)\s*hour/);
        const mins = d.match(/(\d+)\s*minutes/);
        return (hours ? parseInt(hours[1]) * 60 : 0) + (mins ? parseInt(mins[1]) : 0);
      };
      return getMinutes(a.time) - getMinutes(b.time);
    });
  });

  selectedData = computed(() => {
    return this.transportOptions().find(opt => opt.id === this.selectedOptionId()) || this.transportOptions()[0] || null;
  });

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private transportationService: TransportationService,
    private tripService: TripService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.tripId = params.get('tripId');
      if (this.tripId) {
        this.selectedTripId.set(this.tripId);
      }
      this.loadTransports();
    });
  }

  loadTransports() {
    this.transportationService.getAllTransports().subscribe(data => {
      if (data && data.length > 0) {
        const fetched = data.map((t: any) => {
          let icon = this.Car;
          switch (t.mode?.toLowerCase()) {
            case 'bus': icon = this.Bus; break;
            case 'shared_ride': icon = this.Users; break;
            // No Train or Bike icon exported currently in this file directly, default to Car
            default: icon = this.Car;
          }
          return {
            id: t.id,
            title: t.provider || 'Transport Route',
            segments: 1,
            time: `${t.duration || 120} minutes`,
            cost: `$${t.price ?? t.cost ?? 0}`,
            costValue: t.price ?? t.cost ?? 0,
            impact: 'Medium' as 'High' | 'Medium' | 'Low',
            accessibility: 'Accessible',
            considerations: [],
            icon: icon,
            imageUrl: t.imageUrl
          };
        });
        this.transportOptions.set(fetched);
        if (fetched.length > 0) {
          this.selectedOptionId.set(fetched[0].id);
        }
      } else {
        this.transportOptions.set([]);
      }
    });
  }

  setSortBy(option: SortOption) {
    this.sortBy.set(option);
  }

  selectOption(id: string) {
    this.selectedOptionId.set(id);
  }

  getImpactDot(impact: string) {
    return impact === 'High' ? 'bg-red-500' : impact === 'Medium' ? 'bg-amber-500' : 'bg-green-500';
  }

  getImpactColors(impact: string) {
    switch (impact) {
      case 'High': return 'text-red-600 bg-red-50';
      case 'Medium': return 'text-amber-600 bg-amber-50';
      case 'Low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  }

  getAccessibilityColors(accessibility: string) {
    switch (accessibility) {
      case 'Accessible': return 'text-green-700 bg-green-50 border-green-200';
      case 'Limited Access': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Not Accessible': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  }

  getImpactTextColor(impact: string) {
    switch (impact) {
      case 'High': return 'text-red-600';
      case 'Medium': return 'text-amber-600';
      case 'Low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  }

  viewRouteDetails(id: string, event?: Event) {
    if (event) event.stopPropagation();
    this.router.navigate(['/transportation/route', id]);
  }

  confirmSelection() {
    const selected = this.selectedData();
    const finalTripId = this.tripId || this.selectedTripId();
    
    if (selected && finalTripId) {
      this.router.navigate(['/transportation/confirm'], { 
        queryParams: { 
          tripId: finalTripId, 
          optionId: selected.id,
          title: selected.title,
          cost: selected.cost,
          time: selected.time,
          impact: selected.impact,
          imageUrl: selected.imageUrl || ''
        } 
      });
    } else if (!finalTripId) {
      alert('Please select a trip first.');
    }
  }
}
