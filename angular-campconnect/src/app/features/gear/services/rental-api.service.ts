import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PagedResponse } from '../models/gear.model';

export type RentalStatus =
    | 'PENDING'
    | 'APPROVED'
    | 'ACTIVE'
    | 'COMPLETED'
    | 'CANCELLED';

export interface RentalRequest {
    gearId: string;
    /** ISO date string (YYYY-MM-DD) */
    startDate: string;
    /** ISO date string (YYYY-MM-DD) */
    endDate: string;
}

export interface RentalResponse {
    id: string;
    gearId: string;
    gearName: string;
    renterId: string;
    renterName: string;
    startDate: string;
    endDate: string;
    status: RentalStatus;
    rentalDays: number;
    totalPrice: number;
    createdAt: string;
    updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class RentalApiService {
    private readonly base = `${environment.apiUrl}/rentals`;

    constructor(private http: HttpClient) { }

    /**
     * GET /api/rentals  (ADMIN or EQUIPMENT_PROVIDER)
     */
    getAll(page = 0, size = 10): Observable<PagedResponse<RentalResponse>> {
        const params = new HttpParams()
            .set('page', page)
            .set('size', size);
        return this.http.get<PagedResponse<RentalResponse>>(this.base, { params });
    }

    /**
     * GET /api/rentals/my-rentals  (any authenticated user)
     */
    getMyRentals(page = 0, size = 10): Observable<PagedResponse<RentalResponse>> {
        const params = new HttpParams()
            .set('page', page)
            .set('size', size);
        return this.http.get<PagedResponse<RentalResponse>>(`${this.base}/my-rentals`, { params });
    }

    /**
     * GET /api/rentals/{id}
     */
    getById(id: string): Observable<RentalResponse> {
        return this.http.get<RentalResponse>(`${this.base}/${id}`);
    }

    /**
     * GET /api/rentals/gear/{gearId}  (ADMIN or EQUIPMENT_PROVIDER)
     */
    getByGear(gearId: string, page = 0, size = 10): Observable<PagedResponse<RentalResponse>> {
        const params = new HttpParams()
            .set('page', page)
            .set('size', size);
        return this.http.get<PagedResponse<RentalResponse>>(`${this.base}/gear/${gearId}`, { params });
    }

    /**
     * POST /api/rentals  (any authenticated user)
     */
    create(request: RentalRequest): Observable<RentalResponse> {
        return this.http.post<RentalResponse>(this.base, request);
    }

    /**
     * PATCH /api/rentals/{id}/status?status=
     */
    updateStatus(id: string, status: RentalStatus): Observable<RentalResponse> {
        const params = new HttpParams().set('status', status);
        return this.http.patch<RentalResponse>(`${this.base}/${id}/status`, null, { params });
    }
}
