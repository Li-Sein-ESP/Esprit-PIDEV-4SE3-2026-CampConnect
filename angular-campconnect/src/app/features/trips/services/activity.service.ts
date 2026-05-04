import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

const API_URL = `${environment.apiUrl}/activities`;

@Injectable({
    providedIn: 'root'
})
export class ActivityService {
    constructor(private http: HttpClient) { }

    getActivitiesByItinerary(itineraryId: string): Observable<any[]> {
        return this.http.get<any[]>(`${API_URL}/itinerary/${itineraryId}`);
    }

    createActivity(activity: any): Observable<any> {
        return this.http.post<any>(API_URL, activity);
    }
}
