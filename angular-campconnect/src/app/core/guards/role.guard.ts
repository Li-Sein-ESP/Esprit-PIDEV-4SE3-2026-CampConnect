import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * RoleGuard ÔÇö protects routes by checking that the logged-in user's JWT
 * contains at least one of the roles listed in route.data['roles'].
 *
 * Usage in routes:
 * ```ts
 * {
 *   path: 'admin',
 *   canActivate: [roleGuard],
 *   data: { roles: ['ROLE_ADMIN'] }
 * }
 * ```
 */
export const roleGuard: CanActivateFn = (route, _state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
        router.navigate(['/login']);
        return false;
    }

    const requiredRoles = route.data['roles'] as string[] | undefined;
    if (!requiredRoles || requiredRoles.length === 0) {
        return true; // No role restriction ÔÇö any authenticated user is allowed
    }

    const hasRole = requiredRoles.some(role => authService.hasRole(role));
    if (!hasRole) {
        router.navigate(['/']);
        return false;
    }

    return true;
};
