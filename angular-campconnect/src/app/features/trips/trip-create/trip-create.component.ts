import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LucideAngularModule, Calendar, MapPin, Users, Plus, AlertCircle } from 'lucide-angular';
import { TripService } from '../services/trip.service';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';

@Component({
  selector: 'app-trip-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, ButtonComponent, CardComponent, CardContentComponent],
  templateUrl: './trip-create.component.html'
})
export class TripCreateComponent implements OnInit {
  readonly Calendar = Calendar;
  readonly AlertCircle = AlertCircle;
  readonly MapPin = MapPin;
  readonly Users = Users;
  readonly Plus = Plus;

  tripForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  today: string = new Date().toISOString().split('T')[0];

  constructor(
    private fb: FormBuilder,
    private tripService: TripService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.initForm();
    this.route.queryParams.subscribe((params: any) => {
      if (params['destination']) {
        this.tripForm.patchValue({ destination: params['destination'] });
      }
      if (params['date']) {
        this.tripForm.patchValue({ startDate: params['date'] });
      }
    });
  }

  private initForm() {
    this.tripForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      destination: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      participants: [1, [Validators.required, Validators.min(1)]],
      description: [''],
      difficulty: ['MODERATE', Validators.required],
      budget: [1000, [Validators.required, Validators.min(0)]]
    }, { validators: this.dateRangeValidator });
  }

  private dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const start = control.get('startDate')?.value;
    const end = control.get('endDate')?.value;
    const errors: ValidationErrors = {};

    if (start) {
      const todayStr = new Date().toISOString().split('T')[0];
      if (start < todayStr) {
        errors['pastDateInvalid'] = true;
      }
    }

    if (start && end && start > end) {
      errors['dateRangeInvalid'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  // Helper for easy access to form fields in the template
  get f() { return this.tripForm.controls; }

  createTrip() {
    if (this.tripForm.invalid) {
      this.tripForm.markAllAsTouched();
      return;
    }

    const userSnapshot = this.authService.currentUserValue;
    if (!userSnapshot) {
      this.errorMessage = 'You must be logged in to create a trip.';
      return;
    }

    const formValue = this.tripForm.value;

    try {
      this.isSubmitting = true;
      this.errorMessage = '';

      const tripDto = {
        title: formValue.name,
        destination: {
          address: formValue.destination,
          latitude: 0,
          longitude: 0
        },
        startDate: new Date(formValue.startDate).toISOString(),
        endDate: new Date(formValue.endDate).toISOString(),
        difficulty: formValue.difficulty.toUpperCase(),
        totalBudget: formValue.budget || 0,
        status: 'PLANNED',
        participants: formValue.participants,
        userId: userSnapshot.id,
        imageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80'
      };

      console.log('Sending Trip DTO (Reactive):', tripDto);

      this.tripService.createTrip(tripDto).subscribe({
        next: (response) => {
          console.log('Trip created successfully:', response);
          this.isSubmitting = false;
          this.router.navigate(['/trips']);
        },
        error: (err) => {
          console.error('Trip creation failed:', err);
          this.isSubmitting = false;
          this.errorMessage = this.extractErrorMessage(err);
        }
      });
    } catch (e) {
      this.isSubmitting = false;
      this.errorMessage = 'An error occurred formatting the trip data.';
      console.error(e);
    }
  }

  private extractErrorMessage(err: any): string {
    if (err.error) {
      if (typeof err.error === 'string') return err.error;
      if (typeof err.error === 'object') {
        const errors = err.error;
        if (errors.message) return errors.message;
        // Handle Spring Validation errors { field: message }
        return Object.entries(errors).map(([k, v]) => `${k}: ${v}`).join(', ');
      }
    }
    return err.message || 'An unexpected error occurred. Please try again.';
  }

  calculateDuration(): number {
    const startVal = this.tripForm.get('startDate')?.value;
    const endVal = this.tripForm.get('endDate')?.value;
    if (!startVal || !endVal) return 1;
    const start = new Date(startVal);
    const end = new Date(endVal);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }
}
