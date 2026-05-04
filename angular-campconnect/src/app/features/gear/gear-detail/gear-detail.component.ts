import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
    LucideAngularModule, ChevronLeft, Star, Share2, Heart, ShoppingCart,
    Calendar, MapPin, Package, Shield, Truck, RotateCcw, CheckCircle,
    ChevronRight, ThumbsUp, MessageSquare, Tag, ShoppingBag
} from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { BadgeComponent } from '../../../shared/components/badge.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card.component';
import { GearApiService } from '../services/gear-api.service';
import { RentalApiService, RentalRequest } from '../services/rental-api.service';
import { GearReviewApiService } from '../services/gear-review-api.service';
import { GearReviewResponse } from '../models/gear-review.model';
import { GearResponse, gearFirstImage, isGearAvailable, ListingType } from '../models/gear.model';
import { PaymentApiService } from '../services/payment-api.service';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
    selector: 'app-gear-detail',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        LucideAngularModule,
        ButtonComponent,
        BadgeComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardContentComponent,
    ],
    templateUrl: './gear-detail.component.html',
    styles: [`
    :host {
      display: block;
    }
  `]
})
export class GearDetailComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    gearId: string | null = null;
    currentImageIndex = 0;

    // ── Buy/Rent action state ────────────────────────────────────────────────
    /** Active tab: 'rent' or 'buy'. Defaults based on listingType. */
    selectedAction: 'rent' | 'buy' = 'rent';
    /** Number of rental days (1–60). */
    rentalDays = 1;
    /** Purchase quantity. */
    purchaseQty = 1;

    // ── Feedback state ───────────────────────────────────────────────────────
    actionLoading = false;
    successMessage: string | null = null;
    actionError: string | null = null;

    // ── Gear data ────────────────────────────────────────────────────────────
    gear: GearResponse | null = null;
    loading = true;
    error: string | null = null;

    // ── Reviews state ────────────────────────────────────────────────────────
    reviews: GearReviewResponse[] = [];
    reviewsPage = 0;
    hasMoreReviews = true;
    loadingReviews = false;
    newReviewRating = 5;
    newReviewComment = '';
    submittingReview = false;

    // Icons
    readonly ChevronLeft = ChevronLeft;
    readonly Star = Star;
    readonly Share2 = Share2;
    readonly Heart = Heart;
    readonly ShoppingCart = ShoppingCart;
    readonly Calendar = Calendar;
    readonly MapPin = MapPin;
    readonly Package = Package;
    readonly Shield = Shield;
    readonly Truck = Truck;
    readonly RotateCcw = RotateCcw;
    readonly CheckCircle = CheckCircle;
    readonly ChevronRight = ChevronRight;
    readonly ThumbsUp = ThumbsUp;
    readonly MessageSquare = MessageSquare;
    readonly Tag = Tag;
    readonly ShoppingBag = ShoppingBag;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private gearApi: GearApiService,
        private rentalApi: RentalApiService,
        private gearReviewApi: GearReviewApiService,
        private paymentApi: PaymentApiService,
        private toastService: ToastService
    ) { }

    ngOnInit(): void {
        this.loading = true;
        this.route.paramMap.pipe(
            takeUntil(this.destroy$),
            switchMap(params => {
                this.gearId = params.get('id');
                if (!this.gearId) {
                    throw new Error('No gear item ID was provided.');
                }
                this.error = null;
                return this.gearApi.getGearById(this.gearId);
            })
        ).subscribe({
            next: (data) => {
                this.gear = data;
                this.loading = false;
                // Set default tab based on listing type
                const lt: ListingType = data.listingType ?? 'FOR_RENT';
                this.selectedAction = (lt === 'FOR_SALE') ? 'buy' : 'rent';
                // Load reviews
                this.loadReviews(true);

                // Handle payment status from query params
                this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe(qParams => {
                    const paymentStatus = qParams.get('payment');
                    const sessionId = qParams.get('session_id');
                    
                    if (paymentStatus === 'success' && sessionId) {
                        this.router.navigate(['/payment/receipt'], {
                            queryParams: { session_id: sessionId, source: 'gear-detail' }
                        });
                    } else if (paymentStatus === 'cancel') {
                        this.toastService.error('Payment was cancelled.');
                        this.router.navigate([], {
                            relativeTo: this.route,
                            queryParams: { payment: null },
                            queryParamsHandling: 'merge'
                        });
                    }
                });
            },
            error: (err) => {
                this.error = err?.status === 404
                    ? 'Gear item not found.'
                    : 'Failed to load gear details. Please try again.';
                this.loading = false;
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // Manual reload method for error retry
    loadGear(id: string): void {
        this.loading = true;
        this.error = null;
        this.gearApi.getGearById(id).subscribe({
            next: (data) => {
                this.gear = data;
                this.loading = false;
                const lt: ListingType = data.listingType ?? 'FOR_RENT';
                this.selectedAction = (lt === 'FOR_SALE') ? 'buy' : 'rent';
                this.loadReviews(true);
            },
            error: (err) => {
                this.error = err?.status === 404
                    ? 'Gear item not found.'
                    : 'Failed to load gear details. Please try again.';
                this.loading = false;
            }
        });
    }

    // ── Computed helpers ─────────────────────────────────────────────────────

    loadReviews(reset = false): void {
        if (!this.gearId) return;
        if (reset) {
            this.reviews = [];
            this.reviewsPage = 0;
            this.hasMoreReviews = true;
        }
        if (!this.hasMoreReviews) return;

        this.loadingReviews = true;
        this.gearReviewApi.getReviewsForGear(this.gearId, this.reviewsPage, 5).subscribe({
            next: (page) => {
                this.reviews = [...this.reviews, ...page.content];
                this.hasMoreReviews = !page.last;
                if (!page.last) this.reviewsPage++;
                this.loadingReviews = false;
            },
            error: () => {
                this.loadingReviews = false;
            }
        });
    }

    submitReview(): void {
        if (!this.gearId || !this.newReviewComment.trim()) return;
        this.submittingReview = true;
        this.gearReviewApi.createReview({
            gearId: this.gearId,
            rating: this.newReviewRating,
            comment: this.newReviewComment.trim()
        }).subscribe({
            next: (review) => {
                this.toastService.success('Review submitted successfully!');
                this.newReviewComment = '';
                this.newReviewRating = 5;
                this.submittingReview = false;
                // Prepend the new review
                this.reviews.unshift(review);
                if (this.gear) {
                    this.gear.reviewCount = (this.gear.reviewCount || 0) + 1;
                    // Note: Local average update is an approximation, backend has exact.
                }
            },
            error: () => {
                this.submittingReview = false;
            }
        });
    }

    setRating(rating: number): void {
        this.newReviewRating = rating;
    }

    get isAvailable(): boolean {
        return this.gear ? isGearAvailable(this.gear) : false;
    }

    get firstImage(): string {
        return this.gear ? gearFirstImage(this.gear) : 'assets/images/gear-placeholder.jpg';
    }

    get currentImage(): string {
        if (!this.gear?.images?.length) return 'assets/images/gear-placeholder.jpg';
        return this.gear.images[this.currentImageIndex]?.imageUrl ?? this.firstImage;
    }

    get canRent(): boolean {
        const lt = this.gear?.listingType;
        return lt === 'FOR_RENT' || lt === 'BOTH';
    }

    get canBuy(): boolean {
        const lt = this.gear?.listingType;
        return lt === 'FOR_SALE' || lt === 'BOTH';
    }

    get effectiveDailyPrice(): number {
        return this.gear?.dailyPrice ?? this.gear?.price ?? 0;
    }

    get effectiveSalePrice(): number {
        return this.gear?.salePrice ?? 0;
    }

    get rentalTotal(): number {
        return this.effectiveDailyPrice * Math.max(1, this.rentalDays);
    }

    get purchaseTotal(): number {
        return this.effectiveSalePrice * Math.max(1, this.purchaseQty);
    }

    // ── Actions ──────────────────────────────────────────────────────────────

    onRent(): void {
        if (!this.gear || !this.gearId) return;
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

        const request: RentalRequest = {
            gearId: this.gearId,
            startDate: this.formatDate(today),
            endDate: this.formatDate(end),
        };

        this.rentalApi.create(request).subscribe({
            next: (res) => {
                this.actionLoading = false;
                this.toastService.success(`Rental request submitted! Total: $${res.totalPrice?.toFixed(2)} for ${res.rentalDays} day(s).`);
                this.successMessage = `Rental request submitted! Total: $${res.totalPrice?.toFixed(2)} for ${res.rentalDays} day(s). Status: ${res.status}.`;
            },
            error: (err) => {
                this.actionLoading = false;
            }
        });
    }

    onBuy(): void {
        if (!this.gear || !this.gearId) return;
        this.actionLoading = true;
        this.successMessage = null;
        this.actionError = null;

        this.gearApi.purchaseGear({ gearId: this.gearId, quantity: this.purchaseQty }).subscribe({
            next: (res) => {
                this.toastService.success('Purchase created! Redirecting to payment...');
                this.successMessage = `Purchase created! Total: $${res.totalPrice?.toFixed(2)}. Order ID: ${res.id}.`;
                
                // Call Stripe Checkout
                const successUrl = `${window.location.origin}/payment/receipt?source=gear-detail&session_id={CHECKOUT_SESSION_ID}`;
                const cancelUrl = `${window.location.origin}/gear/${this.gearId}?payment=cancel`;
                
                this.paymentApi.createCheckoutSession(res.id, successUrl, cancelUrl).subscribe({
                    next: (checkoutRes) => {
                        window.location.href = checkoutRes.checkoutUrl;
                    },
                    error: (checkoutErr) => {
                        this.actionLoading = false;
                        this.toastService.error('Failed to initiate payment.');
                        this.actionError = 'Payment initiation failed.';
                    }
                });
            },
            error: (err) => {
                this.actionLoading = false;
                this.toastService.error('Failed to create purchase.');
                this.actionError = 'Purchase failed.';
            }
        });
    }

    navigate(path: string): void {
        this.router.navigate([path]);
    }

    nextImage(): void {
        if (!this.gear?.images?.length) return;
        this.currentImageIndex = (this.currentImageIndex + 1) % this.gear.images.length;
    }

    prevImage(): void {
        if (!this.gear?.images?.length) return;
        this.currentImageIndex = this.currentImageIndex === 0
            ? this.gear.images.length - 1
            : this.currentImageIndex - 1;
    }

    range(n: number): number[] {
        return Array.from({ length: n }, (_, i) => i);
    }

    private formatDate(d: Date): string {
        return d.toISOString().slice(0, 10);
    }
}
