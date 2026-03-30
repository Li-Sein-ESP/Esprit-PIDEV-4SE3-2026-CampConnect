import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CartRequest, CartResponse } from '../models/cart.model';

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
     * POST /api/cart/checkout
     */
    checkoutCart(): Observable<void> {
        return this.http.post<void>(`${this.base}/checkout`, {});
    }
}
