export enum TripIntentStatus {
    DRAFT = 'DRAFT',
    OPEN = 'OPEN',
    CLOSED = 'CLOSED'
}

export enum CampingStyle {
    WILD = 'WILD',
    GLAMPING = 'GLAMPING',
    CABIN = 'CABIN',
    CAR_CAMPING = 'CAR_CAMPING',
    BACKPACKING = 'BACKPACKING',
    RV = 'RV',
    TRADITIONAL = 'TRADITIONAL'
}

export enum ExperienceLevel {
    BEGINNER = 'BEGINNER',
    INTERMEDIATE = 'INTERMEDIATE',
    ADVANCED = 'ADVANCED',
    EXPERT = 'EXPERT'
}

export interface TripIntent {
    id: string;
    creatorUserId: string;
    creatorName?: string;
    groupId?: string;
    title?: string;
    dateFrom: string; // ISO Date String
    dateTo: string;   // ISO Date String
    budgetMax: number;
    budgetMin?: number;
    campingStyle: CampingStyle;
    experienceLevel: ExperienceLevel;
    preferredZone?: string;
    status: TripIntentStatus;
    isTrending?: boolean;
    compatibilityScore?: number;
    participantScores?: { [key: string]: number };
    createdAt: string; // ISO Date String
    imageUrl?: string;
}

export interface CreateTripIntentRequest {
    creatorUserId: string;
    title?: string;
    dateFrom: string;
    dateTo: string;
    budgetMax: number;
    budgetMin?: number;
    campingStyle: CampingStyle;
    experienceLevel: ExperienceLevel;
    preferredZone?: string;
    status: TripIntentStatus;
    imageUrl?: string;
}

