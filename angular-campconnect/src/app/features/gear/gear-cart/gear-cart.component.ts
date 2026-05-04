import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';
import { CartApiService } from '../services/cart-api.service';
import { CartResponse, CartItemResponse, CheckoutRequest } from '../models/cart.model';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-gear-cart-component',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    ButtonComponent,
    CardComponent,
    CardContentComponent
  ],
  templateUrl: './gear-cart.component.html',
  styles: []
})
export class GearCartComponent implements OnInit {
  cart: CartResponse | null = null;
  loading = true;
  checkingOut = false;
  error: string | null = null;
  checkoutError: string | null = null;

  constructor(
    private cartApi: CartApiService,
    private toastService: ToastService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading = true;
    this.error = null;
    this.cartApi.getCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load cart:', err);
        this.error = 'Could not load your cart. Please try again.';
        this.loading = false;
      }
    });
  }

  removeItem(itemId: string): void {
    this.cartApi.removeFromCart(itemId).subscribe({
      next: (updatedCart) => {
        this.cart = updatedCart;
        this.toastService.success('Item removed from cart');
      },
      error: () => {
        this.toastService.error('Failed to remove item');
      }
    });
  }

  checkout(): void {
    if (this.checkingOut) return;
    this.checkingOut = true;
    this.checkoutError = null;

    const baseUrl = window.location.origin;
    const successUrl = `${baseUrl}/payment/receipt?source=gear-cart&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/gear/cart`;

    // Resolve delivery coordinates from cart items (use first item that has them, else fallback)
    const itemWithCoords = this.cart?.items?.find(i => i.customerLat != null && i.customerLng != null);
    const deliveryAddress = itemWithCoords?.deliveryAddress
      || this.cart?.items?.find(i => i.deliveryAddress)?.deliveryAddress
      || 'Tunis, Tunisia';
    const customerLat = itemWithCoords?.customerLat ?? 36.8065;
    const customerLng = itemWithCoords?.customerLng ?? 10.1815;

    const checkoutRequest: CheckoutRequest = {
      deliveryMethod: 'DELIVERY',
      deliveryType: 'EXPRESS',
      deliveryAddress,
      customerLat,
      customerLng
    };

    this.cartApi.checkoutCart(checkoutRequest, successUrl, cancelUrl).subscribe({
      next: (res) => {
        // We got the Stripe Checkout URL! Redirect to it.
        window.location.href = res.checkoutUrl;
      },
      error: (err) => {
        this.checkingOut = false;
        console.error('Checkout failed:', err);
        const msg = err?.error?.error || err?.error?.message || 'Checkout failed. Please try again.';
        this.checkoutError = msg;
        this.toastService.error(msg);
      }
    });
  }

  get resolvedDeliveryAddress(): string {
    const fromItems = this.cart?.items?.find(i => i.deliveryAddress)?.deliveryAddress;
    return fromItems || 'Tunis, Tunisia';
  }

  getItemTypeLabel(type: string): string {
    return type === 'RENT' ? 'Rental' : 'Purchase';
  }

  trackByItemId(_index: number, item: CartItemResponse): string {
    return item.id;
  }
}
