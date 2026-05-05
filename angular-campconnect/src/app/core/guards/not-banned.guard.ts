import { inject } from '@angular/core';
import { Router, CanActivateFn, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Empêche l’accès à la création de contenu si le compte est banni (publication).
 */
export const notBannedGuard: CanActivateFn = (
  _route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }
  if (auth.isAccountBanned()) {
    return router.createUrlTree(['/community/feed'], { queryParams: { postingBlocked: '1' } });
  }
  return true;
};
