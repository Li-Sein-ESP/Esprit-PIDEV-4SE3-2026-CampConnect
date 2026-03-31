import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Trip, TripBudget, PackingList } from '../models/trip.model';

@Injectable({
    providedIn: 'root'
})
export class TripService {
    private readonly apiUrl = `${environment.apiUrl}/trips`;

    // Local signal for in-session trip management (non-admin pages)
    trips = signal<Trip[]>(this.getMockTrips());

    constructor(private http: HttpClient) { }

    /** Admin: fetch all trips from the backend */
    getAllTripsAdmin(): Observable<Trip[]> {
        return this.http.get<Trip[]>(this.apiUrl);
    }

    /** Admin: delete a trip by ID */
    deleteTrip(tripId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${tripId}`);
    }

    /** Create a new trip (POST to backend) */
    createTrip(trip: Partial<Trip> & Record<string, any>): Observable<Trip> {
        return this.http.post<Trip>(this.apiUrl, trip);
    }

    getMockTrips(): Trip[] {
        return [
            {
                id: 'trip-1',
                name: 'Yosemite Summer Adventure',
                description: 'Week-long camping trip in Yosemite',
                destination: 'Yosemite National Park, CA',
                startDate: '2024-07-15',
                endDate: '2024-07-22',
                duration: 7,
                status: 'planning',
                participants: 4,
                createdBy: 'user-1',
                createdAt: '2024-06-01T10:00:00Z',
                updatedAt: '2024-06-15T14:30:00Z'
            }
        ];
    }

    getMockBudget(tripId: string): TripBudget {
        return {
            tripId,
            categories: [
                {
                    name: 'Accommodation',
                    planned: 500,
                    actual: 450,
                    items: [
                        { description: 'Campsite fees', amount: 450, paid: true }
                    ]
                },
                {
                    name: 'Food',
                    planned: 300,
                    actual: 0,
                    items: []
                }
            ],
            total: 800,
            spent: 450,
            remaining: 350
        };
    }

    getMockPackingList(tripId: string): PackingList {
        return {
            tripId,
            categories: [
                {
                    name: 'Shelter',
                    items: [
                        { id: '1', name: 'Tent', quantity: 1, packed: false, essential: true },
                        { id: '2', name: 'Sleeping bag', quantity: 4, packed: false, essential: true }
                    ]
                },
                {
                    name: 'Cooking',
                    items: [
                        { id: '3', name: 'Camp stove', quantity: 1, packed: false, essential: true },
                        { id: '4', name: 'Cookware set', quantity: 1, packed: false, essential: false }
                    ]
                }
            ]
        };
    }
}
