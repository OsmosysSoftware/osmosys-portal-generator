import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
    ReactiveFormsModule,
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
  private readonly fb = inject(FormBuilder);

  readonly registerForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    acceptTerms: [false, Validators.requiredTrue],
  });

  readonly loading = signal(false);

  onRegister(): void {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid) {
      if (this.registerForm.controls.acceptTerms.hasError('required')) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Terms Required',
          detail: 'Please accept the terms and conditions',
        });
      }

      return;
    }

    this.loading.set(true);

    // TODO: Wire up registration API call
    // this.authService.register(this.registerForm.getRawValue())
    this.messageService.add({
      severity: 'info',
      summary: 'Registration',
      detail: 'Registration API not yet configured. Wire up your backend endpoint.',
    });
    this.loading.set(false);
  }
}
