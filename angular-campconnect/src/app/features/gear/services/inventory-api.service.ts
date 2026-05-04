import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface GearInventoryRequest {
    gearId: string;
    warehouseId: string;
    quantity: number;
}

export interface GearInventoryResponse {
    id: string;
    gearId: string;
    gearName?: string;
    warehouseId: string;
    warehouseName?: string;
    quantity: number;
}

@Injectable({ providedIn: 'root' })
export class GearInventoryApiService {
    private readonly base = `${environment.apiUrl}/inventory`;

    constructor(private http: HttpClient) {}

    setInventory(request: GearInventoryRequest): Observable<GearInventoryResponse> {
        return this.http.post<GearInventoryResponse>(this.base, request);
    }

    getByGear(gearId: string): Observable<GearInventoryResponse[]> {
        return this.http.get<GearInventoryResponse[]>(`${this.base}/gear/${gearId}`);
    }

    getByWarehouse(warehouseId: string): Observable<GearInventoryResponse[]> {
        return this.http.get<GearInventoryResponse[]>(`${this.base}/warehouse/${warehouseId}`);
    }

    getAvailableWarehouses(
        gearId: string,
        customerLat: number,
        customerLng: number,
        quantity: number
    ): Observable<GearInventoryResponse[]> {
        const params = new HttpParams()
            .set('customerLat', customerLat)
            .set('customerLng', customerLng)
            .set('quantity', quantity);
        return this.http.get<GearInventoryResponse[]>(`${this.base}/gear/${gearId}/available-warehouses`, { params });
    }
}
