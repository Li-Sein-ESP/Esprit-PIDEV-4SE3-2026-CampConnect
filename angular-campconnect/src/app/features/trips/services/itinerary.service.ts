import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

const API_URL = 'http://localhost:8080/api/itineraries';

@Injectable({
    providedIn: 'root'
})
export class ItineraryService {
    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

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

    getItinerariesByTrip(tripId: string): Observable<any[]> {
        return this.http.get<any[]>(`${API_URL}/trip/${tripId}`, this.getHttpOptions());
    }

    createItinerary(itinerary: any): Observable<any> {
        return this.http.post<any>(API_URL, itinerary, this.getHttpOptions());
    }
}
