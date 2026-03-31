import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { DeliveryEarningsComponent } from './delivery-earnings.component';
import { DeliveryApiService } from '../services/delivery-api.service';

describe('DeliveryEarningsComponent', () => {
  let component: DeliveryEarningsComponent;
  let fixture: ComponentFixture<DeliveryEarningsComponent>;
  let deliveryApi: jasmine.SpyObj<DeliveryApiService>;

  beforeEach(async () => {
    deliveryApi = jasmine.createSpyObj('DeliveryApiService', ['getEarnings', 'getEarningsBreakdown', 'getRecentPayments']);

    deliveryApi.getEarnings.and.returnValue(of({
      totalEarnings: 1000,
      weeklyEarnings: 200,
      monthlyEarnings: 500,
      deliveriesCompleted: 20,
      averagePerDelivery: 50,
      dailyBreakdown: []
    } as any));
    deliveryApi.getEarningsBreakdown.and.returnValue(of({ vehicleEarnings: [] }));
    deliveryApi.getRecentPayments.and.returnValue(of({ payments: [] }));

    await TestBed.configureTestingModule({
      imports: [DeliveryEarningsComponent],
      providers: [{ provide: DeliveryApiService, useValue: deliveryApi }]
    }).compileComponents();

    fixture = TestBed.createComponent(DeliveryEarningsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load earnings data on init', fakeAsync(() => {
    fixture.detectChanges();
    tick(120);

    expect(component.earnings.total).toBe(1000);
    expect(component.earnings.weekly).toBe(200);
    expect(component.loading).toBeFalse();
  }));

  it('should fallback to mock data when earnings request fails', () => {
    deliveryApi.getEarnings.and.returnValue(throwError(() => new Error('fail')));
    spyOn(component, 'loadMockData').and.callThrough();

    component.loadRealData();

    expect(component.loadMockData).toHaveBeenCalled();
  });
});
