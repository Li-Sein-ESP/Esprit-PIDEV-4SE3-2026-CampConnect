import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Trip {
    id: string;
    name?: string;
    destination: string;
    startDate: string;
    endDate: string;
    difficulty: string;
    notes?: string;
    groupId?: string;
}

@Injectable({
    providedIn: 'root'
})
export class TripService {
    private apiUrl = 'http://localhost:8081/api/trips';

    constructor(private http: HttpClient) { }

    getTrips(): Observable<Trip[]> {
        return this.http.get<Trip[]>(this.apiUrl);
    }

    getTripById(id: string): Observable<Trip> {
        return this.http.get<Trip>(`${this.apiUrl}/${id}`);
    }

    saveTrip(trip: Trip): Observable<Trip> {
        return this.http.post<Trip>(this.apiUrl, trip);
    }

    updateTrip(id: string, updates: Partial<Trip>): Observable<Trip> {
        return this.http.put<Trip>(`${this.apiUrl}/${id}`, updates);
    }

    deleteTrip(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
