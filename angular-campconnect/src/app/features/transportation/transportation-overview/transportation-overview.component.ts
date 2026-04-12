import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, MapPin, Search, Car, Bus, Train } from 'lucide-angular';
import { TransportationService } from '../services/transportation.service';
import { TransportRoute } from '../models/transportation.model';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';
import { BadgeComponent } from '../../../shared/components/badge.component';

@Component({
  selector: 'app-transportation-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule, ButtonComponent, CardComponent, CardContentComponent],
  templateUrl: './transportation-overview.component.html'
})
export class TransportationOverviewComponent {
  readonly Search = Search;
  readonly MapPin = MapPin;
  readonly Car = Car;
  readonly Bus = Bus;
  readonly Train = Train;

  origin = '';
  destination = '';
  routes = signal<TransportRoute[]>([]);

  constructor(private transportService: TransportationService) { }

  searchRoutes() {
    if (this.origin && this.destination) {
      this.routes.set(this.transportService.getMockRoutes(this.origin, this.destination));
    }
  }

  getIcon(mode: string) {
    return mode === 'car' ? Car : mode === 'bus' ? Bus : Train;
  }
}
