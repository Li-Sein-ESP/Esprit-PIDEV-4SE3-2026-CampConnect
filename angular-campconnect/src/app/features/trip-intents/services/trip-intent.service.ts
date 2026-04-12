import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TripIntent, CreateTripIntentRequest } from '../models/trip-intent.model';

@Injectable({
    providedIn: 'root'
})
export class TripIntentService {
    private apiUrl = `${environment.apiUrl}/trip-intents`;

    constructor(private http: HttpClient) { }

    /**
     * Créer une nouvelle intention de voyage
     */
    createTripIntent(data: CreateTripIntentRequest): Observable<TripIntent> {
        return this.http.post<TripIntent>(this.apiUrl, data);
    }

    /**
     * Récupérer toutes les intentions de voyage ouvertes (Feed)
     */
    getOpenIntents(): Observable<TripIntent[]> {
        return this.http.get<TripIntent[]>(`${this.apiUrl}/open`);
    }

    /**
     * Récupérer une intention de voyage par son ID
     */
    getTripIntentById(id: string): Observable<TripIntent> {
        return this.http.get<TripIntent>(`${this.apiUrl}/${id}`);
    }

    /**
     * Récupérer les intentions de voyage créées par un utilisateur spécifique
     */
    getIntentsByCreator(userId: string): Observable<TripIntent[]> {
        return this.http.get<TripIntent[]>(`${this.apiUrl}/creator/${userId}`);
    }

    /**
     * Mettre à jour une intention de voyage
     */
    updateTripIntent(id: string, data: Partial<CreateTripIntentRequest>): Observable<TripIntent> {
        return this.http.put<TripIntent>(`${this.apiUrl}/${id}`, data);
    }

    /**
     * Supprimer une intention de voyage
     */
    deleteTripIntent(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

}
