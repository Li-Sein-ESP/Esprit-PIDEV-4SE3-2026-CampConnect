import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserApiService } from './user-api.service';

describe('UserApiService', () => {
  let service: UserApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserApiService]
    });

    service = TestBed.inject(UserApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch profile', () => {
    service.getProfile().subscribe((res) => {
      expect(res.id).toBe('user-1');
    });

    const req = httpMock.expectOne('http://localhost:8080/api/users/me');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 'user-1' });
  });

  it('should fetch user stats', () => {
    service.getUserStats().subscribe((res) => {
      expect(res.campsitesVisited).toBe(7);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/users/me/stats');
    expect(req.request.method).toBe('GET');
    req.flush({ campsitesVisited: 7 });
  });

  it('should update profile', () => {
    const payload = { name: 'Updated Camper' };

    service.updateProfile(payload).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/users/me');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 'user-1', name: 'Updated Camper' });
  });
});
