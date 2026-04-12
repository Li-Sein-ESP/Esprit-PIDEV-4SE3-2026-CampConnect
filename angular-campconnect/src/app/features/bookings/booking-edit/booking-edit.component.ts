import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { LucideAngularModule, Calendar, ChevronLeft, Save, AlertCircle } from 'lucide-angular';

export function dateRangeValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const from = group.get('startDate')?.value;
    const to = group.get('endDate')?.value;
    if (from && to && new Date(from) >= new Date(to)) {
      return { dateRangeInvalid: true };
    }
    return null;
  };
}
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card.component';
import { ReservationService } from '../../../core/services/reservation.service';
import { Reservation, ReservationRequest } from '../../../core/models/reservation.model';

@Component({
  selector: 'app-booking-edit',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    LucideAngularModule,
    ButtonComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent
  ],
  template: `
    <div class="min-h-screen bg-[var(--color-background)] py-12">
      <div class="container max-w-2xl">
        <div class="flex justify-between items-center mb-8">
          <button (click)="goBack()" class="flex items-center text-[var(--color-text-secondary)] hover:text-[var(--color-primary-600)] transition-colors">
            <lucide-icon [img]="ChevronLeft" class="w-5 h-5 mr-1"></lucide-icon>
            Back to Details
          </button>
          <!-- Runtime Debug info (Dev only) -->
          <span class="text-[10px] text-gray-400">Status: {{ isLoading ? 'Loading...' : (reservation ? 'Ready' : 'Not Found') }}</span>
        </div>

        <div *ngIf="isLoading" class="flex flex-col items-center justify-center py-20 animate-pulse">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary-600)] mb-4"></div>
          <p class="text-[var(--color-text-secondary)]">Loading reservation details...</p>
        </div>

        <app-card *ngIf="!isLoading && reservation" variant="elevated">
          <app-card-header>
            <app-card-title>Modify Reservation Dates</app-card-title>
          </app-card-header>
          <app-card-content>
            <form [formGroup]="editForm" (ngSubmit)="onSubmit()" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="text-sm font-medium text-[var(--color-text-secondary)]">Check-in Date</label>
                  <div class="relative">
                    <lucide-icon [img]="Calendar" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-tertiary)]"></lucide-icon>
                    <input 
                      type="date" 
                      formControlName="startDate"
                      class="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-medium text-[var(--color-text-secondary)]">Check-out Date</label>
                  <div class="relative">
                    <lucide-icon [img]="Calendar" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-tertiary)]"></lucide-icon>
                    <input 
                      type="date" 
                      formControlName="endDate"
                      class="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div class="text-xs text-red-500 mt-1" *ngIf="editForm.hasError('dateRangeInvalid') && editForm.get('endDate')?.touched">
                      Check-out Date must be strictly after Check-in Date.
                  </div>
                </div>
              </div>

              <div *ngIf="errorMessage" class="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                <lucide-icon [img]="AlertCircle" class="w-5 h-5 text-red-500 shrink-0 mt-0.5"></lucide-icon>
                <div class="flex flex-col">
                    <span class="text-sm font-semibold text-red-700">Error Occurred</span>
                    <span class="text-xs text-red-600">{{ errorMessage }}</span>
                </div>
              </div>

              <div class="flex gap-4 pt-4">
                <app-button type="submit" [isLoading]="isSubmitting" [disabled]="!editForm.valid || isSubmitting" class="flex-1">
                  <lucide-icon [img]="Save" class="w-5 h-5 mr-2"></lucide-icon>
                  Save Changes
                </app-button>
                <app-button type="button" variant="outline" (click)="goBack()" class="flex-1">
                  Cancel
                </app-button>
              </div>
            </form>
          </app-card-content>
        </app-card>

        <div *ngIf="!isLoading && !reservation" class="text-center py-20">
          <lucide-icon [img]="AlertCircle" class="w-16 h-16 text-red-400 mx-auto mb-4"></lucide-icon>
          <h3 class="mb-2">Reservation Not Found</h3>
          <p class="text-[var(--color-text-secondary)] mb-2">We couldn't load the reservation you want to modify.</p>
          <p class="text-xs text-gray-500 mb-8" *ngIf="errorMessage">Server says: {{ errorMessage }}</p>
          <app-button routerLink="/dashboard/bookings">Return to Bookings</app-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    input[type="date"]::-webkit-calendar-picker-indicator {
      filter: invert(0.3);
    }
  `]
})
export class BookingEditComponent implements OnInit {
  readonly ChevronLeft = ChevronLeft;
  readonly Calendar = Calendar;
  readonly Save = Save;
  readonly AlertCircle = AlertCircle;

