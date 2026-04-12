export enum ReservationStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
    COMPLETED = 'COMPLETED'
}

export interface Reservation {
    id?: string;
    _id?: string; // MongoDB fallback
    userId: string;
    targetId: string;
    startDate: string; // ISO LocalDateTime
    endDate: string;   // ISO LocalDateTime
    status: ReservationStatus;
    createdAt?: string;
    updatedAt?: string;
}

export interface ReservationRequest {
    userId: string;
    targetId: string;
    startDate: string;
    endDate: string;
}
