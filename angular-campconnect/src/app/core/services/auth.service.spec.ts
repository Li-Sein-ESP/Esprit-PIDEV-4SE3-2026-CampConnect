import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService, User } from './auth.service';

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
        // Clear localStorage before each test
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
            expect(localStorage.getItem('currentUser')).toBeTruthy();
        });

        const req = httpMock.expectOne('http://localhost:8089/api/auth/signin');
        expect(req.request.method).toBe('POST');
        req.flush(loginResponse);
    });

    it('should logout and clear localStorage', () => {
        // Set up initial state
        (service as any).setCurrentUser(mockUser);
        expect(service.getToken()).toBe(mockUser.token);

        service.logout();

        expect(service.getToken()).toBeUndefined();
        expect(localStorage.getItem('currentUser')).toBeFalsy();
    });

    it('should return true for hasRole if user has the role', () => {
        (service as any).setCurrentUser(mockUser);
        expect(service.hasRole('user')).toBeTrue();
    });

    it('should return false for hasRole if user does not have the role', () => {
        (service as any).setCurrentUser(mockUser);
        expect(service.hasRole('admin')).toBeFalse();
    });

    describe('isTokenExpired', () => {
        it('should return true if no token provided', () => {
            const result = (service as any).isTokenExpired(undefined);
            expect(result).toBeTrue();
        });

        it('should correctly detect expired token', () => {
            // Mock an expired token payload
            // {"exp": 1000} (long ago)
            const expiredPayload = btoa(JSON.stringify({ exp: 1000 }));
            const expiredToken = `header.${expiredPayload}.signature`;
            
            const result = (service as any).isTokenExpired(expiredToken);
            expect(result).toBeTrue();
        });

        it('should return false for a future token', () => {
            // Mock a future token payload
            const futureExp = (Date.now() / 1000) + 3600; // 1 hour from now
            const futurePayload = btoa(JSON.stringify({ exp: futureExp }));
            const futureToken = `header.${futurePayload.replace(/=/g, '')}.signature`;
            
            const result = (service as any).isTokenExpired(futureToken);
            expect(result).toBeFalse();
        });
    });
});
