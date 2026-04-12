import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';
import { CartApiService } from '../services/cart-api.service';
import { CartResponse, CartItemResponse } from '../models/cart.model';

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
  error: string | null = null;

  constructor(private cartApi: CartApiService) { }

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
        this.error = 'Failed to load your cart. Please try again.';
        this.loading = false;
      }
    });
  }

  removeItem(itemId: string): void {
    this.cartApi.removeFromCart(itemId).subscribe({
      next: (updatedCart) => {
        this.cart = updatedCart;
      },
      error: (err) => {
        console.error('Failed to remove item:', err);
        this.error = 'Failed to remove item. Please try again.';
      }
    });
  }

  checkout(): void {
    this.cartApi.checkoutCart().subscribe({
      next: () => {
        // Refresh cart after checkout
        this.loadCart();
      },
      error: (err) => {
        console.error('Checkout failed:', err);
        this.error = 'Checkout failed. Please try again.';
      }
    });
  }

  getItemTypeLabel(type: string): string {
    return type === 'RENT' ? 'Rental' : 'Purchase';
  }

  trackByItemId(_index: number, item: CartItemResponse): string {
    return item.id;
  }
}
