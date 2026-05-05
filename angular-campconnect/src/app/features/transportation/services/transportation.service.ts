import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TransportRoute, VehicleRental } from '../models/transportation.model';

@Injectable({
    providedIn: 'root'
})
export class TransportationService {
    private apiUrl = `${environment.apiUrl}/transports`;
    private routes = signal<TransportRoute[]>([]);

    constructor(private http: HttpClient) { }

    /**
     * Get all transports for administration
     */
    getAllTransports(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }

    getTransportById(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }

    /**
     * Create a new transport option
     */
    createTransport(payload: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, payload);
    }

    /**
     * Update an existing transport option
     */
    updateTransport(id: string, payload: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, payload);
    }

    /**
     * Delete a transport option
     */
    deleteTransport(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getMockRoutes(origin: string, destination: string): TransportRoute[] {
        return [
            {
                id: 'route-1',
                origin: {
                    name: origin,
                    address: origin,
                    coordinates: { lat: 37.7749, lng: -122.4194 }
                },
                destination: {
                    name: destination,
                    address: destination,
                    coordinates: { lat: 37.8651, lng: -119.5383 }
                },
                distance: 195,
                duration: 240,
                mode: 'car',
                price: 45
            },
            {
                id: 'route-2',
                origin: {
                    name: origin,
                    address: origin,
                    coordinates: { lat: 37.7749, lng: -122.4194 }
                },
                destination: {
                    name: destination,
                    address: destination,
                    coordinates: { lat: 37.8651, lng: -119.5383 }
                },
                distance: 195,
                duration: 360,
                mode: 'bus',
                price: 25,
                provider: 'Greyhound'
            }
        ];
    }

    getMockVehicles(): VehicleRental[] {
        return [
            {
                id: 'vehicle-1',
                type: 'car',
                make: 'Toyota',
                model: 'RAV4',
                year: 2023,
                capacity: 5,
                pricePerDay: 65,
                features: ['AWD', 'Roof Rack', 'GPS'],
                imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80',
                available: true
            },
            {
                id: 'vehicle-2',
                type: 'rv',
                make: 'Winnebago',
                model: 'View',
                year: 2022,
                capacity: 4,
                pricePerDay: 200,
                features: ['Kitchen', 'Bathroom', 'Sleeps 4'],
                imageUrl: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=800&q=80',
                available: true
            }
        ];
    }

    /**
     * Obtenir les statistiques de popularité des transports (JPQL/Aggregation Analytics)
     */
    getPopularity(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/popularity-stats`);
    }

    getTransportsByTripId(tripId: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/trip/${tripId}`);
    }

    /** Lab : simule un retard (scheduler Smart Reschedule) ou réinitialise si delayMinutes ≤ 0. */
    applyTestingDelay(
        transportId: string,
        delayMinutes: number,
        departureTimeIso?: string | null,
    ): Observable<any> {
        const body: Record<string, unknown> = { delayMinutes };
        if (departureTimeIso) {
            body['departureTime'] = departureTimeIso;
        }
        return this.http.patch<any>(`${this.apiUrl}/${transportId}/testing/delay`, body);
    }
}
