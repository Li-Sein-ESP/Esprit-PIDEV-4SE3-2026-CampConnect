import { Component, OnInit, OnDestroy, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule, PlusCircle, Map, History, Compass, Info, ChevronRight, Clock, Star, LayoutGrid, Sparkles, ChevronLeft, MapPin, Calendar, Edit, Download } from 'lucide-angular';
import { TripCardComponent } from './my-trips-components/trip-card.component';
import { StatCardComponent } from './my-trips-components/stat-card.component';
import { FilterChipComponent } from './my-trips-components/filter-chip.component';
import { TripService } from './services/trip.service';
import { AuthService } from '../../core/services/auth.service';
import { Subject, takeUntil } from 'rxjs';

interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  groupSize?: number;
  participants?: number;
  status: "planning" | "upcoming" | "active" | "completed" | "cancelled";
  imageUrl?: string;
  template?: boolean;
}

@Component({
  selector: 'app-my-trips',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    LucideAngularModule,
    TripCardComponent,
    StatCardComponent,
    FilterChipComponent
  ],
  templateUrl: './my-trips.component.html'
})
export class MyTripsComponent implements OnInit, OnDestroy {
  // Icons for template
  PlusCircleIcon = PlusCircle;
  MapIcon = Map;
  HistoryIcon = History;
  CompassIcon = Compass;
  InfoIcon = Info;
  ChevronRightIcon = ChevronRight;
  ClockIcon = Clock;
  StarIcon = Star;
  PortfolioIcon = LayoutGrid;
  DiscoverIcon = Sparkles;
  ChevronLeftIcon = ChevronLeft;
  MapPinIcon = MapPin;
  CalendarIcon = Calendar;
  EditIcon = Edit;
  DownloadIcon = Download;

  // Tabs
  activeTab: 'portfolio' | 'history' | 'discover' = 'portfolio';

  // Data
  portfolioTrips: Trip[] = [];
  historyTrips: Trip[] = [];
  discoverTrips: Trip[] = [];
  
  searchTerm = signal<string>('');
  
  currentUserName: string = 'Explorer';
  currentUserInitials: string = 'EX';
  nextTrip: Trip | null = null;
  
  stats = {
    upcoming: 0,
    completed: 0,
    destinations: 0,
    nextTripIn: 'Calculating...'
  };

  private destroy$ = new Subject<void>();

  constructor(
    public router: Router,
    private tripService: TripService,
    private authService: AuthService
  ) {
    // Sync with the service signal for user trips
    effect(() => {
      const allTrips = this.tripService.trips() as any[];
      const now = new Date();
      
      const term = this.searchTerm().toLowerCase();
      
      this.portfolioTrips = allTrips.filter(t => {
        const matchesSearch = !term || 
          (t.name?.toLowerCase().includes(term)) || 
          (t.destination?.toLowerCase().includes(term));
        
        const isPast = t.endDate && new Date(t.endDate) < now;
        const isFinished = t.status === 'completed' || t.status === 'cancelled';
        return matchesSearch && !isPast && !isFinished && !t.template;
      });

      // Find next imminent trip for hero
      if (this.portfolioTrips.length > 0) {
        this.nextTrip = [...this.portfolioTrips].sort((a, b) => {
          if (!a.startDate) return 1;
          if (!b.startDate) return -1;
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        })[0];
      } else {
        this.nextTrip = null;
      }

      this.historyTrips = allTrips.filter(t => {
        const matchesSearch = !term || 
          (t.name?.toLowerCase().includes(term)) || 
          (t.destination?.toLowerCase().includes(term));
          
        const isPast = t.endDate && new Date(t.endDate) < now;
        const isFinished = t.status === 'completed' || t.status === 'cancelled';
        return matchesSearch && (isPast || isFinished) && !t.template;
      });
      
      this.updateStats(allTrips);
    });
  }

  ngOnInit(): void {
    this.authService.getCurrentUser().pipe(takeUntil(this.destroy$)).subscribe(user => {
      if (user) {
        this.currentUserName = (user as any).name || user.username || 'Explorer';
        this.currentUserInitials = this.currentUserName.substring(0, 2).toUpperCase();
        this.tripService.loadUserTrips(user.id);
      }
    });

    // Load Discover Templates
    this.tripService.getAllTemplates().pipe(takeUntil(this.destroy$)).subscribe(templates => {
      this.discoverTrips = templates as any[];
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setTab(tab: 'portfolio' | 'history' | 'discover'): void {
    this.activeTab = tab;
  }

  onSearch(event: any): void {
    const value = event.target.value;
    this.searchTerm.set(value);
  }

  private updateStats(allTrips: Trip[]): void {
    this.stats.upcoming = allTrips.filter(t => t.status === 'planning' || t.status === 'upcoming' || t.status === 'active').length;
    this.stats.completed = allTrips.filter(t => t.status === 'completed').length;
    
    const uniqueDestinations = new Set(allTrips.map(t => t.destination));
    this.stats.destinations = uniqueDestinations.size;

    const upcomingTrips = allTrips
      .filter(t => (t.status === 'upcoming' || t.status === 'planning') && t.startDate)
      .map(t => new Date(t.startDate))
      .sort((a, b) => a.getTime() - b.getTime());

    if (upcomingTrips.length > 0) {
      const diffTime = upcomingTrips[0].getTime() - new Date().getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      this.stats.nextTripIn = diffDays > 0 ? `${diffDays} days` : 'Very soon';
    } else {
      this.stats.nextTripIn = 'TBD';
    }
  }
}


