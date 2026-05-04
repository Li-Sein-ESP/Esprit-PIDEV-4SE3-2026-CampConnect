import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { LucideAngularModule, ChevronLeft, Calendar, Users, MapPin, Star, CheckCircle, Shield, AlertCircle, ChevronRight } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card.component';
import { ReservationService } from '../../../core/services/reservation.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReservationRequest } from '../../../core/models/reservation.model';
import { take } from 'rxjs';

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

@Component({
  selector: 'app-reservation-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, ButtonComponent, CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent],
  templateUrl: './reservation-create.component.html'
})
export class ReservationCreateComponent implements OnInit {
  readonly ChevronLeft = ChevronLeft;
  readonly Calendar = Calendar;
  readonly Users = Users;
  readonly MapPin = MapPin;
  readonly Star = Star;
  readonly CheckCircle = CheckCircle;
  readonly Shield = Shield;
  readonly AlertCircle = AlertCircle;
  readonly ChevronRight = ChevronRight;

  basePrice = 0;
  nights = 0;
  isSubmitting = false;
  reservationForm!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reservationService: ReservationService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    const navigation = this.router.getCurrentNavigation();
    let sDate = null;
    let eDate = null;

    if (navigation?.extras.state) {
      this.basePrice = navigation.extras.state['totalPrice'] || 315;
      this.nights = navigation.extras.state['nights'] || 0;
      sDate = navigation.extras.state['startDate'] || null;
      eDate = navigation.extras.state['endDate'] || null;
    } else {
      const state = history.state;
      this.basePrice = state.totalPrice || 315;
      this.nights = state.nights || 0;
      sDate = state.startDate || null;
      eDate = state.endDate || null;
    }

    const sDateStr = sDate ? new Date(sDate).toISOString().split('T')[0] : '';
    const eDateStr = eDate ? new Date(eDate).toISOString().split('T')[0] : '';

    this.reservationForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9+() -]*$')]],
      startDate: [sDateStr, Validators.required],
      endDate: [eDateStr, Validators.required],
      firewood: [false],
      earlyCheckIn: [false],
      agreedToTerms: [false, Validators.requiredTrue]
    }, { validators: dateRangeValidator() });
  }

  ngOnInit() { }

  calculateTotal(): number {
    let total = this.basePrice;
    if (this.reservationForm && this.reservationForm.value.firewood) total += 25;
    if (this.reservationForm && this.reservationForm.value.earlyCheckIn) total += 15;
    return total;
  }

  get form() {
    return this.reservationForm.controls;
  }

  continueToPayment() {
    if (this.reservationForm.invalid || this.isSubmitting) {
      this.reservationForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;

    this.authService.getCurrentUser().pipe(take(1)).subscribe(user => {
      if (!user) {
        this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
        return;
      }

      const siteId = this.route.snapshot.paramMap.get('siteId') || this.route.snapshot.paramMap.get('id');
      if (!siteId) {
        console.error('No target ID found');
        this.isSubmitting = false;
        return;
      }

      const formatDateForBackend = (dateStr: string, isCheckOut: boolean = false): string => {
        if (!dateStr) return '';
        const timeStr = isCheckOut ? '11:00:00' : '14:00:00';
        return `${dateStr}T${timeStr}`;
      };

      const formVal = this.reservationForm.value;
      const reservationReq: ReservationRequest = {
        userId: user.id,
        targetId: siteId,
        startDate: formatDateForBackend(formVal.startDate),
        endDate: formatDateForBackend(formVal.endDate, true)
      };

      this.reservationService.createReservation(reservationReq).subscribe({
        next: (res) => {
          console.log('Reservation created successfully:', res);
          const rId = res.id || res._id;
          this.router.navigate(['/booking/payment', siteId], { state: { reservationId: rId } });
        },
        error: (err) => {
          console.error('Error creating reservation:', err);
          this.isSubmitting = false;

          if (err.status === 409) {
            alert('Désolé, ce campsite est déjà réservé pour ces dates. Veuillez choisir d\'autres dates sur le calendrier.');
            const siteIdForNav = this.route.snapshot.paramMap.get('siteId') || this.route.snapshot.paramMap.get('id');
            this.router.navigate(['/booking/dates', siteIdForNav]);
          } else {
            const errorMsg = err.error?.error || err.error?.message || 'Une erreur est survenue lors de la création de la réservation. Veuillez réessayer.';
            alert(`Erreur (${err.status}): ${errorMsg}`);
          }
        }
      });
    });
  }

  goBack() {
    this.router.navigate(['/discover']);
  }
}
