import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

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
    showToast: boolean = false;
    toastMessage: string = '';
    toastType: 'success' | 'error' = 'success';

    mockProduct = {
        id: '123',
        name: 'ProTrail 4-Person Dome Tent',
        category: 'tents',
        brand: 'ProTrail',
        condition: 'new',
        sku: 'PT-TENT-4P-001',
        description: 'Spacious 4-person dome tent with easy setup, waterproof construction, and excellent ventilation. Perfect for family camping adventures.',
        pricePerDay: 25,
        deposit: 50,
        cleaningBufferHours: 2,
        minRentalDuration: 1,
        stockQuantity: 12,
        maxWeight: 8.5,
        status: 'active',
        specifications: [
            { key: 'Capacity', value: '4 Person' },
            { key: 'Weight', value: '5.2 kg' },
            { key: 'Dimensions', value: '240 x 210 x 140 cm' },
            { key: 'Material', value: 'Polyester 68D' },
            { key: 'Waterproof Rating', value: '3000 mm' }
        ],
        images: [
            'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=200&h=200&fit=crop',
            'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=200&h=200&fit=crop',
            'https://images.unsplash.com/photo-1445308394109-4ec2920981b1?w=200&h=200&fit=crop'
        ]
    };

    imageUrls: string[] = [];

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.productId = this.route.snapshot.paramMap.get('id') || '';

        this.initForm();
        this.loadProductData();
    }

    initForm(): void {
        this.productForm = this.fb.group({
            name: ['', Validators.required],
            category: ['', Validators.required],
            brand: [''],
            condition: ['', Validators.required],
            sku: [''],
            description: [''],
            pricePerDay: [0, [Validators.required, Validators.min(0)]],
            deposit: [0, Validators.min(0)],
            cleaningBufferHours: [0, [Validators.min(0), Validators.max(72)]],
            minRentalDuration: [1, Validators.min(1)],
            stockQuantity: [0, [Validators.required, Validators.min(0)]],
            maxWeight: [0, Validators.min(0)],
            status: ['active'],
            specifications: this.fb.array([])
        });
    }

    loadProductData(): void {
        // In a real app, you would fetch data using this.productId
        // Here we're using the mock data
        const p = this.mockProduct;
        this.imageUrls = [...p.images];

        this.productForm.patchValue({
            name: p.name,
            category: p.category,
            brand: p.brand,
            condition: p.condition,
            sku: p.sku,
            description: p.description,
            pricePerDay: p.pricePerDay,
            deposit: p.deposit,
            cleaningBufferHours: p.cleaningBufferHours,
            minRentalDuration: p.minRentalDuration,
            stockQuantity: p.stockQuantity,
            maxWeight: p.maxWeight,
            status: p.status
        });

        p.specifications.forEach(spec => {
            this.specifications.push(this.fb.group({
                key: [spec.key, Validators.required],
                value: [spec.value, Validators.required]
            }));
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
        this.imageUrls.push('https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=200&h=200&fit=crop');
        this.displayToast('New image added', 'success');
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

        const formData = {
            ...this.productForm.value,
            images: this.imageUrls
        };

        console.log('Saving product data...', formData);
        this.displayToast('Changes saved successfully!', 'success');
    }

    deleteProduct(): void {
        if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            this.displayToast('Product deleted successfully', 'success');
            setTimeout(() => {
                this.router.navigate(['/provider/products']);
            }, 1000);
        }
    }

    displayToast(message: string, type: 'success' | 'error' = 'success'): void {
        this.toastMessage = message;
        this.toastType = type;
        this.showToast = true;

        setTimeout(() => {
            this.showToast = false;
        }, 3000);
    }
}
