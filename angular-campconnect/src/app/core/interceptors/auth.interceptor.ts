import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * authInterceptor — functional interceptor that automatically attaches 
 * `Authorization: Bearer <token>` to every outgoing HTTP request.
 * It also handles 401 Unauthorized errors by logging out the user.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const token = authService.getToken();

    let authReq = req;
    if (token) {
        authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                console.warn('Unauthorized request (401), logging out.');
                authService.logout();
                router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
            }
            return throwError(() => error);
        })
    );
};
