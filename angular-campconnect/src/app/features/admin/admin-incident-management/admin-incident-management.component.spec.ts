import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { AdminIncidentManagementComponent } from './admin-incident-management.component';
import { environment } from '../../../../environments/environment';

describe('AdminIncidentManagementComponent', () => {
  let component: AdminIncidentManagementComponent;
  let fixture: ComponentFixture<AdminIncidentManagementComponent>;
  let httpMock: HttpTestingController;

  const baseUrl = `${environment.apiUrl}/admin/safety`;
  const analyticsUrl = `${environment.apiUrl}/safety/analytics`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminIncidentManagementComponent, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminIncidentManagementComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads moderation queues and analytics KPI metrics', () => {
    fixture.detectChanges();

    httpMock.expectOne(`${baseUrl}/alerts/pending`).flush([]);
    httpMock.expectOne(`${baseUrl}/incidents/pending`).flush([]);
    httpMock.expectOne(`${analyticsUrl}/scheduler-impact`).flush({
      reviewedIncidentsLast24h: 12,
      autoAlertsCreatedLast24h: 4,
      stalePendingIncidents: 3
    });
    httpMock.expectOne(`${analyticsUrl}/open-incidents-summary`).flush([
      { region: 'Atlas', tripId: 'trip-1', reporterId: 'user-1', openIncidentCount: 7 },
      { region: 'Sahara', tripId: 'trip-2', reporterId: 'user-2', openIncidentCount: 2 }
    ]);

    fixture.detectChanges();

    expect(component.schedulerImpact.reviewedIncidentsLast24h).toBe(12);
    expect(component.schedulerImpact.autoAlertsCreatedLast24h).toBe(4);
    expect(component.schedulerImpact.stalePendingIncidents).toBe(3);
    expect(component.openSummary.length).toBe(2);
    expect(component.openSummary[0].region).toBe('Atlas');

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Reviewed incidents (24h)');
    expect(text).toContain('Auto alerts (24h)');
    expect(text).toContain('Pending older than 24h');
  });

  it('shows admin required message when analytics returns 403', () => {
    fixture.detectChanges();

    httpMock.expectOne(`${baseUrl}/alerts/pending`).flush([]);
    httpMock.expectOne(`${baseUrl}/incidents/pending`).flush([]);
    httpMock.expectOne(`${analyticsUrl}/scheduler-impact`).flush({}, { status: 403, statusText: 'Forbidden' });
    httpMock.expectOne(`${analyticsUrl}/open-incidents-summary`).flush({}, { status: 403, statusText: 'Forbidden' });

    fixture.detectChanges();

    expect(component.analyticsAccessDenied).toBeTrue();
    expect(component.analyticsError).toBe('Acces administrateur requis');
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Acces administrateur requis');
  });
});
