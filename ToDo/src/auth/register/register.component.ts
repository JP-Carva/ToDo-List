import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputIconModule } from 'primeng/inputicon';
import { InputText } from "primeng/inputtext";
import { User } from '../../models/user';
import { MessageService } from 'primeng/api';
import { IconFieldModule } from 'primeng/iconfield';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Password } from "primeng/password";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    InputIconModule,
    InputText,
    IconFieldModule,
    ProgressSpinnerModule,
    Password
],
  templateUrl: './register.component.html',
})
export class RegisterComponent implements OnInit {

  createAccountForm!: FormGroup;

  private auth = inject(AuthService);
  private router = inject(Router);
  messageService = inject(MessageService);
  fb = inject(FormBuilder);

  loading = false;

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm(): void {
    this.createAccountForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      passwordRepeat: ['', Validators.required]
    });
  }

  submit(): void {
    if (this.createAccountForm.invalid){
      this.messageService.add({
        severity:'error',
        summary: 'Formulário inválido',
        detail: 'Preencha todos os campos corretamente'});
      return;
    }
    if (!this.isFormPasswordsEquals()) {
      this.messageService.add({
        severity:'error',
        summary: 'Senhas não coincidem',
        detail: 'As senhas devem ser iguais'});
      return;
    }

    this.loading = true;
    const user: User = { ...this.createAccountForm.value };
    this.auth.register(user)
    .subscribe(() => {
        this.messageService.add({
          severity:'success',
          summary: 'Conta criada',
          detail: 'Conta criada com sucesso'});
          this.router.navigate(['/login']);
          this.loading = false;
        });
    }

  private isFormPasswordsEquals(): boolean {
    const {password, passwordRepeat} = this.createAccountForm.value;
    return password != null && passwordRepeat != null && password == passwordRepeat;
  }
}
