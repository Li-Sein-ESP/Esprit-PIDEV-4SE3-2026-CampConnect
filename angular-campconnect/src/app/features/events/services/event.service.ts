import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Event, EventRegistration } from '../models/event.model';
import { environment } from '../../../../environments/environment';

const API_URL = `${environment.apiUrl}/events`;
const AI_URL = `http://localhost:5000/api/ai`;

@Injectable({
    providedIn: 'root'
})
export class EventService {
    private mockEvents: any[] = [
        {
            id: 'evt-1',
            title: 'Survival Skills: Master the Fire',
            description: 'Learn the ancient art of friction fire making, water purification techniques, and emergency shelter building. A core workshop for every adventurer.',
            type: 'workshop',
            location: { name: 'Atlas Mountains, Morocco', address: 'Base Camp Alpha' },
            startDate: '2026-06-15T09:00:00',
            endDate: '2026-06-16T17:00:00',
            duration: 32,
            organizer: { id: 'org-1', name: 'Survival Pro Academy', verified: true },
            capacity: 12,
            registered: 8,
            price: 120,
            difficulty: 'moderate',
            tags: ['Survival', 'Fire', 'Skills', 'Safety'],
            imageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
            status: 'upcoming',
            categoryName: 'Workshops',
        },
        {
            id: 'evt-2',
            title: 'Summit Expedition: Mont Toubkal',
            description: 'An intensive 3-day trek to reach the highest peak in North Africa. Requires physical preparation and hiking boots. Breathtaking views at the summit.',
            type: 'expedition',
            location: { name: 'Toubkal National Park', address: 'Imlil Valley' },
            startDate: '2026-07-20T06:00:00',
            endDate: '2026-07-23T18:00:00',
            duration: 72,
            organizer: { id: 'org-2', name: 'Peak Climbers', verified: true },
            capacity: 8,
            registered: 4,
            price: 350,
            difficulty: 'advanced',
            tags: ['Hiking', 'Mountain', 'Expedition', 'Trek'],
            imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
            status: 'upcoming',
            categoryName: 'Expeditions',
        },
        {
            id: 'evt-3',
            title: 'Lakeside Family Camping Retreat',
            description: 'Relax with your family by the lake. Activities include canoeing, campfire stories, and star gazing. Perfect for beginners and children.',
            type: 'group-camp',
            location: { name: 'Bin El Ouidane', address: 'West Shore' },
            startDate: '2026-08-10T14:00:00',
            endDate: '2026-08-12T12:00:00',
            duration: 46,
            organizer: { id: 'org-3', name: 'Happy Campers', verified: true },
            capacity: 25,
            registered: 15,
            price: 80,
            difficulty: 'beginner',
            tags: ['Family', 'Water', 'Camping', 'Relax'],
            imageUrl: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800',
            status: 'upcoming',
            categoryName: 'Group Camps',
        },
        {
            id: 'evt-4',
            title: 'Nature Yoga & Mindfulness',
            description: 'Connect with the forest through deep meditation and yoga sessions under the green canopy. Organic meals included. A quiet escape from city life.',
            type: 'retreat',
            location: { name: 'Cedar Forest', address: 'Silent Glade' },
            startDate: '2026-05-22T08:00:00',
            endDate: '2026-05-24T16:00:00',
            duration: 56,
            organizer: { id: 'org-4', name: 'Zen Wilderness', verified: true },
            capacity: 15,
            registered: 12,
            price: 180,
            difficulty: 'all-levels',
            tags: ['Yoga', 'Nature', 'Wellness', 'Forest'],
            imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
            status: 'upcoming',
            categoryName: 'Retreats',
        },
        {
            id: 'evt-5',
            title: 'Night Sky Photography Camp',
            description: 'Learn how to capture the Milky Way and the beauty of the stars. Professional photography workshop in a dark sky location.',
            type: 'workshop',
            location: { name: 'Agafay Desert', address: 'Mars Camp' },
            startDate: '2026-09-05T18:00:00',
            endDate: '2026-09-06T09:00:00',
            duration: 15,
            organizer: { id: 'org-5', name: 'Desert Rangers', verified: true },
            capacity: 10,
            registered: 6,
            price: 150,
            difficulty: 'moderate',
            tags: ['Photography', 'Stars', 'Night', 'Desert'],
            imageUrl: 'https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=800',
            status: 'upcoming',
            categoryName: 'Workshops',
        },
        {
            id: 'evt-6',
            title: 'River Kayaking Adventure',
            description: 'Experience the thrill of river navigation. We teach you safety, paddling, and rescue skills. Prepare to get wet!',
            type: 'guided-hike',
            location: { name: 'Oum Er-Rbia River', address: 'Khenifra' },
            startDate: '2026-04-12T09:00:00',
            endDate: '2026-04-12T18:00:00',
            duration: 9,
            organizer: { id: 'org-6', name: 'Water Explorers', verified: true },
            capacity: 10,
            registered: 9,
            price: 65,
            difficulty: 'moderate',
            tags: ['Water', 'Kayak', 'Adventure', 'River'],
            imageUrl: 'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=800',
            status: 'upcoming',
            categoryName: 'Guided Hikes',
        }
    ];

