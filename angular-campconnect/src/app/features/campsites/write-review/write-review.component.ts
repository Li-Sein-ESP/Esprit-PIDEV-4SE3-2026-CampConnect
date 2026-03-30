import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Star, Upload, X, CheckCircle, Loader2, Image as ImageIcon } from 'lucide-angular';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../../shared/components/button.component';

@Component({
    selector: 'app-write-review',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        LucideAngularModule,
        ModalComponent,
        ButtonComponent
    ],
    templateUrl: './write-review.component.html',
    styles: [`
    :host {
      display: block;
    }
  `]
})
export class WriteReviewComponent {
    @Input() campsiteId: string = '';
    @Output() close = new EventEmitter<void>();

    readonly Star = Star;
    readonly Upload = Upload;
    readonly X = X;
    readonly CheckCircle = CheckCircle;
    readonly Loader2 = Loader2;
    readonly ImageIcon = ImageIcon;

    step: 'rating' | 'details' | 'submitting' | 'success' = 'rating';

    ratings = {
        cleanliness: 0,
        location: 0,
        value: 0,
        amenities: 0
    };

    hoveredRatings = {
        cleanliness: 0,
        location: 0,
        value: 0,
        amenities: 0
    };

    title: string = '';
    content: string = '';
    photos: string[] = [];

    ratingCriteria = [
        { key: 'cleanliness', label: 'Cleanliness', description: 'How clean was the campsite?' },
        { key: 'location', label: 'Location', description: 'How was the location and accessibility?' },
        { key: 'value', label: 'Value', description: 'Was it worth the price?' },
        { key: 'amenities', label: 'Amenities', description: 'Quality of facilities and features' }
    ];

    get overallRating(): number {
        return Math.round(
            (this.ratings.cleanliness + this.ratings.location + this.ratings.value + this.ratings.amenities) / 4
        );
    }

    get canContinueToDetails(): boolean {
        return this.ratings.cleanliness > 0 &&
            this.ratings.location > 0 &&
            this.ratings.value > 0 &&
            this.ratings.amenities > 0;
    }

    get canSubmit(): boolean {
        return this.canContinueToDetails &&
            this.title.trim().length > 0 &&
            this.content.trim().length > 0;
    }

    handlePhotoUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            // In a real app, upload to server. For demo, use placeholders.
            const newPhotos = Array.from(input.files).map(
                () => `https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600&q=80`
            );
            this.photos = [...this.photos, ...newPhotos].slice(0, 5);
        }
    }

    removePhoto(index: number) {
        this.photos = this.photos.filter((_, i) => i !== index);
    }

    handleSubmit() {
        this.step = 'submitting';

        // Simulate API call
        setTimeout(() => {
            this.step = 'success';
            setTimeout(() => {
                this.close.emit();
            }, 2000);
        }, 1500);
    }

    setRating(key: string, value: number) {
        this.ratings = { ...this.ratings, [key]: value };
    }

    setHoveredRating(key: string, value: number) {
        this.hoveredRatings = { ...this.hoveredRatings, [key]: value };
    }

    range(n: number): number[] {
        return Array.from({ length: n }, (_, i) => i);
    }

    getRatingValue(key: string): number {
        return (this.ratings as any)[key] as number;
    }

    getHoveredRatingValue(key: string): number {
        return (this.hoveredRatings as any)[key] as number;
    }
}
