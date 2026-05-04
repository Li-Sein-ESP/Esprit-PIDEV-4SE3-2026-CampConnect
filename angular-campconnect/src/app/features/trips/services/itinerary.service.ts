import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

const API_URL = `${environment.apiUrl}/itineraries`;

@Injectable({
    providedIn: 'root'
})
export class ItineraryService {
    constructor(private http: HttpClient) { }

    getItinerariesByTrip(tripId: string): Observable<any[]> {
        return this.http.get<any[]>(`${API_URL}/trip/${tripId}`);
    }

    createItinerary(itinerary: any): Observable<any> {
        return this.http.post<any>(API_URL, itinerary);
    }
}
