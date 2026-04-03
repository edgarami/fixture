import { Component, HostListener, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, CommonModule],
  template: `
    <app-navbar *ngIf="showNavbar()"></app-navbar>
    <main class="page-container" [class.no-navbar]="!showNavbar()">
      <router-outlet></router-outlet>
    </main>

    <!-- Custom PWA Install Prompt (App Store Style) -->
    <div class="install-overlay" *ngIf="showInstallPrompt()">
      <div class="install-card premium-card animate-slide-up">
        <button class="close-btn" (click)="dismissPrompt()"><i class="fas fa-times"></i></button>
        <div class="app-icon-wrapper">
          <img src="/assets/logo.png" alt="App Logo">
        </div>
        <h2 class="gold-text text-xl">Rey de Reyes 2026</h2>
        <div class="app-rating">
            <i class="fas fa-star gold-text"></i>
            <i class="fas fa-star gold-text"></i>
            <i class="fas fa-star gold-text"></i>
            <i class="fas fa-star gold-text"></i>
            <i class="fas fa-star gold-text"></i>
            <span class="rating-count">(4.9)</span>
        </div>
        <p class="install-desc">Descarga nuestra app oficial. Más rápida, segura y siempre disponible en la pantalla de inicio de tu celular para jugar sin interrupciones.</p>
        
        <button class="btn-premium w-full download-btn" (click)="installPwa()">
          <i class="fas fa-download"></i> OBTENER APLICACIÓN
        </button>
        <p class="free-text">Aplicación Gratuita</p>
      </div>
    </div>
  `,
  styles: `
    .page-container {
      min-height: calc(100vh - 70px);
      padding-bottom: 80px;
    }
    .page-container.no-navbar {
      min-height: 100vh;
      padding-bottom: 0;
    }
    @media (min-width: 769px) {
      .page-container {
        padding-bottom: 2rem;
      }
    }

    /* PWA Install Prompt Styles */
    .install-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(8px);
      display: flex;
      justify-content: center;
      align-items: flex-end;
      z-index: 9999;
      padding: 1rem;
    }

    .install-card {
      width: 100%;
      max-width: 400px;
      padding: 2.5rem 1.5rem 1.5rem;
      text-align: center;
      position: relative;
      margin-bottom: 1rem;
      border: 1px solid var(--gold-primary);
      box-shadow: 0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(212, 175, 55, 0.15);
    }

    .close-btn {
      position: absolute;
      top: 15px;
      right: 15px;
      background: rgba(255,255,255,0.1);
      border: none;
      color: var(--text-muted);
      width: 30px;
      height: 30px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 1rem;
    }

    .app-icon-wrapper {
      width: 90px;
      height: 90px;
      margin: -60px auto 1rem;
      background: var(--bg-card);
      border-radius: 22px;
      padding: 10px;
      box-shadow: 0 10px 20px rgba(0,0,0,0.4);
      border: 2px solid var(--gold-primary);
    }
    .app-icon-wrapper img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .text-xl { font-size: 1.5rem; margin-bottom: 0.5rem; font-weight: 800; letter-spacing: 1px; }

    .app-rating {
      font-size: 0.8rem;
      margin-bottom: 1rem;
    }
    .rating-count { color: var(--text-muted); margin-left: 5px; }

    .install-desc {
      color: var(--text-muted);
      font-size: 0.9rem;
      line-height: 1.5;
      margin-bottom: 1.5rem;
    }

    .download-btn {
      font-size: 1rem;
      padding: 1.2rem;
      border-radius: 14px;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
      font-weight: 800;
      letter-spacing: 1px;
    }

    .free-text {
      font-size: 0.7rem;
      color: var(--text-muted);
      margin-top: 1rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .w-full { width: 100%; }

    .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(100%); }
      to { opacity: 1; transform: translateY(0); }
    }
  `
})
export class App {
  private router = inject(Router);
  title = 'Fixture App';

  showNavbar = signal(false);
  deferredPrompt: any;

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => (event as NavigationEnd).urlAfterRedirects)
    ).subscribe((url: string) => {
      // Hide navbar on login and home
      const hideOn = ['/login', '/home'];
      this.showNavbar.set(!hideOn.some(path => url.includes(path)));
    });
  }
  showInstallPrompt = signal(false);

  @HostListener('window:beforeinstallprompt', ['$event'])
  onBeforeInstallPrompt(e: Event) {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    this.deferredPrompt = e;
    // Update UI notify the user they can install the PWA
    // Add a slight delay so it feels natural when opening the app
    setTimeout(() => {
      // Check if not already dismissed in this session
      if (!sessionStorage.getItem('pwa-prompt-dismissed')) {
        this.showInstallPrompt.set(true);
      }
    }, 1500);
  }

  installPwa() {
    this.showInstallPrompt.set(false);
    if (this.deferredPrompt) {
      // Show the install prompt
      this.deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      this.deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        this.deferredPrompt = null;
      });
    }
  }

  dismissPrompt() {
    this.showInstallPrompt.set(false);
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  }
}
