import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule, Calendar, MapPin, Clock } from 'lucide-angular';
import { TripService } from '../services/trip.service';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card.component';
import { BadgeComponent } from '../../../shared/components/badge.component';

@Component({
  selector: 'app-trip-itinerary',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent, BadgeComponent],
  templateUrl: './trip-itinerary.component.html'
})
export class TripItineraryComponent implements OnInit {
  readonly Calendar = Calendar;
  readonly MapPin = MapPin;
  readonly Clock = Clock;

  mockDays = [
    {
      dayNumber: 1,
      date: 'July 15, 2024',
      activities: [
        { id: '1', time: '9:00 AM', title: 'Depart San Francisco', description: 'Begin journey to Yosemite', location: 'San Francisco, CA', type: 'travel', duration: 240 },
        { id: '2', time: '1:00 PM', title: 'Arrive & Setup Camp', description: 'Check in and set up campsite', location: 'Upper Pines Campground', type: 'camping', duration: 120 }
      ]
    },
    {
      dayNumber: 2,
      date: 'July 16, 2024',
      activities: [
        { id: '3', time: '8:00 AM', title: 'Mist Trail Hike', description: 'Hike to Vernal Fall', location: 'Mist Trail', type: 'hiking', duration: 300 },
        { id: '4', time: '3:00 PM', title: 'Explore Valley', description: 'Visit Yosemite Village and Valley View', location: 'Yosemite Valley', type: 'sightseeing', duration: 180 }
      ]
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private tripService: TripService
  ) { }

  ngOnInit() {
    // Load itinerary data
  }
}
