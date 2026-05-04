import { Injectable } from '@angular/core';
<<<<<<< HEAD
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

const API_URL = 'http://localhost:8080/api/activities';
=======
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

const API_URL = `${environment.apiUrl}/activities`;
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)

@Injectable({
    providedIn: 'root'
})
export class ActivityService {
<<<<<<< HEAD
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
=======
    constructor(private http: HttpClient) { }

    getActivitiesByItinerary(itineraryId: string): Observable<any[]> {
        return this.http.get<any[]>(`${API_URL}/itinerary/${itineraryId}`);
    }

    createActivity(activity: any): Observable<any> {
        return this.http.post<any>(API_URL, activity);
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
    }
}
