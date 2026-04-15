export type CartItemType = 'RENT' | 'BUY';

export interface CartRequest {
    gearId: string;
    itemType: CartItemType;
    quantity: number;
    startDate?: string; // YYYY-MM-DD
    endDate?: string;   // YYYY-MM-DD
    requiresDelivery?: boolean;
    deliveryAddress?: string;
}

export interface CartItemResponse {
    id: string;
    gearId: string;
    itemType: CartItemType;
    gearName: string;
    gearImage: string;
    gearCondition: string;
    gearCategory: string;
    quantity: number;
    startDate?: string;
    endDate?: string;
    rentalDays?: number;
    unitPrice: number;
    deposit: number;
    lineTotal: number;
    requiresDelivery?: boolean;
    deliveryAddress?: string;
}

export interface CartResponse {
    id: string;
    userId: string;
    items: CartItemResponse[];
    subtotal: number;
    totalDeposit: number;
    grandTotal: number;
}
