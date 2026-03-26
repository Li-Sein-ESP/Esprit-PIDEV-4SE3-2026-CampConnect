import { Injectable, signal, Injector } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, map, catchError, of, switchMap } from 'rxjs';
import { Trip, TripBudget, PackingList, TripItinerary } from '../models/trip.model';
import { AuthService } from '../../../core/services/auth.service';

const API_URL = 'http://localhost:8080/api/trips';

@Injectable({
    providedIn: 'root'
})
export class TripService {
    private tripsSignal = signal<Trip[]>([]);

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private injector: Injector
    ) {
        // Automatically fetch/refresh trips when user logs in or out
        this.authService.getCurrentUser().subscribe(user => {
            if (user) {
                this.fetchTrips(user.id);
            } else {
                this.tripsSignal.set([]);
            }
        });
    }

    private getHttpOptions() {
        const token = this.authService.getToken();
        if (token) {
            return {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                })
            };
        }
        return {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' })
        };
    }

    private fetchTrips(userId?: string): void {
        const url = userId ? `${API_URL}/user/${userId}` : API_URL;
        this.http.get<any[]>(url, this.getHttpOptions()).pipe(
            map(data => Array.isArray(data) ? data.map(t => this.mapToFrontend(t)) : []),
            tap(trips => this.tripsSignal.set(trips)),
            catchError(err => {
                console.error('Error fetching trips', err);
                return of([]);
            })
        ).subscribe();
    }

    getTrips(): Trip[] {
        return this.tripsSignal();
    }

    getTripsObservable(): Observable<Trip[]> {
        return toObservable(this.tripsSignal, { injector: this.injector });
    }

    getTripById(id: string | number): Observable<Trip> {
        return this.http.get<any>(`${API_URL}/${id}`, this.getHttpOptions()).pipe(
            map(t => this.mapToFrontend(t)),
            catchError(err => {
                console.error('TripService: Error in getTripById:', err);
                throw err;
            })
        );
    }

    getAllTripsAdmin(): Observable<Trip[]> {
        return this.http.get<any[]>(API_URL, this.getHttpOptions()).pipe(
            map(data => Array.isArray(data) ? data.map(t => this.mapToFrontend(t)) : []),
            catchError(err => {
                console.error('Error fetching all trips for admin', err);
                return of([]);
            })
        );
    }

    getTemplateTrips(): Observable<Trip[]> {
        return this.http.get<any[]>(`${API_URL}/templates`, this.getHttpOptions()).pipe(
            map(data => Array.isArray(data) ? data.map(t => this.mapToFrontend(t)) : []),
            catchError(err => {
                console.error('Error fetching template trips', err);
                return of([]);
            })
        );
    }

    createTrip(trip: any): Observable<Trip> {
        const backendTrip = this.mapToBackend(trip);

        // Use AuthService to get current user ID
        const user = this.authService.getUserValue();
        if (user) {
            backendTrip.userId = user.id;
        }

        if (!backendTrip.userId) {
            alert('You must be logged in to create a trip.');
            throw new Error('No userId');
        }

        return this.http.post<any>(API_URL, backendTrip, this.getHttpOptions()).pipe(
            map(t => this.mapToFrontend(t)),
            tap(newTrip => {
                this.tripsSignal.update(trips => [...trips, newTrip]);
            }),
            catchError(err => {
                console.error('Trip creation failed', err);
                // Show validation details if available (backend returns map of field -> message)
                const errorBody = err.error;
                let message = 'Server error';
                if (errorBody && typeof errorBody === 'object') {
                    const details = Object.entries(errorBody)
                        .map(([field, msg]) => `${field}: ${msg}`)
                        .join('\n');
                    message = details || errorBody.message || 'Server error';
                } else if (typeof errorBody === 'string') {
                    message = errorBody;
                }
                alert('Trip creation failed:\n' + message);
                throw err;
            })
        );
    }

    updateTrip(id: string, trip: any): Observable<Trip> {
        const backendTrip = this.mapToBackend(trip);
        return this.http.put<any>(`${API_URL}/${id}`, backendTrip, this.getHttpOptions()).pipe(
            map(t => this.mapToFrontend(t)),
            tap(updatedTrip => {
                this.tripsSignal.update(trips =>
                    trips.map(t => t.id === id ? updatedTrip : t)
                );
            })
        );
    }

    deleteTrip(id: string): Observable<any> {
        return this.http.delete(`${API_URL}/${id}`, this.getHttpOptions()).pipe(
            tap(() => {
                this.tripsSignal.update(trips => trips.filter(t => t.id !== id));
            })
        );
    }

    private mapToFrontend(t: any): Trip {
        if (!t) {
            console.error('TripService: Received null/undefined trip from backend');
            throw new Error('Null trip data');
        }

        // Handle destination which can be a string or a LocationPoint object
        let destName = 'Custom Location';
        if (t.destination) {
            if (typeof t.destination === 'string') {
                destName = t.destination;
            } else if (t.destination.address) {
                destName = t.destination.address;
            } else if (t.destination.name) {
                destName = t.destination.name;
            }
        }

        return {
            id: t.id || '',
            name: t.title || 'Unnamed Trip',
            description: t.description || '',
            destination: destName,
            startDate: t.startDate || new Date().toISOString(),
            endDate: t.endDate || t.startDate || new Date().toISOString(),
            duration: this.calculateDuration(t.startDate, t.endDate),
            status: this.mapStatusToFrontend(t.status),
            adventureLevel: t.difficulty?.toLowerCase() || 'moderate',
            participants: t.participants || 1,
            comfortLevel: t.comfortLevel || 'comfortable',
            activities: t.activities || [],
            createdBy: t.userId || '',
            createdAt: t.createdAt || t.startDate || new Date().toISOString(),
            updatedAt: t.updatedAt || new Date().toISOString(),
            imageUrl: t.imageUrl || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=80',
            itineraryDays: (t.itineraryIds && Array.isArray(t.itineraryIds)) ? t.itineraryIds.length : 0,
            packingItems: t.packingItems || { total: 0, packed: 0 },
            budget: {
                estimated: t.totalBudget || 0,
                actual: t.totalBudget || 0
            },
            nearbyPlaces: t.nearbyPlacesCount || 0,
            transportIds: t.transportIds || [],
            isTemplate: t.template || t.isTemplate || false
        } as any;
    }

    private mapToBackend(t: any): any {
        // Map difficulty level
        let difficulty = 'MODERATE';
        const level = (t.adventureLevel || '').toLowerCase();
        if (level === 'easy') difficulty = 'EASY';
        else if (level === 'beginner') difficulty = 'BEGINNER';
        else if (level === 'challenging' || level === 'hard') difficulty = 'HARD';
        else if (level === 'expert') difficulty = 'EXPERT';

        // Ensure required dates are always valid ISO strings
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 86400000);
        let startDate: string;
        let endDate: string;
        try {
            startDate = t.startDate ? new Date(t.startDate).toISOString() : now.toISOString();
        } catch { startDate = now.toISOString(); }
        try {
            endDate = t.endDate ? new Date(t.endDate).toISOString() : tomorrow.toISOString();
        } catch { endDate = tomorrow.toISOString(); }

        return {
            id: t.id,
            title: t.name || t.title || 'My Trip',
            description: t.description || '',
            destination: { latitude: 0, longitude: 0, address: t.destination || 'Unknown' },
            startDate,
            endDate,
            difficulty,
            totalBudget: t.budget?.estimated ?? t.totalBudget ?? 0,
            status: this.mapStatusToBackend(t.status) || 'PLANNED',
            participants: t.participants || 1,
            comfortLevel: t.comfortLevel || 'comfortable',
            activities: t.activities || [],
            imageUrl: t.imageUrl || null,
            template: t.isTemplate || false,
            userId: t.createdBy || t.userId
        };
    }

    private calculateDuration(start: string, end: string): number {
        if (!start || !end) return 1;
        const d1 = new Date(start);
        const d2 = new Date(end);
        const diffTime = Math.abs(d2.getTime() - d1.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    private mapStatusToFrontend(status: string): any {
        const s = status?.toLowerCase();
        if (s === 'planned') return 'planning';
        if (s === 'ongoing') return 'active';
        return s || 'planning';
    }

    private mapStatusToBackend(status: string): string {
        const s = status?.toLowerCase();
        if (s === 'planning') return 'PLANNED';
        if (s === 'active') return 'ONGOING';
        return status?.toUpperCase() || 'PLANNED';
    }

    updateTripTransportation(tripId: string, transportation: any): void {
        // This is a partial update, we can use PUT or a specific association endpoint
        // For now, let's update the local signal and potentially notify the backend
        this.tripsSignal.update(trips =>
            trips.map(t => t.id === tripId ? { 
                ...t, 
                transportation, 
                transportIds: [...(t.transportIds || []), transportation.id],
                updatedAt: new Date().toISOString() 
            } : t)
        );

        // Backend update (if needed, assuming PUT /api/trips/{id} handles it or there's a specific association)
        // Since we have specific association endpoints now:
        // /api/trips/{tripId}/assign-transport/{transportId}
        if (transportation.id) {
            this.http.post(`${API_URL}/${tripId}/assign-transport/${transportation.id}`, {}, this.getHttpOptions()).subscribe();
        }
    }

    updateNearbyPlacesCount(tripId: string, count: number): void {
        this.tripsSignal.update(trips =>
            trips.map(t => t.id === tripId ? { ...t, nearbyPlaces: count } : t)
        );
    }
    getMockBudget(tripId: string): TripBudget {
        return {
            tripId,
            categories: [
                { name: 'Accommodation', planned: 500, actual: 450, items: [{ description: 'Campsite fees', amount: 450, paid: true }] },
                { name: 'Food', planned: 300, actual: 0, items: [] }
            ],
            total: 800, spent: 450, remaining: 350
        };
    }

    getMockPackingList(tripId: string): PackingList {
        return {
            tripId,
            categories: [
                { name: 'Shelter', items: [{ id: '1', name: 'Tent', quantity: 1, packed: false, essential: true }, { id: '2', name: 'Sleeping bag', quantity: 4, packed: false, essential: true }] },
                { name: 'Cooking', items: [{ id: '3', name: 'Camp stove', quantity: 1, packed: false, essential: true }, { id: '4', name: 'Cookware set', quantity: 1, packed: false, essential: false }] }
            ]
        };
    }
}
