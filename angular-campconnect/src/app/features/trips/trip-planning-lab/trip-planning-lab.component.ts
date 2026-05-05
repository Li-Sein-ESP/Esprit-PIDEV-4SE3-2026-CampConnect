import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { TripService } from "../services/trip.service";
import { TransportationService } from "../../transportation/services/transportation.service";
import {
  TripAutomationOverview,
  TripAutomationService,
} from "../../../core/services/trip-automation.service";
import { AuthService } from "../../../core/services/auth.service";
import type { Trip } from "../models/trip.model";

/** Instant JS fiable pour une date ISO issue du backend (ou null si invalide / absente). */
function tripInstant(iso: string | undefined | null): number | null {
  if (iso == null || iso === "") return null;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? null : t;
}

@Component({
  selector: "app-trip-planning-lab",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: "./trip-planning-lab.component.html",
})
export class TripPlanningLabComponent implements OnInit {
  /** null = rien choisi (évite mélange value / ngValue sur le select). */
  selectedTripId: string | null = null;
  transports: any[] = [];
  overview: TripAutomationOverview | null = null;

  loadingOverview = false;
  loadingTransports = false;
  busyTransportId: string | null = null;
  busyReschedule = false;

  feedbackOk: string | null = null;
  feedbackErr: string | null = null;

  manualShiftMinutes = 30;
  manualKeyword = "";

