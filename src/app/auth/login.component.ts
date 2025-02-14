import { Component } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule,  } from '@angular/forms';
import { User } from '../models/user.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule, ReactiveFormsModule,CommonModule]
})
export class LoginComponent {
  user: User = {
    name: '',
    email: '',
    password: '',
    enabled: true
  };
  isRegistering = false;
  responseMessage: string = '';
  isProcessing = false;
  isError = false;

  constructor(private readonly authService: AuthService, private readonly router: Router) { }

  login() {
    if (this.user.email.trim() && this.user.password.trim()) {
      this.isProcessing = true;
      this.authService.login(this.user.email, this.user.password);

      this.authService.sessionExpired$.subscribe((message) => {
        this.isProcessing = false;
        setTimeout(() => {
          this.responseMessage = '';
        }, 1000);
      });
    }
  }

  register() {
    if (this.user.email.trim() && this.user.password.trim() && this.user.name.trim()) {
      this.isRegistering = true;
      this.authService.register(this.user).subscribe({
        next: (response) => {
          if (response.code === '00') {
            this.responseMessage = response.message;
            setTimeout(() => {
              this.responseMessage = '';
              this.isRegistering = false;
            }, 10000);
          } else {
            this.isRegistering = false;
            this.isError = true;
            this.responseMessage = `Error: ${response.message}`;
          }
        },
        error: (error) => {
          this.isRegistering = false;
          this.isError = true;
          this.responseMessage = 'Error en el registro. Intente nuevamente.';
          console.error('Error en el registro:', error);
        }
      });
    }
  }

  toggleRegister() {
    this.isRegistering = !this.isRegistering;
  }
}
