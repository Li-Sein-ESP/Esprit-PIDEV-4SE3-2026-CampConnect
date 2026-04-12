import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

const API_URL = 'http://localhost:8080/api/activities';

@Injectable({
    providedIn: 'root'
})
export class ActivityService {
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

    getActivitiesByItinerary(itineraryId: string): Observable<any[]> {
        return this.http.get<any[]>(`${API_URL}/itinerary/${itineraryId}`, this.getHttpOptions());
    }

    createActivity(activity: any): Observable<any> {
        return this.http.post<any>(API_URL, activity, this.getHttpOptions());
    }
}
