import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

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
import { GroupService } from '../../groups/services/group';
import { AuthService } from '../../../core/services/auth.service';
import { CampingStyle, ExperienceLevel, TripIntentStatus } from '../models/trip-intent.model';
import { LucideAngularModule, ArrowLeft, Tent, Map, Calendar, DollarSign, Target, CheckCircle, Flame, Navigation, Key } from 'lucide-angular';

@Component({
    selector: 'app-trip-intent-create',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        LucideAngularModule
    ],
    templateUrl: './trip-intent-create.component.html',
    styleUrl: './trip-intent-create.component.css'
})
export class TripIntentCreateComponent implements OnInit {
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

    intentForm!: FormGroup;
    isSubmitting = false;
    currentUserId: string | null = null;

    campingStyles = [
        { value: CampingStyle.WILD, label: 'Sauvage', icon: this.Flame, desc: 'Expérience authentique au milieu de nulle part' },
        { value: CampingStyle.GLAMPING, label: 'Glamping', icon: this.Tent, desc: 'Le confort avec le charme de la nature' },
        { value: CampingStyle.CAR_CAMPING, label: 'Camping Car', icon: this.Map, desc: 'Facile d\'accès avec votre véhicule' },
        { value: CampingStyle.BACKPACKING, label: 'Backpacking', icon: this.Navigation, desc: 'Randonnée et nuits à la belle étoile' },
        { value: CampingStyle.TRADITIONAL, label: 'Traditionnel', icon: this.Tent, desc: 'Camping classique en tente' },
    ];

    experienceLevels = Object.values(ExperienceLevel);

    constructor(
        private fb: FormBuilder,
        private tripIntentService: TripIntentService,
        private groupService: GroupService,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.authService.getCurrentUser().subscribe(user => {
            this.currentUserId = user?.id || null;
        });

        this.intentForm = this.fb.group({
            title: ['', [Validators.required, Validators.maxLength(100)]],
            dateFrom: ['', Validators.required],
            dateTo: ['', Validators.required],
            budgetMax: [1000, [Validators.required, Validators.min(0)]],
            campingStyle: [CampingStyle.WILD, Validators.required],
            experienceLevel: [ExperienceLevel.INTERMEDIATE, Validators.required],
            preferredZone: [''],
            status: [TripIntentStatus.OPEN, Validators.required]
        }, { validators: dateRangeValidator() });
    }

    getStyleLabel(level: string): string {
        const map: Record<string, string> = {
            BEGINNER: 'Débutant',
            INTERMEDIATE: 'Intermédiaire',
            ADVANCED: 'Avancé',
            EXPERT: 'Expert'
        };
        return map[level] || level;
    }

    setCampingStyle(style: string) {
        this.intentForm.patchValue({ campingStyle: style });
    }

    onSubmit(): void {
        if (this.intentForm.invalid || !this.currentUserId) {
            if (!this.currentUserId) {
                alert('Veuillez vous connecter pour créer une intention.');
            }
            this.intentForm.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;
        const formVal = this.intentForm.value;

        const reqData: any = {
            ...formVal,
            creatorUserId: this.currentUserId,
            // Convert simple date to LocalDateTime format (ISO)
            dateFrom: `${formVal.dateFrom}T10:00:00`,
            dateTo: `${formVal.dateTo}T18:00:00`
        };

        this.tripIntentService.createTripIntent(reqData).subscribe({
            next: (res) => {
                const tripId = res.id || (res as any)._id;

                // Auto-create associated Group
                this.groupService.createGroup({
                    name: res.title || reqData.title,
                    creatorUserId: this.currentUserId!,
                    tripId: tripId,
                    memberUserIds: [this.currentUserId!],
                    status: 'ACTIVE' as any
                }).subscribe({
                    next: () => {
                        this.isSubmitting = false;
                        if (tripId) {
                            this.router.navigate(['/trip-intents', tripId]);
                        } else {
                            this.router.navigate(['/trip-intents']);
                        }
                    },
                    error: (err) => {
                        console.error('Failed to create associated group', err);
                        this.isSubmitting = false;
                        if (tripId) {
                            this.router.navigate(['/trip-intents', tripId]);
                        } else {
                            this.router.navigate(['/trip-intents']);
                        }
                    }
                });
            },
            error: (err) => {
                console.error('Failed to create trip intent', err);
                this.isSubmitting = false;
                alert('Erreur lors de la création : ' + (err.error?.message || 'Problème de connexion'));
            }
        });
    }
}
