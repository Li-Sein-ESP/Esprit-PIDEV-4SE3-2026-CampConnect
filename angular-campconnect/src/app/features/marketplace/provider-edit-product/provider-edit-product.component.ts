import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { GearApiService } from '../../gear/services/gear-api.service';
import { GearStatus } from '../../gear/models/gear.model';

@Component({
    selector: 'app-provider-edit-product',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './provider-edit-product.component.html',
    styleUrls: ['./provider-edit-product.component.scss']
})
export class ProviderEditProductComponent implements OnInit {
    productForm!: FormGroup;
    productId: string = '';
    loading = true;
    saving = false;
    error: string | null = null;
    showToast: boolean = false;
    toastMessage: string = '';
    toastType: 'success' | 'error' = 'success';

    imageUrls: string[] = [];

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private gearApi: GearApiService
    ) { }

    ngOnInit(): void {
        this.productId = this.route.snapshot.paramMap.get('id') || '';
        this.initForm();
        if (this.productId) {
            this.loadProductData();
        } else {
            this.error = 'No product ID provided.';
            this.loading = false;
        }
    }

    initForm(): void {
        this.productForm = this.fb.group({
            name: ['', Validators.required],
            category: ['', Validators.required],
            condition: ['', Validators.required],
            description: [''],
            pricePerDay: [0, [Validators.required, Validators.min(0)]],
            stockQuantity: [0, [Validators.required, Validators.min(0)]],
            status: ['active'],
            specifications: this.fb.array([])
        });
    }

    loadProductData(): void {
        this.loading = true;
        this.error = null;
        this.gearApi.getGearById(this.productId).subscribe({
            next: (gear) => {
                this.imageUrls = gear.images?.map(img => img.imageUrl) ?? [];

                // Map backend status to form status
                const formStatus = (gear.status === 'AVAILABLE' || gear.status === 'RENTED') ? 'active' : 'draft';

                this.productForm.patchValue({
                    name: gear.name,
                    category: gear.category,
                    condition: gear.condition,
                    description: gear.description,
                    pricePerDay: gear.price,
                    stockQuantity: gear.quantity,
                    status: formStatus
                });

                this.loading = false;
            },
            error: (err) => {
                this.error = err?.status === 404
                    ? 'Product not found.'
                    : err?.status === 403
                        ? 'Access denied.'
                        : 'Failed to load product.';
                this.loading = false;
            }
        });
    }

    get specifications() {
        return this.productForm.get('specifications') as FormArray;
    }

    addSpec(): void {
        this.specifications.push(this.fb.group({
            key: ['', Validators.required],
            value: ['', Validators.required]
        }));
    }

    removeSpec(index: number): void {
        if (this.specifications.length > 1) {
            this.specifications.removeAt(index);
        } else {
            this.displayToast('At least one specification is required', 'error');
        }
    }

    get isStatusActive(): boolean {
        return this.productForm.get('status')?.value === 'active';
    }

    toggleStatus(): void {
        const current = this.productForm.get('status')?.value;
        this.productForm.patchValue({ status: current === 'active' ? 'draft' : 'active' });
    }

    addNewImage(): void {
        const url = prompt('Enter image URL:');
        if (url?.trim()) {
            this.imageUrls.push(url.trim());
        }
    }

    removeImage(index: number): void {
        this.imageUrls.splice(index, 1);
    }

    cancelEdit(): void {
        if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            this.router.navigate(['/provider/products']);
        }
    }

    saveChanges(): void {
        if (this.productForm.invalid) {
            this.productForm.markAllAsTouched();
            this.displayToast('Please fill out all required fields properly.', 'error');
            return;
        }
        if (this.imageUrls.length === 0) {
            this.displayToast('At least one image URL is required.', 'error');
            return;
        }

        const formValue = this.productForm.value;
        const backendStatus: GearStatus = formValue.status === 'active' ? 'AVAILABLE' : 'RETIRED';

        this.saving = true;
        this.gearApi.updateGear(this.productId, {
            name: formValue.name,
            description: formValue.description,
            price: formValue.pricePerDay,
            quantity: formValue.stockQuantity,
            condition: formValue.condition,
            category: formValue.category,
            imageUrls: this.imageUrls,
            status: backendStatus
        }).subscribe({
            next: () => {
                this.saving = false;
                this.displayToast('Changes saved successfully!', 'success');
            },
            error: (err) => {
                this.saving = false;
                this.displayToast(err?.error?.message || 'Failed to save changes.', 'error');
            }
        });
    }

    deleteProduct(): void {
        if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            this.gearApi.deleteGear(this.productId).subscribe({
                next: () => {
                    this.displayToast('Product deleted successfully', 'success');
                    setTimeout(() => this.router.navigate(['/provider/products']), 1000);
                },
                error: (err) => {
                    this.displayToast(err?.error?.message || 'Failed to delete product.', 'error');
                }
            });
        }
    }

    displayToast(message: string, type: 'success' | 'error' = 'success'): void {
        this.toastMessage = message;
        this.toastType = type;
        this.showToast = true;
        setTimeout(() => { this.showToast = false; }, 3000);
    }
}
