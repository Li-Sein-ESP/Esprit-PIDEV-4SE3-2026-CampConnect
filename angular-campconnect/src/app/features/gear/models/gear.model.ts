// ─── Backend DTO Models ──────────────────────────────────────────────────────

export type GearStatus = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'OUT_OF_STOCK';
export type ListingType = 'FOR_SALE' | 'FOR_RENT' | 'BOTH';

/** Matches GearImageDto from the Spring Boot backend. */
export interface GearImageDto {
    id: string;
    imageUrl: string;
}

/**
 * Matches the GearResponse DTO returned by GET /api/gear and GET /api/gear/{id}.
 * Field names align exactly with the Spring Boot backend.
 */
export interface GearResponse {
    id: string;
    name: string;
    description: string;
    /** Backward-compat price — equals dailyPrice for FOR_RENT listings */
    price: number;
    /** Price per day when listed for rent */
    dailyPrice?: number;
    /** Sale price when listed for purchase */
    salePrice?: number;
    /** How this item is offered */
    listingType: ListingType;
    /** Available stock count (backend field: quantity) */
    quantity: number;
    condition: string;
    status: GearStatus;
    category: string;
    ownerId: string;
    ownerName: string;
    images: GearImageDto[];
    createdAt: string;
    updatedAt?: string;
}

/** Convenience getter: true when gear is available for rental. */
export function isGearAvailable(gear: GearResponse): boolean {
    return gear.status === 'AVAILABLE' && gear.quantity > 0;
}

/** Returns the first image URL or a placeholder. */
export function gearFirstImage(gear: GearResponse): string {
    return gear.images?.[0]?.imageUrl ?? 'assets/images/gear-placeholder.jpg';
}

export interface GearCreateRequest {
    name: string;
    description: string;
    /** Backward-compat — set to dailyPrice when listing for rent */
    price: number;
    /** Daily rental price (required for FOR_RENT or BOTH) */
    dailyPrice?: number;
    /** Sale price (required for FOR_SALE or BOTH) */
    salePrice?: number;
    listingType: ListingType;
    /** Stock quantity */
    quantity: number;
    condition: string;
    category: string;
    imageUrls: string[];
    status?: GearStatus;
}

export interface GearUpdateRequest extends Partial<GearCreateRequest> { }

export interface PurchaseRequest {
    gearId: string;
    quantity: number;
}

export interface PurchaseResponse {
    id: string;
    gearId: string;
    gearName: string;
    buyerId: string;
    buyerName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
    createdAt: string;
    updatedAt?: string;
}

export interface GearParams {
    page?: number;
    size?: number;
    sort?: string;
    category?: string;
    status?: string;
}

/**
 * Generic paged response wrapper matching Spring Boot PagedResponse<T>.
 * Backend fields: content, page (0-based), size, totalElements, totalPages, last.
 */
export interface PagedResponse<T> {
    content: T[];
    /** Current page index (0-based). */
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
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
