import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './app/core/interceptors/auth.interceptor';
import { HttpTimeoutInterceptor } from './app/core/interceptors/http-timeout.interceptor';
import { ErrorInterceptor } from './app/core/interceptors/error.interceptor';
import { CdTickInterceptor } from './app/core/interceptors/cd-tick.interceptor';

// Important: Polyfill for SockJS and STOMP under Vite/ESBuild which removes the global variable 
(window as any).global = window;

bootstrapApplication(AppComponent, {
    providers: [
        provideRouter(routes),
        provideAnimations(),
        provideHttpClient(withInterceptorsFromDi()),
        // Order matters: Timeout -> Auth -> Error handling -> CD tick
        { provide: HTTP_INTERCEPTORS, useClass: HttpTimeoutInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: CdTickInterceptor, multi: true }
    ]
}).catch(err => console.error(err));
