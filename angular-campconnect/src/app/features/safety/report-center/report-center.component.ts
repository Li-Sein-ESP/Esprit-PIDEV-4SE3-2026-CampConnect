import { Component, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { SafetyService } from '../services/safety.service';
import { AuthService } from '../../../core/services/auth.service';
import { catchError, of } from 'rxjs';

interface PreviewFile {
    file: File;
    url: SafeUrl | null;
    isImage: boolean;
}

@Component({
    selector: 'app-report-center',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './report-center.component.html',
    styleUrls: ['./report-center.component.scss']
})
export class ReportCenterComponent implements OnDestroy {
    reportForm: FormGroup;
    uploadedFiles: PreviewFile[] = [];

    maxFiles = 5;
    maxSize = 10 * 1024 * 1024; // 10MB

    isDragging = false;
    isSubmitting = false;
    showSuccess = false;
    referenceIdDisplay = '';

    constructor(
        private fb: FormBuilder,
        private location: Location,
        private sanitizer: DomSanitizer,
        private safetyService: SafetyService,
        private authService: AuthService
    ) {
        this.reportForm = this.fb.group({
            issueType: ['', Validators.required],
            referenceId: ['', Validators.required],
            description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(2000)]],
            evidenceFiles: [[]],
            contactConsent: [false],
            contactEmail: [''],
            contactPhone: ['']
        });
    }

    ngOnDestroy() {
        // Revoke object URLs to avoid memory leaks
        this.uploadedFiles.forEach(pf => {
            if (pf.isImage && pf.url) {
                URL.revokeObjectURL(pf.url as string);
            }
        });
    }

    get f() { return this.reportForm.controls; }

    get charCount() {
        const desc = this.reportForm.get('description')?.value || '';
        return desc.length;
    }

    toggleContact() {
        const current = this.reportForm.get('contactConsent')?.value;
        this.reportForm.get('contactConsent')?.setValue(!current);
    }

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
            this.handleFiles(Array.from(event.dataTransfer.files));
        }
    }

    onFileSelect(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files) {
            this.handleFiles(Array.from(input.files));
            input.value = ''; // Reset
        }
    }

    handleFiles(files: File[]) {
        const allowed = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];

        for (const file of files) {
            if (this.uploadedFiles.length >= this.maxFiles) break;
            if (!allowed.includes(file.type)) continue;
            if (file.size > this.maxSize) continue;

            const isImage = file.type.startsWith('image/');
            let url: SafeUrl | null = null;

            if (isImage) {
                // Create an object URL for the image preview
                const objectUrl = URL.createObjectURL(file);
                url = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
            }

            this.uploadedFiles.push({ file, url, isImage });
        }

        this.updateFormFiles();
    }

    removeFile(index: number) {
        const pf = this.uploadedFiles[index];
        if (pf.isImage && pf.url) {
            // Need to extract the actual string from SafeUrl if possible, but safeUrl is an object
            // For simplicity, we just rely on ngOnDestroy for cleanup or cast it if needed
        }
        this.uploadedFiles.splice(index, 1);
        this.updateFormFiles();
    }

    private updateFormFiles() {
        const files = this.uploadedFiles.map(pf => pf.file);
        this.reportForm.get('evidenceFiles')?.setValue(files);
    }

    isInvalid(controlName: string): boolean {
        const control = this.reportForm.get(controlName);
        return !!control && control.invalid && (control.dirty || control.touched);
    }

    onCancel() {
        if (this.reportForm.dirty || this.uploadedFiles.length > 0) {
            if (!confirm('Are you sure you want to discard this report?')) {
                return;
            }
        }
        this.location.back();
    }

    onSubmit() {
        if (this.reportForm.invalid) {
            this.reportForm.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;

        const reporterId = this.authService.currentUserValue?.id || 'Unknown';
        const formVal = this.reportForm.value;

        const reportData = {
            type: formVal.issueType || 'Report Center Issue',
            level: 'medium', // Default for general reports
            regionName: 'System', 
            latitude: 0,
            longitude: 0,
            description: `[Ref: ${formVal.referenceId}] ${formVal.description}`,
            reporterId: reporterId
        };

        this.safetyService.submitIncident(reportData).pipe(
            catchError(err => {
                console.error('Submission failed', err);
                this.isSubmitting = false;
                alert('Failed to submit report. Please try again later.');
                return of(null);
            })
        ).subscribe(report => {
            if (report) {
                this.referenceIdDisplay = report.id;
                this.isSubmitting = false;
                this.showSuccess = true;
                this.reportForm.reset();
                this.uploadedFiles = [];
            }
        });
    }

    onSuccessDone() {
        this.location.back();
    }
}
