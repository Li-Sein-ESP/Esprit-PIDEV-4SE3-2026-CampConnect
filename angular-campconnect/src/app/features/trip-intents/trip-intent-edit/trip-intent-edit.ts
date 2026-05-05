import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

export function dateRangeValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const from = group.get('dateFrom')?.value;
    const to = group.get('dateTo')?.value;
    if (from && to && new Date(from) >= new Date(to)) {
      return { dateRangeInvalid: true };
    }
    return null;
  };
}
import { TripIntentService } from '../services/trip-intent.service';
import { AuthService } from '../../../core/services/auth.service';
import { CampingStyle, ExperienceLevel, TripIntentStatus } from '../models/trip-intent.model';
import { LucideAngularModule, ArrowLeft, Tent, Map, Calendar, DollarSign, Target, CheckCircle, Flame, Navigation, Key, Image, Settings } from 'lucide-angular';

@Component({
  selector: 'app-trip-intent-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    LucideAngularModule
  ],
  templateUrl: './trip-intent-edit.html',
  styleUrl: './trip-intent-edit.css'
})
export class TripIntentEditComponent implements OnInit {
  // Icons
  readonly ArrowLeft = ArrowLeft;
  readonly Tent = Tent;
  readonly Map = Map;
  readonly Calendar = Calendar;
  readonly DollarSign = DollarSign;
  readonly Target = Target;
  readonly CheckCircle = CheckCircle;
  readonly Flame = Flame;
  readonly Navigation = Navigation;
  readonly Key = Key;
  readonly Image = Image;
  readonly Settings = Settings;

  intentForm!: FormGroup;
  isSubmitting = false;
  isLoading = true;
  currentUserId: string | null = null;
  intentId: string | null = null;
  today = new Date().toISOString().split('T')[0];

  campingStyles = [
    { value: CampingStyle.WILD, label: 'Wild', icon: this.Flame, desc: 'Authentic experience in the middle of nowhere' },
    { value: CampingStyle.GLAMPING, label: 'Glamping', icon: this.Tent, desc: 'Comfort with the charm of nature' },
    { value: CampingStyle.CAR_CAMPING, label: 'Car Camping', icon: this.Map, desc: 'Easy access with your own vehicle' },
    { value: CampingStyle.BACKPACKING, label: 'Backpacking', icon: this.Navigation, desc: 'Hiking and nights under the stars' },
    { value: CampingStyle.TRADITIONAL, label: 'Traditional', icon: this.Tent, desc: 'Classic camping in a tent' },
  ];

  experienceLevels = Object.values(ExperienceLevel);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private tripIntentService: TripIntentService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUserId = user?.id || null;
    });

    this.initForm();

    this.route.paramMap.subscribe(params => {
      this.intentId = params.get('id');
      if (this.intentId) {
        this.loadIntent(this.intentId);
      } else {
        this.router.navigate(['/my-trip-intents']);
      }
    });
  }

  private initForm(): void {
    this.intentForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      dateFrom: ['', Validators.required],
      dateTo: ['', Validators.required],
      budgetMax: [1000, [Validators.required, Validators.min(50)]],
      campingStyle: [CampingStyle.WILD, Validators.required],
      experienceLevel: [ExperienceLevel.INTERMEDIATE, Validators.required],
      preferredZone: ['', Validators.required],
      status: [TripIntentStatus.OPEN, Validators.required],
      imageUrl: ['']
    }, { validators: dateRangeValidator() });
  }

  private loadIntent(id: string): void {
    this.tripIntentService.getTripIntentById(id).subscribe({
      next: (intent) => {
        if (intent.creatorUserId !== this.currentUserId) {
          alert('You are not authorized to edit this project.');
          this.router.navigate(['/trip-intents', id]);
          return;
        }

        const dFrom = intent.dateFrom ? intent.dateFrom.split('T')[0] : '';
        const dTo = intent.dateTo ? intent.dateTo.split('T')[0] : '';

        this.intentForm.patchValue({
          ...intent,
          dateFrom: dFrom,
          dateTo: dTo
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load intent:', err);
        alert('Error loading trip details.');
        this.router.navigate(['/my-trip-intents']);
      }
    });
  }

  getStyleLabel(level: string): string {
    const map: Record<string, string> = {
      BEGINNER: 'Beginner',
      INTERMEDIATE: 'Intermediate',
      ADVANCED: 'Advanced',
      EXPERT: 'Expert'
    };
    return map[level] || level;
  }

  setCampingStyle(style: string) {
    this.intentForm.patchValue({ campingStyle: style });
  }

  onSubmit(): void {
    if (this.intentForm.invalid || !this.intentId) {
      this.intentForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formVal = this.intentForm.value;

    const reqData: any = {
      ...formVal,
      creatorUserId: this.currentUserId,
      dateFrom: `${formVal.dateFrom}T10:00:00`,
      dateTo: `${formVal.dateTo}T18:00:00`
    };

    this.tripIntentService.updateTripIntent(this.intentId, reqData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/trip-intents', this.intentId]);
      },
      error: (err) => {
        console.error('Failed to update trip intent', err);
        this.isSubmitting = false;
        alert('Error during update: ' + (err.error?.message || 'Connection problem'));
      }
    });
  }
}
