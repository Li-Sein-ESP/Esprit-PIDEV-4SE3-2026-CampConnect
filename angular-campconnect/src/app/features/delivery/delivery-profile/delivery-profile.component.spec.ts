import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { DeliveryProfileComponent } from './delivery-profile.component';
import { AuthService } from '../../../core/services/auth.service';
import { DeliveryApiService } from '../services/delivery-api.service';

describe('DeliveryProfileComponent', () => {
  let component: DeliveryProfileComponent;
  let fixture: ComponentFixture<DeliveryProfileComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let deliveryApiService: jasmine.SpyObj<DeliveryApiService>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    deliveryApiService = jasmine.createSpyObj('DeliveryApiService', ['getProfileStats']);

    authService.getCurrentUser.and.returnValue(of({ username: 'Driver One' } as any));
    deliveryApiService.getProfileStats.and.returnValue(of({
      totalDeliveries: 42,
      activeJobs: 3,
      totalEarnings: 12500,
      rating: 4.7,
      onTimeRate: 95,
      completionRate: 98
    } as any));

    await TestBed.configureTestingModule({
      imports: [DeliveryProfileComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: DeliveryApiService, useValue: deliveryApiService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DeliveryProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load profile stats on init', () => {
    expect(component.providerName).toBe('Driver One');
    expect(component.stats.totalDeliveries).toBe(42);
    expect(component.stats.activeJobs).toBe(3);
    expect(component.loading).toBeFalse();
  });

  it('should toggle review response', () => {
    const review = { showResponse: false } as any;
    component.toggleResponse(review);
    expect(review.showResponse).toBeTrue();
  });

  it('should handle stats loading error', () => {
    deliveryApiService.getProfileStats.and.returnValue(throwError(() => new Error('boom')));

    component.loadProfileStats();

    expect(component.loading).toBeFalse();
  });
});
