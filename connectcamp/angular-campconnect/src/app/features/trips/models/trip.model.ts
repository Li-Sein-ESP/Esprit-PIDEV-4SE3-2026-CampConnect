// Trip Module Interfaces
export interface Trip {
    id: string;
    name: string;
    description: string;
    destination: string;
    startDate: string;
    endDate: string;
    duration: number;
    status: 'planning' | 'upcoming' | 'active' | 'completed' | 'cancelled';
    participants: number;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface TripItinerary {
    tripId: string;
    days: ItineraryDay[];
}

export interface ItineraryDay {
    date: string;
    dayNumber: number;
    activities: Activity[];
    meals: Meal[];
    accommodation?: {
        name: string;
        location: string;
        checkIn: string;
        checkOut: string;
    };
}

export interface Activity {
    id: string;
    time: string;
    title: string;
    description: string;
    location: string;
    duration: number;
    type: 'hiking' | 'camping' | 'sightseeing' | 'water-sports' | 'other';
}

export interface Meal {
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    description: string;
    location?: string;
}

export interface TripBudget {
    tripId: string;
    categories: BudgetCategory[];
    total: number;
    spent: number;
    remaining: number;
}

export interface BudgetCategory {
    name: string;
    planned: number;
    actual: number;
    items: BudgetItem[];
}

export interface BudgetItem {
    description: string;
    amount: number;
    date?: string;
    paid: boolean;
}

export interface PackingList {
    tripId: string;
    categories: PackingCategory[];
}

export interface PackingCategory {
    name: string;
    items: PackingItem[];
}

export interface PackingItem {
    id: string;
    name: string;
    quantity: number;
    packed: boolean;
    essential: boolean;
    notes?: string;
}
