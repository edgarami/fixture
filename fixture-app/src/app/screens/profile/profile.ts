import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppService } from '../../services/app.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container animate-fade-in">
      <header class="page-header">
        <h1 class="gold-text">MI PERFIL</h1>
        <p class="subtitle">Gestiona tu cuenta y revisa tu historial de apuestas</p>
      </header>

      <div class="profile-grid">
        <!-- User Info Card -->
        <div class="premium-card profile-card">
          <div class="user-avatar-large">
            <i class="fas fa-user-circle"></i>
          </div>
          <h2 class="user-name">{{appService.currentUser()?.name}}</h2>
          <p class="user-phone">{{appService.currentUser()?.phone}}</p>
          
          <button class="btn-secondary w-full logout-btn" (click)="logout()">
            <i class="fas fa-sign-out-alt"></i> CERRAR SESIÓN
          </button>
        </div>

        <div class="premium-card history-card animate-fade-in" style="animation-delay: 0.1s">
          <h3 class="gold-text"><i class="fas fa-history"></i> HISTORIAL DE APUESTAS</h3>
          
          <div class="table-container" *ngIf="userBetsWithMatches().length > 0">
            <table>
              <thead>
                <tr>
                  <th>FECHA DE APUESTA</th>
                  <th>EQUIPOS QUE JUGARON</th>
                  <th>APUESTA</th>
                  <th>RESULTADO PARTIDO</th>
                  <th>PG</th>
                  <th>PP</th>
                  <th>PTOS</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let bet of userBetsWithMatches()">
                  <td>{{ bet.timestamp | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td>
                    <div class="team-cell" *ngIf="bet.match">
                      <img [src]="bet.match.team1Flag" [alt]="bet.match.team1">
                      {{ bet.match.team1 }} vs {{ bet.match.team2 }}
                      <img [src]="bet.match.team2Flag" [alt]="bet.match.team2">
                    </div>
                  </td>
                  <td class="bet-value">{{ bet.score1 }} - {{ bet.score2 }}</td>
                  <td class="result-value">
                    <span *ngIf="bet.match?.isFinished">{{ bet.match?.score1 }} - {{ bet.match?.score2 }}</span>
                    <span *ngIf="!bet.match?.isFinished" class="text-muted">Pendiente</span>
                  </td>
                  <td class="points-value">
                    <span *ngIf="bet.match?.isFinished && bet.totalPoints > 0">X</span>
                  </td>
                  <td class="points-value">
                    <span *ngIf="bet.match?.isFinished && bet.totalPoints === 0">X</span>
                  </td>
                  <td class="points-value" [class.points-zero]="bet.totalPoints === 0">
                    {{ bet.totalPoints }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div *ngIf="userBetsWithMatches().length === 0" class="empty-state">
            Aún no has realizado apuestas de partidos.
          </div>
        </div>

      </div>
    </div>
  `,
  styles: `
    .page-header { margin-bottom: 2rem; padding: 0 1rem; text-align: center; }
    .subtitle { color: var(--text-muted); font-size: 0.9rem; }
    
    .profile-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
      padding: 0 1rem;
      justify-items: center;
      align-items: start;
    }

    .history-card {
      width: 100%;
      max-width: 900px;
      margin-top: 1rem;
    }

    .table-container {
      width: 100%;
      overflow-x: auto;
      margin-top: 1.5rem;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(212, 175, 55, 0.1);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
      min-width: 700px;
    }

    th {
      background: rgba(0, 0, 0, 0.3);
      color: var(--gold-primary);
      text-transform: uppercase;
      font-size: 0.7rem;
      letter-spacing: 1px;
      padding: 1rem;
      text-align: center;
      border-bottom: 1px solid rgba(212, 175, 55, 0.2);
    }

    td {
      padding: 1rem;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      color: var(--text-muted);
    }

    .team-cell {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      color: #fff;
      font-weight: 600;
    }

    .team-cell img {
      width: 20px;
      height: 14px;
      object-fit: cover;
      border-radius: 2px;
    }

    .bet-value, .result-value {
      font-weight: 700;
      color: #fff;
    }

    .points-value {
      font-weight: 800;
      color: var(--gold-primary);
    }

    .points-zero {
      color: rgba(255, 255, 255, 0.2);
    }

    .profile-card {
      width: 100%;
      max-width: 500px;
      padding: 2.5rem 1.5rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 400px;
    }

    .user-avatar-large {
      font-size: 4rem;
      color: var(--gold-primary);
      margin-bottom: 1rem;
      filter: drop-shadow(0 0 15px rgba(212, 175, 55, 0.2));
    }

    .user-name { font-size: 1.6rem; margin-bottom: 0.3rem; letter-spacing: 1px; }
    .user-phone { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 2rem; }

    .logout-btn { margin-top: auto; padding: 1rem; font-size: 0.8rem; }

    .w-full { width: 100%; }

    .animate-fade-in {
      animation: fadeIn 0.5s ease forwards;
    }

    .empty-state {
      padding: 3rem;
      text-align: center;
      color: var(--text-muted);
      font-style: italic;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 768px) {
      .profile-grid { grid-template-columns: 1fr; }
      .table-container table { font-size: 0.75rem; min-width: 600px; }
    }
  `
})
export class ProfileComponent {
  public appService = inject(AppService);

  public userBetsWithMatches = computed(() => {
    const bets = this.appService.bets();
    const matches = this.appService.matches();
    
    return bets.map(bet => {
      const match = matches.find(m => m.id === bet.matchId);
      
      let pg = 0;
      let pp = 0;
      let totalPoints = 0;

      if (match && match.isFinished && match.score1 !== null && match.score2 !== null) {
        const actualResult = Math.sign(match.score1 - match.score2);
        const predictedResult = Math.sign(bet.score1 - bet.score2);
        
        const isExact = match.score1 === bet.score1 && match.score2 === bet.score2;
        const isResultCorrect = actualResult === predictedResult;

        if (isExact) {
          pg = 5;
          pp = 5;
          totalPoints = 10;
        } else if (isResultCorrect) {
          pg = 5;
          pp = 0;
          totalPoints = 5;
        }
      }

      return {
        ...bet,
        match,
        pg,
        pp,
        totalPoints
      };
    }).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  });

  logout() {
    this.appService.logout();
    window.location.href = '/login';
  }
}
