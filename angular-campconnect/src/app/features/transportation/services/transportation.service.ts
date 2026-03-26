import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, map, catchError, of } from 'rxjs';
import { TransportRoute, VehicleRental } from '../models/transportation.model';
import { AuthService } from '../../../core/services/auth.service';

const API_URL = 'http://localhost:8080/api/transports';

@Injectable({
    providedIn: 'root'
})
export class TransportationService {
    private routesSignal = signal<TransportRoute[]>([]);

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

    getAllTransports(): Observable<any[]> {
        return this.http.get<any[]>(API_URL, this.getHttpOptions()).pipe(
            catchError(err => {
                console.error('Error fetching all transports', err);
                return of([]);
            })
        );
    }

    getTransportsByTrip(tripId: string): Observable<TransportRoute[]> {
        return this.http.get<any[]>(`${API_URL}/trip/${tripId}`, this.getHttpOptions()).pipe(
            map(data => data.map(t => this.mapToFrontend(t))),
            tap(routes => this.routesSignal.set(routes)),
            catchError(err => {
                console.error('Error fetching transports', err);
                return of([]);
            })
        );
    }

    createTransport(transport: any): Observable<TransportRoute> {
        return this.http.post<any>(API_URL, transport, this.getHttpOptions()).pipe(
            map(t => this.mapToFrontend(t)),
            tap(newRoute => {
                this.routesSignal.update(routes => [...routes, newRoute]);
            })
        );
    }

    updateTransport(id: string, transport: any): Observable<any> {
        return this.http.put<any>(`${API_URL}/${id}`, transport, this.getHttpOptions()).pipe(
            catchError(err => {
                console.error('Error updating transport', err);
                throw err;
            })
        );
    }

    deleteTransport(id: string): Observable<void> {
        return this.http.delete<void>(`${API_URL}/${id}`, this.getHttpOptions()).pipe(
            catchError(err => {
                console.error('Error deleting transport', err);
                throw err;
            })
        );
    }

    private mapToFrontend(t: any): TransportRoute {
        return {
            id: t.id,
            origin: { name: 'Origin', address: 'Origin', coordinates: { lat: 0, lng: 0 } },
            destination: { name: 'Destination', address: 'Destination', coordinates: { lat: 0, lng: 0 } },
            distance: 0,
            duration: t.duration,
            mode: t.mode.toLowerCase(),
            price: t.cost,
            provider: t.provider,
            imageUrl: t.imageUrl
        };
    }

    getMockRoutes(origin: string, destination: string): TransportRoute[] {
        return [
            { id: 'route-1', origin: { name: origin, address: origin, coordinates: { lat: 37.7749, lng: -122.4194 } }, destination: { name: destination, address: destination, coordinates: { lat: 37.8651, lng: -119.5383 } }, distance: 195, duration: 240, mode: 'car', price: 45 },
            { id: 'route-2', origin: { name: origin, address: origin, coordinates: { lat: 37.7749, lng: -122.4194 } }, destination: { name: destination, address: destination, coordinates: { lat: 37.8651, lng: -119.5383 } }, distance: 195, duration: 360, mode: 'bus', price: 25, provider: 'Greyhound' }
        ];
    }

    getMockVehicles(): VehicleRental[] {
        return [
            { id: 'vehicle-1', type: 'car', make: 'Toyota', model: 'RAV4', year: 2023, capacity: 5, pricePerDay: 65, features: ['AWD', 'Roof Rack', 'GPS'], imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80', available: true },
            { id: 'vehicle-2', type: 'rv', make: 'Winnebago', model: 'View', year: 2022, capacity: 4, pricePerDay: 200, features: ['Kitchen', 'Bathroom', 'Sleeps 4'], imageUrl: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=800&q=80', available: true }
        ];
    }
}
