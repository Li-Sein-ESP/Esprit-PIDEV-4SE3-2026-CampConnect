import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

export const adminGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.isAuthenticated().pipe(
        take(1),
        map(isAuthenticated => {
            if (isAuthenticated) {
                if (authService.hasRole('admin')) {
                    return true;
                } else {
                    // If logged in but not an admin, redirect to home
                    router.navigate(['/']);
                    return false;
                }
            } else {
                // Not logged in, redirect to login
                router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
                return false;
            }
        })
    );
};
