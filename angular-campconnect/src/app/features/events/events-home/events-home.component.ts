import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Calendar, Users, MapPin, Star, Filter, Search } from 'lucide-angular';
import { EventService } from '../services/event.service';
import { Event } from '../models/event.model';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card.component';
import { BadgeComponent } from '../../../shared/components/badge.component';

@Component({
  selector: 'app-events-home',
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
  templateUrl: './events-home.component.html'
})
export class EventsHomeComponent {
  readonly Calendar = Calendar;
  readonly Users = Users;
  readonly MapPin = MapPin;
  readonly Star = Star;
  readonly Filter = Filter;
  readonly Search = Search;

  events = signal<Event[]>([]);

  constructor(private eventService: EventService) {
    this.events.set(this.eventService.getMockEvents());
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}
