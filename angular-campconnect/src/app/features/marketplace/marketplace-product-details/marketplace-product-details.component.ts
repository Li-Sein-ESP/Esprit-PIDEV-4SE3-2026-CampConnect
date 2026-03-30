import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { LucideAngularModule, ChevronRight, Mountain, Star, BadgeCheck, ShieldCheck, ShoppingBag, Heart, Truck, RotateCcw, Feather, CloudRain, Wind, Timer, Users, Package, Loader2, CheckCircle } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { GearApiService } from '../../gear/services/gear-api.service';
import { RentalApiService, RentalRequest } from '../../gear/services/rental-api.service';
import { CartApiService } from '../../gear/services/cart-api.service';
import { CartRequest } from '../../gear/models/cart.model';
import { ListingType } from '../../gear/models/gear.model';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-marketplace-product-details',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule, FormsModule],
    templateUrl: './marketplace-product-details.component.html',
    styleUrls: ['./marketplace-product-details.component.scss']
})
export class MarketplaceProductDetailsComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    // Icons
    icons = {
        ChevronRight, Mountain, Star, BadgeCheck, ShieldCheck, ShoppingBag, Heart, Truck, RotateCcw,
        Feather, CloudRain, Wind, Timer, Users, Package, Loader2, CheckCircle
    };

    activeTab: string = 'description';
    activeImageIndex: number = 0;

    // Buy/Rent action state
    selectedAction: 'rent' | 'buy' = 'rent';
    rentalDays = 1;
    purchaseQty = 1;

    actionLoading = false;
    successMessage: string | null = null;
    actionError: string | null = null;

    // Delivery Option State
    requiresDelivery = false;
    deliveryAddress = '';

    // Active Product Data
    product: any = null;

    relatedProducts = [
        {
            id: '2',
            name: 'NEMO Disco 15 Sleeping Bag',
            category: 'Sleeping Bags',
            price: 18,
            rating: 4.8,
            image: 'https://images.unsplash.com/photo-1445308394109-4ec2920981b1?w=600&q=80'
        },
        {
            id: '3',
            name: 'Jetboil Flash Cooking System',
            category: 'Camp Kitchen',
            price: 12,
            rating: 4.9,
            image: 'https://images.unsplash.com/photo-1571687949921-1306bfb24b72?w=600&q=80'
        },
        {
            id: '4',
            name: 'Helinox Chair Zero',
            category: 'Furniture',
            price: 8,
            rating: 4.7,
            image: 'https://images.unsplash.com/photo-1517824806704-9040b037703b?w=600&q=80'
        },
        {
            id: '5',
            name: 'Osprey Atmos AG 65',
            category: 'Backpacks',
            price: 24,
            rating: 4.9,
            image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80'
        }
    ];

    constructor(
        private route: ActivatedRoute,
        private gearService: GearApiService,
        private rentalApi: RentalApiService,
        private cartApi: CartApiService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.route.paramMap.pipe(
            takeUntil(this.destroy$),
            switchMap(params => {
                const id = params.get('id');
                if (!id) {
                    this.router.navigate(['/marketplace']);
                    throw new Error('No product ID provided');
                }
                return this.gearService.getGearById(id);
            })
        ).subscribe({
            next: (g: any) => {
                const images = (g.images && g.images.length > 0)
                    ? g.images.map((img: any) => img.imageUrl)
                    : (g.imageUrls?.length > 0 ? g.imageUrls : ['https://images.unsplash.com/photo-1525811902-f2342640856e?w=800&q=80']);

                this.product = {
                    id: g.id,
                    name: g.name,
                    brand: g.brand || 'ConnectCamp Provider',
                    pricePerDay: g.price || g.pricePerDay || 0,
                    rating: g.rating || 4.5,
                    reviewCount: g.reviewCount || Math.floor(Math.random() * 50),
                    condition: g.condition,
                    description: g.description,
                    features: [
                        { icon: Feather, text: 'Inspected for quality' },
                        { icon: ShieldCheck, text: 'Renter Protection' }
                    ],
                    specs: [
                        { label: 'Category', value: g.category },
                        { label: 'Listing ID', value: g.id }
                    ],
                    images: images,
                    reviews: [],
                    provider: {
                        name: g.ownerName || 'Unknown Provider',
                        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
                        joined: '2023',
                        responseRate: '100% Response Rate',
                        superhost: false
                    },
                    listingType: g.listingType ?? 'FOR_RENT',
                    salePrice: g.salePrice ?? 0
                };

                const lt: ListingType = this.product.listingType;
                this.selectedAction = (lt === 'FOR_SALE') ? 'buy' : 'rent';
            },
            error: (err) => {
                console.error('Failed to load product details', err);
                this.router.navigate(['/marketplace']);
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    setActiveTab(tab: string) {
        this.activeTab = tab;
    }

    setActiveImage(index: number) {
        this.activeImageIndex = index;
    }

    get canRent(): boolean {
        const lt = this.product?.listingType;
        return lt === 'FOR_RENT' || lt === 'BOTH';
    }

    get canBuy(): boolean {
        const lt = this.product?.listingType;
        return lt === 'FOR_SALE' || lt === 'BOTH';
    }

    get rentalTotal(): number {
        return (this.product?.pricePerDay ?? 0) * Math.max(1, this.rentalDays);
    }

    get purchaseTotal(): number {
        return (this.product?.salePrice ?? 0) * Math.max(1, this.purchaseQty);
    }

    onRent(): void {
        if (!this.product || !this.product.id) return;
        if (this.rentalDays < 1 || this.rentalDays > 60) {
            this.actionError = 'Rental duration must be between 1 and 60 days.';
            return;
        }
        this.actionLoading = true;
        this.successMessage = null;
        this.actionError = null;

        const today = new Date();
        const end = new Date(today);
        end.setDate(today.getDate() + this.rentalDays);

        const request: CartRequest = {
            gearId: this.product.id,
            itemType: 'RENT',
            quantity: 1, // rentals currently hardcoded to 1 qty per request
            startDate: this.formatDate(today),
            endDate: this.formatDate(end),
            requiresDelivery: this.requiresDelivery,
            deliveryAddress: this.requiresDelivery ? this.deliveryAddress : undefined
        };

        this.cartApi.addToCart(request).subscribe({
            next: (res) => {
                this.actionLoading = false;
                this.successMessage = `Added rental to cart! Cart subtotal: $${res.subtotal?.toFixed(2)}`;
                this.resetDeliveryState();
            },
            error: (err) => {
                this.actionLoading = false;
                this.actionError = err?.error?.message ?? 'Failed to add rental to cart. Please try again.';
            }
        });
    }

    onBuy(): void {
        if (!this.product || !this.product.id) return;
        this.actionLoading = true;
        this.successMessage = null;
        this.actionError = null;

        const request: CartRequest = {
            gearId: this.product.id,
            itemType: 'BUY',
            quantity: this.purchaseQty,
            requiresDelivery: this.requiresDelivery,
            deliveryAddress: this.requiresDelivery ? this.deliveryAddress : undefined
        };

        this.cartApi.addToCart(request).subscribe({
            next: (res) => {
                this.actionLoading = false;
                this.successMessage = `Added purchase to cart! Cart subtotal: $${res.subtotal?.toFixed(2)}`;
                this.resetDeliveryState();
            },
            error: (err) => {
                this.actionLoading = false;
                this.actionError = err?.error?.message ?? 'Failed to add purchase to cart. Please try again.';
            }
        });
    }

    private formatDate(d: Date): string {
        return d.toISOString().slice(0, 10);
    }

    private resetDeliveryState() {
        this.requiresDelivery = false;
        this.deliveryAddress = '';
    }
}
