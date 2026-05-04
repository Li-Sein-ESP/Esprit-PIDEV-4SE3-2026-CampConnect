import { Injectable } from '@angular/core';
<<<<<<< HEAD
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

const API_URL = 'http://localhost:8080/api/pointofinterests';
=======
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

const API_URL = `${environment.apiUrl}/pointofinterests`;
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)

export interface PointOfInterest {
    id: string;
    name: string;
    description: string;
    location: {
        name: string;
        address: string;
    };
    category: string;
    rating: number;
    hours: string;
    image: string;
    distance?: string;
    driveTime?: string;
    priceLevel?: string;
    isFavorite?: boolean;
    isAddedToTrip?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class PoiService {
    constructor(private http: HttpClient) { }

<<<<<<< HEAD
    private getHttpOptions() {
        const token = localStorage.getItem('token');
        return {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            })
        };
    }

    getAll(): Observable<PointOfInterest[]> {
        return this.http.get<any[]>(API_URL, this.getHttpOptions()).pipe(
=======
    getAll(): Observable<PointOfInterest[]> {
        return this.http.get<any[]>(API_URL).pipe(
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
            map(items => items.map(item => this.mapToFrontend(item)))
        );
    }

    getByItineraryId(itineraryId: string): Observable<PointOfInterest[]> {
<<<<<<< HEAD
        return this.http.get<any[]>(`${API_URL}/itinerary/${itineraryId}`, this.getHttpOptions()).pipe(
=======
        return this.http.get<any[]>(`${API_URL}/itinerary/${itineraryId}`).pipe(
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
            map(items => items.map(item => this.mapToFrontend(item)))
        );
    }

    create(poi: any): Observable<PointOfInterest> {
<<<<<<< HEAD
        return this.http.post<any>(API_URL, poi, this.getHttpOptions()).pipe(
=======
        return this.http.post<any>(API_URL, poi).pipe(
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
            map(item => this.mapToFrontend(item))
        );
    }

    private mapToFrontend(item: any): PointOfInterest {
        return {
            id: item.id,
            name: item.name,
            description: item.description,
            location: item.location || { name: 'Unknown', address: 'Unknown' },
            category: item.category || 'General',
            rating: item.rating || 4.5,
            hours: item.hours || 'Open 24 hours',
            image: item.image || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80',
            distance: 'Unknown distance',
            driveTime: 'Unknown',
            priceLevel: '$$',
            isFavorite: false,
            isAddedToTrip: false
        };
    }
}
