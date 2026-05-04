import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export type DeliveryStatus =
    | 'CREATED'
    | 'PENDING'
    | 'ASSIGNED'
    | 'PICKED_UP'
    | 'IN_TRANSIT'
    | 'DELIVERED'
    | 'FAILED'
    | 'CANCELLED';

export type DeliveryPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type DeliveryType = 'EXPRESS' | 'NORMAL';
export type DeliveryMethod = 'DELIVERY' | 'PICKUP';

export interface RouteDto {
    origin: string;
    destination: string;
    estimatedDuration: string;
    notes?: string;
}

export interface RouteResponse {
    distanceKm: number;
    durationMinutes: number;
    geometryRaw: number[][]; // GeoJSON coordinates [lng, lat]
}

export interface DeliveryRequest {
    rentalId?: string;
    purchaseId?: string;
    driverId?: string;
    vehicleId?: string;
    pickupAddress: string;
    deliveryAddress: string;
    /** ISO date (YYYY-MM-DD) */
    scheduledDate: string;
    priority: DeliveryPriority;
    type?: DeliveryType;
    method?: DeliveryMethod;
    warehouseId?: string;
    route?: RouteDto;
}

export interface DeliveryResponse {
    id: string;
    rentalId?: string;
    purchaseId?: string;
    driverId: string;
    driverName: string;
    vehicleId: string;
    pickupAddress: string;
    deliveryAddress: string;
    customerLat?: number;
    customerLng?: number;
    scheduledDate: string;
    deliveredDate?: string;
    status: DeliveryStatus;
    priority: DeliveryPriority;
    type: DeliveryType;
    method: DeliveryMethod;
    warehouseId?: string;
    batchId?: string;
    estimatedDuration?: number;
    actualDuration?: number;
    route?: RouteDto;
    createdAt: string;
    updatedAt?: string;
}

export interface PagedDeliveryResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

export interface DailyEarning {
    date: string;
    amount: number;
    count: number;
}

export interface EarningsResponse {
    totalEarnings: number;
    weeklyEarnings: number;
    monthlyEarnings: number;
    deliveriesCompleted: number;
    averagePerDelivery: number;
    dailyBreakdown: DailyEarning[];
}

export interface DriverProfileStatsResponse {
    totalDeliveries: number;
    activeJobs: number;
    totalEarnings: number;
    rating: number;
    completionRate: number;
    onTimeRate: number;
    deliveredCount: number;
    cancelledCount: number;
    failedCount: number;
}

export interface VehicleEarning {
    vehicleId: string;
    vehicleName: string;
    deliveryCount: number;
    earnings: number;
}

export interface VehicleEarningsBreakdownResponse {
    vehicleEarnings: VehicleEarning[];
}

export interface Payment {
    id: string;
    deliveryId: string;
    customerName: string;
    amount: number;
    paymentDate: string;
    status: string;
}

export interface RecentPaymentsResponse {
    payments: Payment[];
}

@Injectable({ providedIn: 'root' })
export class DeliveryApiService {
    private readonly base = `${environment.apiUrl}/deliveries`;

    constructor(private http: HttpClient) { }

    /**
     * GET /api/deliveries  (ADMIN or DELIVERY_PROVIDER)
     */
    getAll(
        status?: DeliveryStatus,
        priority?: DeliveryPriority,
        page = 0,
        size = 10
    ): Observable<PagedDeliveryResponse<DeliveryResponse>> {
        let params = new HttpParams().set('page', page).set('size', size);
        if (status) params = params.set('status', status);
        if (priority) params = params.set('priority', priority);
        return this.http.get<PagedDeliveryResponse<DeliveryResponse>>(this.base, { params });
    }

    /**
     * GET /api/deliveries/my-deliveries  (DELIVERY_PROVIDER)
     */
    getMyDeliveries(page = 0, size = 10): Observable<PagedDeliveryResponse<DeliveryResponse>> {
        const params = new HttpParams().set('page', page).set('size', size);
        return this.http.get<PagedDeliveryResponse<DeliveryResponse>>(`${this.base}/my-deliveries`, { params });
    }

