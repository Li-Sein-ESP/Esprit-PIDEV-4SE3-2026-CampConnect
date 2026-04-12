import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay } from 'rxjs';

export interface Trip {
    id: string;
    name: string;
    destination: string;
    startDate: string;
    endDate: string;
    status: 'draft' | 'planned' | 'completed';
    image: string;
    groupSize: number;
    activities: string[];
    packingProgress: number;
    budgetSpent: number;
    budgetTotal: number;
}

@Injectable({
    providedIn: 'root'
})
export class TripService {
    private trips$ = new BehaviorSubject<Trip[]>(this.getMockTrips());

    getTrips(): Observable<Trip[]> {
        return this.trips$.asObservable();
    }

    getTripById(id: string): Observable<Trip | undefined> {
        return of(this.trips$.value.find(t => t.id === id)).pipe(delay(300));
    }

    createTrip(trip: Omit<Trip, 'id'>): Observable<Trip> {
        const newTrip: Trip = {
            ...trip,
            id: `trip-${Date.now()}`
        };
        const currentTrips = this.trips$.value;
        this.trips$.next([...currentTrips, newTrip]);
        return of(newTrip).pipe(delay(500));
    }

    updateTrip(id: string, updates: Partial<Trip>): Observable<Trip | undefined> {
        const currentTrips = this.trips$.value;
        const index = currentTrips.findIndex(t => t.id === id);

        if (index === -1) {
            return of(undefined);
        }

        const updatedTrip = { ...currentTrips[index], ...updates };
        const newTrips = [...currentTrips];
        newTrips[index] = updatedTrip;
        this.trips$.next(newTrips);

        return of(updatedTrip).pipe(delay(500));
    }

    deleteTrip(id: string): Observable<boolean> {
        const currentTrips = this.trips$.value;
        this.trips$.next(currentTrips.filter(t => t.id !== id));
        return of(true).pipe(delay(500));
    }

    private getMockTrips(): Trip[] {
        return [
            {
                id: 'trip-1',
                name: 'Yosemite Valley Adventure',
                destination: 'Yosemite National Park, CA',
                startDate: '2026-07-15',
                endDate: '2026-07-20',
                status: 'planned',
                image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
                groupSize: 4,
                activities: ['Hiking', 'Photography', 'Rock Climbing'],
                packingProgress: 65,
                budgetSpent: 450,
                budgetTotal: 800
            },
            {
                id: 'trip-2',
                name: 'Grand Canyon Expedition',
                destination: 'Grand Canyon, AZ',
                startDate: '2026-08-10',
                endDate: '2026-08-15',
                status: 'draft',
                image: 'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=800&q=80',
                groupSize: 6,
                activities: ['Hiking', 'Camping', 'Stargazing'],
                packingProgress: 20,
                budgetSpent: 0,
                budgetTotal: 1200
            },
            {
                id: 'trip-3',
                name: 'Yellowstone Wildlife Tour',
                destination: 'Yellowstone National Park, WY',
                startDate: '2026-06-01',
                endDate: '2026-06-05',
                status: 'completed',
                image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
                groupSize: 2,
                activities: ['Wildlife Watching', 'Photography', 'Hiking'],
                packingProgress: 100,
                budgetSpent: 650,
                budgetTotal: 600
            }
        ];
    }
}
