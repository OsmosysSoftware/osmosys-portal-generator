import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Auth guard — bypassed by default for development.
 * Set BYPASS_AUTH to false once your backend auth API is configured.
 */
const BYPASS_AUTH = true;

export const authGuard: CanActivateFn = (route, state) => {
  if (BYPASS_AUTH) return true;

  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  if (authService.isTokenExpired()) {
    authService.logout();

    return router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  return true;
};
