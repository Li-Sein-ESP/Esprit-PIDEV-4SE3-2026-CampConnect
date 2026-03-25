import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Event, EventRegistration } from '../models/event.model';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

const API_URL = 'http://localhost:8081/api/events';

@Injectable({
    providedIn: 'root'
})
export class EventService {
    private events = signal<Event[]>([]);

    private mockEvents: Event[] = [
        {
            id: 'evt-1',
            title: 'Full Moon Night Hike & Stargazing',
            description: 'Experience the desert under a full moon with expert astronomy guides. Includes telescope viewing, guided constellation mapping, and a midnight snack at the summit. Perfect for photographers and nature lovers.',
            type: 'guided-hike',
            location: {
                name: 'Joshua Tree National Park, CA',
                address: '74485 National Park Dr, Twentynine Palms, CA 92277'
            },
            startDate: '2026-03-20T19:30:00',
            endDate: '2026-03-21T01:00:00',
            duration: 5,
            organizer: { id: 'org-1', name: 'NightSky Adventures', avatar: 'https://i.pravatar.cc/150?u=nightsky', verified: true },
            capacity: 15,
            registered: 15,
            price: 45,
            difficulty: 'moderate',
            tags: ['Night Hike', 'Astronomy', 'Guided'],
            imageUrl: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=800',
            status: 'upcoming',
            categoryName: 'Guided Hikes',
            whatToExpect: ['2-hour moonlit desert hike', 'Professional telescope viewing session'],
            whatToBring: ['Moderate fitness level required', 'Headlamp or flashlight with red filter', 'Warm layers (desert gets cold at night)', 'Sturdy hiking boots'],
            whatsIncluded: ['Expert astronomy guide', 'Use of professional telescopes', 'Star charts and educational materials', 'Hot chocolate and snacks'],
            safetyNotes: ['Event requires clear skies - weather dependent', 'Stay close to group at all times', 'Bring extra water and warm clothing'],
            cancellationPolicy: 'Full refund if event is cancelled due to weather'
        },
        {
            id: 'evt-2',
            title: 'Weekend Backpacking Expedition',
            description: 'A 3-day backpacking trip through the Grand Canyon. Includes permits, guide, and group gear. Traverse historic trails and witness spectacular geological formations.',
            type: 'expedition',
            location: {
                name: 'Grand Canyon, AZ',
                address: 'Grand Canyon Village, AZ 86023'
            },
            startDate: '2026-03-28T06:00:00',
            endDate: '2026-03-30T17:00:00',
            duration: 60,
            organizer: { id: 'org-2', name: 'Desert Rangers', avatar: 'https://i.pravatar.cc/150?u=ranger', verified: true },
            capacity: 12,
            registered: 8,
            price: 180,
            difficulty: 'advanced',
            tags: ['Backpacking', 'Canyon', 'Trekking'],
            imageUrl: 'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=800',
            status: 'upcoming',
            categoryName: 'Expeditions',
            whatToExpect: ['Epic canyon views', 'River camping', 'Challenging terrain', 'Ancient geological discovery'],
            whatToBring: ['Full backpacking gear', 'Sleep system (tent, pad, bag)', 'Water filtration system', 'Sun protection'],
            whatsIncluded: ['Backcountry permits', 'Professional wilderness guide', 'Group cooking gear', 'Emergency communication device'],
            safetyNotes: ['Requires excellent physical condition', 'Temperature fluctuations are extreme', 'Steep and narrow trails'],
            cancellationPolicy: 'Cancellations allowed up to 14 days before start'
        },
        {
            id: 'evt-3',
            title: 'Beginner Wilderness Skills',
            description: 'Master the fundamentals of outdoor survival. Learn fire starting, shelter building, water purification, and basic navigation in a safe environment.',
            type: 'workshop',
            location: {
                name: 'Yosemite National Park, CA',
                address: 'Yosemite Valley, CA 95389'
            },
            startDate: '2026-03-15T09:00:00',
            endDate: '2026-03-15T17:00:00',
            duration: 8,
            organizer: { id: 'org-3', name: 'Wilderness Academy', avatar: 'https://i.pravatar.cc/150?u=academy', verified: true },
            capacity: 20,
            registered: 12,
            price: 0,
            difficulty: 'beginner',
            tags: ['Survival', 'Workshop', 'Fundamentals'],
            imageUrl: 'https://images.unsplash.com/photo-1476041800959-2f6bb412c8ce?w=800',
            status: 'upcoming',
            categoryName: 'Survival Workshops',
            whatToExpect: ['Hands-on training', 'Survival kit guide', 'Shelter building exercise'],
            whatToBring: ['Comfortable outdoor clothing', 'Notebook and pen', 'Refillable water bottle', 'Positive attitude'],
            whatsIncluded: ['Fire starting materials', 'Navigation tools (lent)', 'Survival handbook', 'Lunch and snacks'],
            safetyNotes: ['Field-based learning - dress for weather', 'Sharp tools will be used under supervision'],
            cancellationPolicy: 'Free cancellation - please let us know so others can join'
        },
        {
            id: 'evt-4',
            title: 'Family Camping Weekend',
            description: 'A fun-filled weekend for families to learn camping basics while enjoying nature activities.',
            type: 'group-camp',
            location: { name: 'Sequoia National Park, CA', address: 'Ash Mountain, CA 93262' },
            startDate: '2026-04-05T14:00:00',
            endDate: '2026-04-07T12:00:00',
            duration: 48,
            organizer: { id: 'org-4', name: 'Sarah Miller', avatar: 'https://i.pravatar.cc/150?u=sarah', verified: true },
            capacity: 25,
            registered: 18,
            price: 35,
            difficulty: 'beginner',
            tags: ['Family', 'Camping', 'Education'],
            imageUrl: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800',
            status: 'upcoming',
            categoryName: 'Family Camping',
        },
        {
            id: 'evt-5',
            title: 'Leave No Trace Certification',
            description: 'Official certification course on ethics and practices for outdoor recreation.',
            type: 'certification',
            location: { name: 'Online & Field Practice', address: 'Boulder, CO' },
            startDate: '2026-04-12T08:00:00',
            endDate: '2026-04-12T17:00:00',
            duration: 9,
            organizer: { id: 'org-5', name: 'LNT Organization', avatar: 'https://i.pravatar.cc/150?u=lnt', verified: true },
            capacity: 30,
            registered: 22,
            price: 120,
            difficulty: 'all-levels',
            tags: ['Ethical', 'Certification', 'Environment'],
            imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
            status: 'upcoming',
            categoryName: 'Certifications',
        },
        {
            id: 'evt-6',
            title: 'Mountain Photography Workshop',
            description: 'Capture the majestic beauty of the Rockies during the golden hour with pro landscape photographers.',
            type: 'workshop',
            location: { name: 'Rocky Mountain National Park, CO', address: 'Estes Park, CO' },
            startDate: '2026-04-18T05:00:00',
            endDate: '2026-04-18T11:00:00',
            duration: 6,
            organizer: { id: 'org-6', name: 'Liam Ross', avatar: 'https://i.pravatar.cc/150?u=liam', verified: true },
            capacity: 10,
            registered: 7,
            price: 95,
            difficulty: 'intermediate',
            tags: ['Photography', 'Mountains', 'Art'],
            imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
            status: 'upcoming',
            categoryName: 'Workshops',
        },
        {
            id: 'evt-7',
            title: 'Alpine Yoga & Mindfulness Retreat',
            description: 'Reconnect with yourself through daily yoga sessions and guided meditation in the serene Alps.',
            type: 'retreat',
            location: { name: 'Swiss Alps, Switzerland', address: 'Zermatt, CH' },
            startDate: '2026-05-10T08:00:00',
            endDate: '2026-05-15T18:00:00',
            duration: 130,
            organizer: { id: 'org-7', name: 'Elena Frost', avatar: 'https://i.pravatar.cc/150?u=elena', verified: true },
            capacity: 15,
            registered: 5,
            price: 450,
            difficulty: 'all-levels',
            tags: ['Yoga', 'Retreat', 'Health'],
            imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
            status: 'upcoming',
            categoryName: 'Retreats',
        },
        {
            id: 'evt-8',
            title: 'Desert Survival Skills Course',
            description: 'Learn critical survival techniques specific to arid environments, including water sourcing and heat management.',
            type: 'skills-course',
            location: { name: 'Sonoran Desert, AZ', address: 'Phoenix, AZ' },
            startDate: '2026-05-20T08:00:00',
            endDate: '2026-05-22T17:00:00',
            duration: 57,
            organizer: { id: 'org-8', name: 'Jack Arid', avatar: 'https://i.pravatar.cc/150?u=jack', verified: true },
            capacity: 12,
            registered: 10,
            price: 155,
            difficulty: 'moderate',
            tags: ['Survival', 'Desert', 'Skills'],
            imageUrl: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=800',
            status: 'upcoming',
            categoryName: 'Survival Skills',
        }
    ];

