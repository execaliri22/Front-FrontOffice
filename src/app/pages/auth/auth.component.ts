import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { LoginRequest, RegisterRequest } from '../../core/models/models';
import { CommonModule } from '@angular/common'; // Para *ngIf

@Component({
  selector: 'app-auth',
  standalone: true, 
  imports: [
    CommonModule,
    ReactiveFormsModule // <-- Para [formGroup]
  ],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  public esLogin = true; 
  loginForm: FormGroup;
  registerForm: FormGroup;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Formulario de Login
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
    // Formulario de Registro
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      direccion: ['', [Validators.required]]
    });
  }

  // (Diagrama: Iniciar sesión)
  onLogin() {
    if (this.loginForm.invalid) return;
    this.error = null;
    const request: LoginRequest = this.loginForm.value;
    this.authService.login(request).subscribe({
      next: () => this.router.navigate(['/tienda']),
      error: (err) => this.error = 'Email o contraseña incorrectos.'
    });
  }

  // (Diagrama: Registrarse)
  onRegister() {
    if (this.registerForm.invalid) return;
    this.error = null;
    const request: RegisterRequest = this.registerForm.value;
    this.authService.register(request).subscribe({
      next: () => this.router.navigate(['/tienda']),
      error: (err) => this.error = 'Error al registrar. ¿El email ya existe?'
    });
  }
}