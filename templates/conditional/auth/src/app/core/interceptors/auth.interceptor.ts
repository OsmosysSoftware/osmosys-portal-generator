import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ReloginService } from '../services/relogin.service';

type InterceptorReq = Parameters<HttpInterceptorFn>[0];
type InterceptorNext = Parameters<HttpInterceptorFn>[1];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const reloginService = inject(ReloginService);

  // Skip auth endpoints to avoid circular calls.
  if (
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/refresh')
  ) {
    return next(req);
  }

  const token = authService.getAccessToken();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      // Got a 401. If we have a refresh token, try a silent refresh first;
      // if that fails (or there's no refresh token), pop the in-place re-login
      // dialog rather than hard-redirecting (preserves page state).
      if (authService.getRefreshToken()) {
        return authService.refreshToken().pipe(
          switchMap(() => retryWithToken(req, next, authService)),
          catchError(() => promptRelogin(req, next, authService, reloginService)),
        );
      }

      return promptRelogin(req, next, authService, reloginService);
    }),
  );
};

/** Retry the original request with the current (refreshed) access token. */
function retryWithToken(
  req: InterceptorReq,
  next: InterceptorNext,
  authService: AuthService,
): ReturnType<InterceptorNext> {
  const token = authService.getAccessToken();
  const retryReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(retryReq);
}

/**
 * Show the re-login dialog and retry the request once the user re-authenticates.
 * The dialog's Logout button clears the queue and routes to /auth/login, so a
 * dismissed dialog simply leaves the failed request unretried.
 */
function promptRelogin(
  req: InterceptorReq,
  next: InterceptorNext,
  authService: AuthService,
  reloginService: ReloginService,
): ReturnType<InterceptorNext> {
  return from(reloginService.requestRelogin('refresh_failed')).pipe(
    switchMap(() => retryWithToken(req, next, authService)),
  );
}
