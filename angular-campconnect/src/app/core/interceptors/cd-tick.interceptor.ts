import { Injectable, ApplicationRef } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';

/**
 * Ensures Angular's change detection runs after every HTTP response.
 * This is needed because some third-party libraries (SockJS, Leaflet, etc.)
 * and RxJS schedulers can occasionally run outside Angular's zone, leaving
 * components in a "stale" state even after their data has loaded.
 */
@Injectable()
export class CdTickInterceptor implements HttpInterceptor {
  constructor(private appRef: ApplicationRef) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          // Kick Angular's CD after every successful HTTP response
          this.appRef.tick();
        }
      })
    );
  }
}
