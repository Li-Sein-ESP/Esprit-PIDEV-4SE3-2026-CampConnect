import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../../shared/services/toast.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  private hasAuthHeader(headers: HttpHeaders): boolean {
    return headers.keys().some(key => key.toLowerCase() === 'authorization');
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      retry({
        count: 2,
        delay: (error: HttpErrorResponse, retryCount: number) => {
          // Don't retry on client errors (4xx) except 408 (timeout) and 429 (rate limit)
          if (error.status >= 400 && error.status < 500 &&
              error.status !== 408 && error.status !== 429) {
            throw error;
          }
          // Exponential backoff using zone-safe timer() instead of setTimeout
          return timer(retryCount * 1000);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An error occurred. Please try again.';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          console.error('Client error:', error.error.message);
          errorMessage = error.error.message;
          this.toastService.error(errorMessage);
        } else {
          // Server-side error — parse backend ErrorResponse message if present
          const backendMessage = error.error?.message;
          const suppressError = req.headers.has('X-Suppress-Error');

          if (!suppressError) {
            switch (error.status) {
              case 0:
                errorMessage = 'Cannot connect to server. Please check your internet connection.';
                this.toastService.error(errorMessage);
                break;
              case 400:
                errorMessage = backendMessage || 'Invalid request. Please check your input.';
                this.toastService.error(errorMessage);
                break;
              case 401:
                errorMessage = 'Session expired. Please login again.';
                if (this.hasAuthHeader(req.headers)) {
                  this.toastService.warning(errorMessage);
                  this.authService.logout();
                  this.router.navigate(['/login']);
                }
                break;
              case 403:
                errorMessage = 'You do not have permission to perform this action.';
                this.toastService.warning(errorMessage);
                break;
              case 404:
                errorMessage = backendMessage || 'The requested resource was not found.';
                this.toastService.error(errorMessage);
                break;
              case 409:
                errorMessage = backendMessage || 'This action conflicts with the current state. Please refresh and try again.';
                this.toastService.warning(errorMessage);
                break;
              case 500:
                errorMessage = 'An unexpected error occurred. Please try again later.';
                this.toastService.error(errorMessage);
                break;
              case 503:
                errorMessage = 'Service temporarily unavailable. Please try again later.';
                this.toastService.error(errorMessage);
                break;
              default:
                errorMessage = backendMessage || errorMessage;
                this.toastService.error(errorMessage);
            }
          }
        }

        return throwError(() => ({ ...error, userMessage: errorMessage }));
      })
    );
  }
}
