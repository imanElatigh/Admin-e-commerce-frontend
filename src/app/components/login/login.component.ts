import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      remember: [false],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.loginForm.controls).forEach((key) => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const loginData = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    };

    this.apiService.post('/api/auth/authenticate', loginData).subscribe({
      next: (response: any) => {
        console.log('Login successful:', response);
        this.isSubmitting = false;

        // Save token to localStorage instead of cookies
        if (response && response.access_token) {
          localStorage.setItem('token', response.access_token);

          // If remember me is checked, we could set additional flags or extend token validity
          if (this.loginForm.value.remember) {
            localStorage.setItem('remember', 'true');
          }

          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = 'Réponse de serveur invalide.';
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        this.isSubmitting = false;
        if (error.status === 403) {
          this.errorMessage = 'Email ou mot de passe incorrect.';
        } else {
          this.errorMessage =
            error.error?.message ||
            'Une erreur est survenue lors de la connexion. Veuillez réessayer.';
        }
      },
    });
  }

  // Helper methods for form validation
  get email() {
    return this.loginForm.get('email');
  }
  get password() {
    return this.loginForm.get('password');
  }
}
