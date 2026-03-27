import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { GearApiService } from '../services/gear-api.service';
import { GearCreateRequest, ListingType } from '../models/gear.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-gear-create',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './gear-create.component.html',
    styleUrls: ['./gear-create.component.scss']
})
export class GearCreateComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    gearForm!: FormGroup;
    isSubmitting = false;
    serverError: string | null = null;
    validationErrors: { [key: string]: string } = {};

    readonly listingTypes: { value: ListingType; label: string; icon: string }[] = [
        { value: 'FOR_RENT', label: 'For Rent', icon: '🏕️' },
        { value: 'FOR_SALE', label: 'For Sale', icon: '🏷️' },
        { value: 'BOTH', label: 'Both', icon: '🔄' },
    ];

    constructor(
        private fb: FormBuilder,
        private gearService: GearApiService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.gearForm = this.fb.group({
            name: ['', [Validators.required, Validators.maxLength(100)]],
            description: ['', [Validators.required, Validators.maxLength(1000)]],
            category: ['', [Validators.required]],
            brand: ['', [Validators.required]],
            listingType: ['FOR_RENT', [Validators.required]],
            dailyPrice: [null],
            salePrice: [null],
            condition: ['NEW', [Validators.required]],
            stockQuantity: [1, [Validators.required, Validators.min(1)]],
            location: ['', [Validators.required]],
        });

        // Apply conditional validators whenever listingType changes
        this.gearForm.get('listingType')!.valueChanges.pipe(
            takeUntil(this.destroy$)
        ).subscribe(type => {
            this.applyPriceValidators(type);
        });

        // Apply initial validators based on default
        this.applyPriceValidators('FOR_RENT');
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    get listingType(): ListingType {
        return this.gearForm.get('listingType')!.value;
    }

    get showDailyPrice(): boolean {
        return this.listingType === 'FOR_RENT' || this.listingType === 'BOTH';
    }

    get showSalePrice(): boolean {
        return this.listingType === 'FOR_SALE' || this.listingType === 'BOTH';
    }

    private applyPriceValidators(type: ListingType): void {
        const dailyPriceCtrl = this.gearForm.get('dailyPrice')!;
        const salePriceCtrl = this.gearForm.get('salePrice')!;

        if (type === 'FOR_RENT') {
            dailyPriceCtrl.setValidators([Validators.required, Validators.min(0.01)]);
            salePriceCtrl.clearValidators();
        } else if (type === 'FOR_SALE') {
            salePriceCtrl.setValidators([Validators.required, Validators.min(0.01)]);
            dailyPriceCtrl.clearValidators();
        } else {
            // BOTH
            dailyPriceCtrl.setValidators([Validators.required, Validators.min(0.01)]);
            salePriceCtrl.setValidators([Validators.required, Validators.min(0.01)]);
        }

        dailyPriceCtrl.updateValueAndValidity();
        salePriceCtrl.updateValueAndValidity();
    }

    onSubmit(): void {
        this.serverError = null;
        this.validationErrors = {};

        if (this.gearForm.invalid) {
            this.gearForm.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;
        const v = this.gearForm.value;

        const request: GearCreateRequest = {
            name: v.name,
            description: v.description,
            category: v.category,
            condition: v.condition,
            quantity: v.stockQuantity,
            listingType: v.listingType,
            // Backward-compat price = dailyPrice (or salePrice if FOR_SALE)
            price: v.dailyPrice ?? v.salePrice ?? 0,
            dailyPrice: v.dailyPrice ?? undefined,
            salePrice: v.salePrice ?? undefined,
            imageUrls: [],
        };

        this.gearService.createGear(request).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.router.navigate(['/gear/my-gear']);
            },
            error: (err) => {
                this.isSubmitting = false;
                if (err.status === 400 && err.error?.errors) {
                    this.validationErrors = err.error.errors;
                } else if (err.error?.message) {
                    this.serverError = err.error.message;
                } else {
                    this.serverError = 'An unexpected error occurred. Please try again.';
                }
            }
        });
    }

    hasError(field: string): boolean {
        const control = this.gearForm.get(field);
        return !!(control && control.invalid && (control.dirty || control.touched)) || !!this.validationErrors[field];
    }

    getErrorMessage(field: string): string {
        if (this.validationErrors[field]) {
            return this.validationErrors[field];
        }
        const control = this.gearForm.get(field);
        if (!control || !control.errors) return '';

        if (control.errors['required']) return `${field} is required`;
        if (control.errors['minlength']) return `${field} must be at least ${control.errors['minlength'].requiredLength} characters`;
        if (control.errors['maxlength']) return `${field} cannot exceed ${control.errors['maxlength'].requiredLength} characters`;
        if (control.errors['min']) return `${field} must be >= ${control.errors['min'].min}`;
        return 'Invalid input';
    }
}
