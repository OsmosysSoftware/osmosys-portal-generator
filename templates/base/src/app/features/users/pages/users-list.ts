import {
  Component,
  ChangeDetectionStrategy,
  signal,
  viewChild,
  inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { PasswordModule } from 'primeng/password';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToolbarModule } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmationService, MessageService } from 'primeng/api';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: number;
  status: number;
  created_on: string;
}

interface RoleOption {
  label: string;
  value: number;
}

type Severity = 'success' | 'info' | 'warn' | 'danger' | 'secondary';

const ROLE_LABELS: Record<number, string> = {
  0: 'User',
  1: 'Admin',
};

@Component({
  selector: 'app-users-list',
  imports: [
    ReactiveFormsModule,
    DatePipe,
    TableModule,
    TagModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    TooltipModule,
    PasswordModule,
    ConfirmDialogModule,
    ToolbarModule,
    IconFieldModule,
    InputIconModule,
  ],
  providers: [ConfirmationService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './users-list.html',
  styleUrl: './users-list.scss',
})
export class UsersListComponent {
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly dt = viewChild<Table>('dt');

  // Demo data — replace with API calls
  readonly users = signal<User[]>([
    { id: 1, email: 'admin@example.com', first_name: 'John', last_name: 'Doe', role: 1, status: 1, created_on: '2025-01-15T10:30:00Z' },
    { id: 2, email: 'jane@example.com', first_name: 'Jane', last_name: 'Smith', role: 0, status: 1, created_on: '2025-02-20T14:00:00Z' },
    { id: 3, email: 'bob@example.com', first_name: 'Bob', last_name: 'Wilson', role: 0, status: 1, created_on: '2025-03-10T09:15:00Z' },
    { id: 4, email: 'alice@example.com', first_name: 'Alice', last_name: 'Brown', role: 0, status: 0, created_on: '2025-03-18T16:45:00Z' },
  ]);

  readonly saving = signal(false);
  readonly dialogVisible = signal(false);
  readonly editingUser = signal<User | null>(null);

  readonly userForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    first_name: [''],
    last_name: [''],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: [0, Validators.required],
  });

  readonly roleOptions: RoleOption[] = [
    { label: 'User', value: 0 },
    { label: 'Admin', value: 1 },
  ];

  private readonly statusSeverityMap: Record<number, Severity> = {
    1: 'success',
    0: 'danger',
  };

  onGlobalFilter(event: Event): void {
    this.dt()?.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openCreate(): void {
    this.editingUser.set(null);
    this.userForm.reset({ email: '', first_name: '', last_name: '', password: '', role: 0 });
    this.userForm.controls.password.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.controls.password.updateValueAndValidity();
    this.dialogVisible.set(true);
  }

  openEdit(user: User): void {
    this.editingUser.set(user);
    this.userForm.patchValue({
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      password: '',
      role: user.role,
    });
    this.userForm.controls.password.clearValidators();
    this.userForm.controls.password.setValidators([Validators.minLength(6)]);
    this.userForm.controls.password.updateValueAndValidity();
    this.dialogVisible.set(true);
  }

  save(): void {
    this.userForm.markAllAsTouched();
    if (this.userForm.invalid) {
      return;
    }

    const formValue = this.userForm.getRawValue();
    this.saving.set(true);

    // TODO: Replace with API call
    setTimeout(() => {
      const editing = this.editingUser();

      if (editing) {
        this.users.update((list) =>
          list.map((u) =>
            u.id === editing.id
              ? {
                  ...u,
                  email: formValue.email ?? '',
                  first_name: formValue.first_name ?? '',
                  last_name: formValue.last_name ?? '',
                  role: formValue.role ?? 0,
                }
              : u,
          ),
        );
        this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'User updated successfully' });
      } else {
        const newUser: User = {
          id: Math.max(...this.users().map((u) => u.id)) + 1,
          email: formValue.email ?? '',
          first_name: formValue.first_name ?? '',
          last_name: formValue.last_name ?? '',
          role: formValue.role ?? 0,
          status: 1,
          created_on: new Date().toISOString(),
        };

        this.users.update((list) => [...list, newUser]);
        this.messageService.add({ severity: 'success', summary: 'Created', detail: 'User created successfully' });
      }

      this.dialogVisible.set(false);
      this.saving.set(false);
    }, 300);
  }

  getDisplayName(user: User): string {
    const parts = [user.first_name, user.last_name].filter(Boolean);

    return parts.length > 0 ? parts.join(' ') : '---';
  }

  getRoleLabel(role: number): string {
    return ROLE_LABELS[role] || 'Unknown';
  }

  getStatusSeverity(status: number): Severity {
    return this.statusSeverityMap[status] ?? 'info';
  }

  confirmDelete(user: User): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${this.getDisplayName(user)}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        // TODO: Replace with API call
        this.users.update((list) => list.filter((u) => u.id !== user.id));
        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'User deleted successfully' });
      },
    });
  }
}
