import { Injectable, signal } from '@angular/core';
import { Trip, TripBudget, PackingList, TripItinerary } from '../models/trip.model';

@Injectable({
    providedIn: 'root'
})
export class TripService {
    private trips = signal<Trip[]>([]);

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

    createTrip(trip: Partial<Trip>): Trip {
        const newTrip: Trip = {
            id: 'trip-' + Math.random().toString(36).substr(2, 9),
            name: trip.name || '',
            description: trip.description || '',
            destination: trip.destination || '',
            startDate: trip.startDate || '',
            endDate: trip.endDate || '',
            duration: trip.duration || 1,
            status: 'planning',
            participants: trip.participants || 1,
            createdBy: 'current-user',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.trips.update(trips => [...trips, newTrip]);
        return newTrip;
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
