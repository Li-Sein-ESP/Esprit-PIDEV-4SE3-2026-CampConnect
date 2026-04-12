import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TransportRoute, VehicleRental } from '../models/transportation.model';

export interface TransportDTO {
    id?: string;
    tripId?: string | null;
    mode: string;
    provider: string;
    duration: number;
    cost: number;
    imageUrl?: string;
}

@Injectable({
    providedIn: 'root'
})
export class TransportationService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8080/api/transports';
    private routes = signal<TransportRoute[]>([]);

    // ============ CRUD Operations for Admin ============

    getAllTransports(): Observable<TransportDTO[]> {
        return this.http.get<TransportDTO[]>(this.apiUrl);
    }

    getTransportById(id: string): Observable<TransportDTO> {
        return this.http.get<TransportDTO>(`${this.apiUrl}/${id}`);
    }

    createTransport(transport: Omit<TransportDTO, 'id'>): Observable<TransportDTO> {
        return this.http.post<TransportDTO>(this.apiUrl, transport);
    }

    updateTransport(id: string, transport: Omit<TransportDTO, 'id'>): Observable<TransportDTO> {
        return this.http.put<TransportDTO>(`${this.apiUrl}/${id}`, transport);
    }

    deleteTransport(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getTransportsByTrip(tripId: string): Observable<TransportDTO[]> {
        return this.http.get<TransportDTO[]>(`${this.apiUrl}/trip/${tripId}`);
    }

    // ============ Mock Data for UI Development ============

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
}
