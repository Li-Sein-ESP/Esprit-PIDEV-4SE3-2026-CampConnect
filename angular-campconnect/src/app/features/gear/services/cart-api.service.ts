import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CartRequest, CartResponse, CheckoutRequest } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartApiService {
    private readonly base = `${environment.apiUrl}/cart`;

    constructor(private http: HttpClient) { }

    /**
     * GET /api/cart
     */
    getCart(): Observable<CartResponse> {
        return this.http.get<CartResponse>(this.base);
    }

    /**
     * POST /api/cart/items
     */
    addToCart(request: CartRequest): Observable<CartResponse> {
        return this.http.post<CartResponse>(`${this.base}/items`, request);
    }

    /**
     * DELETE /api/cart/items/{itemId}
     */
    removeFromCart(itemId: string): Observable<CartResponse> {
        return this.http.delete<CartResponse>(`${this.base}/items/${itemId}`);
    }

    /**
     * PUT /api/cart/delivery-location
     */
    updateDeliveryLocation(request: Partial<CartRequest>): Observable<CartResponse> {
        return this.http.put<CartResponse>(`${this.base}/delivery-location`, request);
    }

    /**
     * POST /api/cart/checkout
     */
    checkoutCart(checkoutRequest: CheckoutRequest, successUrl: string, cancelUrl: string): Observable<{ checkoutUrl: string, sessionId: string }> {
        const url = `${this.base}/checkout?successUrl=${encodeURIComponent(successUrl)}&cancelUrl=${encodeURIComponent(cancelUrl)}`;
        return this.http.post<{ checkoutUrl: string, sessionId: string }>(url, checkoutRequest);
    }
}
