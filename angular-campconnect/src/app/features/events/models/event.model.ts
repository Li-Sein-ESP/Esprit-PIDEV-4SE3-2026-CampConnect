// Event Module Interfaces
export interface Event {
    id: string;
    title: string;
    description: string;
    categoryName: string;
    type: 'workshop' | 'expedition' | 'meetup' | 'training' | 'festival' | 'retreat' | 'skills-course' | 'group-camp' | 'certification' | 'guided-hike';
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
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'moderate' | 'all-levels';
    tags: string[];
    imageUrl: string;
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    whatToExpect?: string[];
    whatToBring?: string[];
    whatsIncluded?: string[];
    safetyNotes?: string[];
    cancellationPolicy?: string;
}

export interface EventRegistration {
    id: string;
    userId: string;
    username: string;
    eventId: string;
    eventTitle?: string;
    registrationDate: string;
    status: string;
    participants: number;
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
