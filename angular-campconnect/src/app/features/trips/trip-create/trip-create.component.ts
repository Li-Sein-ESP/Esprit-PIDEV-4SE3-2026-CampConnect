import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, Calendar, MapPin, Users, Plus } from 'lucide-angular';
import { TripService } from '../../../core/services/trip.service';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';

@Component({
  selector: 'app-trip-create',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ButtonComponent, CardComponent, CardContentComponent],
  templateUrl: './trip-create.component.html'
})
export class TripCreateComponent {
  readonly Calendar = Calendar;
  readonly MapPin = MapPin;
  readonly Users = Users;
  readonly Plus = Plus;

  tripData = {
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    participants: 1,
    description: ''
  };

  constructor(
    private tripService: TripService,
    private router: Router
  ) { }

  createTrip() {
    if (!this.tripData.destination || !this.tripData.startDate || !this.tripData.endDate) {
      alert('Please fill in Destination and Dates.');
      return;
    }

    // Backend expects LocalDateTime (ISO format with time) and DifficultyLevel Enum
    const payload = {
      destination: this.tripData.destination,
      startDate: this.tripData.startDate + 'T00:00:00',
      endDate: this.tripData.endDate + 'T00:00:00',
      difficulty: 'MEDIUM', // enum: EASY, MEDIUM, HARD, EXTREME
      // Note: Backend Trip model/DTO currently doesn't have 'name', 'participants' or 'description'
      // We send them anyway in case the model is updated or they are handled elsewhere
      name: this.tripData.name,
      notes: this.tripData.description
    };

    console.log('Creating trip via real service:', payload);
    this.tripService.saveTrip(payload as any).subscribe({
      next: (savedTrip) => {
        alert('Trip created successfully!');
        this.router.navigate(['/trips', savedTrip.id]);
      },
      error: (err) => {
        console.error('Full error details:', err);
        alert('Failed to create trip. Please check your connection and try again.');
      }
    });
  }
}
