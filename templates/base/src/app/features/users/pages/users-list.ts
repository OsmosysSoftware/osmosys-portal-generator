import {
  Component,
  ChangeDetectionStrategy,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
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

const ROLE_LABELS: Record<number, string> = {
  0: 'User',
  1: 'Admin',
};

@Component({
  selector: 'app-users-list',
  imports: [
    FormsModule,
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
  readonly dt = viewChild<Table>('dt');

  // Demo data — replace with API calls
  readonly users = signal<User[]>([
    { id: 1, email: 'admin@example.com', first_name: 'John', last_name: 'Doe', role: 1, status: 1, created_on: '2025-01-15T10:30:00Z' },
    { id: 2, email: 'jane@example.com', first_name: 'Jane', last_name: 'Smith', role: 0, status: 1, created_on: '2025-02-20T14:00:00Z' },
    { id: 3, email: 'bob@example.com', first_name: 'Bob', last_name: 'Wilson', role: 0, status: 1, created_on: '2025-03-10T09:15:00Z' },
    { id: 4, email: 'alice@example.com', first_name: 'Alice', last_name: 'Brown', role: 0, status: 0, created_on: '2025-03-18T16:45:00Z' },
  ]);

  readonly saving = signal(false);

  // Dialog state
  readonly dialogVisible = signal(false);
  readonly editingUser = signal<User | null>(null);
  readonly formEmail = signal('');
  readonly formFirstName = signal('');
  readonly formLastName = signal('');
  readonly formPassword = signal('');
  readonly formRole = signal<number>(0);

  readonly roleOptions: RoleOption[] = [
    { label: 'User', value: 0 },
    { label: 'Admin', value: 1 },
  ];

  private readonly messageService = new MessageService();
  private readonly confirmationService = new ConfirmationService();

  onGlobalFilter(event: Event): void {
    this.dt()?.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openCreate(): void {
    this.editingUser.set(null);
    this.formEmail.set('');
    this.formFirstName.set('');
    this.formLastName.set('');
    this.formPassword.set('');
    this.formRole.set(0);
    this.dialogVisible.set(true);
  }

  openEdit(user: User): void {
    this.editingUser.set(user);
    this.formEmail.set(user.email);
    this.formFirstName.set(user.first_name || '');
    this.formLastName.set(user.last_name || '');
    this.formPassword.set('');
    this.formRole.set(user.role);
    this.dialogVisible.set(true);
  }

  isFormValid(): boolean {
    const email = this.formEmail().trim();

    if (!email) {
      return false;
    }

    if (!this.editingUser() && !this.formPassword().trim()) {
      return false;
    }

    return this.formRole() !== null && this.formRole() !== undefined;
  }

  save(): void {
    if (!this.isFormValid()) {
      return;
    }

    // TODO: Replace with API call
    this.saving.set(true);

    setTimeout(() => {
      const editing = this.editingUser();

      if (editing) {
        this.users.update((list) =>
          list.map((u) =>
            u.id === editing.id
              ? {
                  ...u,
                  email: this.formEmail().trim(),
                  first_name: this.formFirstName().trim(),
                  last_name: this.formLastName().trim(),
                  role: this.formRole(),
                }
              : u,
          ),
        );
      } else {
        const newUser: User = {
          id: Math.max(...this.users().map((u) => u.id)) + 1,
          email: this.formEmail().trim(),
          first_name: this.formFirstName().trim(),
          last_name: this.formLastName().trim(),
          role: this.formRole(),
          status: 1,
          created_on: new Date().toISOString(),
        };

        this.users.update((list) => [...list, newUser]);
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

  confirmDelete(user: User): void {
    // TODO: Replace with API call + ConfirmationService
    this.users.update((list) => list.filter((u) => u.id !== user.id));
  }
}
