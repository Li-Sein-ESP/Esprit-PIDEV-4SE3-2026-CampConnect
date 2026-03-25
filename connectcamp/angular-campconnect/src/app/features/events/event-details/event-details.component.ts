import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  LucideAngularModule, Calendar, Users, MapPin, Clock, DollarSign, ChevronLeft,
  ArrowRight, Star, CheckCircle, Shield, Mountain, Award, Share2, Heart,
  ChevronRight, Play, Tent, Info, Backpack, HelpCircle, AlertTriangle
} from 'lucide-angular';
import { EventService } from '../services/event.service';
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

  event = signal<Event | null>(null);
  isRegistered = signal<boolean>(false);
  isFavorited = signal<boolean>(false);

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
    private eventService: EventService
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
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  getCapacityPercent(): number {
    const evt = this.event();
    if (!evt) return 0;
    return Math.round((evt.registered / evt.capacity) * 100);
  }

  getSpotsLeft(): number {
    const evt = this.event();
    if (!evt) return 0;
    return evt.capacity - evt.registered;
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
      this.eventService.registerForEvent(evt.id, 1);
      this.isRegistered.set(true);
    }
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
