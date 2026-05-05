import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { extendedHttpTimeoutMs } from '../http-timeout.context';

@Injectable()
export class HttpTimeoutInterceptor implements HttpInterceptor {
  private readonly DEFAULT_TIMEOUT = 30000; // 30 seconds

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const fromContext = req.context.get(extendedHttpTimeoutMs);
    const fromHeader = req.headers.get('timeout');
    const timeoutValueNumeric =
      fromContext > 0
        ? fromContext
        : fromHeader != null && !Number.isNaN(Number(fromHeader))
          ? Number(fromHeader)
          : this.DEFAULT_TIMEOUT;

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
