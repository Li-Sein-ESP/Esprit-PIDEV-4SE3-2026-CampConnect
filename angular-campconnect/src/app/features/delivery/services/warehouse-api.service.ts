import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface WarehouseRequest {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
}

export interface WarehouseResponse {
    id: string;
    providerId: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class WarehouseApiService {
    private readonly base = `${environment.apiUrl}/warehouses`;

    constructor(private http: HttpClient) {}

    getMine(): Observable<WarehouseResponse[]> {
        return this.http.get<WarehouseResponse[]>(`${this.base}/mine`);
    }

    getByProvider(providerId: string): Observable<WarehouseResponse[]> {
        return this.http.get<WarehouseResponse[]>(`${this.base}/provider/${providerId}`);
    }

    getById(id: string): Observable<WarehouseResponse> {
        return this.http.get<WarehouseResponse>(`${this.base}/${id}`);
    }

    create(request: WarehouseRequest): Observable<WarehouseResponse> {
        return this.http.post<WarehouseResponse>(this.base, request);
    }

    update(id: string, request: WarehouseRequest): Observable<WarehouseResponse> {
        return this.http.put<WarehouseResponse>(`${this.base}/${id}`, request);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.base}/${id}`);
    }
}
