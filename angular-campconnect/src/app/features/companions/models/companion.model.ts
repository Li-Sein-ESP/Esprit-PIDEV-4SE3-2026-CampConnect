// Companion Module Interfaces
export interface Companion {
    id: string;
    userId: string;
    profile: {
        displayName: string;
        avatar?: string;
        bio: string;
        location: string;
        verified: boolean;
    };
    preferences: CompanionPreferences;
    stats: {
        tripsCompleted: number;
        rating: number;
        reviews: number;
        joinedDate: string;
    };
    badges: Badge[];
}

export interface CompanionPreferences {
    activityLevel: 'relaxed' | 'moderate' | 'active' | 'extreme';
    tripTypes: string[];
    interests: string[];
    experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    groupSize: 'solo' | 'small' | 'medium' | 'large';
    ageRange?: {
        min: number;
        max: number;
    };
    smokingPreference: 'no-smoking' | 'smoking-ok' | 'no-preference';
    petFriendly: boolean;
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedDate: string;
}

export interface CompanionMatch {
    id: string;
    companion: Companion;
    matchScore: number;
    commonInterests: string[];
    compatibilityFactors: {
        activityLevel: number;
        tripTypes: number;
        experienceLevel: number;
    };
    status: 'suggested' | 'contacted' | 'accepted' | 'declined';
}

export interface Group {
    id: string;
    name: string;
    description: string;
    createdBy: string;
    members: GroupMember[];
    maxMembers: number;
    privacy: 'public' | 'private' | 'invite-only';
    tripId?: string;
    createdAt: string;
    imageUrl?: string;
}

export interface GroupMember {
    userId: string;
    displayName: string;
    avatar?: string;
    role: 'owner' | 'admin' | 'member';
    joinedAt: string;
    status: 'active' | 'inactive';
}

export interface GroupTrip {
    groupId: string;
    tripId: string;
    destination: string;
    startDate: string;
    endDate: string;
    participants: number;
    status: 'planning' | 'confirmed' | 'active' | 'completed';
}
