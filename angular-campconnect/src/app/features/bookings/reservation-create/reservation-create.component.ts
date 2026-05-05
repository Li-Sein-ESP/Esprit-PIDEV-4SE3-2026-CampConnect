import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { LucideAngularModule, ChevronLeft, Calendar, Users, MapPin, Star, CheckCircle, Shield, AlertCircle, ChevronRight, Info } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card.component';
import { ReservationService } from '../../../core/services/reservation.service';
import { AuthService } from '../../../core/services/auth.service';
import { CampsiteService, Campsite } from '../../../core/services/campsite.service';
import { ReservationRequest } from '../../../core/models/reservation.model';
import { take, Subscription } from 'rxjs';

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

@Component({
  selector: 'app-reservation-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, ButtonComponent, CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent],
  templateUrl: './reservation-create.component.html'
})
export class ReservationCreateComponent implements OnInit, OnDestroy {
  readonly ChevronLeft = ChevronLeft;
  readonly Calendar = Calendar;
  readonly Users = Users;
  readonly MapPin = MapPin;
  readonly Star = Star;
  readonly CheckCircle = CheckCircle;
  readonly Shield = Shield;
  readonly AlertCircle = AlertCircle;
  readonly ChevronRight = ChevronRight;
  readonly Info = Info;

  campsite = signal<Campsite | null>(null);
  nights = signal<number>(0);
  isSubmitting = false;
  reservationForm!: FormGroup;
  private valueChangesSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reservationService: ReservationService,
    private campsiteService: CampsiteService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    const navigation = this.router.getCurrentNavigation();
    let sDate = null;
    let eDate = null;

    if (navigation?.extras.state && navigation.extras.state['campsite']) {
      this.campsite.set(navigation.extras.state['campsite']);
    }

    const state = history.state;
    if (state && state.campsite) {
      this.campsite.set(state.campsite);
    }

    // Attempt to get dates from state if coming from some search
    sDate = navigation?.extras.state?.['startDate'] || state.startDate || null;
    eDate = navigation?.extras.state?.['endDate'] || state.endDate || null;

    const sDateStr = sDate ? new Date(sDate).toISOString().split('T')[0] : '';
    const eDateStr = eDate ? new Date(eDate).toISOString().split('T')[0] : '';

    this.reservationForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['+216', [Validators.required, Validators.pattern('^\\+216[0-9]{8}$')]],
      startDate: [sDateStr, Validators.required],
      endDate: [eDateStr, Validators.required],
      firewood: [false],
      earlyCheckIn: [false],
      agreedToTerms: [false, Validators.requiredTrue]
    }, { validators: dateRangeValidator() });
  }

  ngOnInit() {
    const siteId = this.route.snapshot.paramMap.get('siteId') || this.route.snapshot.paramMap.get('id');
    
    if (siteId && !this.campsite()) {
      this.campsiteService.getCampsiteById(siteId).subscribe(site => {
        if (site) {
          this.campsite.set(site);
          this.calculateNights();
        }
      });
    }

    this.valueChangesSub = this.reservationForm.valueChanges.subscribe(() => {
      this.calculateNights();
    });

    this.calculateNights();
    
    // Auto-fill user info if logged in
    this.authService.getCurrentUser().pipe(take(1)).subscribe(user => {
      if (user) {
        this.reservationForm.patchValue({
          firstName: user.username?.split(' ')[0] || '',
          lastName: user.username?.split(' ')[1] || '',
          email: user.email || ''
        });
      }
    });
  }

  ngOnDestroy() {
    this.valueChangesSub?.unsubscribe();
  }

  calculateNights() {
    const start = this.reservationForm.get('startDate')?.value;
    const end = this.reservationForm.get('endDate')?.value;
    
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const diffTime = endDate.getTime() - startDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      this.nights.set(diffDays > 0 ? diffDays : 0);
    } else {
      this.nights.set(0);
    }
  }

  calculateTotal(): number {
    const site = this.campsite();
    if (!site) return 0;
    
    let total = site.price * this.nights();
    if (this.reservationForm.value.firewood) total += 25;
    if (this.reservationForm.value.earlyCheckIn) total += 15;
    return total;
  }

  get form() {
    return this.reservationForm.controls;
  }

  confirmReservation() {
    if (this.reservationForm.invalid || this.isSubmitting || !this.campsite()) {
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
        console.error('No site ID found');
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
        username: user.name || user.username,
        targetId: siteId,
        startDate: formatDateForBackend(formVal.startDate),
        endDate: formatDateForBackend(formVal.endDate, true)
      };

      this.reservationService.createReservation(reservationReq).subscribe({
        next: (res) => {
          this.router.navigate(['/booking/confirmation'], { 
            state: { 
              reservation: res,
              campsite: this.campsite()
            } 
          });
        },
        error: (err) => {
          this.isSubmitting = false;
          const errorMsg = err.error?.error || err.error?.message || 'Une erreur est survenue. Veuillez réessayer.';
          alert(`Erreur: ${errorMsg}`);
        }
      });
    });
  }

  goBack() {
    const siteId = this.route.snapshot.paramMap.get('siteId') || this.route.snapshot.paramMap.get('id');
    if (siteId) {
      this.router.navigate(['/campsites', siteId]);
    } else {
      this.router.navigate(['/campsites']);
    }
  }
}
