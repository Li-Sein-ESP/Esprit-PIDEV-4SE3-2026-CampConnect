import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SafetyAlertsComponent } from './safety-alerts.component';
import { SafetyService } from '../services/safety.service';
import { of } from 'rxjs';
import { LucideAngularModule, AlertTriangle, ShieldCheck, Search, Filter, Info, CloudRain, Flame, AlertCircle, MapPin, Calendar, Clock, ChevronRight, Map as LucideMap, Edit3, Trash2 } from 'lucide-angular';
import { Router } from '@angular/router';
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
      deleteAlert: jasmine.createSpy('deleteAlert').and.returnValue(of(null)),
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
        { provide: Router, useValue: mockRouter }
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
    expect(component.alerts.length).toBe(2);
    expect(component.filteredAlerts.length).toBe(2);
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
});
