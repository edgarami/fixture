import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppService } from '../../services/app.service';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container animate-fade-in">
      <header class="page-header">
        <h1 class="gold-text">POSICIONES</h1>
        <p class="subtitle">Tabla de posiciones y puntajes en tiempo real</p>
      </header>

      <div class="premium-card ranking-card">
        <div class="ranking-header">
            <span class="col-pos">POS</span>
            <span class="col-name">NOMBRE</span>
            <span class="col-bets">APUESTAS</span>
            <span class="col-won">GANADOS</span>
            <span class="col-pts">PUNTOS</span>
        </div>
        <ul class="ranking-list">
          <li *ngFor="let user of appService.ranking(); let i = index" 
              [class.top-three]="i < 3" 
              [class.current-user]="user.id === appService.currentUser()?.id">
            <div class="col-pos">
              <div class="rank-number">{{i + 1}}</div>
            </div>
            <div class="col-name player-info">
              <span class="player-name">{{user.name}}</span>
            </div>
            <div class="col-bets text-center">
              <span class="stat-value">{{user.totalBets || 0}}</span>
            </div>
            <div class="col-won text-center">
              <span class="stat-value">{{user.wonGames || 0}}</span>
            </div>
            <div class="col-pts gold-text player-score">
              {{user.points || 0}}
            </div>
          </li>
        </ul>
        <div *ngIf="appService.ranking().length === 0" class="empty-state">
            Aún no hay jugadores registrados.
        </div>
      </div>
      <div class="premium-card points-legend-card animate-fade-in" style="animation-delay: 0.2s">
        <h3 class="gold-text"><i class="fas fa-info-circle"></i> SISTEMA DE PUNTUACIÓN</h3>
        <div class="legend-grid">
          <div class="legend-item">
            <div class="legend-icon"><i class="fas fa-trophy gold-text"></i></div>
            <div class="legend-info">
              <span class="legend-label">CAMPEÓN FINAL</span>
              <span class="legend-value">20 PTS</span>
              <p class="legend-desc">Predicción del equipo ganador antes del mundial.</p>
            </div>
          </div>
          <div class="legend-item">
            <div class="legend-icon"><i class="fas fa-medal gold-text"></i></div>
            <div class="legend-info">
              <span class="legend-label">DESAFÍO GRUPO (1º)</span>
              <span class="legend-value">5 PTS</span>
              <p class="legend-desc">Por acertar el primer puesto de un grupo.</p>
            </div>
          </div>
          <div class="legend-item">
            <div class="legend-icon"><i class="fas fa-th-list gold-text"></i></div>
            <div class="legend-info">
              <span class="legend-label">DESAFÍO GRUPO (FULL)</span>
              <span class="legend-value">3 PTS</span>
              <p class="legend-desc">Por acertar las 4 posiciones del grupo.</p>
            </div>
          </div>
          <div class="legend-item">
            <div class="legend-icon"><i class="fas fa-bullseye gold-text"></i></div>
            <div class="legend-info">
              <span class="legend-label">RESULTADO EXACTO</span>
              <span class="legend-value">10 PTS</span>
              <p class="legend-desc">Por acertar el marcador exacto (incluye empates).</p>
            </div>
          </div>
          <div class="legend-item">
            <div class="legend-icon"><i class="fas fa-check gold-text"></i></div>
            <div class="legend-info">
              <span class="legend-label">GANADOR O EMPATE</span>
              <span class="legend-value">5 PTS</span>
              <p class="legend-desc">Por acertar el resultado sin el marcador exacto.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .page-header { margin-bottom: 2rem; padding: 0 1rem; }
    .subtitle { color: var(--text-muted); font-size: 0.9rem; }
    .ranking-card { padding: 0; overflow: hidden; border: 1px solid rgba(212, 175, 55, 0.2); }
    
    .ranking-header {
        display: flex;
        padding: 1rem 1.5rem;
        background: rgba(255, 255, 255, 0.02);
        font-size: 0.6rem;
        font-weight: 800;
        color: var(--text-muted);
        letter-spacing: 1.5px;
        border-bottom: 1px solid var(--border-color);
        text-transform: uppercase;
    }

    .ranking-header span, .ranking-list li > div {
        display: flex;
        align-items: center;
    }

    .col-pos { width: 50px; justify-content: center; }
    .col-name { flex: 2; margin-left: 10px; }
    .col-bets { flex: 1; justify-content: center; }
    .col-won { flex: 1; justify-content: center; }
    .col-pts { flex: 1; justify-content: flex-end; font-weight: 900; }

    .text-center { justify-content: center; }
    
    .ranking-list { list-style: none; }
    .ranking-list li {
      display: flex;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.03);
      transition: all 0.3s ease;
    }
    .ranking-list li:hover { background: rgba(212, 175, 55, 0.03); }
    .ranking-list li.current-user { background: rgba(212, 175, 55, 0.06); border-left: 3px solid var(--gold-primary); }
    
    .rank-number {
      width: 28px;
      height: 28px;
      background: rgba(255,255,255,0.03);
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 8px;
      font-weight: 800;
      font-size: 0.75rem;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .top-three .rank-number {
      background: var(--gold-gradient);
      color: #000;
      border: none;
      box-shadow: 0 4px 10px rgba(212, 175, 55, 0.3);
    }
    .player-info { display: flex; flex-direction: column; }
    .player-name { font-weight: 700; font-size: 0.95rem; letter-spacing: 0.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .stat-value { font-family: 'Inter', sans-serif; font-weight: 500; font-size: 1rem; color: #fff; }
    .player-score { font-size: 1.1rem; }
    
    .empty-state { padding: 3rem; text-align: center; color: var(--text-muted); }

    /* Legend Styles */
    .points-legend-card { margin-top: 2rem; padding: 2rem; border: 1px solid rgba(212, 175, 55, 0.1); }
    .points-legend-card h3 { font-size: 1rem; margin-bottom: 2rem; letter-spacing: 1px; display: flex; align-items: center; gap: 10px; }
    .legend-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; }
    .legend-item { display: flex; gap: 1rem; align-items: flex-start; }
    .legend-icon { 
      width: 36px; height: 36px; background: rgba(255,255,255,0.03); 
      border-radius: 10px; display: flex; justify-content: center; 
      align-items: center; flex-shrink: 0; 
      border: 1px solid rgba(255,255,255,0.05);
    }
    .legend-info { display: flex; flex-direction: column; gap: 4px; }
    .legend-label { font-size: 0.6rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }
    .legend-value { font-size: 1.2rem; font-weight: 900; color: var(--gold-primary); }
    .legend-desc { font-size: 0.75rem; color: var(--text-muted); line-height: 1.4; margin: 0; }

    .animate-fade-in {
      animation: fadeIn 0.5s ease forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `
})
export class RankingComponent {
  public appService = inject(AppService);
}
