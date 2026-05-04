import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ChevronLeft, Calendar, Trash2, Edit2, ShieldCheck, Star, ArrowRight, ShoppingBag, Loader2, Truck } from 'lucide-angular';
import { CartApiService } from '../../gear/services/cart-api.service';
import { CartResponse, CartItemResponse, CheckoutRequest } from '../../gear/models/cart.model';
import { MapPickerComponent } from '../../../shared/components/map-picker/map-picker.component';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/auth.models';
import { WarehousePickerComponent } from '../../../shared/components/warehouse-picker/warehouse-picker.component';

@Component({
    selector: 'app-marketplace-cart',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule, MapPickerComponent, WarehousePickerComponent],
    templateUrl: './marketplace-cart.component.html',
    styleUrls: ['./marketplace-cart.component.scss']
})
export class MarketplaceCartComponent implements OnInit, OnDestroy {
    private navigationTimer?: number;
    
    icons = {
        ChevronLeft, Calendar, Trash2, Edit2, ShieldCheck, Star, ArrowRight, ShoppingBag, Loader2, Truck
    };

    cart: CartResponse | null = null;
    currentUser: User | null = null;
    loading = true;
    error: string | null = null;
    actionLoading = false;
    successMessage: string | null = null;

    // Delivery Preference
    deliveryMethod: 'pickup' | 'delivery' = 'delivery';
    deliveryType: 'EXPRESS' | 'NORMAL' = 'EXPRESS';
    pickupWarehouseId?: string;
    selectedGovernorate = '';
    selectedCity = '';
    selectedLat?: number;
    selectedLng?: number;

    governorates = [
        'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Zaghouan', 'Bizerte', 'Béja',
        'Jendouba', 'Kef', 'Siliana', 'Kairouan', 'Kasserine', 'Sidi Bouzid', 'Sousse',
        'Monastir', 'Mahdia', 'Sfax', 'Gafsa', 'Tozeur', 'Kebili', 'Gabès', 'Medenine', 'Tataouine'
    ];

    citiesMap: { [key: string]: string[] } = {
        'Tunis': ['Medina', 'El Menzah', 'La Marsa', 'Carthage', 'Bardo', 'Le Kram'],
        'Ariana': ['Ariana Ville', 'Ennasr', 'Raoued', 'Soukra', 'Kalaat el Andalous'],
        'Ben Arous': ['Ben Arous', 'Radès', 'Mornag', 'Hammam Lif', 'Ezzahra'],
        'Sousse': ['Sousse Ville', 'Hammam Sousse', 'Akouda', 'Kalaa Kebira', 'Port El Kantaoui'],
        'Sfax': ['Sfax Ville', 'Sakiet Ezzit', 'Sakiet Eddaier', 'Thyna', 'Kerkennah'],
        'Nabeul': ['Nabeul Ville', 'Hammamet', 'Kelibia', 'Dar Chaabane', 'Korba'],
        'Bizerte': ['Bizerte Nord', 'Bizerte Sud', 'Menzel Bourguiba', 'Zarzouna']
    };

    get availableCities(): string[] {
        return this.citiesMap[this.selectedGovernorate] || ['City Center', 'North District', 'South District'];
    }

    constructor(private router: Router, private cartApi: CartApiService, private authService: AuthService, private cdr: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.loadCart();
        this.authService.getCurrentUser().subscribe(user => {
            this.currentUser = user;
        });
    }

