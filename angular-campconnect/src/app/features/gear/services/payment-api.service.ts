import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface CheckoutSessionResponse {
    sessionId: string;
    checkoutUrl: string;
}

export interface GearReceiptItem {
    gearName: string;
    quantity: number;
    type: 'RENT' | 'BUY';
    lineTotal?: number;
}

export interface PaymentReceiptResponse {
    status: 'SUCCESS' | 'ALREADY_PROCESSED';
    message: string;
    sessionId: string;
    paymentIntentId?: string;
    paymentStatus?: string;
    currency?: string;
    amountTotalCents?: number;
    amountTotal?: number;
    createdAt?: string;
    referenceType?: 'PURCHASE' | 'CART';
    referenceId?: string;
    purchaseId?: string;
    cartId?: string;
    gearName?: string;
    quantity?: number;
    buyerName?: string;
    purchaseStatus?: string;
    processedItems?: number;
    gearItems?: GearReceiptItem[];
    fulfillmentDelayed?: boolean;
}

@Injectable({ providedIn: 'root' })
export class PaymentApiService {
    private readonly base = `${environment.apiUrl}/payments`;

    /** Stripe publishable key — safe to expose in the browser */
    readonly stripePublicKey = environment.stripePublicKey;

    constructor(private http: HttpClient) { }

    createCheckoutSession(purchaseId: string, successUrl: string, cancelUrl: string): Observable<CheckoutSessionResponse> {
        return this.http.post<CheckoutSessionResponse>(
            `${this.base}/checkout/${purchaseId}?successUrl=${encodeURIComponent(successUrl)}&cancelUrl=${encodeURIComponent(cancelUrl)}`,
            {}
        );
    }

    confirmPayment(sessionId: string): Observable<PaymentReceiptResponse> {
        return this.http.post<PaymentReceiptResponse>(`${this.base}/success?sessionId=${encodeURIComponent(sessionId)}`, {});
    }
}
