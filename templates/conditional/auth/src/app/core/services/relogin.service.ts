import { Injectable, signal } from '@angular/core';

export type ReloginReason = 'token_expired' | 'refresh_failed' | 'network_error';

/**
 * Manages the re-login dialog state and a pending-request queue.
 *
 * When a token refresh fails (or a 401 arrives with no usable refresh token),
 * the auth interceptor calls requestRelogin() — which shows a modal dialog
 * instead of navigating away — so the user can re-authenticate in place and
 * all in-flight requests retry automatically. Keeps page state intact rather
 * than bouncing to the login route.
 */
@Injectable({ providedIn: 'root' })
export class ReloginService {
  /** Controls visibility of the re-login dialog. */
  readonly showDialog = signal(false);

  /** Why the dialog was triggered. */
  readonly reason = signal<ReloginReason>('token_expired');

  /** Pending request resolvers — resolved when the user re-authenticates. */
  private pendingResolvers: (() => void)[] = [];

  /**
   * Show the re-login dialog and return a Promise that resolves once the user
   * successfully re-authenticates. Concurrent callers all resolve together.
   */
  requestRelogin(reason: ReloginReason): Promise<void> {
    this.reason.set(reason);

    if (!this.showDialog()) {
      this.showDialog.set(true);
    }

    return new Promise<void>((resolve) => {
      this.pendingResolvers.push(resolve);
    });
  }

  /** Called by the dialog after a successful re-login — retries queued requests. */
  onReloginSuccess(): void {
    this.showDialog.set(false);
    const resolvers = [...this.pendingResolvers];
    this.pendingResolvers = [];
    resolvers.forEach((resolve) => resolve());
  }

  /** Called when the user dismisses the dialog (chooses to log out). */
  onReloginDismissed(): void {
    this.showDialog.set(false);
    this.pendingResolvers = [];
  }
}
