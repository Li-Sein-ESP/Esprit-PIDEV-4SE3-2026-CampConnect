import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SafetyAlertsComponent } from './safety-alerts.component';
import { SafetyService } from '../services/safety.service';
import { of } from 'rxjs';
import { LucideAngularModule, AlertTriangle, ShieldCheck, Search, Filter, Info, CloudRain, Flame, AlertCircle, MapPin, Calendar, Clock, ChevronRight, Map as LucideMap, Edit3, Trash2 } from 'lucide-angular';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

describe('SafetyAlertsComponent', () => {
  let component: SafetyAlertsComponent;
  let fixture: ComponentFixture<SafetyAlertsComponent>;
  let mockSafetyService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockSafetyService = {
      getAlerts: jasmine.createSpy('getAlerts').and.returnValue(of([
        { 
          id: '1', 
          title: 'Forest Fire', 
          type: 'fire', 
          severity: 'critical', 
          location: { name: 'North Park', region: 'Mountain Sector' },
          description: 'Evacuation in progress',
          updatedAt: new Date().toISOString()
        },
        { 
          id: '2', 
          title: 'Heavy Rain', 
          type: 'weather', 
          severity: 'warning', 
          location: { name: 'East Lake' },
          description: 'Flash floods possible'
        }
      ])),
      getIncidents: jasmine.createSpy('getIncidents').and.returnValue(of([
        {
          id: 'inc-1',
          type: 'Wildlife',
          level: 'medium',
          regionName: 'Forest',
          latitude: 12.34,
          longitude: 56.78,
          description: 'Bear seen near trail',
          reporterId: 'u1',
          createdAt: new Date().toISOString(),
          status: 'pending'
        }
      ])),
      deleteAlert: jasmine.createSpy('deleteAlert').and.returnValue(of(null)),
      deleteIncident: jasmine.createSpy('deleteIncident').and.returnValue(of(null)),
      createAlert: jasmine.createSpy('createAlert').and.returnValue(of({
        id: '3',
        title: 'New Alert',
        type: 'weather',
        severity: 'warning',
        location: { name: 'South Lake', region: 'Valley' },
        description: 'Strong winds expected'
      })),
      updateAlert: jasmine.createSpy('updateAlert').and.returnValue(of({ id: '1', title: 'Updated Fire' }))
    };
    mockRouter = { navigate: jasmine.createSpy('navigate') };

    await TestBed.configureTestingModule({
      imports: [
        SafetyAlertsComponent,
        FormsModule,
        LucideAngularModule.pick({ 
          AlertTriangle, ShieldCheck, Search, Filter, Info, 
          CloudRain, Flame, AlertCircle, MapPin, Calendar, 
          Clock, ChevronRight, LucideMap, Edit3, Trash2 
        })
      ],
      providers: [
        { provide: SafetyService, useValue: mockSafetyService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SafetyAlertsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load alerts on initialization', () => {
    expect(mockSafetyService.getAlerts).toHaveBeenCalled();
    expect(mockSafetyService.getIncidents).toHaveBeenCalled();
    expect(component.alerts.length).toBe(2);
    expect(component.filteredAlerts.length).toBe(2);
    expect(component.incidents.length).toBe(1);
  });

  it('should filter alerts by searching for title', () => {
    component.searchQuery = 'Fire';
    component.applyFilters();
    expect(component.filteredAlerts.length).toBe(1);
    expect(component.filteredAlerts[0].title).toBe('Forest Fire');
  });

  it('should filter alerts by severity', () => {
    component.selectedSeverity = 'critical';
    component.applyFilters();
    expect(component.filteredAlerts.length).toBe(1);
    expect(component.filteredAlerts[0].severity).toBe('critical');
  });

  it('should open edit modal when onEdit is called', () => {
    const mockEvent = { stopPropagation: jasmine.createSpy('stopPropagation') } as any;
    const alert = component.alerts[0];
    
    component.onEdit(mockEvent, alert);
    
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(component.showEditModal).toBeTrue();
    expect(component.editingAlert.title).toBe(alert.title);
  });

  it('should call deleteAlert service when onDelete is confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const mockEvent = { stopPropagation: jasmine.createSpy('stopPropagation') } as any;
    
    component.onDelete(mockEvent, '1');
    
    expect(mockSafetyService.deleteAlert).toHaveBeenCalledWith('1');
    expect(component.alerts.length).toBe(1);
  });

  it('should add a new alert through saveAlert in create mode', () => {
    component.openAddAlertModal();
    component.editingAlert.title = 'New Alert';
    component.editingAlert.description = 'Strong winds expected';
    component.editingAlert.type = 'weather';
    component.editingAlert.severity = 'warning';
    component.editingAlert.location = { name: 'South Lake', region: 'Valley' };

    component.saveAlert();

    expect(mockSafetyService.createAlert).toHaveBeenCalled();
    expect(component.alerts[0].title).toBe('New Alert');
  });

  it('should prevent saving alert when validation fails', () => {
    component.openAddAlertModal();
    component.editingAlert.title = 'a';
    component.editingAlert.description = 'short';
    component.editingAlert.type = 'invalid';
    component.editingAlert.severity = 'invalid';

    component.saveAlert();

    expect(mockSafetyService.createAlert).not.toHaveBeenCalled();
    expect(component.alertFormErrors['title']).toBeTruthy();
    expect(component.alertFormErrors['description']).toBeTruthy();
    expect(component.alertFormErrors['type']).toBeTruthy();
    expect(component.alertFormErrors['severity']).toBeTruthy();
  });

  it('should return correct stats from loaded alerts', () => {
    const s = component.stats;
    expect(s.active).toBe(0);
    expect(s.critical).toBe(1);
    expect(s.warning).toBe(1);
    expect(s.info).toBe(0);
  });
});
