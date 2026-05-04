import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, AlertTriangle, ShieldCheck, Search, Filter, Info, CloudRain, Flame, AlertCircle, MapPin, Calendar, Clock, ChevronRight, Map as LucideMap, Edit3, Trash2 } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';
import { BadgeComponent } from '../../../shared/components/badge.component';
import { IncidentReport, SafetyAlert } from '../models/safety.model';
import { SafetyService } from '../services/safety.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-safety-alerts',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LucideAngularModule,
    ButtonComponent,
    CardComponent,
    CardContentComponent,
    BadgeComponent,
    ModalComponent
  ],
  templateUrl: './safety-alerts.component.html',
  styles: []
})
export class SafetyAlertsComponent implements OnInit {
  // Icons
  readonly AlertTriangle = AlertTriangle;
  readonly ShieldCheck = ShieldCheck;
  readonly SearchIcon = Search;
  readonly FilterIcon = Filter;
  readonly InfoIcon = Info;
  readonly CloudRain = CloudRain;
  readonly Flame = Flame;
  readonly AlertCircle = AlertCircle;
  readonly MapPin = MapPin;
  readonly Calendar = Calendar;
  readonly Clock = Clock;
  readonly ChevronRight = ChevronRight;
  readonly MapIcon = LucideMap;
  readonly EditIcon = Edit3;
  readonly TrashIcon = Trash2;

  // Search and Filters
  searchQuery = '';
  selectedType = 'all';
  selectedSeverity = 'all';

  alerts: SafetyAlert[] = [];
  filteredAlerts: SafetyAlert[] = [];
  incidents: IncidentReport[] = [];
  loading = false;
  incidentsLoading = false;
  error: string | null = null;
  
  // Modal State
  showEditModal = false;
  showIncidentEditModal = false;
  editingAlert: any = null;
  editingIncident: any = null;
  isEditingAlert = false;
  saving = false;
  savingAlert = false;
<<<<<<< HEAD
=======
  alertFormSubmitted = false;
  alertFormErrors: Record<string, string> = {};
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)

  constructor(
    private router: Router,
    private safetyService: SafetyService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    console.log('SafetyAlertsComponent initialized');
    this.loadAlerts();
    this.loadIncidents();
  }

  loadAlerts(): void {
    this.loading = true;
    this.safetyService.getAlerts().pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (data) => {
        console.log('Received alerts from service:', data);
        this.alerts = Array.isArray(data) ? data : [];
        this.applyFilters();
        console.log('Filtered alerts count:', this.filteredAlerts.length);
      },
      error: (err) => {
        console.error('Error fetching alerts:', err);
        this.error = 'Failed to load safety alerts. Please try again later.';
        this.alerts = [];
        this.applyFilters();
      }
    });
  }

  applyFilters(): void {
    if (!Array.isArray(this.alerts)) {
      this.filteredAlerts = [];
      return;
    }
    const query = (this.searchQuery || '').toLowerCase();
    this.filteredAlerts = this.alerts.filter(alert => {
      if (!alert) return false;
      
      const title = (alert.title || '').toLowerCase();
      const locName = (alert.location?.name || '').toLowerCase();
      const locRegion = (alert.location?.region || '').toLowerCase();
      const desc = (alert.description || '').toLowerCase();

      const matchesSearch = query === '' ||
        title.includes(query) ||
        locName.includes(query) ||
        locRegion.includes(query) ||
        desc.includes(query);

      const matchesType = this.selectedType === 'all' || alert.type === this.selectedType;
      const matchesSeverity = this.selectedSeverity === 'all' || alert.severity === this.selectedSeverity;

      return matchesSearch && matchesType && matchesSeverity;
    });
  }

  get stats() {
    const safeAlerts = Array.isArray(this.alerts) ? this.alerts : [];
    return {
      active: safeAlerts.filter(a => a && a.active).length,
      critical: safeAlerts.filter(a => a && (a.severity === 'critical' || a.severity === 'danger')).length,
      warning: safeAlerts.filter(a => a && a.severity === 'warning').length,
      info: safeAlerts.filter(a => a && a.severity === 'info').length
    };
  }

  getSeverityClasses(severity: string): string {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'danger': return 'bg-orange-600 text-white';
      case 'warning': return 'bg-amber-500 text-white';
      case 'info': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  }

  getTypeIcon(type: string): any {
    switch (type) {
      case 'weather': return this.CloudRain;
      case 'fire': return this.Flame;
      case 'wildlife': return this.AlertTriangle;
      case 'closure': return this.AlertCircle;
      default: return this.InfoIcon;
    }
  }

  viewDetails(id: string): void {
    this.router.navigate(['/safety/alerts', id]);
  }

<<<<<<< HEAD
=======
  openSafetyMap(): void {
    this.router.navigateByUrl('/safety/map').then((ok) => {
      if (!ok) {
        window.location.href = '/safety/map';
      }
    });
  }

  openReportIncident(): void {
    this.router.navigateByUrl('/safety/report-incident').then((ok) => {
      if (!ok) {
        window.location.href = '/safety/report-incident';
      }
    });
  }

