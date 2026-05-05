import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reservation, ReservationRequest, ReservationStatus } from '../models/reservation.model';

@Injectable({
    providedIn: 'root'
})
export class ReservationService {
    private apiUrl = 'http://localhost:8089/api/reservations';

    constructor(private http: HttpClient) { }

    getAllReservations(): Observable<Reservation[]> {
        return this.http.get<Reservation[]>(this.apiUrl);
    }

    getReservationById(id: string): Observable<Reservation> {
        return this.http.get<Reservation>(`${this.apiUrl}/${id}`);
    }

    getUserReservations(userId: string): Observable<Reservation[]> {
        return this.http.get<Reservation[]>(`${this.apiUrl}/user/${userId}`);
    }

    createReservation(request: ReservationRequest): Observable<Reservation> {
        return this.http.post<Reservation>(this.apiUrl, request);
    }

    updateReservation(id: string, request: ReservationRequest): Observable<Reservation> {
        return this.http.put<Reservation>(`${this.apiUrl}/${id}`, request);
    }

    cancelReservation(id: string): Observable<Reservation> {
        return this.http.patch<Reservation>(`${this.apiUrl}/${id}/cancel`, {});
    }

    confirmReservation(id: string): Observable<Reservation> {
        return this.http.patch<Reservation>(`${this.apiUrl}/${id}/confirm`, {});
    }

    deleteReservation(id: string): Observable<Reservation> {
        return this.http.delete<Reservation>(`${this.apiUrl}/${id}`);
    }
}
