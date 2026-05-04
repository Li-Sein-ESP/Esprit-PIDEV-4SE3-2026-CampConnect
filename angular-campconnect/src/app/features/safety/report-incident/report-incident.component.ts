import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SafetyService } from '../services/safety.service';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-report-incident',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule],
    templateUrl: './report-incident.component.html',
    styleUrls: ['./report-incident.component.scss']
})
export class ReportIncidentComponent {
    incidentForm: FormGroup;
    isSubmitting = false;
    showSuccess = false;
    referenceId = '';
    
    tunisianRegions = [
        'Zaghouan (Jebel Zaghouan)',
        'Jendouba (Aïn Draham)',
        'Jendouba (Tabarka)',
        'Bizerte (Parc Ichkeul)',
        'Bizerte (Raf Raf)',
        'Nabeul (Hammam Ghezaz)',
        'Nabeul (Kelibia)',
        'Siliana (Kesra)',
        'Kasserine (Chambi)',
        'Ben Arous (Boukornine)',
        'Beja (Oued Ziatine)',
        'Kef (Jugurtha Tableland)'
    ];

    constructor(
        private fb: FormBuilder,
        private safetyService: SafetyService,
        private router: Router,
        private authService: AuthService
    ) {
        this.incidentForm = this.fb.group({
            type: ['', Validators.required],
            level: ['', Validators.required],
            regionName: ['', Validators.required],
            latitude: ['', [Validators.pattern(/^-?([1-8]?[1-9]|[1-9]0)\.{1}\d{1,6}/)]],
            longitude: ['', [Validators.pattern(/^-?(([-+]?)([\d]{1,3})((\.[\d]+)?))$/)]],
            description: ['', [Validators.required, Validators.minLength(50)]],
            confirmed: [false, Validators.requiredTrue]
        });
    }

    get f() {
        return this.incidentForm.controls;
    }

    isInvalid(controlName: string): boolean {
        const control = this.incidentForm.get(controlName);
        return !!control && control.invalid && (control.dirty || control.touched);
    }

    onSubmit() {
        if (this.incidentForm.invalid) {
            this.incidentForm.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;

        // Read reporterId from active user profile
        const reporterId = this.authService.currentUserValue?.id || 'Unknown';

        const reportData = {
            type: this.incidentForm.value.type,
            level: this.incidentForm.value.level,
            regionName: this.incidentForm.value.regionName,
            latitude: parseFloat(this.incidentForm.value.latitude) || 0,
            longitude: parseFloat(this.incidentForm.value.longitude) || 0,
            description: this.incidentForm.value.description,
            reporterId: reporterId
        };

        this.safetyService.submitIncident(reportData).pipe(
            catchError(err => {
                console.error('Submission failed', err);
                this.isSubmitting = false;
                alert('La transmission a échoué. Veuillez vérifier votre connexion ou réessayer plus tard.');
                return of(null);
            })
        ).subscribe(report => {
            if (report) {
                this.referenceId = report.id;
                this.isSubmitting = false;
                this.showSuccess = true;
                this.incidentForm.reset();
            }
        });
    }

    resetForm() {
        this.showSuccess = false;
        this.incidentForm.reset();
    }

    returnToDashboard() {
        this.router.navigate(['/safety/alerts']);
    }
}
