// Event Module Interfaces
export interface Event {
    id: string;
    title: string;
    description: string;
    type: 'workshop' | 'expedition' | 'meetup' | 'training' | 'festival';
    location: {
        name: string;
        address: string;
        coordinates?: {
            lat: number;
            lng: number;
        };
    };
    startDate: string;
    endDate: string;
    duration: number;
    organizer: {
        id: string;
        name: string;
        avatar?: string;
        verified: boolean;
    };
    capacity: number;
    registered: number;
    price: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    tags: string[];
    imageUrl: string;
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export interface EventRegistration {
    eventId: string;
    userId: string;
    registeredAt: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    paymentStatus: 'pending' | 'paid' | 'refunded';
    participants: number;
    totalAmount: number;
}

export interface EventSchedule {
    eventId: string;
    sessions: EventSession[];
}

export interface EventSession {
    id: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    duration: number;
    speaker?: {
        name: string;
        title: string;
        avatar?: string;
    };
    location: string;
    capacity?: number;
}
