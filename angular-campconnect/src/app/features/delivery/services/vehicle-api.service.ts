import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export type VehicleStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'RETIRED';

export interface VehicleRequest {
    plateNumber: string;
    capacity: number;
    status?: VehicleStatus;
    driverId?: string;
}

export interface VehicleResponse {
    id: string;
    plateNumber: string;
    capacity: number;
    status: VehicleStatus;
    driverId?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface PagedVehicleResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

@Injectable({ providedIn: 'root' })
export class VehicleApiService {
    private readonly base = `${environment.apiUrl}/vehicles`;

    constructor(private http: HttpClient) { }

    /**
     * GET /api/vehicles  (ADMIN or DELIVERY_PROVIDER)
     */
    getAll(status?: VehicleStatus, page = 0, size = 20): Observable<PagedVehicleResponse<VehicleResponse>> {
        let params = new HttpParams().set('page', page).set('size', size);
        if (status) params = params.set('status', status);
        return this.http.get<PagedVehicleResponse<VehicleResponse>>(this.base, { params });
    }

    /**
     * GET /api/vehicles/{id}
     */
    getById(id: string): Observable<VehicleResponse> {
        return this.http.get<VehicleResponse>(`${this.base}/${id}`);
    }

    /**
     * POST /api/vehicles  (ADMIN only)
     */
    create(request: VehicleRequest): Observable<VehicleResponse> {
        return this.http.post<VehicleResponse>(this.base, request);
    }

    /**
     * PUT /api/vehicles/{id}  (ADMIN only)
     */
    update(id: string, request: VehicleRequest): Observable<VehicleResponse> {
        return this.http.put<VehicleResponse>(`${this.base}/${id}`, request);
    }

    /**
     * DELETE /api/vehicles/{id}  (ADMIN only, soft-delete)
     */
    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.base}/${id}`);
    }
}
