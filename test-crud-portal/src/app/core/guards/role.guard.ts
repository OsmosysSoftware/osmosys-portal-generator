import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../constants/roles';

/**
 * Creates a functional route guard that requires the user to have at least
 * the specified minimum role.
 *
 * Usage in routes:
 *   canActivate: [roleGuard(UserRoles.ADMIN)]
 */
export function roleGuard(minimumRole: UserRole): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      return router.createUrlTree(['/auth/login']);
    }

    if (!authService.hasMinimumRole(minimumRole)) {
      return router.createUrlTree(['/auth/access']);
    }

    return true;
  };
}
