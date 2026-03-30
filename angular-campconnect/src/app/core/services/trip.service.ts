import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Trip {
    id: string;
    title: string;
    destination: any;
    startDate: string;
    endDate: string;
    status: string;
    participants: number;
    userId: string;
    budgetSpent?: number;
    totalBudget?: number;
}

@Injectable({
    providedIn: 'root'
})
export class TripService {
    private apiUrl = `${environment.apiUrl}/trips`;
    trips = signal<Trip[]>([]);

    constructor(private http: HttpClient) { }

    loadUserTrips(userId: string): void {
        this.http.get<any[]>(`${this.apiUrl}/user/${userId}`).subscribe({
            next: (data) => {
                this.trips.set(data.map(t => ({
                    id: t.id,
                    title: t.title || t.name,
                    destination: t.destination,
                    startDate: t.startDate,
                    endDate: t.endDate,
                    status: t.status,
                    participants: t.participants || 1,
                    userId: t.userId
                })));
            },
            error: (err) => console.error('Failed to load trips', err)
        });
    }

    getTrips(): Observable<Trip[]> {
        return this.http.get<Trip[]>(this.apiUrl);
    }

    getTripById(id: string): Observable<Trip> {
        return this.http.get<Trip>(`${this.apiUrl}/${id}`);
    }

    createTrip(trip: any): Observable<Trip> {
        return this.http.post<Trip>(this.apiUrl, trip);
    }

    updateTrip(id: string, updates: Partial<Trip>): Observable<Trip> {
        return this.http.put<Trip>(`${this.apiUrl}/${id}`, updates);
    }

    deleteTrip(id: string): Observable<boolean> {
        return new Observable(subscriber => {
            this.http.delete(`${this.apiUrl}/${id}`).subscribe({
                next: () => {
                    subscriber.next(true);
                    subscriber.complete();
                },
                error: () => {
                    subscriber.next(false);
                    subscriber.complete();
                }
            });
        });
    }
}
