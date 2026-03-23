import { Routes } from '@angular/router';
import { AppLayout } from './layout/component/app.layout';

import { authGuard } from './core/guards/auth.guard';


export const routes: Routes = [
  {
    path: '',
    component: AppLayout,

    canActivate: [authGuard],

    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard').then((m) => m.DashboardComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/pages/profile').then((m) => m.ProfileComponent),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/users/pages/users-list').then((m) => m.UsersListComponent),
      },
    ],
  },

  { path: 'auth', loadChildren: () => import('./pages/auth/auth.routes') },

  {
    path: 'notfound',
    loadComponent: () =>
      import('./pages/notfound/notfound').then((m) => m.NotfoundComponent),
  },
  { path: '**', redirectTo: '/notfound' },
];
