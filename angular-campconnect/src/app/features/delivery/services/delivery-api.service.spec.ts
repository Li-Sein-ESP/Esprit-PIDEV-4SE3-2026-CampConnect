import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DeliveryApiService } from './delivery-api.service';

describe('DeliveryApiService', () => {
  let service: DeliveryApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DeliveryApiService]
    });

    service = TestBed.inject(DeliveryApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch profile stats', () => {
    const mock = { totalDeliveries: 12, activeJobs: 2 } as any;

    service.getProfileStats().subscribe((res) => {
      expect(res.totalDeliveries).toBe(12);
      expect(res.activeJobs).toBe(2);
    });

    const req = httpMock.expectOne('http://localhost:8081/api/deliveries/profile-stats');
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('should include query params in getAll', () => {
    service.getAll('PENDING', 'HIGH', 1, 20).subscribe();

    const req = httpMock.expectOne((r) =>
      r.url === 'http://localhost:8081/api/deliveries' &&
      r.params.get('status') === 'PENDING' &&
      r.params.get('priority') === 'HIGH' &&
      r.params.get('page') === '1' &&
      r.params.get('size') === '20'
    );
    expect(req.request.method).toBe('GET');
    req.flush({ content: [], page: 1, size: 20, totalElements: 0, totalPages: 0, last: true });
  });

  it('should call updateStatus with PATCH and status param', () => {
    service.updateStatus('delivery-1', 'ASSIGNED').subscribe();

    const req = httpMock.expectOne((r) =>
      r.url === 'http://localhost:8081/api/deliveries/delivery-1/status' &&
      r.params.get('status') === 'ASSIGNED'
    );
    expect(req.request.method).toBe('PATCH');
    req.flush({ id: 'delivery-1' });
  });
});
