import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Car, Users, Zap } from 'lucide-angular';
import { TransportationService } from '../services/transportation.service';
import { VehicleRental } from '../models/transportation.model';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';
import { BadgeComponent } from '../../../shared/components/badge.component';

@Component({
  selector: 'app-transportation-options',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, ButtonComponent, CardComponent, CardContentComponent, BadgeComponent],
  templateUrl: './transportation-options.component.html'
})
export class TransportationOptionsComponent {
  readonly Car = Car;
  readonly Users = Users;
  readonly Zap = Zap;

  vehicles = signal<VehicleRental[]>([]);

  constructor(private transportService: TransportationService) {
    this.vehicles.set(this.transportService.getMockVehicles());
  }
}
