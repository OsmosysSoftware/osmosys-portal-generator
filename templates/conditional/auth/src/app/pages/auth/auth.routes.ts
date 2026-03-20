import { Routes } from '@angular/router';
import { Access } from './access';
import { Error } from './error';

export default [
  { path: 'access', component: Access },
  { path: 'error', component: Error },
  {
    path: 'login',
    loadComponent: () => import('./login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register').then((m) => m.RegisterComponent),
  },
] as Routes;