  constructor(
    public tripService: TripService,
    private transportationService: TransportationService,
    private automationService: TripAutomationService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user?.id) {
      this.tripService.loadUserTrips(user.id);
    }
  }

  onTripChange(): void {
    this.transports = [];
    this.feedbackOk = null;
    this.feedbackErr = null;
    if (this.selectedTripId == null || this.selectedTripId === "") return;
    this.loadTransports();
  }

  /** Voyage courant dans la liste chargée */
  selectedTrip(): Trip | undefined {
    const id = this.selectedTripId;
    if (id == null || id === "") return undefined;
    return this.tripService.trips().find((t) => t.id === id);
  }

  /**
   * Voyage clos pour le lab : statut terminal, ou date de fin passée, ou (sans fin) début passé + statut cohérent.
   */
  isSelectedTripPastForLab(): boolean {
    const t = this.selectedTrip();
    if (!t) return false;
    if (t.status === "completed" || t.status === "cancelled") return true;
    const endTs = tripInstant(t.endDate);
    if (endTs != null && endTs < Date.now()) return true;
    return false;
  }

  /** Voyage dont la période ne commence qu’après maintenant (d’après startDate). */
  isSelectedTripFutureForLab(): boolean {
    const t = this.selectedTrip();
    if (!t || this.isSelectedTripPastForLab()) return false;
    const startTs = tripInstant(t.startDate);
    if (startTs == null) return false;
    return startTs > Date.now();
  }

  /** past | future | active — pour adapter l’interface à chaque voyage. */
  tripTemporalPhase(): "past" | "future" | "active" {
    if (this.isSelectedTripPastForLab()) return "past";
    if (this.isSelectedTripFutureForLab()) return "future";
    return "active";
  }

  pastTripExplanation(): string {
    const t = this.selectedTrip();
    if (!t) return "";
    const bits: string[] = [];
    if (t.status === "completed") bits.push("completed status");
    if (t.status === "cancelled") bits.push("cancelled trip");
    const startTs = tripInstant(t.startDate);
    if (startTs != null) {
      bits.push(`start on ${new Date(startTs).toLocaleDateString()}`);
    }
    const endTs = tripInstant(t.endDate);
    if (endTs != null) {
      bits.push(`end on ${new Date(endTs).toLocaleDateString()}`);
    }
    return bits.length ? bits.join(" · ") : "closed trip";
  }

  futureTripExplanation(): string {
    const t = this.selectedTrip();
    if (!t) return "";
    const s = tripInstant(t.startDate);
    const e = tripInstant(t.endDate);
    const sStr = s != null ? new Date(s).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";
    const eStr = e != null ? new Date(e).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";
    return `Scheduled start on ${sStr} · scheduled end on ${eStr}.`;
  }

  activeTripExplanation(): string {
    const t = this.selectedTrip();
    if (!t) return "";
    const s = tripInstant(t.startDate);
    const e = tripInstant(t.endDate);
    const sStr = s != null ? new Date(s).toLocaleDateString() : "—";
    const eStr = e != null ? new Date(e).toLocaleDateString() : "—";
    return `Registered period from ${sStr} to ${eStr}.`;
  }

  /** Infobulle sur chaque ligne du select (vérification rapide des dates). */
  tripOptionTitle(t: Trip): string {
    const phase = this.phaseForTrip(t);
    const s = tripInstant(t.startDate);
    const e = tripInstant(t.endDate);
    const sStr = s != null ? new Date(s).toLocaleDateString() : "?";
    const eStr = e != null ? new Date(e).toLocaleDateString() : "?";
    return `${phase} — from ${sStr} to ${eStr}`;
  }

  private phaseForTrip(t: Trip): string {
    if (this.isPastTrip(t)) return "Past";
    if (this.isFutureTrip(t)) return "On the horizon";
    return "On the way";
  }

  private isPastTrip(t: Trip): boolean {
    if (t.status === "completed" || t.status === "cancelled") return true;
    const endTs = tripInstant(t.endDate);
    if (endTs != null && endTs < Date.now()) return true;
    return false;
  }

  private isFutureTrip(t: Trip): boolean {
    if (this.isPastTrip(t)) return false;
    const startTs = tripInstant(t.startDate);
    return startTs != null && startTs > Date.now();
  }

  private assertTripAllowsLab(): boolean {
    if (!this.isSelectedTripPastForLab()) return true;
    this.feedbackErr =
      "This trip is already in the rearview mirror: open another one still active on the agenda to play with schedules.";
    return false;
  }

  loadTransports(): void {
    if (this.selectedTripId == null || this.selectedTripId === "") return;
    this.loadingTransports = true;
    this.transportationService.getTransportsByTripId(this.selectedTripId).subscribe({
      next: (rows) => {
        this.transports = rows || [];
        this.loadingTransports = false;
      },
      error: () => {
        this.transports = [];
        this.loadingTransports = false;
        this.feedbackErr = "Unable to load transports for this trip.";
      },
    });
  }

  refreshOverview(): void {
    this.loadingOverview = true;
    this.feedbackErr = null;
    this.automationService.getOverview().subscribe({
      next: (o) => {
        this.overview = o;
        this.loadingOverview = false;
      },
      error: () => {
        this.overview = null;
        this.loadingOverview = false;
        this.feedbackErr =
          "The summary could not be loaded. Check your connection, log in again, then try again.";
      },
    });
  }

  simulateTransportDelay(transportId: string, minutes: number): void {
    if (!this.assertTripAllowsLab()) return;
    this.busyTransportId = transportId;
    this.feedbackOk = null;
    this.feedbackErr = null;
    this.transportationService.applyTestingDelay(transportId, minutes).subscribe({
      next: () => {
        this.busyTransportId = null;
        this.feedbackOk = `Delay of ${minutes} minute(s) recorded. The activity schedule may automatically update shortly.`;
        this.loadTransports();
        this.refreshOverview();
      },
      error: () => {
        this.busyTransportId = null;
        this.feedbackErr = "Unable to record the delay. Please try again later.";
      },
    });
  }

  clearTransportDelay(transportId: string): void {
    if (!this.assertTripAllowsLab()) return;
    this.busyTransportId = transportId;
    this.feedbackOk = null;
    this.feedbackErr = null;
    this.transportationService.applyTestingDelay(transportId, 0).subscribe({
      next: () => {
        this.busyTransportId = null;
        this.feedbackOk = "Delay cancelled: the transport is considered available again.";
        this.loadTransports();
        this.refreshOverview();
      },
      error: () => {
        this.busyTransportId = null;
        this.feedbackErr = "Unable to cancel the delay.";
      },
    });
  }

  /** Heure de départ dans ~45 min pour tester les alertes avant départ. */
  setDepartureReminderWindow(transportId: string): void {
    if (!this.assertTripAllowsLab()) return;
    const iso = new Date(Date.now() + 45 * 60 * 1000).toISOString();
    this.busyTransportId = transportId;
    this.feedbackOk = null;
    this.feedbackErr = null;
    this.transportationService.applyTestingDelay(transportId, 0, iso).subscribe({
      next: () => {
        this.busyTransportId = null;
        this.feedbackOk =
          "A departure time in about 45 minutes has been recorded to test your pre-departure alerts.";
        this.loadTransports();
        this.refreshOverview();
      },
      error: () => {
        this.busyTransportId = null;
        this.feedbackErr = "Unable to set departure time.";
      },
    });
  }

  runManualReschedule(): void {
    if (this.selectedTripId == null || this.selectedTripId === "") return;
    if (!this.assertTripAllowsLab()) return;
    this.busyReschedule = true;
    this.feedbackOk = null;
    this.feedbackErr = null;
    const kw = this.manualKeyword?.trim() || undefined;
    this.tripService
      .rescheduleTripActivities(this.selectedTripId, this.manualShiftMinutes, kw)
      .subscribe({
        next: () => {
          this.busyReschedule = false;
          this.feedbackOk =
            kw
              ? `Activities containing "${kw}" have been shifted by ${this.manualShiftMinutes} minute(s).`
              : `All concerned activities have been shifted by ${this.manualShiftMinutes} minute(s).`;
          this.refreshOverview();
        },
        error: () => {
          this.busyReschedule = false;
          this.feedbackErr =
            "The shift could not be applied. Try again or check that your trip has an activity program.";
        },
      });
  }

  /** Libellés compréhensibles pour les états renvoyés par le serveur */
  transportStatusLabel(raw: string | undefined): string {
    if (raw == null || raw === "") return "Not specified";
    const key = String(raw).toUpperCase();
    const labels: Record<string, string> = {
      DELAYED: "Delayed",
      AVAILABLE: "Available",
      BOOKED: "Booked",
      RESERVED: "Reserved",
      IN_PROGRESS: "In progress",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
    };
    return labels[key] || raw;
  }

  friendlyMode(mode: string | undefined): string {
    if (mode == null || mode === "") return "transport";
    const m = String(mode).toUpperCase();
    const map: Record<string, string> = {
      CAR: "Car",
      BUS: "Bus",
      TRAIN: "Train",
      VAN: "Van / minibus",
      BOAT: "Boat",
      PLANE: "Plane",
    };
    return map[m] || String(mode).toLowerCase();
  }
}
