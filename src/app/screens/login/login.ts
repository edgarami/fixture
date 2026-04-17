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
          <p class="subtitle">Ingresa tus datos para empezar a apostar</p>
        </header>

        <form (submit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label>Nombre Completo</label>
            <div class="input-wrapper">
              <i class="fas fa-user"></i>
              <input 
                type="text" 
                [(ngModel)]="name" 
                name="name" 
                placeholder="Ej. Juan Pérez" 
                required
              >
            </div>
          </div>

          <div class="form-group">
            <label>Teléfono / WhatsApp</label>
            <div class="input-wrapper">
              <i class="fas fa-phone"></i>
              <input 
                type="tel" 
                [(ngModel)]="phone" 
                name="phone" 
                placeholder="Ej. +54 9 11 ..." 
                required
              >
            </div>
          </div>

          <button type="submit" class="btn-premium login-submit" [disabled]="loading()">
            {{ loading() ? 'Uniéndose...' : 'INGRESAR AHORA' }}
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
    .login-header { margin-bottom: 2rem; }
    .login-logo-container { margin-bottom: 1.5rem; }
    .login-logo {
      height: 120px;
      width: auto;
      filter: drop-shadow(0 0 20px rgba(212, 175, 55, 0.2));
    }
    .subtitle { color: var(--text-muted); font-size: 0.9rem; margin-top: 0.5rem; }
    
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
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
      box-shadow: 0 0 15px rgba(212, 175, 55, 0.1);
    }
    .login-submit {
      margin-top: 1rem;
      padding: 1.1rem;
    }
    .login-footer {
      margin-top: 2rem;
      font-size: 0.7rem;
      color: var(--text-muted);
      opacity: 0.6;
    }
  `
})
export class LoginComponent {
  private appService = inject(AppService);
  private router = inject(Router);

  name = '';
  phone = '';
  loading = signal(false);

  onSubmit() {
    if (!this.name || !this.phone) return;

    this.loading.set(true);
    this.appService.register(this.name, this.phone).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: () => {
        this.loading.set(false);
        alert('Error al registrar usuario');
      }
    });
  }
}
