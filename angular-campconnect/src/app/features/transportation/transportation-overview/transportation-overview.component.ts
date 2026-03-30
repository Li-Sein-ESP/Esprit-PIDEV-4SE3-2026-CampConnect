import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule, Router } from "@angular/router";
import {
  LucideAngularModule,
  MapPin,
  Search,
  Car,
  Bus,
  Train,
} from "lucide-angular";
import { TransportationService } from "../services/transportation.service";
import { TransportRoute } from "../models/transportation.model";
import { ButtonComponent } from "../../../shared/components/button.component";
import {
  CardComponent,
  CardContentComponent,
} from "../../../shared/components/card.component";
import { BadgeComponent } from "../../../shared/components/badge.component";

@Component({
  selector: "app-transportation-overview",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    LucideAngularModule,
    ButtonComponent,
    CardComponent,
    CardContentComponent,
  ],
  templateUrl: "./transportation-overview.component.html",
})
export class TransportationOverviewComponent {
  readonly Search = Search;
  readonly MapPin = MapPin;
  readonly Car = Car;
  readonly Bus = Bus;
  readonly Train = Train;

  origin = "";
  destination = "";
  routes = signal<TransportRoute[]>([]);
  transports = signal<any[]>([]);
  today = new Date().toISOString().split("T")[0];

  constructor(
    private transportService: TransportationService,
    public router: Router,
  ) {}

  searchRoutes() {
    if (this.origin && this.destination) {
      this.routes.set(
        this.transportService.getMockRoutes(this.origin, this.destination),
      );
    }
  }

  getIcon(mode: string) {
    return mode === "car" ? Car : mode === "bus" ? Bus : Train;
  }

  findNearby(route: TransportRoute) {
    const date = this.today;
    const originName =
      this.origin || (route.origin && (route.origin as any).name) || "";
    const destinationName =
      this.destination ||
      (route.destination && (route.destination as any).name) ||
      "";
    this.router.navigate(["/plan-trip/create"], {
      queryParams: { origin: originName, destination: destinationName, date },
    });
  }

  goToMyTrips() {
    this.router.navigate(["/trips"]);
  }

  ngOnInit(): void {
    this.transportService.getAllTransports().subscribe({
      next: (data: any[]) => this.transports.set(data || []),
      error: (err) => console.error("Failed to load admin transports", err),
    });
  }
}
