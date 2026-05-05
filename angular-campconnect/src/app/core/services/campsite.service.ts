import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, timeout, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Campsite {
    id: string;
    name: string;
    location: string;
    description: string;
    price: number;
    rating: number;
    reviewCount: number;
    images: string[];
    amenities: string[];
    capacity: number;
    available: boolean;
    latitude?: number;
    longitude?: number;
    status?: string;
    creatorUsername?: string;
}

export interface CampsiteReview {
    id?: string;
    campsiteId?: string;
    userId?: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    title: string;
    content: string;
    photos?: string[];
    verifiedStay?: boolean;
    createdAt?: string;
    helpful?: number;
    helpfulByUsers?: string[];
}

@Injectable({
    providedIn: 'root'
})
export class CampsiteService {

    private readonly apiUrl = `${environment.apiUrl}/campsites`;

    constructor(private http: HttpClient) { }

    getAllCampsites(): Observable<Campsite[]> {
        return this.http.get<Campsite[]>(this.apiUrl).pipe(
            timeout(10000),
            catchError(err => {
                console.error('CampsiteService.getAllCampsites error:', err);
                return throwError(() => err);
            })
        );
    }

    getCampsiteById(id: string): Observable<Campsite> {
        return this.http.get<Campsite>(`${this.apiUrl}/${id}`).pipe(
            timeout(10000),
            catchError(err => {
                console.error(`CampsiteService.getCampsiteById(${id}) error:`, err);
                return throwError(() => err);
            })
        );
    }

    getReviews(campsiteId: string): Observable<CampsiteReview[]> {
        return this.http.get<CampsiteReview[]>(`${this.apiUrl}/${campsiteId}/reviews`).pipe(
            timeout(10000),
            catchError(err => {
                console.error(`CampsiteService.getReviews(${campsiteId}) error:`, err);
                return throwError(() => err);
            })
        );
    }

    addReview(campsiteId: string, review: any): Observable<CampsiteReview> {
        return this.http.post<CampsiteReview>(`${this.apiUrl}/${campsiteId}/reviews`, review).pipe(
            timeout(10000),
            catchError(err => {
                console.error(`CampsiteService.addReview(${campsiteId}) error:`, err);
                return throwError(() => err);
            })
        );
    }

    reactToReview(campsiteId: string, reviewId: string, userId: string): Observable<CampsiteReview> {
        return this.http.post<CampsiteReview>(`${this.apiUrl}/${campsiteId}/reviews/${reviewId}/react`, { userId }).pipe(
            timeout(10000),
            catchError(err => {
                console.error(`CampsiteService.reactToReview error:`, err);
                return throwError(() => err);
            })
        );
    }

    searchCampsites(filters: any): Observable<Campsite[]> {
        let params = new HttpParams();
        if (filters.priceMin) params = params.set('priceMin', filters.priceMin);
        if (filters.priceMax) params = params.set('priceMax', filters.priceMax);
        if (filters.capacity) params = params.set('capacity', filters.capacity);
        if (filters.status) params = params.set('status', filters.status);
        if (filters.amenities) {
            filters.amenities.forEach((a: string) => params = params.append('amenities', a));
        }

        return this.http.get<Campsite[]>(`${this.apiUrl}/search`, { params }).pipe(
            timeout(10000),
            catchError(err => {
                console.error('CampsiteService.searchCampsites error:', err);
                return of([]);
            })
        );
    }

    createCampsite(campsite: Campsite): Observable<Campsite> {
        return this.http.post<Campsite>(this.apiUrl, campsite).pipe(
            timeout(10000),
            catchError(err => {
                console.error('CampsiteService.createCampsite error:', err);
                return throwError(() => err);
            })
        );
    }

    updateCampsite(id: string, campsite: Campsite): Observable<Campsite> {
        return this.http.put<Campsite>(`${this.apiUrl}/${id}`, campsite).pipe(
            timeout(10000),
            catchError(err => {
                console.error(`CampsiteService.updateCampsite(${id}) error:`, err);
                return throwError(() => err);
            })
        );
    }

    deleteCampsite(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
            timeout(10000),
            catchError(err => {
                console.error(`CampsiteService.deleteCampsite(${id}) error:`, err);
                return throwError(() => err);
            })
        );
    }
}
