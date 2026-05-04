import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { asyncScheduler } from 'rxjs';

/**
 * Zone-safe HTTP timeout interceptor.
 * The standard timeout() operator uses asyncScheduler (setInterval) which
 * can detach from Angular's zone. We wrap the zone back in after the operator.
 */
@Injectable()
export class HttpTimeoutInterceptor implements HttpInterceptor {
  private readonly DEFAULT_TIMEOUT = 30000; // 30 seconds

  constructor(private zone: NgZone) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const timeoutValue = Number(req.headers.get('timeout') || this.DEFAULT_TIMEOUT);

    return new Observable(observer => {
      // Run the entire HTTP chain inside Angular's zone so all callbacks
      // (success, error, timeout) fire within zone-tracked context.
      this.zone.run(() => {
        next.handle(req).pipe(
          timeout(timeoutValue),
          catchError(err => {
            if (err instanceof TimeoutError) {
              console.error(`Request to ${req.url} timed out after ${timeoutValue}ms`);
              return throwError(() => new Error('Request timed out. Please try again.'));
            }
            return throwError(() => err);
          })
        ).subscribe({
          next: v => this.zone.run(() => observer.next(v)),
          error: e => this.zone.run(() => observer.error(e)),
          complete: () => this.zone.run(() => observer.complete())
        });
      });
    });
  }
}
