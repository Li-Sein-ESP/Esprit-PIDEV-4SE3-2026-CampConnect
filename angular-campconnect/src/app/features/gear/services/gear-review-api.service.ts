import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { GearReviewRequest, GearReviewResponse } from '../models/gear-review.model';
import { PagedResponse } from '../models/gear.model';

@Injectable({ providedIn: 'root' })
export class GearReviewApiService {
    private readonly base = `${environment.apiUrl}/gear/reviews`;

    constructor(private http: HttpClient) { }

    /**
     * POST /api/gear/reviews
     * Submit a review for a gear item (requires authentication)
     */
    createReview(data: GearReviewRequest): Observable<GearReviewResponse> {
        return this.http.post<GearReviewResponse>(this.base, data);
    }

    /**
     * GET /api/gear/reviews/{gearId}?page=&size=
     * Get reviews for a specific gear item
     */
    getReviewsForGear(gearId: string, page = 0, size = 10): Observable<PagedResponse<GearReviewResponse>> {
        const params = new HttpParams()
            .set('page', page)
            .set('size', size);
        return this.http.get<PagedResponse<GearReviewResponse>>(`${this.base}/${gearId}`, { params });
    }
}
