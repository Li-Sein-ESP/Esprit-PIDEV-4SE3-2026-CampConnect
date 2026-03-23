import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.isAuthenticated().pipe(
        take(1),
        map(isAuthenticated => {
            if (isAuthenticated) {
                // Check for role requirements
                const requiredRoles = route.data['roles'] as Array<string>;
                if (requiredRoles && requiredRoles.length > 0) {
                    const hasRequiredRole = requiredRoles.some(role => authService.hasRole(role));
                    if (!hasRequiredRole) {
                        // Redirect to home or unauthorized page
                        router.navigate(['/']);
                        return false;
                    }
                }
                return true;
            } else {
                router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
                return false;
            }
        })
    );
};
