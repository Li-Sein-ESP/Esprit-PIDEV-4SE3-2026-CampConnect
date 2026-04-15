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
import { GearResponse, gearFirstImage, isGearAvailable, ListingType } from '../models/gear.model';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

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
        private rentalApi: RentalApiService
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
                this.successMessage = `Rental request submitted! Total: $${res.totalPrice?.toFixed(2)} for ${res.rentalDays} day(s). Status: ${res.status}.`;
            },
            error: (err) => {
                this.actionLoading = false;
                this.actionError = err?.error?.message ?? 'Failed to create rental. Please try again.';
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
                this.actionLoading = false;
                this.successMessage = `Purchase confirmed! Total: $${res.totalPrice?.toFixed(2)}. Order ID: ${res.id}.`;
            },
            error: (err) => {
                this.actionLoading = false;
                this.actionError = err?.error?.message ?? 'Purchase failed. Please try again.';
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