    loadCart(): void {
        this.loading = true;
        this.error = null;
        this.cartApi.getCart().subscribe({
            next: (cart) => {
                this.cart = cart;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.error = 'Failed to load your cart. Make sure you are logged in.';
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    get subtotal(): number {
        return this.cart?.subtotal || 0;
    }

    get discountAmount(): number {
        return this.cart?.discountAmount || 0;
    }

    get totalDeposit(): number {
        return this.cart?.totalDeposit || 0;
    }

    get deliveryCost(): number {
        if (!this.cart || this.cart.items.length === 0) return 0;
        if (this.deliveryMethod === 'pickup') return 0;

        let cost = 0;
        let requiresDeliveryCount = 0;

        this.cart.items.forEach(item => {
            // we assume all items require delivery if method is delivery
            requiresDeliveryCount++;
        });

        if (requiresDeliveryCount > 0) {
            cost = this.cart.deliveryFee !== undefined && this.cart.deliveryFee > 0 ? this.cart.deliveryFee : (requiresDeliveryCount * 15);
        }

        return cost;
    }

    get taxes(): number {
        return Math.round(((this.subtotal - this.discountAmount) + this.deliveryCost) * 0.08);
    }

    get grandTotal(): number {
        return (this.subtotal - this.discountAmount) + this.totalDeposit + this.deliveryCost + this.taxes;
    }

    removeItem(itemId: string) {
        if (confirm('Remove this item from your cart?')) {
            this.actionLoading = true;
            this.cartApi.removeFromCart(itemId).subscribe({
                next: (cart) => {
                    this.cart = cart;
                    this.actionLoading = false;
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    this.actionLoading = false;
                    this.error = 'Could not remove item from cart.';
                    this.cdr.detectChanges();
                }
            });
        }
    }

    onDeliveryLocationSelected(loc: {lat: number, lng: number} | null) {
        if (loc) {
            this.selectedLat = loc.lat;
            this.selectedLng = loc.lng;
        } else {
            this.selectedLat = undefined;
            this.selectedLng = undefined;
        }
    }

    onWarehouseSelected(id: string) {
        this.pickupWarehouseId = id;
    }

    proceedToCheckout() {
        if (!this.cart || this.cart.items.length === 0) return;

        this.actionLoading = true;
        this.error = null;

        const requiresDelivery = this.deliveryMethod === 'delivery';
        let deliveryAddress = '';

        if (requiresDelivery) {
            if (!this.selectedGovernorate || !this.selectedCity || !this.selectedLat) {
                this.error = "Please specify full delivery details including pinning your location on the map.";
                this.actionLoading = false;
                return;
            }
            deliveryAddress = `${this.selectedGovernorate}, ${this.selectedCity}`;
        } else {
            if (!this.pickupWarehouseId) {
                this.error = "Please select a pickup warehouse.";
                this.actionLoading = false;
                return;
            }
        }

        const checkoutReq: CheckoutRequest = {
            deliveryMethod: requiresDelivery ? 'DELIVERY' as any : 'PICKUP' as any,
            deliveryType: requiresDelivery ? this.deliveryType as any : undefined,
            deliveryAddress: requiresDelivery ? deliveryAddress : undefined,
            customerLat: requiresDelivery ? this.selectedLat : undefined,
            customerLng: requiresDelivery ? this.selectedLng : undefined,
            pickupWarehouseId: !requiresDelivery ? this.pickupWarehouseId : undefined
        };

        // First, update all cart items with delivery pref
        this.cartApi.updateDeliveryLocation({
            requiresDelivery: requiresDelivery,
            deliveryAddress: requiresDelivery ? deliveryAddress : undefined,
            customerLat: requiresDelivery ? this.selectedLat : undefined,
            customerLng: requiresDelivery ? this.selectedLng : undefined
        }).subscribe({
            next: (updatedCart) => {
                const baseUrl = window.location.origin;
                const successUrl = `${baseUrl}/payment/receipt?source=marketplace&session_id={CHECKOUT_SESSION_ID}`;
                const cancelUrl = `${baseUrl}/marketplace/cart`;

                this.cartApi.checkoutCart(checkoutReq, successUrl, cancelUrl).subscribe({
                    next: (res) => {
                        this.actionLoading = false;
                        this.cdr.detectChanges();
                        window.location.href = res.checkoutUrl;
                    },
                    error: (err) => {
                        this.actionLoading = false;
                        this.error = err?.error?.error || err?.error?.message || 'Checkout failed. Please try again.';
                        this.cdr.detectChanges();
                    }
                });
            },
            error: (err) => {
                this.actionLoading = false;
                this.error = "Could not update delivery location on server.";
                this.cdr.detectChanges();
            }
        });
    }

    ngOnDestroy(): void {
        if (this.navigationTimer) {
            clearTimeout(this.navigationTimer);
        }
    }
}
