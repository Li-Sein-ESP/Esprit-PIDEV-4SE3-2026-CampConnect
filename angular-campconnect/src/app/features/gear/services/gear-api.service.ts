import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
    GearResponse,
    GearCreateRequest,
    GearUpdateRequest,
    GearParams,
    PagedResponse,
    PurchaseRequest,
    PurchaseResponse
} from '../models/gear.model';
import { GearAnalyticsResponse, ProviderStatsResponse } from '../../marketplace/models/provider-stats.model';

@Injectable({ providedIn: 'root' })
export class GearApiService {
    private readonly base = `${environment.apiUrl}/gear`;

    constructor(private http: HttpClient) { }

    /**
     * GET /api/gear?page=&size=&sort=&category=&status=
     * Returns a paged list of gear.
     */
    getGear(params: GearParams = {}): Observable<PagedResponse<GearResponse>> {
        let httpParams = new HttpParams();
        if (params.page !== undefined) httpParams = httpParams.set('page', params.page);
        if (params.size !== undefined) httpParams = httpParams.set('size', params.size);
        if (params.sort) httpParams = httpParams.set('sort', params.sort);
        if (params.category) httpParams = httpParams.set('category', params.category);
        if (params.status) httpParams = httpParams.set('status', params.status);
        return this.http.get<PagedResponse<GearResponse>>(this.base, { params: httpParams });
    }

    /**
     * GET /api/gear/{id}
     */
    getGearById(id: string): Observable<GearResponse> {
        return this.http.get<GearResponse>(`${this.base}/${id}`);
    }

    /**
     * GET /api/gear/my-gear  (requires authentication)
     */
    getMyGear(params: GearParams = {}): Observable<PagedResponse<GearResponse>> {
        let httpParams = new HttpParams();
        if (params.page !== undefined) httpParams = httpParams.set('page', params.page);
        if (params.size !== undefined) httpParams = httpParams.set('size', params.size);
        if (params.sort) httpParams = httpParams.set('sort', params.sort);
        return this.http.get<PagedResponse<GearResponse>>(`${this.base}/my-gear`, { params: httpParams });
    }

    /**
     * POST /api/gear  (requires ROLE_EQUIPMENT_PROVIDER or ROLE_ADMIN)
     */
    createGear(data: GearCreateRequest): Observable<GearResponse> {
        return this.http.post<GearResponse>(this.base, data);
    }

    /**
     * PUT /api/gear/{id}  (requires ROLE_EQUIPMENT_PROVIDER or ROLE_ADMIN)
     */
    updateGear(id: string, data: GearUpdateRequest): Observable<GearResponse> {
        return this.http.put<GearResponse>(`${this.base}/${id}`, data);
    }

    /**
     * DELETE /api/gear/{id}  (soft-delete, owner only)
     */
    deleteGear(id: string): Observable<void> {
        return this.http.delete<void>(`${this.base}/${id}`);
    }

    /**
     * POST /api/gear/{id}/images?imageUrl=   — add an image URL to a gear item.
     */
    addGearImage(id: string, imageUrl: string): Observable<GearResponse> {
        const params = new HttpParams().set('imageUrl', imageUrl);
        return this.http.post<GearResponse>(`${this.base}/${id}/images`, null, { params });
    }

    /**
     * DELETE /api/gear/{id}/images/{imageId}  — remove an image from a gear item.
     */
    removeGearImage(id: string, imageId: string): Observable<GearResponse> {
        return this.http.delete<GearResponse>(`${this.base}/${id}/images/${imageId}`);
    }

    /**
     * POST /api/upload
     * Uploads a multipart image file and returns the server-hosted URL.
     */
    uploadImage(file: File): Observable<{ url: string }> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<{ url: string }>(`${environment.apiUrl}/upload`, formData);
    }

    /**
     * POST /api/purchases  — buy a gear item (authenticated user).
     */
    purchaseGear(request: PurchaseRequest): Observable<PurchaseResponse> {
        return this.http.post<PurchaseResponse>(`${environment.apiUrl}/purchases`, request);
    }

    /**
     * GET /api/purchases/my-purchases  — list purchases for the authenticated user.
     */
    getMyPurchases(page = 0, size = 10): Observable<PagedResponse<PurchaseResponse>> {
        const params = new HttpParams()
            .set('page', page)
            .set('size', size);
        return this.http.get<PagedResponse<PurchaseResponse>>(
            `${environment.apiUrl}/purchases/my-purchases`, { params });
    }

    getGearAnalytics(gearId: string): Observable<GearAnalyticsResponse> {
        return this.http.get<GearAnalyticsResponse>(`${this.base}/${gearId}/analytics`);
    }

    getProviderStats(): Observable<ProviderStatsResponse> {
        return this.http.get<ProviderStatsResponse>(`${this.base}/provider/stats`);
    }
}
