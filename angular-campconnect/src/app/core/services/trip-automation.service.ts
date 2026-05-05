import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

export interface TripAutomationOverview {
  generatedAt: string;
  adminScope: boolean;
  schedulers: {
    smartReschedule: string;
    itineraryNotifications: string;
    tripStatusUpdates: string;
  };
  delayedTransports: Array<{
    transportId: string;
    tripId: string | null;
    tripTitle: string;
    delayMinutes: number;
    provider: string | null;
    mode: string | null;
  }>;
  upcomingReminders: {
    windowStart: string;
    windowEnd: string;
    activityCount: number;
    transportCount: number;
    activitySummaries: string[];
    transportSummaries: string[];
  };
  tripStatusEngine: {
    tripsEligiblePlannedToOngoing: number;
    tripsEligibleToCompleted: number;
  };
}

@Injectable({ providedIn: "root" })
export class TripAutomationService {
  private readonly url = `${environment.apiUrl}/trips/automation/overview`;

  constructor(private http: HttpClient) {}

  getOverview(): Observable<TripAutomationOverview> {
    return this.http.get<TripAutomationOverview>(this.url);
  }
}
