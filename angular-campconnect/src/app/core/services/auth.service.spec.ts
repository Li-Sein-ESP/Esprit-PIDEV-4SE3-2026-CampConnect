import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { User } from '../models/auth.models';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
    let service: AuthService;
    let httpMock: HttpTestingController;

    const mockUser: User = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['ROLE_USER'],
        token: 'header.payload.signature'
    };

    beforeEach(() => {
        localStorage.clear();

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [AuthService]
        });

        service = TestBed.inject(AuthService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should login and store user in localStorage', () => {
        const loginResponse = { ...mockUser };
        
        service.login('testuser', 'password').subscribe(user => {
            expect(service.getToken()).toBe(mockUser.token);
            expect(localStorage.getItem('cc_user')).toBeTruthy();
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/auth/signin`);
        expect(req.request.method).toBe('POST');
        req.flush(loginResponse);
    });

    it('should logout and clear localStorage', () => {
        // Set up initial state using private method (setSession)
        (service as any).setSession(mockUser, mockUser.token!);
        expect(service.getToken()).toBe(mockUser.token);

        service.logout();

        expect(service.getToken()).toBeUndefined();
        expect(localStorage.getItem('cc_user')).toBeFalsy();
    });

    it('should return true for hasRole if user has the role', () => {
        (service as any).setSession(mockUser, mockUser.token!);
        expect(service.hasRole('user')).toBeTrue();
    });

    it('should return false for hasRole if user does not have the role', () => {
        (service as any).setSession(mockUser, mockUser.token!);
        expect(service.hasRole('admin')).toBeFalse();
    });
});
