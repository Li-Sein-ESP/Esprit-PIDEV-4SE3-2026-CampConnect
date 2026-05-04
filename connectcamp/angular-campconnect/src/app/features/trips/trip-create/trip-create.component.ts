import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, Calendar, MapPin, Users, Plus } from 'lucide-angular';
import { TripService } from '../services/trip.service';
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
    const duration = this.calculateDuration();
    const trip = this.tripService.createTrip({ ...this.tripData, duration });
    this.router.navigate(['/trips', trip.id]);
  }

  calculateDuration(): number {
    if (!this.tripData.startDate || !this.tripData.endDate) return 1;
    const start = new Date(this.tripData.startDate);
    const end = new Date(this.tripData.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }
}
