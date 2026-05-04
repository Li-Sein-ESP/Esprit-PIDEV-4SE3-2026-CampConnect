// Booking Module Interfaces
export interface Booking {
    id: string;
    campsiteId: string;
    campsite: {
        name: string;
        location: string;
        imageUrl: string;
    };
    checkIn: string;
    checkOut: string;
    guests: number;
    nights: number;
    total: number;
    status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
    bookedAt: string;
    canCancel: boolean;
    refundEligible: boolean;
}

export interface SearchParams {
    startDate: string;
    endDate: string;
    guests: number;
}

export interface GuestInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}

export interface AddOns {
    firewood: boolean;
    earlyCheckIn: boolean;
    lateCheckOut: boolean;
}

export interface Pricing {
    basePrice: number;
    addOns: number;
    subtotal: number;
    tax: number;
    serviceFee: number;
    total: number;
}

export interface PaymentMethod {
    type: 'card' | 'wallet';
    cardDetails?: {
        number: string;
        name: string;
        expiry: string;
        cvv: string;
    };
    billingZip?: string;
}
