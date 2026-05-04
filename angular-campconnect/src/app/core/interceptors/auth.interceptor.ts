import { Injectable, inject } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * AuthInterceptor — automatically attaches `Authorization: Bearer <token>`
 * to every outgoing HTTP request when a JWT token is available.
 * Also handles token expiration and auth errors.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private router = inject(Router);

    constructor(private authService: AuthService) { }

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        const token = this.authService.getToken();

        // Never block or modify auth requests — they must always pass through cleanly
        const isAuthEndpoint = request.url.includes('/auth/signin') || request.url.includes('/auth/signup');

        if (!isAuthEndpoint) {
            // Block expired-token requests for protected endpoints
            if (token && this.authService.isTokenExpired()) {
                console.warn('Token expired, clearing and redirecting to login');
                this.authService.logout();
                this.router.navigate(['/login']);
                return throwError(() => new Error('Session expired'));
            }

            if (token) {
                request = request.clone({
                    setHeaders: { Authorization: `Bearer ${token}` }
                });
            }
        }

        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
<<<<<<< HEAD
                if (!isAuthEndpoint && error.status === 401) {
=======
                const hasAuthHeader = request.headers.keys().some(key => key.toLowerCase() === 'authorization');

                if (!isAuthEndpoint && error.status === 401 && hasAuthHeader) {
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
                    console.warn('Auth error (401) detected, clearing session');
                    this.authService.logout();
                    this.router.navigate(['/login']);
                }
                // 403 = Forbidden (wrong role) — do NOT logout, just propagate the error
                return throwError(() => error);
            })
        );
    }
}
