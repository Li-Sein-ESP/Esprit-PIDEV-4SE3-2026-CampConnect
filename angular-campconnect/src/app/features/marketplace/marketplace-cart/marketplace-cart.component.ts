import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ChevronLeft, Calendar, Trash2, Edit2, ShieldCheck, Star, ArrowRight, ShoppingBag, Loader2, Truck } from 'lucide-angular';
import { CartApiService } from '../../gear/services/cart-api.service';
import { CartResponse, CartItemResponse } from '../../gear/models/cart.model';

@Component({
    selector: 'app-marketplace-cart',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
    templateUrl: './marketplace-cart.component.html',
    styleUrls: ['./marketplace-cart.component.scss']
})
export class MarketplaceCartComponent implements OnDestroy {
    private navigationTimer?: number;
    
    icons = {
        ChevronLeft, Calendar, Trash2, Edit2, ShieldCheck, Star, ArrowRight, ShoppingBag, Loader2, Truck
    };

    cart: CartResponse | null = null;
    loading = true;
    error: string | null = null;
    actionLoading = false;
    successMessage: string | null = null;

    constructor(private router: Router, private cartApi: CartApiService) { }

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
                this.error = 'Failed to load your cart. Make sure you are logged in.';
                this.loading = false;
            }
        });
    }

    get subtotal(): number {
        return this.cart?.subtotal || 0;
    }

    get totalDeposit(): number {
        return this.cart?.totalDeposit || 0;
    }

    get deliveryCost(): number {
        if (!this.cart || this.cart.items.length === 0) return 0;

        let cost = 0;
        let requiresDeliveryCount = 0;

        this.cart.items.forEach(item => {
            if (item.requiresDelivery) {
                requiresDeliveryCount++;
            }
        });

        if (requiresDeliveryCount > 0) {
            cost = requiresDeliveryCount * 15; // $15 per delivery item as handled earlier
        }

        return cost;
    }

    get taxes(): number {
        return Math.round((this.subtotal + this.deliveryCost) * 0.08);
    }

    get grandTotal(): number {
        return this.subtotal + this.totalDeposit + this.deliveryCost + this.taxes;
    }

    removeItem(itemId: string) {
        if (confirm('Remove this item from your cart?')) {
            this.actionLoading = true;
            this.cartApi.removeFromCart(itemId).subscribe({
                next: (cart) => {
                    this.cart = cart;
                    this.actionLoading = false;
                },
                error: (err) => {
                    this.actionLoading = false;
                    this.error = 'Could not remove item from cart.';
                }
            });
        }
    }

    proceedToCheckout() {
        if (!this.cart || this.cart.items.length === 0) return;

        this.actionLoading = true;
        this.cartApi.checkoutCart().subscribe({
            next: () => {
                this.actionLoading = false;
                this.successMessage = "Your checkout was successful! Your purchases and rentals are confirmed.";
                this.cart = null; // Clear view
                this.navigationTimer = window.setTimeout(() => {
                    this.router.navigate(['/marketplace']);
                }, 3000);
            },
            error: (err) => {
                this.actionLoading = false;
                this.error = err?.error?.message ?? 'Checkout failed. Please try again.';
            }
        });
    }

    ngOnDestroy(): void {
        if (this.navigationTimer) {
            clearTimeout(this.navigationTimer);
        }
    }
}
