import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LucideAngularModule, Calendar, Users, MapPin, Clock, DollarSign, ChevronLeft } from 'lucide-angular';
import { EventService } from '../services/event.service';
import { Event } from '../models/event.model';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';
import { BadgeComponent } from '../../../shared/components/badge.component';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    ButtonComponent,
    CardComponent,
    CardContentComponent,
    BadgeComponent
  ],
  templateUrl: './event-details.component.html'
})
export class EventDetailsComponent implements OnInit {
  readonly Calendar = Calendar;
  readonly Users = Users;
  readonly MapPin = MapPin;
  readonly Clock = Clock;
  readonly DollarSign = DollarSign;
  readonly ChevronLeft = ChevronLeft;

  event = signal<Event | null>(null);

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const events = this.eventService.getMockEvents();
    const found = events.find(e => e.id === id);
    if (found) {
      this.event.set(found);
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  register() {
    const evt = this.event();
    if (evt) {
      this.eventService.registerForEvent(evt.id, 1);
      alert('Registration successful!');
    }
  }
}
