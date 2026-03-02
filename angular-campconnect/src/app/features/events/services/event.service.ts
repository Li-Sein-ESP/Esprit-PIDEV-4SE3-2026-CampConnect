import { Injectable, signal } from '@angular/core';
import { Event, EventRegistration } from '../models/event.model';

@Injectable({
    providedIn: 'root'
})
export class EventService {
    private events = signal<Event[]>([]);

    getMockEvents(): Event[] {
        return [
            {
                id: 'evt-1',
                title: 'Wilderness Survival Workshop',
                description: 'Learn essential survival skills from expert instructors',
                type: 'workshop',
                location: {
                    name: 'Mountain Training Center',
                    address: '123 Trail Rd, Boulder, CO',
                    coordinates: { lat: 40.0150, lng: -105.2705 }
                },
                startDate: '2024-08-15T09:00:00Z',
                endDate: '2024-08-15T17:00:00Z',
                duration: 8,
                organizer: {
                    id: 'org-1',
                    name: 'Outdoor Academy',
                    verified: true
                },
                capacity: 20,
                registered: 12,
                price: 150,
                difficulty: 'intermediate',
                tags: ['survival', 'skills', 'training'],
                imageUrl: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&q=80',
                status: 'upcoming'
            },
            {
                id: 'evt-2',
                title: 'Full Moon Camping Expedition',
                description: 'Experience the wilderness under the full moon',
                type: 'expedition',
                location: {
                    name: 'Joshua Tree National Park',
                    address: 'Joshua Tree, CA',
                    coordinates: { lat: 33.8734, lng: -115.9010 }
                },
                startDate: '2024-09-01T18:00:00Z',
                endDate: '2024-09-03T12:00:00Z',
                duration: 42,
                organizer: {
                    id: 'org-2',
                    name: 'Desert Explorers',
                    verified: true
                },
                capacity: 15,
                registered: 8,
                price: 250,
                difficulty: 'advanced',
                tags: ['camping', 'night-hiking', 'photography'],
                imageUrl: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&q=80',
                status: 'upcoming'
            }
        ];
    }

    registerForEvent(eventId: string, participants: number): EventRegistration {
        return {
            eventId,
            userId: 'current-user',
            registeredAt: new Date().toISOString(),
            status: 'confirmed',
            paymentStatus: 'paid',
            participants,
            totalAmount: 150 * participants
        };
    }
}
