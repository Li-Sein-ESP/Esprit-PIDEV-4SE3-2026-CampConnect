import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, MapPin, Clock, Navigation } from 'lucide-angular';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';

@Component({
  selector: 'app-route-breakdown',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, CardComponent, CardContentComponent],
  templateUrl: './route-breakdown.component.html'
})
export class RouteBreakdownComponent {
  readonly MapPin = MapPin;
  readonly Clock = Clock;
  readonly Navigation = Navigation;

  routeSegments = [
    { title: 'Start: San Francisco', duration: '0 min', distance: '0 mi', description: 'Begin your journey' },
    { title: 'I-580 East', duration: '45 min', distance: '35 mi', description: 'Take I-580 East towards Tracy' },
    { title: 'CA-120 East', duration: '90 min', distance: '85 mi', description: 'Continue on CA-120 through Manteca' },
    { title: 'Arrive: Yosemite Valley', duration: '3 hrs', distance: '195 mi', description: 'Destination reached' }
  ];
}
