export interface GearReviewRequest {
    gearId: string;
    rating: number;
    comment: string;
}

export interface GearReviewResponse {
    id: string;
    gearId: string;
    reviewerId: string;
    reviewerName: string;
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
}