  reservation: Reservation | null = null;
  isLoading = true;
  isSubmitting = false;
  errorMessage: string | null = null;

  editForm!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reservationService: ReservationService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    }, { validators: dateRangeValidator() });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('DEBUG: Edit page loaded for Reservation ID:', id);

    // Try state first
    const state = window.history.state;
    if (state && state.booking) {
      console.log('DEBUG: Found booking in router state for Edit:', state.booking);
      this.populateEditData(state.booking);
    } else if (id) {
      this.loadReservation(id);
    } else {
      this.isLoading = false;
    }
  }

  private populateEditData(res: Reservation) {
    this.reservation = res;
    // Format dates for input[type="date"] (YYYY-MM-DD)
    let sDate = '';
    let eDate = '';
    if (res.startDate) {
      sDate = res.startDate.split('T')[0];
    }
    if (res.endDate) {
      eDate = res.endDate.split('T')[0];
    }
    this.editForm.patchValue({
      startDate: sDate,
      endDate: eDate
    });
    this.isLoading = false;
  }
  loadReservation(id: string) {
    this.isLoading = true;
    console.log('DEBUG: Fetching reservation for edit from server for ID:', id);
    this.reservationService.getReservationById(id).subscribe({
      next: (res) => {
        console.log('DEBUG: Received reservation for edit:', res);
        this.populateEditData(res);
      },
      error: (err) => {
        console.error('DEBUG: Error loading reservation for edit', err);
        this.errorMessage = 'Could not load reservation details.';
        this.isLoading = false;
      }
    });
  }

  onSubmit() {
    const id = this.reservation?.id || this.reservation?._id;
    if (!id || this.editForm.invalid) {
      this.errorMessage = 'Vérifiez vos données ou ID de réservation manquant.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    const val = this.editForm.value;
    const request: ReservationRequest = {
      userId: this.reservation!.userId,
      targetId: this.reservation!.targetId,
      startDate: `${val.startDate}T14:00:00`,
      endDate: `${val.endDate}T11:00:00`
    };

    console.log('DEBUG: Update request body:', request);

    this.reservationService.updateReservation(id, request).subscribe({
      next: (response) => {
        console.log('DEBUG: Update successful, response:', response);
        // Reset sub state just in case nav is slow
        this.isSubmitting = false;
        this.router.navigate(['/booking/details', id]);
      },
      error: (err) => {
        console.error('DEBUG: Update failed, error:', err);
        this.isSubmitting = false;

        if (err.status === 409) {
          this.errorMessage = 'Conflict: Les dates choisies sont déjà réservées. Veuillez en choisir d\'autres.';
        } else if (err.status === 400) {
          this.errorMessage = 'Erreur de validation : ' + (err.error?.message || 'Vérifiez vos dates.');
        } else {
          this.errorMessage = 'Erreur (' + err.status + '): ' + (err.error?.message || 'Impossible de mettre à jour la réservation.');
        }
      }
    });
  }

  goBack() {
    const id = this.reservation?.id || this.reservation?._id || this.route.snapshot.paramMap.get('id');
    if (id) {
      this.router.navigate(['/booking/details', id]);
    } else {
      this.router.navigate(['/dashboard/bookings']);
    }
  }
}
