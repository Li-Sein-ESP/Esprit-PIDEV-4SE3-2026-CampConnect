import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GearApiService } from './gear-api.service';

describe('GearApiService', () => {
  let service: GearApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GearApiService]
    });

    service = TestBed.inject(GearApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get gear list with filters', () => {
    service.getGear({ page: 2, size: 8, category: 'Tents', status: 'AVAILABLE' }).subscribe();

    const req = httpMock.expectOne((r) =>
      r.url === 'http://localhost:8080/api/gear' &&
      r.params.get('page') === '2' &&
      r.params.get('size') === '8' &&
      r.params.get('category') === 'Tents' &&
      r.params.get('status') === 'AVAILABLE'
    );
    expect(req.request.method).toBe('GET');
    req.flush({ content: [], page: 2, size: 8, totalElements: 0, totalPages: 0, last: true });
  });

  it('should get gear item by id', () => {
    service.getGearById('gear-1').subscribe((res) => {
      expect(res.id).toBe('gear-1');
    });

    const req = httpMock.expectOne('http://localhost:8080/api/gear/gear-1');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 'gear-1' });
  });

  it('should create gear with POST', () => {
    const payload: any = { name: 'Tent' };

    service.createGear(payload).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/gear');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 'gear-1' });
  });
});
