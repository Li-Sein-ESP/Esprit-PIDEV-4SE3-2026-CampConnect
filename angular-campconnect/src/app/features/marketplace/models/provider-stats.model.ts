export interface GearAnalyticsResponse {
    gearId: string;
    gearName: string;
    totalRentals: number;
    totalPurchases: number;
    totalRevenue: number;
    averageRating: number;
    activeRentals: number;
    availableStock: number;
}

export interface ProviderStatsResponse {
    totalRevenue: number;
    activeRentals: number;
    pendingRequests: number;
    totalProducts: number;
    averageRating: number;
}
