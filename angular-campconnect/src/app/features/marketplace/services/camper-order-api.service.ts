import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface CamperOrderSummary {
  orderId: string;
  orderType: 'RENTAL' | 'PURCHASE';
  gearId: string;
  gearName: string;
  gearImageUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  rentalDays: number | null;
  totalPrice: number;
  discountApplied: number;
  deliveryStatus: string | null;   // "Pending" | "Assigned" | "Picked Up" | "In Transit" | "Delivered" | "Cancelled" | null
  rawDeliveryStatus: string | null;
  createdAt: string;
}

export interface CamperDelivery {
  id: string;
  rentalId: string | null;
  purchaseId: string | null;
  status: string;
  camperStatus: string;
  driverName: string | null;
  vehicleType: string | null;
  deliveryAddress: string | null;
  scheduledDate: string | null;
  deliveredDate: string | null;
  customerLat?: number;
  customerLng?: number;
}

export interface PagedOrderResponse {
  content: CamperOrderSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

@Injectable({ providedIn: 'root' })
export class CamperOrderApiService {

  private readonly base = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  getMyOrders(page = 0, size = 20): Observable<PagedOrderResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PagedOrderResponse>(`${this.base}/my-orders`, { params });
  }

  getMyDelivery(rentalId?: string, purchaseId?: string): Observable<CamperDelivery> {
    let params = new HttpParams();
    if (rentalId) params = params.set('rentalId', rentalId);
    if (purchaseId) params = params.set('purchaseId', purchaseId);
    return this.http.get<CamperDelivery>(`${this.base}/my-delivery`, { 
      params,
      headers: { 'X-Suppress-Error': 'true' }
    });
  }

  getPurchaseById(id: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/purchases/${id}`);
  }
}
