import { Routes } from '@angular/router';
import { authGuard } from '../interceptors/guards/auth.guards';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('../auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('../auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'tasks',
    canActivate: [authGuard],
    loadComponent: () =>
      import('../modules/task/task.component').then(m => m.TasksComponent),
  },
  { path: '**', redirectTo: 'tasks' },
];
