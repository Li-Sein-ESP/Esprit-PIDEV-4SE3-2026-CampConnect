import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, ChevronLeft, Plus, Edit2, Camera, StickyNote, Clock, X, Users, DollarSign, Timer } from 'lucide-angular';
import { TripService } from '../services/trip.service';
import { ItineraryService } from '../services/itinerary.service';
import { ActivityService } from '../services/activity.service';

interface DayTab {
  id: string;
  label: string;
  subtitle: string;
  dateLabel: string;
  fullDate: string;
  dayNumber: number;
}

interface ActivityItem {
  id: string;
  dayId: string;
  time: string;
  duration: string;
  title: string;
  location: string;
  description: string;
  icon: string;
  accentColor: string;
  type: string;
  participants: string;
  cost: number;
}

@Component({
  selector: 'app-trip-itinerary',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './trip-itinerary.component.html'
})
export class TripItineraryComponent implements OnInit {
  tripId: string | null = null;
  trip = signal<any>(null);
  selectedDayId = signal<string>('');
  showAddModal = signal<boolean>(false);
  dayTabs = signal<DayTab[]>([]);
  allActivities = signal<ActivityItem[]>([]);

  // Form model
  newActivity = {
    time: '',
    duration: '1h',
    title: '',
    location: '',
    description: '',
    type: 'activity',
    icon: '👟',
    participants: 'Everyone',
    cost: 0
  };

  // Icons
  readonly ChevronLeft = ChevronLeft;
  readonly Plus = Plus;
  readonly Edit2 = Edit2;
  readonly Camera = Camera;
  readonly StickyNote = StickyNote;
  readonly Clock = Clock;
  readonly X = X;
  readonly Users = Users;
  readonly DollarSign = DollarSign;
  readonly Timer = Timer;

  currentDayInfo = computed(() => {
    const selected = this.dayTabs().find(d => d.id === this.selectedDayId());
    if (selected) return selected;
    return this.dayTabs().length > 0 ? this.dayTabs()[0] : {
      id: '', label: 'Day 1', subtitle: 'Day 1', dateLabel: 'Loading...', fullDate: 'Day 1', dayNumber: 1
    };
  });

  currentDayActivities = computed(() => {
    return this.allActivities().filter(a => a.dayId === this.selectedDayId())
      .sort((a, b) => a.time.localeCompare(b.time));
  });

  totalCost = computed(() => {
    return this.currentDayActivities().reduce((acc, a) => acc + (a.cost || 0), 0);
  });

  dayTimes = computed(() => {
    const activities = this.currentDayActivities();
    if (activities.length === 0) return { start: '08:00', end: '20:00' };
    return {
      start: activities[0].time,
      end: activities[activities.length - 1].time
    };
  });

  currentDayStats = computed(() => {
    const activities = this.currentDayActivities();
    const stats: { [key: string]: { label: string, icon: string, count: number, color: string } } = {};

    activities.forEach(a => {
      const type = a.type || 'activity';
      if (!stats[type]) {
        stats[type] = {
          label: type.charAt(0).toUpperCase() + type.slice(1),
          icon: a.icon || '👟',
          count: 0,
          color: this.getActivityColor(type)
        };
      }
      stats[type].count++;
    });

    return Object.values(stats);
  });

