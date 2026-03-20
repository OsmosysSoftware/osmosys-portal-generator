import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AppFloatingConfigurator } from '../../../layout/component/app.floatingconfigurator';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    FormsModule,
    RouterModule,
    ToastModule,
    AppFloatingConfigurator,
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService],
})
export class RegisterComponent {
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  readonly name = signal('');
  readonly email = signal('');
  readonly password = signal('');
  readonly acceptTerms = signal(false);
  readonly loading = signal(false);

  onRegister(): void {
    if (!this.acceptTerms()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Terms Required',
        detail: 'Please accept the terms and conditions',
      });

      return;
    }

    this.loading.set(true);

    // TODO: Wire up registration API call
    // this.authService.register({ name: this.name(), email: this.email(), password: this.password() })
    this.messageService.add({
      severity: 'info',
      summary: 'Registration',
      detail: 'Registration API not yet configured. Wire up your backend endpoint.',
    });
    this.loading.set(false);
  }
}