    constructor(private http: HttpClient) { }

    getEvents(): Observable<Event[]> {
        return this.http.get<Event[]>(API_URL).pipe(
            map((events: any[]) => {
                if (!events || events.length === 0) {
                    return this.mockEvents;
                }
                // Normalize casing for frontend matching
                return events.map(e => ({
                    ...e,
                    type: e.type?.toLowerCase(),
                    difficulty: e.difficulty?.toLowerCase(),
                    status: e.status?.toLowerCase()
                }));
            }),
            tap(events => this.events.set(events)),
            catchError(err => {
                this.events.set(this.mockEvents);
                return of(this.mockEvents);
            })
        );
    }

    getEventById(id: string): Observable<Event> {
        return this.http.get<Event>(`${API_URL}/${id}`).pipe(
            map((e: any) => ({
                ...e,
                type: e.type?.toLowerCase(),
                difficulty: e.difficulty?.toLowerCase(),
                status: e.status?.toLowerCase()
            })),
            catchError(err => {
                const mock = this.mockEvents.find(e => e.id === id);
                if (mock) {
                    return of(mock);
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

    registerForEvent(eventId: string, participants: number): Observable<EventRegistration> {
        return this.http.post<EventRegistration>(`${API_URL}/${eventId}/register`, { eventId, participants, userId: 'current-user', status: 'CONFIRMED' });
    }

    assignUserToEvent(eventId: string, userId: string, participants: number = 1): Observable<EventRegistration> {
        return this.http.post<EventRegistration>(`${API_URL}/${eventId}/register`, { eventId, userId, participants, status: 'CONFIRMED' });
    }

    getParticipants(eventId: string): Observable<EventRegistration[]> {
        return this.http.get<EventRegistration[]>(`${API_URL}/${eventId}/participants`);
    }
}