  private getActivityColor(type: string): string {
    switch (type) {
      case 'travel': return 'bg-amber-100 text-amber-600';
      case 'meal': return 'bg-rose-100 text-rose-600';
      case 'setup': return 'bg-emerald-100 text-emerald-600';
      case 'rest': return 'bg-slate-100 text-slate-600';
      default: return 'bg-indigo-100 text-indigo-600';
    }
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tripService: TripService,
    private itineraryService: ItineraryService,
    private activityService: ActivityService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.tripId = params.get('tripId');
      if (this.tripId) {
        this.loadTrip();
      }
    });
  }

  loadTrip() {
    if (!this.tripId) return;
    this.tripService.getTripById(this.tripId).subscribe(trip => {
      this.trip.set(trip);
      this.loadItineraries();
    });
  }

  loadItineraries() {
    if (!this.tripId) return;
    this.itineraryService.getItinerariesByTrip(this.tripId).subscribe(data => {
      const tabs: DayTab[] = data.map((it: any) => ({
        id: it.id,
        label: `Day ${it.dayNumber}`,
        subtitle: `Day ${it.dayNumber}`,
        dateLabel: it.dailyDescription,
        fullDate: this.formatDayDate(it.dayNumber),
        dayNumber: it.dayNumber
      })).sort((a: any, b: any) => a.dayNumber - b.dayNumber);

      this.dayTabs.set(tabs);
      if (tabs.length > 0) {
        if (!this.selectedDayId()) {
          this.selectedDayId.set(tabs[0].id);
        }
        this.loadActivities(tabs.map(t => t.id));

        // If trip duration is longer than existing itineraries, we could offer to add more
        const duration = this.trip()?.duration || 1;
        if (tabs.length < duration) {
          console.log(`Itinerary has ${tabs.length} days but trip is ${duration} days.`);
          // Auto-generate missing days
          this.generateMissingDays(tabs.length + 1, duration);
        }
      } else {
        // Create full itinerary based on duration
        this.createFullItinerary();
      }
    });
  }

  formatDayDate(dayNumber: number): string {
    const trip = this.trip();
    if (!trip || !trip.startDate) return `Day ${dayNumber}`;
    const date = new Date(trip.startDate);
    date.setDate(date.getDate() + dayNumber - 1);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  createFullItinerary() {
    const duration = this.trip()?.duration || 1;
    this.generateMissingDays(1, duration);
  }

  generateMissingDays(start: number, end: number) {
    if (!this.tripId || start > end) return;

    const descriptions = [
      'Arrival & Camp Setup',
      'Half Dome Views & Valley Hikes',
      'Glacier Point & Stargazing',
      'Pack Up & Departure',
      'Full Day Exploration',
      'Local Gems & Hidden Trails',
      'River Activities',
      'Photography Session',
      'Morning Hike & Sightseeing',
      'Grand Finale Hike'
    ];

    this.itineraryService.createItinerary({
      tripId: this.tripId,
      dayNumber: start,
      dailyDescription: descriptions[start - 1] || 'Adventure Day'
    }).subscribe(it => {
      if (start === 1) {
        this.generateDay1Activities(it.id);
      }

      if (start < end) {
        this.generateMissingDays(start + 1, end);
      } else {
        this.loadItineraries();
      }
    });
  }

  loadActivities(itineraryIds: string[]) {
    itineraryIds.forEach(id => {
      this.activityService.getActivitiesByItinerary(id).subscribe(data => {
        const activities: ActivityItem[] = data.map((act: any) => ({
          id: act.id,
          dayId: id,
          time: act.startTime ? new Date(act.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '12:00',
          duration: '1h', // Could be calculated from endTime
          title: act.name,
          location: act.location?.name || 'Yosemite',
          description: act.description,
          icon: this.getActivityIcon(act.type),
          accentColor: this.getActivityAccentColor(act.type),
          type: act.type || 'activity',
          participants: 'Everyone',
          cost: act.cost || 0
        }));
        this.allActivities.update(prev => [...prev.filter(a => a.dayId !== id), ...activities]);
      });
    });
  }

  private getActivityIcon(type: string): string {
    switch (type) {
      case 'travel': return '🚗';
      case 'meal': return '🍽️';
      case 'setup': return '🏕️';
      case 'rest': return '🛌';
      default: return '👟';
    }
  }

  private getActivityAccentColor(type: string): string {
    switch (type) {
      case 'travel': return 'bg-amber-100';
      case 'meal': return 'bg-rose-100';
      case 'setup': return 'bg-emerald-100';
      case 'rest': return 'bg-slate-100';
      default: return 'bg-indigo-100';
    }
  }

  createDefaultItinerary() {
    if (!this.tripId) return;
    this.itineraryService.createItinerary({
      tripId: this.tripId,
      dayNumber: 1,
      dailyDescription: 'Arrival & Setup'
    }).subscribe(() => this.loadItineraries());
  }

  generateDay1Activities(itineraryId: string) {
    const trip = this.trip();
    const dateStr = trip?.startDate ? trip.startDate.split('T')[0] : '2026-03-15';

    const defaultActivities = [
      {
        name: 'Drive to Yosemite',
        time: '08:00',
        type: 'travel',
        icon: '🚗',
        description: 'Depart from home and drive to Yosemite Valley. Stop for supplies if needed.',
        location: 'Highway 120'
      },
      {
        name: 'Lunch Break',
        time: '11:00',
        type: 'meal',
        icon: '🍽️',
        description: 'Stop for lunch at a scenic viewpoint before entering the park.',
        location: 'Groveland'
      },
      {
        name: 'Camp Setup',
        time: '12:30',
        type: 'setup',
        icon: '🏕️',
        description: 'Arrive at campsite, set up tents, organize gear, and familiarize with the area.',
        location: 'Upper Pines Campground'
      },
      {
        name: 'Valley Floor Exploration',
        time: '15:00',
        type: 'activity',
        icon: '👟',
        description: 'Easy walk around the valley to get oriented. Visit visitor center.',
        location: 'Yosemite Valley'
      },
      {
        name: 'Dinner & Campfire',
        time: '18:00',
        type: 'meal',
        icon: '🔥',
        description: 'Prepare first camp dinner. Share stories around the campfire.',
        location: 'Campsite'
      },
      {
        name: 'Rest',
        time: '21:00',
        type: 'rest',
        icon: '🛌',
        description: 'Get a good night\'s sleep for tomorrow\'s adventures.',
        location: 'Campsite'
      }
    ];

    defaultActivities.forEach(act => {
      this.activityService.createActivity({
        itineraryId,
        name: act.name,
        description: act.description,
        startTime: `${dateStr}T${act.time}:00Z`,
        type: act.type,
        location: { name: act.location, address: act.location }
      }).subscribe();
    });
  }

  selectDay(id: string) {
    this.selectedDayId.set(id);
  }

  openAddModal() {
    this.newActivity = {
      time: '12:00',
      duration: '1h',
      title: '',
      location: '',
      description: '',
      type: 'activity',
      icon: '👟',
      participants: 'Everyone',
      cost: 0
    };
    this.showAddModal.set(true);
  }

  closeAddModal() {
    this.showAddModal.set(false);
  }

  saveActivity() {
    if (!this.newActivity.title || !this.newActivity.time || !this.selectedDayId()) return;

    const trip = this.trip();
    const dateStr = trip?.startDate ? trip.startDate.split('T')[0] : '2026-03-15';

    this.activityService.createActivity({
      itineraryId: this.selectedDayId(),
      name: this.newActivity.title,
      description: this.newActivity.description || 'New activity',
      startTime: `${dateStr}T${this.newActivity.time}:00Z`,
      cost: this.newActivity.cost || 0,
      location: { name: this.newActivity.location || 'Yosemite', address: this.newActivity.location }
    }).subscribe(() => {
      this.loadActivities([this.selectedDayId()]);
      this.closeAddModal();
    });
  }

  navigateBack() {
    const tripId = this.tripId || '1';
    this.router.navigate(['/trips', tripId]);
  }
}
