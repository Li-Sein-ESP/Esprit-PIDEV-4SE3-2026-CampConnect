import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, tap, map } from "rxjs";
import { environment } from "../../../../environments/environment";
import { Trip, TripBudget, PackingList } from "../models/trip.model";

@Injectable({
  providedIn: "root",
})
export class TripService {
  private apiUrl = `${environment.apiUrl}/trips`;
  trips = signal<Trip[]>([]);

  constructor(private http: HttpClient) {}

  /**
   * Charger les voyages d'un utilisateur depuis l'API
   */
  loadUserTrips(userId: string): void {
    this.http.get<any[]>(`${this.apiUrl}/user/${userId}`).subscribe({
      next: (data) => {
        console.log("Raw trips data from backend:", data);
        if (!data || !Array.isArray(data)) {
          console.error("Invalid trips data received:", data);
          this.trips.set([]);
          return;
        }
        const mappedTrips: Trip[] = data.map((t) => ({
          id: t.id || t._id,
          name: t.title || t.name || "Untitled Trip",
          description: t.description || "",
          destination:
            typeof t.destination === "string"
              ? t.destination
              : t.destination?.address || "Destination inconnue",
          startDate: t.startDate,
          endDate: t.endDate,
          duration: 0,
          status: this.mapStatus(t.status),
          participants: t.participants || 1,
          createdBy: t.userId || t.creatorId,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
          imageUrl: t.imageUrl,
          template: t.template,
        }));
        this.trips.set(mappedTrips);
      },
      error: (err) => console.error("Failed to load trips", err),
    });
  }

  private mapStatus(
    status: any,
  ): "planning" | "upcoming" | "active" | "completed" | "cancelled" {
    if (!status) return "planning";
    const s = status.toString().toLowerCase();
    if (s === "planned" || s === "planning") return "planning";
    if (s === "ongoing" || s === "active") return "active";
    if (s === "confirmed" || s === "upcoming") return "upcoming";
    if (s === "completed" || s === "finished" || s === "complted") return "completed";
    if (s === "cancelled" || s === "inactive") return "cancelled";
    return "planning";
  }

  createTrip(trip: any, userId?: string): Observable<any> {
    console.log("Creating trip for user:", userId, trip);
    // Normalize payload to satisfy backend TripDTO requirements
    const payload = {
      ...trip,
      title: (trip.title as any) || (trip.name as any) || "Untitled Trip",
      userId: userId || trip?.userId || trip?.createdBy || trip?.creatorId,
    };

    return this.http.post<any>(this.apiUrl, payload).pipe(
      tap((response) => {
        console.log("Trip created successfully, response:", response);

        // Build a mapped Trip for immediate optimistic display.
        const mapped: Trip = {
          id: response?.id || response?._id || trip?.id || `temp-${Date.now()}`,
          name:
            response?.title ||
            response?.name ||
            trip?.title ||
            trip?.name ||
            "Untitled Trip",
          description:
            response?.description || response?.notes || trip?.description || "",
          destination:
            typeof response?.destination === "string"
              ? response.destination
              : response?.destination?.address ||
                response?.destination?.name ||
                (typeof trip?.destination === "string"
                  ? trip.destination
                  : trip?.destination?.address) ||
                "Destination inconnue",
          startDate: response?.startDate || trip?.startDate || "",
          endDate: response?.endDate || trip?.endDate || "",
          duration: response?.duration || trip?.duration || 0,
          status: this.mapStatus(response?.status || trip?.status),
          participants: response?.participants || trip?.participants || 1,
          createdBy:
            response?.userId ||
            response?.createdBy ||
            response?.creatorId ||
            trip?.userId ||
            trip?.createdBy ||
            "",
          createdAt: response?.createdAt || new Date().toISOString(),
          updatedAt: response?.updatedAt || new Date().toISOString(),
          imageUrl: response?.imageUrl || trip?.imageUrl || "",
        } as Trip;

        // Optimistically insert the new trip so the user sees it immediately.
        this.trips.update((prev) => [mapped, ...prev]);

        // Try to reload the authoritative list from backend (give DB a moment to commit).
        const ownerId =
          userId ||
          response?.userId ||
          response?.createdBy ||
          response?.creatorId ||
          payload?.userId ||
          trip?.userId ||
          trip?.createdBy;
        if (ownerId) {
          setTimeout(() => this.loadUserTrips(ownerId), 600);
        }
      }),
    );
  }

  getTripById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getAllTripsAdmin(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((data) =>
        (data || []).map((t) => ({
          id: t.id || t._id,
          name: t.title || t.name || "Untitled Trip",
          description: t.description || "",
          destination:
            typeof t.destination === "string"
              ? t.destination
              : t.destination?.address ||
                t.destination?.name ||
                "Destination inconnue",
          startDate: t.startDate,
          endDate: t.endDate,
          duration: 0,
          status: this.mapStatus(t.status),
          participants: t.participants || 1,
          createdBy: t.userId || t.creatorId,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
          imageUrl: t.imageUrl,
          template: t.template,
        })),
      ),
    );
  }

  getAllTemplates(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/templates`).pipe(
      map((data) =>
        (data || []).map((t) => ({
          id: t.id || t._id,
          name: t.title || t.name || "Untitled Trip",
          description: t.description || "",
          destination:
            typeof t.destination === "string"
              ? t.destination
              : t.destination?.address ||
                t.destination?.name ||
                "Destination inconnue",
          startDate: t.startDate,
          endDate: t.endDate,
          duration: 0,
          status: this.mapStatus(t.status),
          participants: t.participants || 1,
          createdBy: t.userId || t.creatorId,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
          imageUrl: t.imageUrl,
          template: t.template,
        })),
      ),
    );
  }

  updateTrip(id: string, trip: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, trip);
  }

  deleteTrip(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        // remove from local signal so UI updates immediately
        this.trips.update((prev) => prev.filter((t) => t.id !== id));
      }),
    );
  }

  getFullItinerary(tripId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${tripId}/full-itinerary`);
  }

  /**
   * Recherche avancée (Keywords) sur Titre ou Destination
   */
  searchByKeywords(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search`, {
      params: { q: query },
    });
  }

  /**
   * Analytics: Statistiques par difficulté (Aggregation)
   */
  getDifficultyAnalytics(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/difficulty-stats`);
  }

  /**
   * Recherche avancée Multi-critères (Keywords + Difficulty)
   */
  advancedSearch(difficulty: string, address: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/advanced-search`, {
      params: { difficulty, address },
    });
  }

  /** Smart reschedule manuel : décale les activités du voyage (keywords optionnels). */
  rescheduleTripActivities(
    tripId: string,
    delayMinutes: number,
    keyword?: string,
  ): Observable<void> {
    let url = `${this.apiUrl}/${tripId}/reschedule?delay=${delayMinutes}`;
    if (keyword != null && keyword !== "") {
      url += `&keyword=${encodeURIComponent(keyword)}`;
    }
    return this.http.post<void>(url, {});
  }

  getMockBudget(tripId: string): TripBudget {
    return {
      tripId,
      categories: [
        {
          name: "Accommodation",
          planned: 500,
          actual: 450,
          items: [{ description: "Campsite fees", amount: 450, paid: true }],
        },
      ],
      total: 500,
      spent: 450,
      remaining: 50,
    };
  }

  getMockPackingList(tripId: string): PackingList {
    return {
      tripId,
      categories: [
        {
          name: "Essentials",
          items: [
            {
              id: "1",
              name: "Tent",
              quantity: 1,
              packed: false,
              essential: true,
            },
          ],
        },
      ],
    };
  }
}
