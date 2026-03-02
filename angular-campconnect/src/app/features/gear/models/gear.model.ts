// ─── Backend DTO Models ──────────────────────────────────────────────────────

/**
 * Matches the GearResponse DTO returned by GET /api/gear and GET /api/gear/{id}.
 * Field names align with the Spring Boot backend.
 */
export interface GearResponse {
    id: string;
    name: string;
    description: string;
    category: string;
    brand: string;
    pricePerDay: number;
    purchasePrice?: number;
    condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR';
    imageUrls: string[];
    available: boolean;
    stockQuantity: number;
    location: string;
    ownerId: string;
    ownerUsername: string;
    rating?: number;
    reviewCount?: number;
    createdAt: string;
    updatedAt?: string;
}


export interface GearCreateRequest {
    name: string;
    description: string;
    category: string;
    brand: string;
    pricePerDay: number;
    purchasePrice?: number;
    condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR';
    imageUrls?: string[];
    stockQuantity: number;
    location: string;
}

export interface GearUpdateRequest extends Partial<GearCreateRequest> { }

export interface GearParams {
    page?: number;
    size?: number;
    sort?: string;
    category?: string;
    status?: string;
}

/**
 * Generic Spring Boot Page<T> response wrapper.
 */
export interface PagedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;        // current page index (0-based)
    size: number;
    first: boolean;
    last: boolean;
    numberOfElements: number;
}

// ─── Frontend-facing Models (kept for UI components unrelated to backend) ────

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
    imageUrl?: string;
    location: string;
    description: string;
}
