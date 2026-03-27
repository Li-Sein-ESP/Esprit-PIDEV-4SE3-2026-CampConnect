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

export interface RouteDto {
    origin: string;
    destination: string;
    estimatedDuration: string;
    notes?: string;
}

export interface DeliveryRequest {
    rentalId?: string;
    purchaseId?: string;
    driverId: string;
    pickupAddress: string;
    deliveryAddress: string;
    /** ISO date (YYYY-MM-DD) */
    scheduledDate: string;
    priority: DeliveryPriority;
    route?: RouteDto;
}

export interface DeliveryResponse {
    id: string;
    rentalId?: string;
    purchaseId?: string;
    driverId: string;
    driverName: string;
    pickupAddress: string;
    deliveryAddress: string;
    scheduledDate: string;
    deliveredDate?: string;
    status: DeliveryStatus;
    priority: DeliveryPriority;
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
     * PATCH /api/deliveries/{id}/status?status=
     */
    updateStatus(id: string, status: DeliveryStatus): Observable<DeliveryResponse> {
        const params = new HttpParams().set('status', status);
        return this.http.patch<DeliveryResponse>(`${this.base}/${id}/status`, null, { params });
    }

    /**
     * PUT /api/deliveries/{id}/route
     */
    updateRoute(id: string, route: RouteDto): Observable<DeliveryResponse> {
        return this.http.put<DeliveryResponse>(`${this.base}/${id}/route`, route);
    }

    /**
     * GET /api/deliveries/earnings  (DELIVERY_PROVIDER)
     */
    getEarnings(): Observable<EarningsResponse> {
        return this.http.get<EarningsResponse>(`${this.base}/earnings`);
    }
}
