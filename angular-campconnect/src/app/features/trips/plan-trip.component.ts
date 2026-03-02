import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardComponent, CardContentComponent, CardHeaderComponent, CardTitleComponent } from '../../shared/components/card.component';
import { DropdownComponent, DropdownOption } from '../../shared/components/dropdown.component';
import { LucideAngularModule, Calendar, MapPin, Users, DollarSign, Plus } from 'lucide-angular';
import { TripService } from '../../core/services/trip.service';

@Component({
  selector: 'app-plan-trip',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    DropdownComponent,
    LucideAngularModule
  ],
  templateUrl: './plan-trip.component.html',
  styles: []
})
export class PlanTripComponent {
  CalendarIcon = Calendar;
  MapPinIcon = MapPin;
  UsersIcon = Users;
  DollarSignIcon = DollarSign;
  PlusIcon = Plus;

  tripName = '';
  destination = '';
  startDate = '';
  endDate = '';
  groupSize = 1;
  budget = 0;
  notes = '';

  destinationOptions: DropdownOption[] = [
    { label: 'Yosemite National Park', value: 'yosemite' },
    { label: 'Grand Canyon National Park', value: 'grand-canyon' },
    { label: 'Yellowstone National Park', value: 'yellowstone' },
    { label: 'Zion National Park', value: 'zion' },
    { label: 'Rocky Mountain National Park', value: 'rocky-mountain' },
    { label: 'Glacier National Park', value: 'glacier' },
  ];

  constructor(public router: Router, private tripService: TripService) { }

  handleSubmit(): void {
    const tripData = {
      name: this.tripName,
      destination: this.destination,
      startDate: this.startDate,
      endDate: this.endDate,
      difficulty: 'moderate', // Defaulting
      notes: this.notes
    };

    console.log('Creating trip:', tripData);
    this.tripService.saveTrip(tripData as any).subscribe({
      next: () => {
        alert('Trip created successfully!');
        this.router.navigate(['/trips']);
      },
      error: (err) => {
        console.error('Error creating trip', err);
        alert('Failed to create trip. Please try again.');
      }
    });
  }
}

