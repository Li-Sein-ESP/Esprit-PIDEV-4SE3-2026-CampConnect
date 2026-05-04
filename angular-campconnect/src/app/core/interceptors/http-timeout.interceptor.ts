import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';

@Injectable()
export class HttpTimeoutInterceptor implements HttpInterceptor {
  private readonly DEFAULT_TIMEOUT = 10000; // 10 seconds

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const timeoutValue = req.headers.get('timeout') || this.DEFAULT_TIMEOUT;
    const timeoutValueNumeric = Number(timeoutValue);

    return next.handle(req).pipe(
      timeout(timeoutValueNumeric),
      catchError(err => {
        if (err instanceof TimeoutError) {
          console.error(`Request to ${req.url} timed out after ${timeoutValueNumeric}ms`);
          return throwError(() => new Error('Request timed out. Please try again.'));
        }
        return throwError(() => err);
      })
    );
  }
}
