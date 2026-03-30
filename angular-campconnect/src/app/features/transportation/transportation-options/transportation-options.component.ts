import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Router } from "@angular/router";
import { LucideAngularModule, Car, Users, Zap } from "lucide-angular";
import { TransportationService } from "../services/transportation.service";
import { VehicleRental } from "../models/transportation.model";
import { ButtonComponent } from "../../../shared/components/button.component";
import {
  CardComponent,
  CardContentComponent,
} from "../../../shared/components/card.component";
import { BadgeComponent } from "../../../shared/components/badge.component";

@Component({
  selector: "app-transportation-options",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    ButtonComponent,
    CardComponent,
    CardContentComponent,
    BadgeComponent,
  ],
  templateUrl: "./transportation-options.component.html",
})
export class TransportationOptionsComponent {
  readonly Car = Car;
  readonly Users = Users;
  readonly Zap = Zap;

  vehicles = signal<VehicleRental[]>([]);

  today = new Date().toISOString().split("T")[0];

  constructor(
    private transportService: TransportationService,
    public router: Router,
  ) {
    // Load transports from backend (admin-provided) and map to vehicle-like objects
    this.transportService.getAllTransports().subscribe({
      next: (data: any[]) => {
        const mapped = (data || []).map(
          (t) =>
            ({
              id: t.id,
              type: t.mode || "car",
              make: t.provider || t.make || "",
              model: t.model || t.mode || "",
              year: t.year || new Date().getFullYear(),
              capacity: t.capacity || t.seats || 4,
              pricePerDay: t.cost || t.price || 0,
              features: t.features || [],
              imageUrl: t.imageUrl || "",
              available: t.available !== undefined ? t.available : true,
            }) as VehicleRental,
        );
        this.vehicles.set(mapped);
      },
      error: (err) =>
        console.error("Failed to load transports for options", err),
    });
  }

  goToMyTrips() {
    this.router.navigate(["/trips"]);
  }

  findNearby() {
    this.router.navigate(["/plan-trip/create"], {
      queryParams: { date: this.today },
    });
  }
}