    /**
     * GET /api/deliveries/{id}
     */
    getById(id: string): Observable<DeliveryResponse> {
        return this.http.get<DeliveryResponse>(`${this.base}/${id}`);
    }

    /**
     * POST /api/deliveries
     */
    create(request: DeliveryRequest): Observable<DeliveryResponse> {
        return this.http.post<DeliveryResponse>(this.base, request);
    }

    /**
     * PATCH /api/deliveries/{id}/status?status=&vehicleId=
     */
    updateStatus(id: string, status: DeliveryStatus, vehicleId?: string): Observable<DeliveryResponse> {
        let params = new HttpParams().set('status', status);
        if (vehicleId) {
            params = params.set('vehicleId', vehicleId);
        }
        return this.http.patch<DeliveryResponse>(`${this.base}/${id}/status`, null, { params });
    }

    /**
     * PUT /api/deliveries/{id}/route
     */
    updateRoute(id: string, route: RouteDto): Observable<DeliveryResponse> {
        return this.http.put<DeliveryResponse>(`${this.base}/${id}/route`, route);
    }

    /**
     * GET /api/routes/estimate
     */
    estimateRoute(warehouseLat: number, warehouseLng: number, customerLat: number, customerLng: number): Observable<RouteResponse> {
        let params = new HttpParams()
            .set('warehouseLat', warehouseLat)
            .set('warehouseLng', warehouseLng)
            .set('customerLat', customerLat)
            .set('customerLng', customerLng);
        return this.http.get<RouteResponse>(`${environment.apiUrl}/routes/estimate`, { params });
    }

    /**
     * GET /api/deliveries/earnings  (DELIVERY_PROVIDER)
     */
    getEarnings(): Observable<EarningsResponse> {
        return this.http.get<EarningsResponse>(`${this.base}/earnings`);
    }

    /**
     * GET /api/deliveries/profile-stats  (DELIVERY_PROVIDER)
     */
    getProfileStats(): Observable<DriverProfileStatsResponse> {
        return this.http.get<DriverProfileStatsResponse>(`${this.base}/profile-stats`);
    }

    /**
     * GET /api/deliveries/earnings/breakdown  (DELIVERY_PROVIDER)
     */
    getEarningsBreakdown(): Observable<VehicleEarningsBreakdownResponse> {
        return this.http.get<VehicleEarningsBreakdownResponse>(`${this.base}/earnings/breakdown`);
    }

    /**
     * GET /api/deliveries/earnings/payments  (DELIVERY_PROVIDER)
     */
    getRecentPayments(): Observable<RecentPaymentsResponse> {
        return this.http.get<RecentPaymentsResponse>(`${this.base}/earnings/payments`);
    }

    /**
     * POST /api/deliveries/{id}/proof  (DELIVERY_PROVIDER)
     */
    submitProofOfDelivery(deliveryId: string, proof: ProofOfDeliveryRequest): Observable<ProofOfDeliveryResponse> {
        return this.http.post<ProofOfDeliveryResponse>(`${this.base}/${deliveryId}/proof`, proof);
    }

    /**
     * GET /api/deliveries/{id}/proof
     */
    getProofOfDelivery(deliveryId: string): Observable<ProofOfDeliveryResponse> {
        return this.http.get<ProofOfDeliveryResponse>(`${this.base}/${deliveryId}/proof`);
    }
}

export interface ProofOfDeliveryRequest {
    recipientName: string;
    signatureDataUrl?: string;
    photoUrl?: string;
    notes?: string;
}

export interface ProofOfDeliveryResponse {
    id: string;
    deliveryId: string;
    recipientName: string;
    signatureDataUrl?: string;
    photoUrl?: string;
    notes?: string;
    createdAt: string;
}
