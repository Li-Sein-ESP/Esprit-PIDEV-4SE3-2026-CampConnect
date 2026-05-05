import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  LucideAngularModule, Calendar, Users, MapPin, Star, Filter, Search,
  ChevronRight, Clock, Mountain, Tent, ArrowRight, Compass, Flame,
  Award, TrendingUp, Eye, BookOpen, Plus, X, CheckSquare, AlertCircle, Ban, BadgeCheck, Zap, Wind, Sun, Cloud, Sparkles, ShieldCheck
} from 'lucide-angular';
import { EventService } from '../services/event.service';
import { Event } from '../models/event.model';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-events-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
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
  readonly CheckSquare = CheckSquare;
  readonly AlertCircle = AlertCircle;
  readonly Ban = Ban;
  readonly BadgeCheck = BadgeCheck;
  readonly Zap = Zap;
  readonly Wind = Wind;
  readonly Sun = Sun;
  readonly Cloud = Cloud;
  readonly Sparkles = Sparkles;
  readonly X = X;
  readonly ShieldCheck = ShieldCheck;

  allEvents = signal<Event[]>([]);
  selectedType = signal<string>('all');
  searchQuery = signal<string>('');
  aiPrompt = signal<string>('');
  isAiSearching = signal<boolean>(false);
  aiResult: { categoryName: string; confidenceScore: number } | null = null;
  toast: { message: string; type: 'success' | 'error' } | null = null;

  // IA Recommender System State
  isRecommending = signal<boolean>(false);
  showAiDashboard = signal<boolean>(false);
  isScanning = signal<boolean>(false);
  aiAnalysis = signal<any>(null);
  aiRecommendations = signal<any[]>([]); // Store full match objects: {eventId, matchScore, title, ...}
  aiRecommendationsMap = signal<Map<string, number>>(new Map()); // Maps eventId -> matchScore

  quickPrompts = [
    { emoji: '🏕️', label: 'Beginner Camping', text: 'Looking for a camping activity for beginners' },
    { emoji: '🧗', label: 'Advanced Expedition', text: 'Challenging mountain expedition for athletes' },
    { emoji: '🌿', label: 'Nature Retreat', text: 'Quiet retreat in nature to recharge' },
    { emoji: '👨‍👩‍👧', label: 'Family Friendly', text: 'Outdoor activity for family with children' },
    { emoji: '🎓', label: 'Survival Workshop', text: 'Survival workshop and wilderness survival techniques' },
  ];

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
      events = events.filter(e => {
        const normalizedType = e.type?.toLowerCase().replace('_', '-');
        return normalizedType === type;
      });
    }
    if (query) {
      events = events.filter(e =>
        e.title.toLowerCase().includes(query) ||
        e.location.name.toLowerCase().includes(query)
      );
    }

    // Apply AI Recommendation filter (if active, only show recommended events)
    const recs = this.aiRecommendations();
    if (recs.length > 0) {
      const recIds = recs.map(r => r.eventId.toString());
      events = events.filter(event => recIds.includes(event.id.toString()));
      const map = this.aiRecommendationsMap();
      events.sort((a, b) => {
        const scoreA = map.get(a.id.toString()) || 0;
        const scoreB = map.get(b.id.toString()) || 0;
        return scoreB - scoreA;
      });
    }

    return events;
  });

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.eventService.getEvents().subscribe({
      next: (events) => this.allEvents.set(events),
      error: (err) => console.error('EventsHomeComponent: Failed to load events', err)
    });
  }

  setType(type: string): void {
    this.selectedType.set(type);
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { message, type };
    setTimeout(() => this.toast = null, 3000);
  }

  // --- IA RECOMMENDER SYSTEM ---
  aiSmartSearch(): void {
    const prompt = this.aiPrompt().trim();
    if (!prompt || prompt.length < 5) {
      this.clearAiResult();
      return;
    }

    this.isRecommending.set(true);
    this.isScanning.set(true);
    this.aiResult = null;
    this.showAiDashboard.set(true);
    
    // Simulation historique croisée (Academy + Profil)
    const userHistory = ['Astronomie', 'Survie', 'Feu de camp']; 

    this.eventService.recommendAiEvents(prompt, this.allEvents(), userHistory).subscribe({
      next: (res: any) => {
        const results = res.recommendations;
        this.aiAnalysis.set(res.analysis);
        
        setTimeout(() => { // Effet Scanner Cyber-Premium
            this.isRecommending.set(false);
            this.isScanning.set(false);
            
            if (!results || results.length === 0) {
              this.showToast('AI could not find an exact match.', 'error');
              return;
            }

            this.aiRecommendations.set(results);
            
            const matchMap = new Map<string, number>();
            results.forEach((r: any) => matchMap.set(r.eventId.toString(), r.matchScore));
            this.aiRecommendationsMap.set(matchMap);

            this.showToast(`Analysis complete: ${results.length} opportunities detected.`, 'success');
        }, 1500);
      },
      error: (err) => {
        this.isRecommending.set(false);
        this.isScanning.set(false);
        this.showToast('AI Server unavailable.', 'error');
      }
    });
  }

  clearAiResult(): void {
    this.aiResult = null;
    this.aiPrompt.set('');
    this.setType('all');
    this.aiRecommendations.set([]);
    this.showAiDashboard.set(false);
    this.aiRecommendationsMap.set(new Map());
  }

  applyQuickPrompt(text: string): void {
    this.aiPrompt.set(text);
    this.aiSmartSearch();
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

  getCapacitySegments(event: Event): boolean[] {
    const percent = (event.registered / event.capacity) * 10;
    return Array.from({ length: 10 }, (_, i) => i < percent);
  }

  getCapacityColor(event: Event): string {
    const percent = (event.registered / event.capacity);
    if (percent > 0.9) return '#ef4444'; // Red alert
    if (percent > 0.7) return '#f59e0b'; // Amber warning
    return '#10b981'; // Emerald secure
  }
}
