import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Functional Guard to protect routes based on authentication and optional roles.
 * Usage in routes: 
 * { path: 'admin', canActivate: [authGuard], data: { roles: ['ROLE_ADMIN'] } }
 */
export const authGuard: CanActivateFn = (
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isLoggedIn()) {
        const requiredRoles = next.data['roles'] as Array<string>;

        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const hasRequiredRole = requiredRoles.some(role => authService.hasRole(role));

        if (hasRequiredRole) {
            return true;
        } else {
            // Authorized but doesn't have required role
            router.navigate(['/']);
            return false;
        }
    }

    // Not logged in, redirect to login with return url
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
};
