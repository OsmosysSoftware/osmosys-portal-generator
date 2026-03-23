import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AppFloatingConfigurator } from '../../../layout/component/app.floatingconfigurator';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    PasswordModule,
    FormsModule,
    ToastModule,
    AppFloatingConfigurator,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService],
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  readonly email = signal('');
  readonly password = signal('');
  readonly rememberMe = signal(false);
  readonly loading = signal(false);

  /**
   * Demo mode: set to false once your backend auth API is configured.
   * When true, demo credentials bypass the API and navigate directly.
   */
  private readonly DEMO_MODE = true;

  onLogin(): void {
    if (this.DEMO_MODE && this.email() === 'admin@example.com' && this.password() === 'password') {
      this.router.navigate(['/']);

      return;
    }

    this.loading.set(true);
    this.authService.login({ email: this.email(), password: this.password() }).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Login Failed',
          detail: err?.error?.detail || 'Invalid credentials',
        });
      },
    });
  }
}
