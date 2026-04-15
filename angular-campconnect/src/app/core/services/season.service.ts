import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Season {
    id: string;
    name?: string;
    startDate: string;     // ISO 8601, e.g. "2025-06-01"
    endDate: string;       // ISO 8601, e.g. "2025-09-30"
    priceModifier: number; // e.g. 1.5 = +50% during peak season (can be 0)
    isOpen: boolean;       // whether the season is open for bookings
    campsiteId: string;    // linked campsite identifier
}

@Injectable({
    providedIn: 'root'
})
export class SeasonService {

    private readonly apiUrl = `${environment.apiUrl}/seasons`;

    constructor(private http: HttpClient) { }

    /**
     * GET /api/seasons
     * Récupère toutes les saisons.
     */
    getAllSeasons(): Observable<Season[]> {
        return this.http.get<Season[]>(this.apiUrl);
    }

    /**
     * GET /api/seasons/{id}
     * Récupère une saison par son identifiant.
     */
    getSeasonById(id: string): Observable<Season> {
        return this.http.get<Season>(`${this.apiUrl}/${id}`);
    }

    /**
     * POST /api/seasons
     * Crée une nouvelle saison.
     */
    createSeason(season: Season): Observable<Season> {
        return this.http.post<Season>(this.apiUrl, season);
    }

    /**
     * PUT /api/seasons/{id}
     * Met à jour une saison existante.
     */
    updateSeason(id: string, season: Season): Observable<Season> {
        return this.http.put<Season>(`${this.apiUrl}/${id}`, season);
    }

    /**
     * DELETE /api/seasons/{id}
     * Supprime une saison par son identifiant.
     */
    deleteSeason(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
