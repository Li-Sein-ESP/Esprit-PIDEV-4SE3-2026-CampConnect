// Gear Module Interfaces
export interface GearItem {
    id: string;
    name: string;
    description: string;
    category: string;
    brand: string;
    price: number;
    rentalPrice?: number;
    condition: 'new' | 'like-new' | 'good' | 'fair';
    images: string[];
    seller: {
        id: string;
        name: string;
        rating: number;
        verified: boolean;
    };
    specifications: Record<string, string>;
    tags: string[];
    available: boolean;
    location: string;
    createdAt: string;
}

export interface GearKit {
    id: string;
    name: string;
    description: string;
    type: 'camping' | 'hiking' | 'winter' | 'desert' | 'custom';
    items: GearKitItem[];
    totalPrice: number;
    imageUrl: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    season: 'spring' | 'summer' | 'fall' | 'winter' | 'all-season';
}

export interface GearKitItem {
    gearId: string;
    name: string;
    quantity: number;
    essential: boolean;
    category: string;
}

export interface GearRental {
    id: string;
    gearId: string;
    userId: string;
    startDate: string;
    endDate: string;
    days: number;
    totalPrice: number;
    status: 'pending' | 'confirmed' | 'active' | 'returned' | 'cancelled';
    deposit: number;
    deliveryMethod: 'pickup' | 'delivery';
    deliveryAddress?: string;
}

export interface CartItem {
    gearId: string;
    gear: GearItem;
    quantity: number;
    type: 'purchase' | 'rental';
    rentalDates?: {
        start: string;
        end: string;
    };
}

export interface DeliveryTracking {
    id: string;
    orderId: string;
    status: 'preparing' | 'in-transit' | 'out-for-delivery' | 'delivered';
    estimatedDelivery: string;
    trackingNumber: string;
    carrier: string;
    updates: DeliveryUpdate[];
}

export interface DeliveryUpdate {
    timestamp: string;
    status: string;
    location: string;
    description: string;
}
