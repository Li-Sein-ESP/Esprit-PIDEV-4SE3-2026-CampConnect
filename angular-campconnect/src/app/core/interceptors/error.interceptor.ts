import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private router = inject(Router);

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
          // Exponential backoff: 1s, 2s
          return new Observable(observer => {
            setTimeout(() => {
              observer.next(undefined);
              observer.complete();
            }, retryCount * 1000);
          });
        }
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An error occurred. Please try again.';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          console.error('Client error:', error.error.message);
          errorMessage = error.error.message;
        } else {
          // Server-side error
          console.error(`Server error: ${error.status}`, error.message);
          
          switch (error.status) {
            case 0:
              errorMessage = 'Cannot connect to server. Please check your internet connection.';
              break;
            case 401:
              errorMessage = 'Session expired. Please login again.';
              // Clear token and redirect to login
              localStorage.removeItem('token');
              this.router.navigate(['/login']);
              break;
            case 403:
              errorMessage = 'You do not have permission to access this resource.';
              break;
            case 404:
              errorMessage = 'The requested resource was not found.';
              break;
            case 500:
              errorMessage = 'Server error. Please try again later.';
              break;
            case 503:
              errorMessage = 'Service temporarily unavailable. Please try again later.';
              break;
            default:
              errorMessage = error.error?.message || errorMessage;
          }
        }

        return throwError(() => ({ ...error, userMessage: errorMessage }));
      })
    );
  }
}
