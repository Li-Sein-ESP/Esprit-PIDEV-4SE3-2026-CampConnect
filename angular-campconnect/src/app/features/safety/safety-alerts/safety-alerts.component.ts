import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  ShieldAlert,
  AlertTriangle,
  Bell,
  Clock,
  Info,
  ChevronRight,
  ArrowRight,
  Snowflake,
  MapPin,
  Flame,
  CheckCircle,
  ExternalLink,
  X,
  Send,
  AlertCircle
} from 'lucide-angular';

@Component({
  selector: 'app-safety-alerts-component',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LucideAngularModule,
    LucideAngularModule
  ],
  templateUrl: './safety-alerts.component.html',
  styles: []
})
export class SafetyAlertsComponent {
  // Lucide Icons
  readonly ShieldAlertIcon = ShieldAlert;
  readonly AlertTriangleIcon = AlertTriangle;
  readonly BellIcon = Bell;
  readonly ClockIcon = Clock;
  readonly InfoIcon = Info;
  readonly ChevronRightIcon = ChevronRight;
  readonly ArrowRightIcon = ArrowRight;
  readonly SnowflakeIcon = Snowflake;
  readonly MapPinIcon = MapPin;
  readonly FlameIcon = Flame;
  readonly CheckCircleIcon = CheckCircle;
  readonly ExternalLinkIcon = ExternalLink;
  readonly XIcon = X;
  readonly SendIcon = Send;
  readonly AlertCircleIcon = AlertCircle;

  // Modal state
  showReportModal = false;
  reportForm = {
    location: '',
    incidentType: '',
    description: ''
  };

  incidentTypes = [
    'Wildlife Encounter',
    'Fire Hazard',
    'Severe Weather',
    'Trail Hazard',
    'Medical Emergency',
    'Other'
  ];

  openReportModal() {
    this.showReportModal = true;
  }

  closeReportModal() {
    this.showReportModal = false;
    this.reportForm = { location: '', incidentType: '', description: '' };
  }

  submitReport() {
    if (this.reportForm.location && this.reportForm.incidentType && this.reportForm.description) {
      console.log('Report submitted:', this.reportForm);
      this.closeReportModal();
    }
  }

  constructor() { }
}
