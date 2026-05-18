import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FluidModule } from 'primeng/fluid';
import { MessageService } from 'primeng/api';
import { IconField } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    FluidModule,
    IconField,
    InputIconModule,
    InputTextModule,
    PasswordModule
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent {

  email?: string;
  password?: string;
  error?: string;
  loading  = false;

  auth = inject(AuthService);
  router = inject(Router);
  messageService = inject(MessageService);

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.error = 'Preencha todos os campos.';
      this.messageService.add({
        severity: 'error',
        summary: 'Informe usuário e senha',
        detail: 'Usuário e/ou senha inválido(s)'
      });
      return;
    }
    this.loading = true;
    this.error   = '';

    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/tasks']),
      error: err => {
        this.error   = err.error?.message || 'Erro ao fazer login.';
        this.messageService.add({
            severity: 'error',
            summary: 'Falha na autenticação',
            detail: 'Usuário e/ou senha inválido(s)'
          })
        this.loading = false;
      },
    });
  }
}
