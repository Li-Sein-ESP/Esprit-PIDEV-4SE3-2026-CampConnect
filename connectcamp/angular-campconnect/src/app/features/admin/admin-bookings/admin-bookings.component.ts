import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Plus, Pencil, Trash2, Calendar, MapPin } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardContentComponent, CardHeaderComponent, CardTitleComponent } from '../../../shared/components/card.component';
import { EventService } from '../../events/services/event.service';
import { Event } from '../../events/models/event.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-bookings-component',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    ButtonComponent,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    FormsModule
  ],
  templateUrl: './admin-bookings.component.html',
  styles: []
})
export class AdminBookingsComponent implements OnInit {
  PlusIcon = Plus;
  PencilIcon = Pencil;
  TrashIcon = Trash2;
  CalendarIcon = Calendar;
  MapPinIcon = MapPin;

  events = signal<Event[]>([]);
  showForm = false;
  editingEvent: Event | null = null;
  formErrors: { [key: string]: string } = {};
  eventForm: Partial<Event> = {
    title: '',
    description: '',
    type: 'expedition',
    location: { name: '', address: '' },
    price: 0,
    capacity: 20,
    difficulty: 'moderate',
    status: 'upcoming'
  };

  constructor(private eventService: EventService) { }

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents() {
    this.eventService.getEvents().subscribe(events => {
      this.events.set(events);
    });
  }

  openAddForm() {
    this.editingEvent = null;
    this.formErrors = {};
    this.eventForm = {
      title: '',
      description: '',
      type: 'expedition',
      location: { name: '', address: '' },
      price: 0,
      capacity: 20,
      difficulty: 'moderate',
      status: 'upcoming'
    };
    this.showForm = true;
  }

  openEditForm(event: Event) {
    this.editingEvent = event;
    this.formErrors = {};
    this.eventForm = { ...event };
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingEvent = null;
    this.formErrors = {};
  }

  validateForm(): boolean {
    this.formErrors = {};

    if (!this.eventForm.title || this.eventForm.title.trim().length < 3) {
      this.formErrors['title'] = 'Le titre est requis (min. 3 caractères)';
    }

    if (this.eventForm.price == null || this.eventForm.price < 0) {
      this.formErrors['price'] = 'Le prix doit être 0 ou positif';
    }

    if (!this.eventForm.capacity || this.eventForm.capacity < 1) {
      this.formErrors['capacity'] = 'La capacité doit être supérieure à 0';
    }

    if (!this.eventForm.location?.name || this.eventForm.location.name.trim() === '') {
      this.formErrors['location'] = 'Le lieu est requis';
    }

    return Object.keys(this.formErrors).length === 0;
  }

  saveEvent() {
    if (!this.validateForm()) {
      return;
    }

    if (this.editingEvent) {
      this.eventService.updateEvent(this.editingEvent.id!, this.eventForm as Event).subscribe({
        next: () => {
          this.loadEvents();
          this.closeForm();
        },
        error: (err) => {
          if (err.error?.errors) {
            this.formErrors = err.error.errors;
          }
        }
      });
    } else {
      this.eventService.createEvent(this.eventForm as Event).subscribe({
        next: () => {
          this.loadEvents();
          this.closeForm();
        },
        error: (err) => {
          if (err.error?.errors) {
            this.formErrors = err.error.errors;
          }
        }
      });
    }
  }

  deleteEvent(id: string) {
    if (confirm('Are you sure you want to delete this event?')) {
      this.eventService.deleteEvent(id).subscribe(() => {
        this.loadEvents();
      });
    }
  }
}

