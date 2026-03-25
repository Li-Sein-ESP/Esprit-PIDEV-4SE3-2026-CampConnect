import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export interface GearItem {
    id: string;
    name: string;
    category: string;
    description: string;
    rentPrice: number;
    buyPrice: number;
    rating: number;
    reviewCount: number;
    images: string[];
    specifications: Record<string, string>;
    available: boolean;
    inStock: number;
}

@Injectable({
    providedIn: 'root'
})
export class GearService {
    private gear: GearItem[] = this.getMockGear();

    getGear(filters?: { category?: string; maxPrice?: number }): Observable<GearItem[]> {
        let filtered = [...this.gear];

        if (filters?.category) {
            filtered = filtered.filter(g => g.category === filters.category);
        }

        if (filters?.maxPrice !== undefined) {
            filtered = filtered.filter(g => g.buyPrice <= filters.maxPrice!);
        }

        return of(filtered).pipe(delay(300));
    }

    getGearById(id: string): Observable<GearItem | undefined> {
        return of(this.gear.find(g => g.id === id)).pipe(delay(300));
    }

    searchGear(query: string): Observable<GearItem[]> {
        const results = this.gear.filter(g =>
            g.name.toLowerCase().includes(query.toLowerCase()) ||
            g.description.toLowerCase().includes(query.toLowerCase())
        );
        return of(results).pipe(delay(300));
    }

    getCategories(): string[] {
        return [...new Set(this.gear.map(g => g.category))];
    }

    private getMockGear(): GearItem[] {
        return [
            {
                id: 'gear-1',
                name: 'Alpine Pro 4-Season Tent',
                category: 'Tents',
                description: 'Professional-grade 4-season tent for extreme conditions',
                rentPrice: 45,
                buyPrice: 599,
                rating: 4.9,
                reviewCount: 234,
                images: [
                    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80'
                ],
                specifications: {
                    'Capacity': '2-3 Person',
                    'Weight': '5.2 lbs',
                    'Packed Size': '18" x 6"',
                    'Material': 'Ripstop Nylon'
                },
                available: true,
                inStock: 12
            },
            {
                id: 'gear-2',
                name: 'TrailBlazer 65L Backpack',
                category: 'Backpacks',
                description: 'Ergonomic hiking backpack with ventilated back panel',
                rentPrice: 25,
                buyPrice: 249,
                rating: 4.7,
                reviewCount: 189,
                images: [
                    'https://images.unsplash.com/photo-1622260614927-9d0fa8196f5f?w=600&q=80'
                ],
                specifications: {
                    'Capacity': '65 Liters',
                    'Weight': '3.8 lbs',
                    'Torso Fit': 'Adjustable',
                    'Material': 'Ripstop Polyester'
                },
                available: true,
                inStock: 8
            },
            {
                id: 'gear-3',
                name: 'Summit Down Sleeping Bag',
                category: 'Sleeping Bags',
                description: 'Lightweight down sleeping bag rated to 15°F',
                rentPrice: 30,
                buyPrice: 399,
                rating: 4.8,
                reviewCount: 156,
                images: [
                    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80'
                ],
                specifications: {
                    'Temperature Rating': '15°F',
                    'Fill': '800-Fill Down',
                    'Weight': '2.1 lbs',
                    'Length': 'Regular (6ft)'
                },
                available: true,
                inStock: 15
            }
        ];
    }
}
