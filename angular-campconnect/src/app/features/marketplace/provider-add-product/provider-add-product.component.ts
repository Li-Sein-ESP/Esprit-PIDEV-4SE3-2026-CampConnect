import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { GearApiService } from '../../gear/services/gear-api.service';
import { GearCreateRequest } from '../../gear/models/gear.model';
import { LucideAngularModule, Camera, X, Loader2 } from 'lucide-angular';

@Component({
    selector: 'app-provider-add-product',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideAngularModule],
    templateUrl: './provider-add-product.component.html',
    styleUrls: ['./provider-add-product.component.scss']
})
export class ProviderAddProductComponent implements OnInit {
    readonly Camera = Camera;
    readonly X = X;
    readonly Loader2 = Loader2;

    // Tracking the status of in-flight uploads
    isUploadingImage = false;
    uploadError: string | null = null;

    addProductForm!: FormGroup;
    // Local previews and their eventual remote URLs
    uploadedImages: { file: File, preview: string, remoteUrl?: string, uploading: boolean, error?: boolean }[] = [];
    isDragging = false;
    toast: { show: boolean; msg: string; type: 'success' | 'draft' | 'trash' | 'error' } = { show: false, msg: '', type: 'success' };
    activeSection = 'section-basic';
    isSaving = false;
    categories: string[] = [
        'Tents & Shelters',
        'Backpacks & Bags',
        'Sleeping Gear',
        'Camp Kitchen',
        'Lighting',
        'Navigation & Electronics',
        'Tools & Repair',
        'Safety & First Aid'
    ];

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private gearService: GearApiService
    ) { }

    ngOnInit() {

        this.addProductForm = this.fb.group({
            name: ['', Validators.required],
            category: ['', Validators.required],
            description: ['', Validators.required],
            pricePerDay: [0, [Validators.required, Validators.min(0)]],
            stockQuantity: [1, [Validators.required, Validators.min(1)]],
            condition: ['NEW', Validators.required],
            imageUrls: [[], Validators.required],
            status: ['active']
        });
    }

    get specifications() {
        return this.addProductForm.get('specifications') as FormArray;
    }

    addSpec() {
        this.specifications.push(this.fb.group({
            key: [''],
            value: ['']
        }));
    }

    removeSpec(index: number) {
        this.specifications.removeAt(index);
    }

    get completionPercentage(): number {
        let filled = 0;
        const total = 5;
        const vals = this.addProductForm.value;

        if (vals.name?.trim()) filled++;
        if (vals.category) filled++;
        if (vals.description?.trim()) filled++;
        if (vals.pricePerDay > 0) filled++;
        if (vals.stockQuantity > 0) filled++;

        return Math.round((filled / total) * 100);
    }

    // Handle Drag & Drop
    onDragOver(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging = true;
    }

    onDragLeave(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging = false;
    }

    onDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging = false;

        if (event.dataTransfer?.files) {
            this.handleFiles(event.dataTransfer.files);
        }
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.handleFiles(input.files);
        }
    }

    handleFiles(files: FileList) {
        // Enforce max 8 images
        if (this.uploadedImages.length + files.length > 8) {
            this.uploadError = "You can only upload a maximum of 8 images.";
            return;
        }

        this.uploadError = null;

        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) return;

            // Generate a local preview
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewSrc = e.target?.result as string;

                // Represent this image's state
                const imageObj = { file, preview: previewSrc, remoteUrl: undefined as string | undefined, uploading: true, error: false };
                this.uploadedImages.push(imageObj);

                // Dispatch the actual backend upload
                this.gearService.uploadImage(file).subscribe({
                    next: (response) => {
                        imageObj.remoteUrl = response.url;
                        imageObj.uploading = false;
                        this.updateImageUrlFormState();
                    },
                    error: (err) => {
                        console.error('Image upload failed', err);
                        imageObj.error = true;
                        imageObj.uploading = false;
                    }
                });
            };
            reader.readAsDataURL(file);
        });
    }

    removeImage(index: number) {
        this.uploadedImages.splice(index, 1);
        this.updateImageUrlFormState();
    }

    private updateImageUrlFormState() {
        // Map all uploaded images that successfully resolved a remote URL
        const successfulUrls = this.uploadedImages
            .filter(img => img.remoteUrl && !img.uploading)
            .map(img => img.remoteUrl);

        this.addProductForm.patchValue({ imageUrls: successfulUrls });

        // Ensure form validation correctly registers length requirements
        if (successfulUrls.length === 0) {
            this.addProductForm.get('imageUrls')?.setErrors({ required: true });
        } else {
            this.addProductForm.get('imageUrls')?.setErrors(null);
        }
    }

    showToast(msg: string, type: 'success' | 'draft' | 'trash' | 'error') {
        this.toast = { show: true, msg, type };
        setTimeout(() => {
            this.toast.show = false;
        }, 3200);
    }

    scrollToSection(sectionId: string) {
        this.activeSection = sectionId;
        const el = document.getElementById(sectionId);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    @HostListener('window:scroll', [])
    onWindowScroll() {
        const sections = ['section-basic', 'section-pricing', 'section-inventory', 'section-images', 'section-specs'];
        for (const id of sections) {
            const el = document.getElementById(id);
            if (el) {
                const rect = el.getBoundingClientRect();
                if (rect.top <= 100 && rect.bottom >= 100) {
                    this.activeSection = id;
                }
            }
        }
    }

    selectCondition(condition: string) {
        this.addProductForm.patchValue({ condition });
    }

    toggleStatus() {
        const currentStatus = this.addProductForm.get('status')?.value;
        this.addProductForm.patchValue({ status: currentStatus === 'active' ? 'draft' : 'active' });
    }

    discardProduct() {
        this.showToast('Product discarded', 'trash');
        setTimeout(() => {
            this.router.navigate(['/provider/products']);
        }, 1500);
    }

    saveDraft() {
        this.showToast('Product saved as draft', 'draft');
    }

    saveProduct() {
        if (this.addProductForm.invalid) {
            this.addProductForm.markAllAsTouched();
            this.showToast('Please fill in all required fields.', 'error');
            return;
        }

        this.isSaving = true;
        const formValue = this.addProductForm.value;

        const request = {
            name: formValue.name,
            description: formValue.description,
            price: formValue.pricePerDay,
            quantity: formValue.stockQuantity,
            condition: formValue.condition,
            category: formValue.category,
            imageUrls: formValue.imageUrls,
            status: formValue.status === 'active' ? 'AVAILABLE' : 'MAINTENANCE'
        };

        this.gearService.createGear(request as any).subscribe({
            next: (res) => {
                this.isSaving = false;
                this.showToast('Product published successfully!', 'success');
                setTimeout(() => {
                    this.router.navigate(['/provider/products']);
                }, 1500);
            },
            error: (err) => {
                this.isSaving = false;
                let errorMsg = 'Failed to create product. Please check your inputs.';
                if (err?.error?.message) {
                    errorMsg = err.error.message;
                } else if (err?.status === 400) {
                    errorMsg = 'Validation error: Please check all required fields.';
                } else if (err?.status === 403) {
                    errorMsg = 'You do not have permission to create gear listings.';
                } else if (err?.status === 0) {
                    errorMsg = 'Cannot connect to server. Is the backend running?';
                }
                console.error('Error creating gear', err);
                this.showToast(errorMsg, 'error');
            }
        });
    }
}
