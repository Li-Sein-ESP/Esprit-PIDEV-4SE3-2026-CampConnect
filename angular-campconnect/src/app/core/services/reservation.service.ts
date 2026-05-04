import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Reservation, ReservationRequest } from '../models/reservation.model';

const API_URL = `${environment.apiUrl}/reservations`;

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
    providedIn: 'root'
})
export class ReservationService {
    constructor(private http: HttpClient) { }

    getAllReservations(): Observable<Reservation[]> {
        return this.http.get<Reservation[]>(API_URL);
    }

    getReservationById(id: string): Observable<Reservation> {
        return this.http.get<Reservation>(`${API_URL}/${id}`);
    }

    getUserReservations(userId: string): Observable<Reservation[]> {
        return this.http.get<Reservation[]>(`${API_URL}/user/${userId}`);
    }

    createReservation(reservation: ReservationRequest): Observable<Reservation> {
        return this.http.post<Reservation>(API_URL, reservation, httpOptions);
    }

    updateReservation(id: string, reservation: ReservationRequest): Observable<Reservation> {
        return this.http.put<Reservation>(`${API_URL}/${id}`, reservation, httpOptions);
    }

    cancelReservation(id: string): Observable<Reservation> {
        return this.http.patch<Reservation>(`${API_URL}/${id}/cancel`, {}, httpOptions);
    }

    deleteReservation(id: string): Observable<Reservation> {
        return this.http.delete<Reservation>(`${API_URL}/${id}`, httpOptions);
    }
}
