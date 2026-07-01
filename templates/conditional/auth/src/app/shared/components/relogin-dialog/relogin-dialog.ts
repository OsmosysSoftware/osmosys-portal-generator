import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../core/services/auth.service';
import { ReloginService } from '../../../core/services/relogin.service';
import { LoginDto } from '../../../core/models/auth.model';

interface ApiError {
  error?: { detail?: string; message?: string };
}

/**
 * Modal shown when the session expires mid-workflow. Lets the user
 * re-authenticate in place (preserving page state) instead of being
 * redirected to /auth/login. Pending requests retry on success.
 */
@Component({
  selector: 'app-relogin-dialog',
  imports: [FormsModule, DialogModule, ButtonModule, InputTextModule, PasswordModule, MessageModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './relogin-dialog.html',
})
export class ReloginDialogComponent {
  private readonly authService = inject(AuthService);
  readonly reloginService = inject(ReloginService);

  readonly email = signal(this.authService.getLastEmail());
  readonly password = signal('');
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  onSubmit(): void {
    const email = this.email().trim();
    const password = this.password();

    if (!email || !password) {
      this.errorMessage.set('Please enter your email and password');

      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    const dto: LoginDto = { email, password };

    this.authService.login(dto).subscribe({
      next: () => {
        this.loading.set(false);
        this.password.set('');
        this.errorMessage.set('');
        this.reloginService.onReloginSuccess();
      },
      error: (error: ApiError) => {
        this.loading.set(false);
        this.errorMessage.set(
          error.error?.detail ?? error.error?.message ?? 'Login failed. Check your credentials.',
        );
      },
    });
  }

  onLogout(): void {
    this.password.set('');
    this.errorMessage.set('');
    this.reloginService.onReloginDismissed();
    this.authService.logout();
  }
}
