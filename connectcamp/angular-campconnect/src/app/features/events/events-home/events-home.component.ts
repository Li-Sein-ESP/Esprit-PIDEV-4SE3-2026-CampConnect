import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  LucideAngularModule, Calendar, Users, MapPin, Star, Filter, Search,
  ChevronRight, Clock, Mountain, Tent, ArrowRight, Compass, Flame,
  Award, TrendingUp, Eye, BookOpen
} from 'lucide-angular';
import { EventService } from '../services/event.service';
import { Event } from '../models/event.model';

@Component({
  selector: 'app-events-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule
  ],
  templateUrl: './events-home.component.html',
  styles: [`
    :host {
      display: block;
      background-color: #F1EDE1;
    }
    @keyframes ken-burns {
      0%   { transform: scale(1.05) translate(0%, 0%); }
      25%  { transform: scale(1.12) translate(-1.5%, -1%); }
      50%  { transform: scale(1.08) translate(1%, -0.5%); }
      75%  { transform: scale(1.15) translate(-0.5%, 1%); }
      100% { transform: scale(1.05) translate(0%, 0%); }
    }
    .animate-slow-zoom {
      animation: ken-burns 30s ease-in-out infinite;
    }
  `]
})
export class EventsHomeComponent implements OnInit {
  readonly Calendar = Calendar;
  readonly Users = Users;
  readonly MapPin = MapPin;
  readonly Star = Star;
  readonly Filter = Filter;
  readonly Search = Search;
  readonly ChevronRight = ChevronRight;
  readonly Clock = Clock;
  readonly Mountain = Mountain;
  readonly Tent = Tent;
  readonly ArrowRight = ArrowRight;
  readonly Compass = Compass;
  readonly Flame = Flame;
  readonly Award = Award;
  readonly TrendingUp = TrendingUp;
  readonly Eye = Eye;
  readonly BookOpen = BookOpen;

  allEvents = signal<Event[]>([]);
  selectedType = signal<string>('all');
  searchQuery = signal<string>('');

  categories = [
    { id: 'all', label: 'All Events' },
    { id: 'workshop', label: 'Workshops' },
    { id: 'expedition', label: 'Expeditions' },
    { id: 'guided-hike', label: 'Guided Hikes' },
    { id: 'retreat', label: 'Retreats' },
    { id: 'group-camp', label: 'Group Camps' },
    { id: 'certification', label: 'Certifications' },
    { id: 'skills-course', label: 'Skills Courses' }
  ];

  featuredEvents = computed(() => {
    return this.allEvents().slice(0, 2);
  });

  filteredEvents = computed(() => {
    let events = this.allEvents();
    const type = this.selectedType();
    const query = this.searchQuery().toLowerCase();

    if (type !== 'all') {
      events = events.filter(e => e.type === type);
    }
    if (query) {
      events = events.filter(e =>
        e.title.toLowerCase().includes(query) ||
        e.location.name.toLowerCase().includes(query)
      );
    }
    return events;
  });

  stats = computed(() => {
    const events = this.allEvents();
    return [
      { label: 'Total Events', value: events.length, suffix: '' },
      { label: 'Upcoming', value: events.filter(e => e.status === 'upcoming').length, suffix: '' },
      { label: 'Participants', value: events.reduce((sum, e) => sum + e.registered, 0), suffix: '+' },
      { label: 'Locations', value: new Set(events.map(e => e.location.name)).size, suffix: '' }
    ];
  });

  constructor(private eventService: EventService) { }

  ngOnInit(): void {
    this.eventService.getEvents().subscribe({
      next: (events) => this.allEvents.set(events),
      error: (err) => console.error('EventsHomeComponent: Failed to load events', err)
    });
  }

  setType(type: string): void {
    this.selectedType.set(type);
  }

  onSearch(event: any): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTypeEmoji(type: string): string {
    const emojis: Record<string, string> = {
      'workshop': '🔥',
      'expedition': '🏔️',
      'meetup': '🤝',
      'training': '🎯',
      'festival': '🎪'
    };
    return emojis[type] || '🌿';
  }
}
