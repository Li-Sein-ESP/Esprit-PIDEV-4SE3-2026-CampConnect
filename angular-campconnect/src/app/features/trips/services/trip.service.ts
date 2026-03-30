import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Trip, TripBudget, PackingList } from '../models/trip.model';

@Injectable({
    providedIn: 'root'
})
export class TripService {
    private apiUrl = `${environment.apiUrl}/trips`;
    trips = signal<Trip[]>([]);

    constructor(private http: HttpClient) { }

    /**
     * Charger les voyages d'un utilisateur depuis l'API
     */
    loadUserTrips(userId: string): void {
        this.http.get<any[]>(`${this.apiUrl}/user/${userId}`).subscribe({
            next: (data) => {
                const mappedTrips: Trip[] = data.map(t => ({
                    id: t.id,
                    name: t.title || t.name,
                    description: t.description || '',
                    destination: typeof t.destination === 'string' ? t.destination : (t.destination?.address || 'Destination inconnue'),
                    startDate: t.startDate,
                    endDate: t.endDate,
                    duration: 0,
                    status: this.mapStatus(t.status),
                    participants: t.participants || 1,
                    createdBy: t.userId || t.creatorId,
                    createdAt: t.createdAt,
                    updatedAt: t.updatedAt,
                    imageUrl: t.imageUrl,
                    template: t.template
                }));
                this.trips.set(mappedTrips);
            },
            error: (err) => console.error('Failed to load trips', err)
        });
    }

    private mapStatus(status: any): 'planning' | 'upcoming' | 'active' | 'completed' | 'cancelled' {
        if (!status) return 'planning';
        const s = status.toString().toLowerCase();
        if (s === 'planned' || s === 'planning') return 'planning';
        if (s === 'ongoing' || s === 'active') return 'active';
        if (s === 'confirmed' || s === 'upcoming') return 'upcoming';
        if (s === 'completed' || s === 'finished') return 'completed';
        if (s === 'cancelled' || s === 'inactive') return 'cancelled';
        return 'planning';
    }

    createTrip(trip: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, trip);
    }

    /**
     * Récupérer un voyage par son ID
     */
    getTripById(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }

    /**
     * Get all trips for administrative management
     */
    getAllTripsAdmin(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }

    /**
     * Get all admin-provided template trips for the user to select
     */
    getAllTemplates(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/templates`);
    }

    /**
     * Update an existing trip
     */
    updateTrip(id: string, trip: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, trip);
    }

    /**
     * Delete a trip by ID
     */
    deleteTrip(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getMockBudget(tripId: string): TripBudget {
        return {
            tripId,
            categories: [
                {
                    name: 'Accommodation',
                    planned: 500,
                    actual: 450,
                    items: [
                        { description: 'Campsite fees', amount: 450, paid: true }
                    ]
                }
            ],
            total: 500,
            spent: 450,
            remaining: 50
        };
    }

    getMockPackingList(tripId: string): PackingList {
        return {
            tripId,
            categories: [
                {
                    name: 'Essentials',
                    items: [
                        { id: '1', name: 'Tent', quantity: 1, packed: false, essential: true }
                    ]
                }
            ]
        };
    }
}
