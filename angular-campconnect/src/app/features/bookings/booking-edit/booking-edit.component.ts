import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { LucideAngularModule, Calendar, ChevronLeft, Save, AlertCircle } from 'lucide-angular';

export function dateRangeValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const from = group.get('startDate')?.value;
    const to = group.get('endDate')?.value;
    
    if (!from || !to) return null;

    const startDate = new Date(from);
    const endDate = new Date(to);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const errors: any = {};

    if (startDate < today) {
      errors.pastStartDate = true;
    }

    if (startDate >= endDate) {
      errors.dateRangeInvalid = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
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
    <div class="booking-edit-wrapper" *ngIf="!isLoading && reservation">
      <!-- Hero Header -->
      <div class="edit-hero" [style.background-image]="'url(https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=1200)'">
        <div class="hero-overlay"></div>
        <div class="container relative z-10 py-12 px-6">
          <button (click)="goBack()" class="back-link">
            <lucide-icon [img]="ChevronLeft" size="18"></lucide-icon>
            Back to details
          </button>
          <h1 class="text-4xl md:text-5xl font-black text-white mt-8 tracking-tighter">
            Adjust your <span class="text-emerald-400">Expedition</span>
          </h1>
          <p class="text-white/60 font-medium mt-2 uppercase tracking-[0.2em] text-[10px]">Modifying Booking #{{ (reservation.id || reservation._id)?.slice(-6) }}</p>
        </div>
      </div>

      <div class="container -mt-20 relative z-20 pb-20 px-6">
        <div class="max-w-3xl mx-auto">
          <div class="glass-form-card animate-slide-up">
            <div class="p-8 md:p-12">
              <form [formGroup]="editForm" (ngSubmit)="onSubmit()" class="space-y-10">
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <!-- Start Date -->
                  <div class="input-group">
                    <label class="input-label">New Arrival</label>
                    <div class="input-wrapper">
                      <lucide-icon [img]="Calendar" class="input-icon"></lucide-icon>
                      <input type="date" formControlName="startDate" class="premium-input" />
                    </div>
                    <div class="error-msg" *ngIf="editForm.hasError('pastStartDate') && editForm.get('startDate')?.touched">
                      Arrival must be in the future
                    </div>
                  </div>

                  <!-- End Date -->
                  <div class="input-group">
                    <label class="input-label">New Departure</label>
                    <div class="input-wrapper">
                      <lucide-icon [img]="Calendar" class="input-icon"></lucide-icon>
                      <input type="date" formControlName="endDate" class="premium-input" />
                    </div>
                    <div class="error-msg" *ngIf="editForm.hasError('dateRangeInvalid') && editForm.get('endDate')?.touched">
                      Departure must be after arrival
                    </div>
                  </div>
                </div>

                <!-- Error Message Alert -->
                <div *ngIf="errorMessage" class="error-alert animate-shake">
                  <lucide-icon [img]="AlertCircle" size="20"></lucide-icon>
                  <div class="flex flex-col">
                    <span class="font-black text-[10px] uppercase tracking-widest">Update Conflict</span>
                    <span class="text-sm font-medium">{{ errorMessage }}</span>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-col sm:flex-row gap-4 pt-6">
                  <button type="submit" [disabled]="!editForm.valid || isSubmitting" class="btn-submit">
                    <span *ngIf="!isSubmitting" class="flex items-center gap-2">
                      <lucide-icon [img]="Save" size="18"></lucide-icon>
                      Confirm New Dates
                    </span>
                    <div *ngIf="isSubmitting" class="mini-loader"></div>
                  </button>
                  
                  <button type="button" (click)="goBack()" class="btn-cancel">
                    Discard Changes
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div *ngIf="isLoading" class="min-h-screen flex flex-col items-center justify-center bg-[#fdfcf8]">
      <div class="premium-loader"></div>
      <p class="mt-6 text-emerald-900 font-black tracking-[0.3em] uppercase text-[10px]">Synchronizing with Base Camp...</p>
    </div>

    <!-- Error State -->
    <div *ngIf="!isLoading && !reservation" class="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div class="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-8">
        <lucide-icon [img]="AlertCircle" size="48" class="text-red-500"></lucide-icon>
      </div>
      <h2 class="text-4xl font-black text-gray-900 mb-3 tracking-tighter">Expedition Not Found</h2>
      <p class="text-gray-500 max-w-md mb-10 font-medium">We couldn't load the reservation you want to modify. It may have been relocated.</p>
      <app-button routerLink="/dashboard/bookings" variant="primary">Return to Base Camp</app-button>
    </div>
  `,
  styles: [`
    .booking-edit-wrapper {
      background-color: #fcfcfc;
      min-height: 100vh;
    }

    .edit-hero {
      height: 45vh;
      background-size: cover;
      background-position: center;
      position: relative;
    }

    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, #fcfcfc 0%, rgba(0,0,0,0.4) 100%);
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: white;
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      opacity: 0.7;
      transition: all 0.3s ease;
    }

    .back-link:hover {
      opacity: 1;
      transform: translateX(-5px);
    }

    .glass-form-card {
      background: white;
      border-radius: 3rem;
      box-shadow: 0 40px 80px rgba(0,0,0,0.06);
      border: 1px solid rgba(0,0,0,0.02);
    }

    .input-label {
      display: block;
      font-size: 0.7rem;
      font-weight: 950;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #94a3b8;
      margin-bottom: 0.75rem;
    }

    .input-wrapper {
      position: relative;
    }

    .input-icon {
      position: absolute;
      left: 1.25rem;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
      pointer-events: none;
    }

    .premium-input {
      width: 100%;
      padding: 1.25rem 1.25rem 1.25rem 3.5rem;
      background: #f8fafc;
      border: 2px solid #f1f5f9;
      border-radius: 1.25rem;
      font-weight: 800;
      color: #064e3b;
      font-size: 1rem;
      transition: all 0.3s ease;
      outline: none;
    }

    .premium-input:focus {
      background: white;
      border-color: #059669;
      box-shadow: 0 10px 25px rgba(5, 150, 105, 0.1);
    }

    .btn-submit {
      flex: 2;
      padding: 1.25rem;
      background: #064e3b;
      color: white;
      border-radius: 1.25rem;
      font-weight: 900;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-submit:hover:not(:disabled) {
      transform: translateY(-4px);
      box-shadow: 0 15px 30px rgba(6, 78, 59, 0.3);
    }

    .btn-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-cancel {
      flex: 1;
      padding: 1.25rem;
      background: transparent;
      color: #94a3b8;
      border: 2px solid #f1f5f9;
      border-radius: 1.25rem;
      font-weight: 800;
      font-size: 0.85rem;
      transition: all 0.3s ease;
    }

    .btn-cancel:hover {
      background: #f1f5f9;
      color: #64748b;
    }

    .error-alert {
      padding: 1.25rem;
      background: #fef2f2;
      border-left: 4px solid #ef4444;
      border-radius: 1rem;
      color: #991b1b;
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .error-msg {
      font-size: 0.7rem;
      font-weight: 700;
      color: #ef4444;
      margin-top: 0.5rem;
    }

    .premium-loader {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(5, 150, 105, 0.1);
      border-top: 4px solid #059669;
      border-radius: 50%;
      animation: spin 1s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite;
    }

    .mini-loader {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }

    .animate-slide-up { animation: slide-up 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
    .animate-shake { animation: shake 0.4s ease-in-out; }

    input[type="date"]::-webkit-calendar-picker-indicator {
      opacity: 0;
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      cursor: pointer;
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
        // Optimization: Pass the updated booking in state to avoid server reload on detail page
        this.router.navigate(['/booking/details', id], {
          state: { booking: response }
        });
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
