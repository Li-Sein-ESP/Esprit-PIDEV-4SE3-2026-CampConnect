import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { GearApiService } from '../services/gear-api.service';
import { GearCreateRequest } from '../models/gear.model';

@Component({
    selector: 'app-gear-create',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './gear-create.component.html',
    styleUrls: ['./gear-create.component.scss']
})
export class GearCreateComponent implements OnInit {
    gearForm!: FormGroup;
    isSubmitting = false;
    serverError: string | null = null;
    validationErrors: { [key: string]: string } = {};

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
            pricePerDay: [0, [Validators.required, Validators.min(0)]],
            purchasePrice: [0, [Validators.min(0)]],
            condition: ['NEW', [Validators.required]],
            stockQuantity: [1, [Validators.required, Validators.min(1)]],
            location: ['', [Validators.required]],
        });
    }

    onSubmit(): void {
        this.serverError = null;
        this.validationErrors = {};

        if (this.gearForm.invalid) {
            this.gearForm.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;
        const request: GearCreateRequest = this.gearForm.value;

        this.gearService.createGear(request).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.router.navigate(['/gear/my-gear']);
            },
            error: (err) => {
                this.isSubmitting = false;
                if (err.status === 400 && err.error?.errors) {
                    // Backend validation errors format from GlobalExceptionHandler
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
