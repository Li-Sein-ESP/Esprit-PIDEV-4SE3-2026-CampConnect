import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  LucideAngularModule, Calendar, Users, MapPin, Clock, DollarSign, ChevronLeft,
  ArrowRight, Star, CheckCircle, Shield, Mountain, Award, Share2, Heart,
  ChevronRight, Play, Tent, Info, Backpack, HelpCircle, AlertTriangle, BadgeCheck, Ban
} from 'lucide-angular';
import { EventService } from '../services/event.service';
import { AuthService } from '../../../core/services/auth.service';
import { Event } from '../models/event.model';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule
  ],
  templateUrl: './event-details.component.html',
  styles: [`
    :host {
      display: block;
      background-color: #F1EDE1;
    }
  `]
})
export class EventDetailsComponent implements OnInit {
  readonly Calendar = Calendar;
  readonly Users = Users;
  readonly MapPin = MapPin;
  readonly Clock = Clock;
  readonly DollarSign = DollarSign;
  readonly ChevronLeft = ChevronLeft;
  readonly ArrowRight = ArrowRight;
  readonly Star = Star;
  readonly CheckCircle = CheckCircle;
  readonly Shield = Shield;
  readonly Mountain = Mountain;
  readonly Award = Award;
  readonly Share2 = Share2;
  readonly Heart = Heart;
  readonly ChevronRight = ChevronRight;
  readonly Play = Play;
  readonly Tent = Tent;
  readonly Info = Info;
  readonly Backpack = Backpack;
  readonly HelpCircle = HelpCircle;
  readonly AlertTriangle = AlertTriangle;
  readonly BadgeCheck = BadgeCheck;
  readonly Ban = Ban;

  event = signal<Event | null>(null);
  isRegistered = signal<boolean>(false);
  isFavorited = signal<boolean>(false);
  toast = signal<{ message: string, type: 'success' | 'error' } | null>(null);

  highlights = [
    'Expert-led instruction',
    'All equipment provided',
    'Certificate of completion',
    'Small group setting',
    'Meals & refreshments included',
    'Post-event community access'
  ];

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('eventId') || this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventService.getEventById(id).subscribe(evt => {
        if (evt) {
          this.event.set(evt);
        }
      });
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  isSameTime(start: string, end: string): boolean {
    if (!start || !end) return true;
    return this.formatTime(start) === this.formatTime(end);
  }

  getCapacityColor(): string {
    const percent = this.getCapacityPercent();
    if (percent >= 100) return '#9D4A4A'; // Red
    if (percent >= 80) return '#C77D48';  // Orange
    return '#2d6a4f';                     // Green
  }

  getCapacityPercent(): number {
    const evt = this.event();
    if (!evt) return 0;
    return Math.round((evt.registered / evt.capacity) * 100);
  }

  getSpotsLeft(): number {
    const evt = this.event();
    if (!evt) return 0;
    return Math.max(0, evt.capacity - evt.registered);
  }

  getCapacitySegments(): number[] {
    // Returns an array of 10 segments representing the capacity status
    const percent = this.getCapacityPercent();
    const activeSegments = Math.ceil(percent / 10);
    return Array(10).fill(0).map((_, i) => i < activeSegments ? 1 : 0);
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

  register() {
    const evt = this.event();
    if (evt) {
      this.authService.getCurrentUser().subscribe(user => {
        if (!user || !user.id) {
          this.showToast('Authentication Required: Protocol Halted', 'error');
          return;
        }

        this.eventService.registerForEvent(evt.id, 1, user.id).subscribe({
          next: () => {
            this.isRegistered.set(true);
            // REACTIVE UPDATE: Create a new object to trigger the signal effect
            this.event.set({
              ...evt,
              registered: evt.registered + 1
            });
            this.showToast('Sector Authorized: Deployment Confirmed', 'success');
          },
          error: (err) => {
            console.error('Registration failed:', err);
            this.showToast('Clearance Denied: Authorization Failed', 'error');
          }
        });
      });
    }
  }

  showToast(message: string, type: 'success' | 'error') {
    this.toast.set({ message, type });
    setTimeout(() => this.toast.set(null), 4000);
  }

  toggleFavorite() {
    this.isFavorited.set(!this.isFavorited());
  }

  joinWaitlist() {
    // Placeholder waitlist logic
    alert('Joining waitlist for ' + this.event()?.title);
  }

  shareEvent() {
    if (navigator.share) {
      navigator.share({
        title: this.event()?.title,
        text: this.event()?.description,
        url: window.location.href
      });
    } else {
      alert('Sharing: ' + window.location.href);
    }
  }

  saveEvent() {
    this.isFavorited.set(!this.isFavorited());
  }

  navigateBack() {
    window.history.back();
  }
}
