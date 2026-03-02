import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
    GearResponse,
    GearCreateRequest,
    GearUpdateRequest,
    GearParams,
    PagedResponse
} from '../models/gear.model';

@Injectable({ providedIn: 'root' })
export class GearApiService {
    private readonly base = `${environment.apiUrl}/gear`;

    constructor(private http: HttpClient) { }


    /**
     * GET /api/gear?page=&size=&sort=
     * Returns a Spring Boot Page<GearResponse>.
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
     * GET /api/gear/my-gear (requires authentication)
     */
    getMyGear(params: GearParams = {}): Observable<PagedResponse<GearResponse>> {
        let httpParams = new HttpParams();
        if (params.page !== undefined) httpParams = httpParams.set('page', params.page);
        if (params.size !== undefined) httpParams = httpParams.set('size', params.size);
        if (params.sort) httpParams = httpParams.set('sort', params.sort);
        return this.http.get<PagedResponse<GearResponse>>(`${this.base}/my-gear`, { params: httpParams });
    }

    /**
     * POST /api/gear   (requires ROLE_EQUIPMENT_PROVIDER or ROLE_ADMIN)
     */
    createGear(data: GearCreateRequest): Observable<GearResponse> {
        return this.http.post<GearResponse>(this.base, data);
    }

    /**
     * PUT /api/gear/{id}
     */
    updateGear(id: string, data: GearUpdateRequest): Observable<GearResponse> {
        return this.http.put<GearResponse>(`${this.base}/${id}`, data);
    }

    /**
     * DELETE /api/gear/{id}
     */
    deleteGear(id: string): Observable<void> {
        return this.http.delete<void>(`${this.base}/${id}`);
    }

    /**
     * POST /api/upload
     * Uploads a multipart image file and returns the URI string.
     */
    uploadImage(file: File): Observable<{ url: string }> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<{ url: string }>(`${environment.apiUrl}/upload`, formData);
    }
}
