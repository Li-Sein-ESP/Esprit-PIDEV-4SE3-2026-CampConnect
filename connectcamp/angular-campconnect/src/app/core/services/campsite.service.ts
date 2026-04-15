import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export interface Campsite {
    id: string;
    name: string;
    location: string;
    description: string;
    price: number;
    rating: number;
    reviewCount: number;
    images: string[];
    amenities: string[];
    capacity: number;
    available: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class CampsiteService {
    private campsites: Campsite[] = this.getMockCampsites();

    getCampsites(filters?: { location?: string; minPrice?: number; maxPrice?: number }): Observable<Campsite[]> {
        let filtered = [...this.campsites];

        if (filters?.location) {
            filtered = filtered.filter(c =>
                c.location.toLowerCase().includes(filters.location!.toLowerCase())
            );
        }

        if (filters?.minPrice !== undefined) {
            filtered = filtered.filter(c => c.price >= filters.minPrice!);
        }

        if (filters?.maxPrice !== undefined) {
            filtered = filtered.filter(c => c.price <= filters.maxPrice!);
        }

        return of(filtered).pipe(delay(300));
    }

    getCampsiteById(id: string): Observable<Campsite | undefined> {
        return of(this.campsites.find(c => c.id === id)).pipe(delay(300));
    }

    searchCampsites(query: string): Observable<Campsite[]> {
        const results = this.campsites.filter(c =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.location.toLowerCase().includes(query.toLowerCase()) ||
            c.description.toLowerCase().includes(query.toLowerCase())
        );
        return of(results).pipe(delay(300));
    }

    private getMockCampsites(): Campsite[] {
        return [
            {
                id: 'site-1',
                name: 'Pine Valley Campground',
                location: 'Yosemite National Park, CA',
                description: 'Nestled among towering pines with stunning valley views',
                price: 45,
                rating: 4.8,
                reviewCount: 234,
                images: [
                    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
                    'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&q=80'
                ],
                amenities: ['Restrooms', 'Fire Pits', 'Picnic Tables', 'Water'],
                capacity: 6,
                available: true
            },
            {
                id: 'site-2',
                name: 'Riverside Retreat',
                location: 'Grand Canyon, AZ',
                description: 'Peaceful riverside camping with canyon views',
                price: 55,
                rating: 4.9,
                reviewCount: 189,
                images: [
                    'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&q=80'
                ],
                amenities: ['Restrooms', 'Showers', 'Fire Pits', 'Water', 'Electricity'],
                capacity: 8,
                available: true
            },
            {
                id: 'site-3',
                name: 'Mountain Peak Camp',
                location: 'Rocky Mountains, CO',
                description: 'High-altitude camping with breathtaking mountain vistas',
                price: 40,
                rating: 4.7,
                reviewCount: 156,
                images: [
                    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'
                ],
                amenities: ['Restrooms', 'Fire Pits', 'Picnic Tables'],
                capacity: 4,
                available: false
            }
        ];
    }
}