>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
  formatDate(isoDate: string): string {
    if (!isoDate) return 'Recently';
    return new Date(isoDate).toLocaleDateString();
  }

  loadIncidents(): void {
    this.incidentsLoading = true;
    this.safetyService.getIncidents().pipe(
      finalize(() => {
        this.incidentsLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (data) => {
        console.log('Received incidents:', data);
        this.incidents = Array.isArray(data) ? data : [];
      },
      error: (err) => {
        console.error('Error fetching incidents:', err);
        this.incidents = [];
      }
    });
  }

  // Edit/Delete Actions for Alerts
  // ... (existing code)

  // Edit/Delete Actions for Incidents
  onEditIncident(event: Event, incident: IncidentReport): void {
    event.stopPropagation();
    this.editingIncident = JSON.parse(JSON.stringify(incident));
    this.showIncidentEditModal = true;
  }

  onDeleteIncident(event: Event, id: string): void {
    console.log('Delete incident clicked for ID:', id);
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this incident report?')) {
      this.safetyService.deleteIncident(id).pipe(
        finalize(() => {
          this.cdr.detectChanges();
        })
      ).subscribe({
        next: () => {
          console.log('Delete success for ID:', id);
          this.incidents = this.incidents.filter(i => i.id !== id);
        },
        error: (err) => {
          console.error('Error deleting incident:', err);
          alert('Failed to delete incident. Please try again.');
        }
      });
    }
  }

  closeIncidentEditModal(): void {
    this.showIncidentEditModal = false;
    this.editingIncident = null;
  }

  saveIncidentChanges(): void {
    if (!this.editingIncident) return;
    console.log('Saving incident changes:', this.editingIncident);
    this.saving = true;
    this.safetyService.updateIncident(this.editingIncident.id, this.editingIncident).pipe(
      finalize(() => {
        this.saving = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (updated) => {
        console.log('Update success, received:', updated);
        const index = this.incidents.findIndex(i => i.id === updated.id);
        if (index !== -1) {
          this.incidents[index] = updated;
        }
        this.closeIncidentEditModal();
      },
      error: (err) => {
        console.error('Error updating incident:', err);
        alert('Failed to update incident. Please try again.');
      }
    });
  }

  openAddAlertModal(): void {
    const newAlert: any = {
      title: '',
      description: '',
      type: 'advisory',
      severity: 'info',
      location: { name: '', region: '' },
      active: true
    };
    this.editingAlert = newAlert;
    this.isEditingAlert = false;
<<<<<<< HEAD
=======
    this.alertFormSubmitted = false;
    this.alertFormErrors = {};
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
    this.showEditModal = true;
  }

  // Edit/Delete Actions
  onEdit(event: Event, alert: SafetyAlert): void {
    event.stopPropagation();
    this.editingAlert = JSON.parse(JSON.stringify(alert)); // Deep copy
    this.isEditingAlert = true;
<<<<<<< HEAD
=======
    this.alertFormSubmitted = false;
    this.alertFormErrors = {};
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
    this.showEditModal = true;
  }

  onDelete(event: Event, id: string): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this safety alert?')) {
      this.safetyService.deleteAlert(id).subscribe({
        next: () => {
          this.alerts = this.alerts.filter(a => a.id !== id);
          this.applyFilters();
        },
        error: (err) => {
          console.error('Error deleting alert:', err);
          alert('Failed to delete alert. Please try again.');
        }
      });
    }
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingAlert = null;
    this.isEditingAlert = false;
<<<<<<< HEAD
=======
    this.alertFormSubmitted = false;
    this.alertFormErrors = {};
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
  }

  saveAlert(): void {
    if (!this.editingAlert) return;
<<<<<<< HEAD
=======

    this.alertFormSubmitted = true;
    if (!this.validateAlertForm()) {
      return;
    }

    // sanitize string fields before sending
    this.editingAlert.title = (this.editingAlert.title || '').trim();
    this.editingAlert.description = (this.editingAlert.description || '').trim();
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
    
    this.savingAlert = true;
    const alertData = this.editingAlert;
    
    const request = this.isEditingAlert 
      ? this.safetyService.updateAlert(alertData.id, alertData)
      : this.safetyService.createAlert(alertData);

    request.pipe(
      finalize(() => {
        this.savingAlert = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (saved) => {
        console.log('Alert saved successfully:', saved);
        if (this.isEditingAlert) {
          const index = this.alerts.findIndex(a => a.id === saved.id);
          if (index !== -1) {
            this.alerts[index] = saved;
          }
        } else {
          this.alerts = [saved, ...this.alerts];
        }
        this.applyFilters();
        this.closeEditModal();
      },
      error: (err) => {
        console.error('Error saving alert:', err);
        alert('Failed to save safety alert. Please try again.');
      }
    });
  }
<<<<<<< HEAD
=======

  validateAlertForm(): boolean {
    this.alertFormErrors = {};
    if (!this.editingAlert) {
      return false;
    }

    const title = (this.editingAlert.title || '').trim();
    const description = (this.editingAlert.description || '').trim();
    const type = (this.editingAlert.type || '').trim();
    const severity = (this.editingAlert.severity || '').trim();

    if (!title) {
      this.alertFormErrors['title'] = 'Title is required.';
    } else if (title.length < 4) {
      this.alertFormErrors['title'] = 'Title must be at least 4 characters.';
    } else if (title.length > 120) {
      this.alertFormErrors['title'] = 'Title cannot exceed 120 characters.';
    }

    if (!description) {
      this.alertFormErrors['description'] = 'Description is required.';
    } else if (description.length < 15) {
      this.alertFormErrors['description'] = 'Description must be at least 15 characters.';
    } else if (description.length > 500) {
      this.alertFormErrors['description'] = 'Description cannot exceed 500 characters.';
    }

    const validTypes = ['weather', 'fire', 'wildlife', 'closure', 'advisory'];
    if (!type || !validTypes.includes(type)) {
      this.alertFormErrors['type'] = 'Please select a valid category.';
    }

    const validSeverities = ['critical', 'danger', 'warning', 'info'];
    if (!severity || !validSeverities.includes(severity)) {
      this.alertFormErrors['severity'] = 'Please select a valid severity.';
    }

    return Object.keys(this.alertFormErrors).length === 0;
  }

  hasAlertFieldError(field: string): boolean {
    return this.alertFormSubmitted && !!this.alertFormErrors[field];
  }
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
}
