import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { LucideAngularModule, ChevronRight, Mountain, Star, BadgeCheck, ShieldCheck, ShoppingBag, Heart, Truck, RotateCcw, Feather, CloudRain, Wind, Timer, Users, Package, Loader2, CheckCircle } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { GearApiService } from '../../gear/services/gear-api.service';
import { RentalApiService, RentalRequest } from '../../gear/services/rental-api.service';
import { CartApiService } from '../../gear/services/cart-api.service';
import { GearReviewApiService } from '../../gear/services/gear-review-api.service';
import { GearReviewResponse } from '../../gear/models/gear-review.model';
import { AuthService } from '../../../core/services/auth.service';
import { CartRequest } from '../../gear/models/cart.model';
import { ListingType } from '../../gear/models/gear.model';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { GearAvailabilityCalendarComponent } from './gear-availability-calendar.component';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-marketplace-product-details',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule, FormsModule, GearAvailabilityCalendarComponent],
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
    purchaseQty = 1;

    // Rental date range — ISO strings yyyy-MM-dd
    rentalStartDate: string = this.todayIso();
    rentalEndDate: string = this.tomorrowIso();

    /** ISO date pre-filled from the availability calendar click */
    calendarStartDate: string | null = null;

    actionLoading = false;
    successMessage: string | null = null;
    actionError: string | null = null;

    // Delivery Option State
    requiresDelivery = false;
    deliveryAddress = '';

    // Active Product Data
    product: any = null;
    
    // Reviews State
    reviews: GearReviewResponse[] = [];
    isSubmittingReview = false;
    newReviewRating = 5;
    newReviewComment = '';
    reviewSubmitError: string | null = null;
    reviewSubmitSuccess = false;
    isAuthenticated = false;

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
        private reviewApi: GearReviewApiService,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.isAuthenticated = this.authService.isLoggedIn();
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
                const baseUrl = environment.apiUrl.replace('/api', '').replace('/v1', ''); // fallback just in case
                
                const processUrl = (url: string) => {
                    if (url && url.startsWith('/uploads')) {
                        return baseUrl + url;
                    }
                    return url || 'https://images.unsplash.com/photo-1525811902-f2342640856e?w=800&q=80';
                };

                const images = (g.images && g.images.length > 0)
                    ? g.images.map((img: any) => processUrl(img.imageUrl))
                    : (g.imageUrls?.length > 0 ? g.imageUrls.map((u: string) => processUrl(u)) : ['https://images.unsplash.com/photo-1525811902-f2342640856e?w=800&q=80']);

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
                    provider: {
                        name: g.ownerName || 'Unknown Provider',
                        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
                        joined: '2023',
                        responseRate: '100% Response Rate',
                        superhost: false
                    },
                    listingType: g.listingType ?? 'FOR_RENT',
                    salePrice: g.salePrice ?? 0,
                    quantity: g.quantity ?? 0,
                    status: g.status ?? 'AVAILABLE'
                };

                const lt: ListingType = this.product.listingType;
                this.selectedAction = (lt === 'FOR_SALE') ? 'buy' : 'rent';
                
                this.loadReviews();
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

    loadReviews(): void {
        if (!this.product?.id) return;
        this.reviewApi.getReviewsForGear(this.product.id, 0, 50).subscribe({
            next: (res) => {
                this.reviews = res.content || [];
                // Recalculate local mock fields just in case backend data is stale
                if (this.reviews.length > 0) {
                    this.product.reviewCount = this.reviews.length;
                    const sum = this.reviews.reduce((acc, rv) => acc + rv.rating, 0);
                    this.product.rating = (sum / this.reviews.length).toFixed(1);
                } else {
                    this.product.reviewCount = 0;
                    this.product.rating = 0;
                }
            },
            error: (err) => console.error('Failed to load reviews', err)
        });
    }

    submitReview(): void {
        if (!this.product?.id || !this.newReviewRating) return;
        if (!this.newReviewComment || this.newReviewComment.trim().length < 5) {
            this.reviewSubmitError = "Comment must be at least 5 characters long.";
            return;
        }

        this.isSubmittingReview = true;
        this.reviewSubmitError = null;
        this.reviewSubmitSuccess = false;

        this.reviewApi.createReview({
            gearId: this.product.id,
            rating: this.newReviewRating,
            comment: this.newReviewComment.trim()
        }).subscribe({
            next: (newReview) => {
                this.isSubmittingReview = false;
                this.reviewSubmitSuccess = true;
                this.newReviewComment = '';
                this.newReviewRating = 5;
                // Prepend to list locally to update UI instantly
                this.reviews.unshift(newReview);
                this.product.reviewCount++;
                // Update average
                const sum = this.reviews.reduce((acc, rv) => acc + rv.rating, 0);
                this.product.rating = (sum / this.reviews.length).toFixed(1);
            },
            error: (err) => {
                this.isSubmittingReview = false;
                this.reviewSubmitError = err?.error?.message || "Failed to submit review. You may have already reviewed this item.";
            }
        });
    }

    setRating(rating: number): void {
        this.newReviewRating = rating;
    }

    setActiveTab(tab: string) {
        this.activeTab = tab;
    }

    setActiveImage(index: number) {
        this.activeImageIndex = index;
    }

    get canRent(): boolean {
        const lt = this.product?.listingType;
        return (lt === 'FOR_RENT' || lt === 'BOTH') && this.isInStock;
    }

    get canBuy(): boolean {
        const lt = this.product?.listingType;
        return (lt === 'FOR_SALE' || lt === 'BOTH') && this.isInStock;
    }

    get isInStock(): boolean {
        if (!this.product) return false;
        return this.product.quantity > 0 && this.product.status === 'AVAILABLE';
    }

    get isLimitedStock(): boolean {
        if (!this.product || !this.isInStock) return false;
        return this.product.quantity < 10;
    }

    get stockMessage(): string {
        if (!this.product) return '';
        if (!this.isInStock) return 'Out of stock';
        if (this.isLimitedStock) return `Limited stock: only ${this.product.quantity} left`;
        return `In stock: ${this.product.quantity} available`;
    }

    get rentalDays(): number {
        if (!this.rentalStartDate || !this.rentalEndDate) return 0;
        const start = new Date(this.rentalStartDate + 'T00:00:00');
        const end   = new Date(this.rentalEndDate   + 'T00:00:00');
        const diff  = Math.round((end.getTime() - start.getTime()) / 86400000);
        return Math.max(0, diff);
    }

    get rentalTotal(): number {
        return (this.product?.pricePerDay ?? 0) * Math.max(1, this.rentalDays);
    }

    get purchaseTotal(): number {
        return (this.product?.salePrice ?? 0) * Math.max(1, this.purchaseQty);
    }

    onRent(): void {
        if (!this.product || !this.product.id || !this.isInStock) return;

        const today = this.todayIso();
        if (!this.rentalStartDate || !this.rentalEndDate) {
            this.actionError = 'Please select both a start date and an end date.';
            return;
        }
        if (this.rentalStartDate < today) {
            this.actionError = 'Start date cannot be in the past.';
            return;
        }
        if (this.rentalEndDate <= this.rentalStartDate) {
            this.actionError = 'End date must be after the start date.';
            return;
        }
        if (this.rentalDays < 1 || this.rentalDays > 60) {
            this.actionError = 'Rental duration must be between 1 and 60 days.';
            return;
        }

        this.actionLoading = true;
        this.successMessage = null;
        this.actionError = null;

        const request: CartRequest = {
            gearId: this.product.id,
            itemType: 'RENT',
            quantity: 1,
            startDate: this.rentalStartDate,
            endDate: this.rentalEndDate,
            requiresDelivery: this.requiresDelivery,
            deliveryAddress: this.requiresDelivery ? this.deliveryAddress : undefined
        };

        this.cartApi.addToCart(request).subscribe({
            next: (res) => {
                this.actionLoading = false;
                this.successMessage = `Rental added to cart! (${this.rentalDays} day${this.rentalDays > 1 ? 's' : ''} · ${this.rentalTotal.toFixed(2)} TND)`;
                this.resetDeliveryState();
            },
            error: (err) => {
                this.actionLoading = false;
                this.actionError = err?.error?.message ?? 'Failed to add rental to cart. Please try again.';
            }
        });
    }

    onBuy(): void {
        if (!this.product || !this.product.id || !this.isInStock) return;
        if (this.purchaseQty > this.product.quantity) {
            this.actionError = `Only ${this.product.quantity} item(s) available.`;
            return;
        }
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

    /** Called when the availability calendar emits a free date click. */
    onCalendarDateSelected(isoDate: string): void {
        this.calendarStartDate = isoDate;
        this.rentalStartDate = isoDate;
        // Auto-advance end date to at least the next day
        const next = new Date(isoDate + 'T00:00:00');
        next.setDate(next.getDate() + 1);
        const nextIso = next.toISOString().slice(0, 10);
        if (this.rentalEndDate <= isoDate) {
            this.rentalEndDate = nextIso;
        }
        this.actionError = null;
    }

    // ---- date helpers ----
    todayIso(): string {
        return new Date().toISOString().slice(0, 10);
    }

    tomorrowIso(): string {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().slice(0, 10);
    }
}
