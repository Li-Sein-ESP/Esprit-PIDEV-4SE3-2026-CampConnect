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
  template: `
    <div class="container mx-auto p-6">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-3xl font-bold mb-6">Plan Your Next Trip</h1>
        
        <div class="bg-white rounded-xl shadow-sm border p-6 space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Trip Name</label>
            <input type="text" [(ngModel)]="tripName" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Summer in Yosemite">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Destination</label>
            <input type="text" [(ngModel)]="destination" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter destination">
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" [(ngModel)]="startDate" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input type="date" [(ngModel)]="endDate" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
            </div>
          </div>

          <button (click)="handleSubmit()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors">
            Create Trip
          </button>
        </div>
      </div>
    </div>
  `,
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
    if (!this.tripName || !this.destination || !this.startDate || !this.endDate) {
      alert('Please fill in all required fields.');
      return;
    }

    // Backend expects LocalDateTime (ISO format with time)
    const tripData = {
      name: this.tripName,
      destination: this.destination,
      startDate: this.startDate + 'T00:00:00',
      endDate: this.endDate + 'T00:00:00',
      difficulty: 'MEDIUM', // Must match DifficultyLevel enum: EASY, MEDIUM, HARD, EXTREME
      notes: this.notes
    };

    console.log('Creating trip with formatted data:', tripData);
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