    constructor(private http: HttpClient) { }

    getEvents(): Observable<Event[]> {
        return this.http.get<Event[]>(API_URL).pipe(
            map(events => events.map(e => ({
                ...e,
                type: (e.type?.toLowerCase().replace(/_/g, '-') as any),
                difficulty: (e.difficulty?.toLowerCase() as any),
                status: (e.status?.toLowerCase() as any)
            } as Event))),
            catchError(err => {
                console.warn('EventService: Using mock data due to error', err);
                return of(this.mockEvents as any as Event[]);
            })
        );
    }

    getEventById(id: string): Observable<Event | undefined> {
        return this.http.get<Event>(`${API_URL}/${id}`).pipe(
            map(e => ({
                ...e,
                type: (e.type?.toLowerCase().replace(/_/g, '-') as any),
                difficulty: (e.difficulty?.toLowerCase() as any),
                status: (e.status?.toLowerCase() as any)
            } as Event)),
            catchError(err => {
                const mock = this.mockEvents.find(e => e.id === id);
                if (mock) {
                    return of(mock as any as Event);
                }
                return throwError(() => err);
            })
        );
    }

    createEvent(event: Event): Observable<Event> {
        return this.http.post<Event>(API_URL, event);
    }

    updateEvent(id: string, event: Event): Observable<Event> {
        return this.http.put<Event>(`${API_URL}/${id}`, event);
    }

    deleteEvent(id: string): Observable<void> {
        return this.http.delete<void>(`${API_URL}/${id}`);
    }

    registerForEvent(eventId: string, participants: number, userId: string): Observable<EventRegistration> {
        return this.http.post<EventRegistration>(`${API_URL}/${eventId}/register`, { eventId, participants, userId, status: 'CONFIRMED' });
    }

    /**
     * TÂCHE IA : Smart Pricing Predictor
     */
    predictAiPopularity(categoryId: number, capacity: number, durationDays: number, difficulty: string, season: string): Observable<any> {
        let params = new HttpParams()
            .set('categoryId', categoryId.toString())
            .set('capacity', capacity.toString())
            .set('durationDays', durationDays.toString())
            .set('difficulty', difficulty)
            .set('season', season);
            
        return this.http.get<any>(`${API_URL}/ai-popularity-predict`, { params });
    }

    /**
     * TÂCHE IA : Système de recommandation d'événements (User Side)
     */
    recommendAiEvents(preferences: string, events: any[], history: string[] = []): Observable<any> {
        return this.http.post<any>(`${AI_URL}/event/recommend`, { 
            user_preferences: preferences, 
            user_history: history,
            events: events
        });
    }

    predictAiCategory(description: string): Observable<any> {
        return this.http.post<any>(`${AI_URL}/event/predict-category`, { description });
    }

    getPackingList(eventType: string, difficulty: string, season: string): Observable<any> {
        return this.http.post<any>(`${AI_URL}/events/packing-list`, {
            event_type: eventType,
            difficulty,
            season
        });
    }

    predictAiOdd(title: string, description: string): Observable<any> {
        return this.http.post<any>(`${AI_URL}/event/predict-odd`, {
            title,
            description
        });
    }

    assignUserToEvent(eventId: string, userId: string, participants: number = 1): Observable<EventRegistration> {
        return this.http.post<EventRegistration>(`${API_URL}/${eventId}/register`, { eventId, userId, participants, status: 'CONFIRMED' });
    }

    getParticipants(eventId: string): Observable<EventRegistration[]> {
        return this.http.get<EventRegistration[]>(`${API_URL}/${eventId}/participants`);
    }
}
