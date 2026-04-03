import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-container">
      <div class="hero-section animate-fade-in">
        <div class="logo-wrapper">
          <img src="/assets/logo.png" alt="Rey de Reyes 2026" class="main-logo">
          <div class="logo-glow"></div>
        </div>
        <h1 class="welcome-text gold-text">BIENVENIDOS</h1>
        <h2 class="tournament-title gold-text">REY DE REYES 2026</h2>
      </div>

      <div class="menu-grid animate-slide-up">
        <button class="menu-item glass-card" routerLink="/profile">
          <div class="icon-box"><i class="fas fa-user-circle"></i></div>
          <span>Perfil</span>
        </button>

        <button class="menu-item glass-card" routerLink="/groups">
          <div class="icon-box"><i class="fas fa-table"></i></div>
          <span>Grupos</span>
        </button>

        <button class="menu-item glass-card" routerLink="/matches">
          <div class="icon-box"><i class="fas fa-calendar-alt"></i></div>
          <span>Partidos</span>
        </button>

        <button class="menu-item glass-card" routerLink="/extras">
          <div class="icon-box"><i class="fas fa-star"></i></div>
          <span>Apuestas Extras</span>
        </button>

        <button class="menu-item glass-card" routerLink="/ranking">
          <div class="icon-box"><i class="fas fa-trophy"></i></div>
          <span>Posiciones</span>
        </button>
      </div>

      <footer class="home-footer">
        <p>Vive la emoción del mundial 2026</p>
      </footer>
    </div>
  `,
  styles: `
    .home-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: radial-gradient(circle at top, rgba(212, 175, 55, 0.1) 0%, transparent 50%),
                  radial-gradient(circle at bottom, rgba(0, 0, 0, 1) 0%, #0f0f0f 100%);
      overflow-x: hidden;
    }

    .hero-section {
      text-align: center;
      margin-bottom: 3rem;
    }

    .logo-wrapper {
      position: relative;
      margin-bottom: 1.5rem;
    }

    .main-logo {
      height: 180px;
      width: auto;
      position: relative;
      z-index: 2;
      filter: drop-shadow(0 0 30px rgba(212, 175, 55, 0.3));
    }

    .logo-glow {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 200px;
      height: 200px;
      background: radial-gradient(circle, rgba(212, 175, 55, 0.2) 0%, transparent 70%);
      z-index: 1;
      border-radius: 50%;
      animation: pulse 4s infinite ease-in-out;
    }

    .welcome-text {
      font-size: 2.5rem;
      font-weight: 800;
      letter-spacing: 4px;
      margin: 0;
      text-transform: uppercase;
    }

    .tournament-title {
      font-weight: 700;
      letter-spacing: 2px;
      font-size: 1.2rem;
      margin-top: 0.5rem;
      text-transform: uppercase;
    }

    .menu-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
      width: 100%;
      max-width: 500px;
    }

    /* Make the last button span 2 columns to center the 5th button */
    .menu-item:nth-child(5) {
      grid-column: span 2;
    }

    .menu-item {
      position: relative;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(212, 175, 55, 0.2);
      border-radius: 20px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.8rem;
      color: #fff;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      backdrop-filter: blur(10px);
    }

    .menu-item:hover {
      transform: translateY(-8px);
      background: rgba(212, 175, 55, 0.1);
      border-color: var(--gold-primary);
      box-shadow: 0 15px 30px rgba(0,0,0,0.5), 0 0 20px rgba(212, 175, 55, 0.2);
    }

    .icon-box {
      font-size: 2rem;
      color: var(--gold-primary);
      transition: transform 0.3s ease;
    }

    .menu-item:hover .icon-box {
      transform: scale(1.2);
    }

    .menu-item span {
      font-weight: 700;
      text-transform: uppercase;
      font-size: 0.9rem;
      letter-spacing: 1px;
    }

    .badge {
      font-size: 0.6rem;
      background: var(--gold-primary);
      color: #000;
      padding: 2px 8px;
      border-radius: 10px;
      font-weight: 800;
      position: absolute;
      top: 10px;
      right: 10px;
    }

    .home-footer {
      margin-top: 4rem;
      text-align: center;
      color: var(--text-muted);
      font-size: 0.8rem;
      opacity: 0.5;
    }

    @keyframes pulse {
      0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
      50% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.6; }
    }

    @media (max-width: 480px) {
      .welcome-text { font-size: 2rem; }
      .menu-grid { gap: 1rem; }
      .menu-item { padding: 1.2rem; }
      .main-logo { height: 140px; }
    }
  `
})
export class HomeComponent {
    private router = inject(Router);
}
