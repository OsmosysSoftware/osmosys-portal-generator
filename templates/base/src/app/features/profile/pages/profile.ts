import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-profile',
  imports: [
    FormsModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    PasswordModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfileComponent {
  // Profile form
  readonly email = signal('admin@example.com');
  readonly firstName = signal('John');
  readonly lastName = signal('Doe');

  // Original values for change detection
  private originalFirstName = 'John';
  private originalLastName = 'Doe';

  readonly hasChanges = computed(
    () =>
      this.firstName().trim() !== this.originalFirstName ||
      this.lastName().trim() !== this.originalLastName,
  );

  readonly saving = signal(false);

  // Change password dialog
  readonly passwordDialogVisible = signal(false);
  readonly changingPassword = signal(false);
  readonly currentPassword = signal('');
  readonly newPassword = signal('');
  readonly confirmPassword = signal('');

  readonly isPasswordFormValid = computed(() => {
    const current = this.currentPassword().trim();
    const newPwd = this.newPassword().trim();
    const confirm = this.confirmPassword().trim();

    return current.length > 0 && newPwd.length >= 6 && newPwd === confirm;
  });

  readonly passwordMismatch = computed(() => {
    const newPwd = this.newPassword().trim();
    const confirm = this.confirmPassword().trim();

    return confirm.length > 0 && newPwd !== confirm;
  });

  saveProfile(): void {
    if (!this.hasChanges()) {
      return;
    }

    this.saving.set(true);

    // TODO: Call profile API
    setTimeout(() => {
      this.originalFirstName = this.firstName().trim();
      this.originalLastName = this.lastName().trim();
      this.saving.set(false);
    }, 500);
  }

  cancelChanges(): void {
    this.firstName.set(this.originalFirstName);
    this.lastName.set(this.originalLastName);
  }

  openChangePassword(): void {
    this.currentPassword.set('');
    this.newPassword.set('');
    this.confirmPassword.set('');
    this.passwordDialogVisible.set(true);
  }

  changePassword(): void {
    if (!this.isPasswordFormValid()) {
      return;
    }

    this.changingPassword.set(true);

    // TODO: Call change password API
    setTimeout(() => {
      this.passwordDialogVisible.set(false);
      this.changingPassword.set(false);
    }, 500);
  }
}
