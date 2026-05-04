import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';
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
    status: string;
    latitude: number;
    longitude: number;
}

export interface CampsiteReview {
    id?: string;
    campsiteId?: string;
    userId?: string;
    userName?: string;
    userAvatar?: string;
    rating?: number;
    title?: string;
    content?: string;
    photos?: string[];
    verifiedStay?: boolean;
    createdAt?: string;
    helpfulByUsers?: string[];
    helpful?: number;
}

@Injectable({
    providedIn: 'root'
})
export class CampsiteService {

    private readonly apiUrl = `${environment.apiUrl}/campsites`;

    constructor(private http: HttpClient) { }

    /**
     * GET /api/campsites
     * Récupère tous les campings.
     */
    getAllCampsites(): Observable<Campsite[]> {
        return this.http.get<Campsite[]>(this.apiUrl);
    }

    /**
     * GET /api/campsites with optional filters
     * Retrieves campsites with optional filtering (client-side for now).
     */
    getCampsites(filters?: { location?: string; minPrice?: number; maxPrice?: number }): Observable<Campsite[]> {
        return this.http.get<Campsite[]>(this.apiUrl).pipe(
            map(campsites => {
                let filtered = [...campsites];

                if (filters?.location) {
                    filtered = filtered.filter(c =>
                        c.location.toLowerCase().includes(filters.location!.toLowerCase())
                    );
                }

                if (filters?.minPrice !== undefined) {
                    filtered = filtered.filter(c => c.price >= filters.minPrice!);
                }

                if (filters?.maxPrice !== undefined) {
                    filtered = filtered.filter(c => c.price <= filters.maxPrice!);
                }

                return filtered;
            }),
            catchError(error => {
                console.error('Error fetching campsites:', error);
                return of([]);
            })
        );
    }

    /**
     * GET /api/campsites/{id}
     * Récupère un camping par son identifiant.
     */
    getCampsiteById(id: string): Observable<Campsite | undefined> {
        return this.http.get<Campsite>(`${this.apiUrl}/${id}`).pipe(
            catchError(error => {
                console.error('Error fetching campsite:', error);
                return of(undefined);
            })
        );
    }

    /**
     * Search campsites by query string (client-side filtering)
     */
    searchCampsites(query: string): Observable<Campsite[]> {
        return this.http.get<Campsite[]>(this.apiUrl).pipe(
            map(campsites => campsites.filter(c =>
                c.name.toLowerCase().includes(query.toLowerCase()) ||
                c.location.toLowerCase().includes(query.toLowerCase()) ||
                c.description.toLowerCase().includes(query.toLowerCase())
            )),
            catchError(error => {
                console.error('Error searching campsites:', error);
                return of([]);
            })
        );
    }

    /**
     * POST /api/campsites
     * Crée un nouveau camping.
     */
    createCampsite(campsite: Campsite): Observable<Campsite> {
        return this.http.post<Campsite>(this.apiUrl, campsite);
    }

    /**
     * PUT /api/campsites/{id}
     * Met à jour un camping existant.
     */
    updateCampsite(id: string, campsite: Campsite): Observable<Campsite> {
        return this.http.put<Campsite>(`${this.apiUrl}/${id}`, campsite);
    }

    /**
     * DELETE /api/campsites/{id}
     * Supprime un camping par son identifiant.
     */
    deleteCampsite(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    /**
     * GET /api/campsites/{campsiteId}/reviews
     * Retrieves all reviews for a specific campsite.
     */
    getReviews(campsiteId: string): Observable<CampsiteReview[]> {
        return this.http.get<CampsiteReview[]>(`${this.apiUrl}/${campsiteId}/reviews`);
    }

    /**
     * POST /api/campsites/{campsiteId}/reviews
     * Adds a new review to a campsite.
     */
    addReview(campsiteId: string, review: CampsiteReview): Observable<CampsiteReview> {
        return this.http.post<CampsiteReview>(`${this.apiUrl}/${campsiteId}/reviews`, review);
    }

    /**
     * POST /api/campsites/{campsiteId}/reviews/{reviewId}/react?userId={userId}
     * Toggles a helpful reaction on a review.
     */
    reactToReview(campsiteId: string, reviewId: string, userId: string): Observable<CampsiteReview> {
        return this.http.post<CampsiteReview>(
            `${this.apiUrl}/${campsiteId}/reviews/${reviewId}/react?userId=${userId}`, 
            {}
        );
    }
    /**
     * POST /api/upload/image
     * Uploads an image file to the backend and returns the URL.
     */
    uploadCampsiteImage(file: File): Observable<{ url: string; filename: string }> {
        const formData = new FormData();
        formData.append('file', file);
        // Use the backend base URL (without /api suffix)
        const backendBase = environment.apiUrl.substring(0, environment.apiUrl.lastIndexOf('/api'));
        return this.http.post<{ url: string; filename: string }>(
            `${backendBase}/api/upload/image`,
            formData
        );
    }
}
