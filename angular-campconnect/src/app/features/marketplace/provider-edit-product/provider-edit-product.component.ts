import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { GearApiService } from '../../gear/services/gear-api.service';
import { GearStatus } from '../../gear/models/gear.model';
import { environment } from '../../../../environments/environment';

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
    isUploadingImage = false;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private gearApi: GearApiService,
        private cdr: ChangeDetectorRef
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
            listingType: ['FOR_RENT', Validators.required],
            salePrice: [null],
            warehouseLat: [null, Validators.required],
            warehouseLng: [null, Validators.required],
            weightKg: [null, [Validators.required, Validators.min(0.01)]],
            imageUrls: [[]],
            brand: [''],
            sku: [''],
            deposit: [0],
            cleaningBufferHours: [0],
            minRentalDuration: [1],
            maxWeight: [0],
            specifications: this.fb.array([])
        });
    }

    loadProductData(): void {
        this.loading = true;
        this.error = null;
        this.gearApi.getGearById(this.productId).subscribe({
            next: (gear) => {
                const baseUrl = environment.apiUrl.replace('/api', '').replace('/v1', '');
                this.imageUrls = gear.images?.map(img => {
                    return img.imageUrl?.startsWith('/uploads') ? baseUrl + img.imageUrl : img.imageUrl;
                }) ?? [];

                // Map backend status to form status
                const formStatus = (gear.status === 'AVAILABLE' || gear.status === 'RENTED') ? 'active' : 'draft';

                this.productForm.patchValue({
                    name: gear.name,
                    category: gear.category,
                    condition: gear.condition,
                    description: gear.description,
                    pricePerDay: gear.dailyPrice ?? gear.price,
                    stockQuantity: gear.quantity,
                    status: formStatus,
                    listingType: gear.listingType,
                    salePrice: gear.salePrice,
                    warehouseLat: gear.warehouseLat ?? 0,
                    warehouseLng: gear.warehouseLng ?? 0,
                    weightKg: gear.weightKg ?? null,
                    imageUrls: this.imageUrls
                });

                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.error = err?.status === 404
                    ? 'Product not found.'
                    : err?.status === 403
                        ? 'Access denied.'
                        : 'Failed to load product.';
                this.loading = false;
                this.cdr.detectChanges();
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

    addNewImage(event: any): void {
        const file = event.target.files[0];
        if (!file) return;

        this.isUploadingImage = true;
        this.gearApi.uploadImage(file).subscribe({
            next: (res) => {
                this.isUploadingImage = false;
                this.imageUrls.push(res.url);
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.isUploadingImage = false;
                this.displayToast('Failed to upload image.', 'error');
                this.cdr.detectChanges();
            }
        });
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
        const backendStatus: GearStatus = formValue.status === 'active' ? 'AVAILABLE' : 'MAINTENANCE';

        const payload = {
            name: formValue.name,
            description: formValue.description,
            price: formValue.pricePerDay,
            dailyPrice: formValue.listingType === 'FOR_SALE' ? undefined : formValue.pricePerDay,
            salePrice: formValue.listingType === 'FOR_RENT' ? undefined : formValue.salePrice,
            listingType: formValue.listingType,
            quantity: Number(formValue.stockQuantity ?? 0),
            condition: formValue.condition,
            category: formValue.category,
            imageUrls: this.imageUrls,
            status: backendStatus,
            warehouseLat: formValue.warehouseLat,
            warehouseLng: formValue.warehouseLng,
            weightKg: Number(formValue.weightKg)
        };

        this.saving = true;
        this.gearApi.updateGear(this.productId, payload as any).subscribe({
            next: () => {
                this.saving = false;
                this.displayToast('Changes saved successfully!', 'success');
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.saving = false;
                this.displayToast(err?.error?.message || 'Failed to save changes.', 'error');
                this.cdr.detectChanges();
            }
        });
    }

    deleteProduct(): void {
        if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            this.gearApi.deleteGear(this.productId).subscribe({
                next: () => {
                    this.displayToast('Product deleted successfully', 'success');
                    setTimeout(() => this.router.navigate(['/provider/products']), 1000);
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    this.displayToast(err?.error?.message || 'Failed to delete product.', 'error');
                    this.cdr.detectChanges();
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
