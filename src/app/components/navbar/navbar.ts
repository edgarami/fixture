import { Component, HostListener, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="navbar">
      <div class="nav-content">
        <div class="logo">
          <img src="/assets/logo.png" alt="REY DE REYES 2026" class="logo-img">
        </div>
        <div class="nav-links">
          <a routerLink="/matches" routerLinkActive="active" class="nav-item">
            <div class="icon-box"><i class="fas fa-calendar-alt"></i></div>
            <span>Partidos</span>
          </a>
          <a routerLink="/groups" routerLinkActive="active" class="nav-item">
            <div class="icon-box"><i class="fas fa-table"></i></div>
            <span>Grupos</span>
          </a>
          <a routerLink="/ranking" routerLinkActive="active" class="nav-item">
            <div class="icon-box"><i class="fas fa-trophy"></i></div>
            <span>Posiciones</span>
          </a>
          <a routerLink="/extras" routerLinkActive="active" class="nav-item">
            <div class="icon-box"><i class="fas fa-plus-circle"></i></div>
            <span>Extras</span>
          </a>
          <a routerLink="/profile" routerLinkActive="active" class="nav-item">
            <div class="icon-box"><i class="fas fa-user"></i></div>
            <span>Perfil</span>
          </a>
          
          <!-- PWA Install Button Mobile -->
          <a *ngIf="deferredPrompt()" (click)="installPwa()" class="nav-item install-btn-mobile">
            <div class="icon-box install-icon"><i class="fas fa-download"></i></div>
            <span>Instalar</span>
          </a>
        </div>

        <div class="auth-group">
          <button *ngIf="deferredPrompt()" (click)="installPwa()" class="btn-premium install-btn-desktop">
            <i class="fas fa-download"></i> INSTALAR APP
          </button>
          <div class="auth-btn">
            <a routerLink="/login" class="btn-premium login-btn">Acceder</a>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: `
    .navbar {
      background: var(--glass-bg);
      backdrop-filter: var(--glass-blur);
      border-bottom: 1px solid var(--glass-border);
      padding: 0.7rem 0;
      position: sticky;
      top: 0;
      z-index: 1000;
      width: 100%;
    }
    .nav-content {
      max-width: 1300px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo {
      display: flex;
      align-items: center;
    }
    .logo-img {
      height: 60px;
      width: auto;
      filter: drop-shadow(0 0 10px rgba(212, 175, 55, 0.3));
      transition: transform 0.3s ease;
    }
    .logo-img:hover {
      transform: scale(1.05);
    }
    .nav-links {
      display: flex;
      gap: 2.5rem;
    }
    .nav-item {
      text-decoration: none;
      color: var(--text-muted);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      cursor: pointer;
    }
    .icon-box {
      width: 36px;
      height: 36px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 10px;
      transition: all 0.3s ease;
      background: rgba(255, 255, 255, 0.03);
    }
    .nav-item i {
      font-size: 1.1rem;
    }
    .nav-item:hover, .nav-item.active {
      color: var(--gold-primary);
    }
    .nav-item:hover .icon-box, .nav-item.active .icon-box {
      background: var(--gold-soft-glow);
      color: var(--gold-primary);
      transform: translateY(-2px);
    }

    .auth-group { display: flex; gap: 1rem; align-items: center; }

    .install-btn-desktop {
      background: #2ecc71;
      border: 1px solid #27ae60;
      color: #fff;
      font-size: 0.75rem;
      padding: 0.5rem 1rem;
    }
    .install-btn-desktop:hover {
      background: #27ae60;
      box-shadow: 0 0 15px rgba(46, 204, 113, 0.4);
    }

    .install-btn-mobile { display: none; }
    .install-icon { background: rgba(46, 204, 113, 0.1); color: #2ecc71; }

    .login-btn {
      padding: 0.6rem 1.8rem;
      font-size: 0.8rem;
    }
    @media (max-width: 992px) {
      .nav-links { gap: 1.5rem; }
    }
    @media (max-width: 768px) {
      .navbar {
        position: fixed;
        bottom: 0;
        top: auto;
        padding: 0.6rem 0;
        border-bottom: none;
        border-top: 1px solid var(--glass-border);
      }
      .nav-content {
        padding: 0 1rem;
      }
      .logo, .auth-btn, .install-btn-desktop { display: none; }
      .nav-links { 
        width: 100%; 
        justify-content: space-around; 
        gap: 0; 
      }
      .install-btn-mobile { display: flex; }
      .nav-item span { font-size: 0.65rem; }
    }
  `
})
export class Navbar {
  deferredPrompt = signal<any>(null);

  @HostListener('window:beforeinstallprompt', ['$event'])
  onBeforeInstallPrompt(e: any) {
    e.preventDefault();
    this.deferredPrompt.set(e);
  }

  installPwa() {
    const promptEvent = this.deferredPrompt();
    if (!promptEvent) return;
    promptEvent.prompt();
    promptEvent.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the PWA install prompt');
      }
      this.deferredPrompt.set(null);
    });
  }
}
