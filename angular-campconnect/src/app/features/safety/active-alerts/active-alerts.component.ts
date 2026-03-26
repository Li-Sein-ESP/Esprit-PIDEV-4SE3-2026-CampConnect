import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X, Send, AlertCircle } from 'lucide-angular';

@Component({
    selector: 'app-active-alerts',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
    templateUrl: './active-alerts.component.html'
})
export class ActiveAlertsComponent {
    readonly XIcon = X;
    readonly SendIcon = Send;
    readonly AlertCircleIcon = AlertCircle;

    showReportModal = false;
    reportForm = { location: '', incidentType: '', description: '' };
    incidentTypes = ['Wildlife Encounter', 'Fire Hazard', 'Severe Weather', 'Trail Hazard', 'Medical Emergency', 'Other'];

    openReportModal() { this.showReportModal = true; }
    closeReportModal() { this.showReportModal = false; this.reportForm = { location: '', incidentType: '', description: '' }; }
    submitReport() {
        if (this.reportForm.location && this.reportForm.incidentType && this.reportForm.description) {
            this.closeReportModal();
        }
    }
}
