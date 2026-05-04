import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

const API_URL = `${environment.apiUrl}/pointofinterests`;

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

    getAll(): Observable<PointOfInterest[]> {
        return this.http.get<any[]>(API_URL).pipe(
            map(items => items.map(item => this.mapToFrontend(item)))
        );
    }

    getByItineraryId(itineraryId: string): Observable<PointOfInterest[]> {
        return this.http.get<any[]>(`${API_URL}/itinerary/${itineraryId}`).pipe(
            map(items => items.map(item => this.mapToFrontend(item)))
        );
    }

    create(poi: any): Observable<PointOfInterest> {
        return this.http.post<any>(API_URL, poi).pipe(
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
