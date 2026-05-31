import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppService } from '../../services/app.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <div class="premium-card login-card animate-slide-up">
        <header class="login-header">
          <div class="login-logo-container">
            <img src="/assets/logo.png" alt="Logo" class="login-logo">
          </div>
          <h1 class="gold-text">UNIRSE AL FIXTURE</h1>
          <p class="subtitle">
            {{ isRegister() ? 'Crea tu cuenta para apostar' : 'Inicia sesión con tu correo' }}
          </p>
        </header>

        <div class="mode-toggle">
          <button type="button" [class.active]="!isRegister()" (click)="isRegister.set(false)">
            Iniciar sesión
          </button>
          <button type="button" [class.active]="isRegister()" (click)="isRegister.set(true)">
            Registrarse
          </button>
        </div>

        <form (submit)="onSubmit()" class="login-form">
          @if (isRegister()) {
            <div class="form-group">
              <label>Nombre completo</label>
              <div class="input-wrapper">
                <i class="fas fa-user"></i>
                <input type="text" [(ngModel)]="name" name="name" placeholder="Ej. Juan Pérez" required>
              </div>
            </div>

            <div class="form-group">
              <label>Teléfono / WhatsApp</label>
              <div class="input-wrapper">
                <i class="fas fa-phone"></i>
                <input type="tel" [(ngModel)]="phone" name="phone" placeholder="Ej. +54 9 11 ..." required>
              </div>
            </div>
          }

          <div class="form-group">
            <label>Correo electrónico</label>
            <div class="input-wrapper">
              <i class="fas fa-envelope"></i>
              <input type="email" [(ngModel)]="email" name="email" placeholder="tu@correo.com" required>
            </div>
          </div>

          <div class="form-group">
            <label>Contraseña</label>
            <div class="input-wrapper">
              <i class="fas fa-lock"></i>
              <input
                type="password"
                [(ngModel)]="password"
                name="password"
                placeholder="Mínimo 6 caracteres"
                minlength="6"
                required
              >
            </div>
          </div>

          @if (errorMessage()) {
            <p class="error-msg">{{ errorMessage() }}</p>
          }

          <button type="submit" class="btn-premium login-submit" [disabled]="loading()">
            {{ loading() ? 'Espere...' : (isRegister() ? 'CREAR CUENTA' : 'INGRESAR') }}
          </button>
        </form>

        <p class="login-footer">Al ingresar, aceptas los términos de la competición.</p>
      </div>
    </div>
  `,
  styles: `
    .login-page {
      height: 90vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: radial-gradient(circle at center, rgba(212, 175, 55, 0.05) 0%, transparent 70%);
    }
    .login-card {
      width: 100%;
      max-width: 450px;
      padding: 3rem 2rem;
      text-align: center;
    }
    .login-header { margin-bottom: 1.5rem; }
    .login-logo-container { margin-bottom: 1.5rem; }
    .login-logo {
      height: 120px;
      width: auto;
      filter: drop-shadow(0 0 20px rgba(212, 175, 55, 0.2));
    }
    .subtitle { color: var(--text-muted); font-size: 0.9rem; margin-top: 0.5rem; }

    .mode-toggle {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      background: rgba(255, 255, 255, 0.03);
      padding: 0.35rem;
      border-radius: 12px;
      border: 1px solid var(--border-color);
    }
    .mode-toggle button {
      flex: 1;
      padding: 0.65rem;
      border: none;
      border-radius: 10px;
      background: transparent;
      color: var(--text-muted);
      font-family: inherit;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .mode-toggle button.active {
      background: rgba(212, 175, 55, 0.15);
      color: var(--gold-primary);
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      text-align: left;
    }
    .form-group label {
      display: block;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--gold-primary);
      text-transform: uppercase;
      margin-bottom: 0.6rem;
      letter-spacing: 1px;
    }
    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-wrapper i {
      position: absolute;
      left: 1rem;
      color: var(--text-muted);
      font-size: 1rem;
    }
    .input-wrapper input {
      width: 100%;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-color);
      padding: 1rem 1rem 1rem 3rem;
      border-radius: 12px;
      color: #fff;
      font-family: inherit;
      font-size: 1rem;
      transition: all 0.3s ease;
    }
    .input-wrapper input:focus {
      outline: none;
      border-color: var(--gold-primary);
      background: rgba(212, 175, 55, 0.05);
    }
    .error-msg {
      color: #ff6b6b;
      font-size: 0.85rem;
      margin: 0;
      text-align: center;
    }
    .login-submit { margin-top: 0.5rem; padding: 1.1rem; }
    .login-footer {
      margin-top: 2rem;
      font-size: 0.7rem;
      color: var(--text-muted);
      opacity: 0.6;
    }
  `,
})
export class LoginComponent {
  private appService = inject(AppService);
  private router = inject(Router);

  isRegister = signal(false);
  name = '';
  phone = '';
  email = '';
  password = '';
  loading = signal(false);
  errorMessage = signal('');

  onSubmit() {
    if (!this.email || !this.password) return;
    if (this.isRegister() && (!this.name || !this.phone)) return;

    this.loading.set(true);
    this.errorMessage.set('');

    const request = this.isRegister()
      ? this.appService.register(this.email, this.password, this.name, this.phone)
      : this.appService.login(this.email, this.password);

    request.subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/home']);
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.errorMessage.set(err.message || 'Error al autenticar');
      },
    });
  }
}
