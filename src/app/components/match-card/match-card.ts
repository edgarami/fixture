import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppService, Match, MatchBetSummary } from '../../services/app.service';

@Component({
  selector: 'app-match-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="premium-card match-card animate-slide-up">
      <div class="match-header">
        <span class="venue">
          <i class="fas fa-hashtag gold-text"></i> 
          <span *ngIf="match.matchNumber" class="gold-text mr-2">PARTIDO {{match.matchNumber}} • </span>
          <i class="fas fa-map-marker-alt"></i> {{match.venue}}
        </span>
        <span class="match-time">{{formatTime(match.time)}}</span>
      </div>
      
      <div class="match-teams">
        <div class="team">
          <div class="flag-wrapper">
            <img [src]="match.team1Flag || 'https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.3.2/flags/4x3/un.svg'" alt="flag">
          </div>
          <span class="team-name">{{match.team1}}</span>
        </div>
        
        <div class="match-score">
          <div class="score-box" [class.live]="match.score1 !== null">
            <span class="score-val">{{match.score1 ?? '-'}}</span>
            <span class="separator">:</span>
            <span class="score-val">{{match.score2 ?? '-'}}</span>
          </div>
          <div *ngIf="match.score1 !== null && !match.isFinished" class="live-indicator">
            <span class="dot"></span> LIVE
          </div>
          <div *ngIf="match.isFinished" class="final-indicator">FINAL</div>
        </div>
        
        <div class="team right">
          <span class="team-name">{{match.team2}}</span>
          <div class="flag-wrapper">
            <img [src]="match.team2Flag || 'https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.3.2/flags/4x3/un.svg'" alt="flag">
          </div>
        </div>
      </div>
      
      <div class="betting-overlay" *ngIf="showBetForm()">
        <div class="bet-inputs">
            <input type="number" [(ngModel)]="betScore1" class="score-input">
            <span class="sep">-</span>
            <input type="number" [(ngModel)]="betScore2" class="score-input">
        </div>
        <div class="bet-actions">
            <button class="btn-secondary flex-1" (click)="showBetForm.set(false)">Cancelar</button>
            <button class="btn-premium flex-1" (click)="confirmBet()">Confirmar</button>
        </div>
      </div>

      <div class="user-bet-info" *ngIf="!showBetForm() && !showDetails() && appService.getBetForMatch(match.id) as userBet">
        Tu apuesta: <span class="gold-text">{{userBet.score1}} - {{userBet.score2}}</span>
      </div>

      <div class="match-actions" *ngIf="!showBetForm() && !showDetails() && !match.isFinished">
        <button class="btn-secondary flex-1" (click)="viewDetails()">Detalles</button>
        <button class="btn-premium flex-1" (click)="openBet()">Apostar</button>
      </div>

      <div class="details-overlay animate-fade-in" *ngIf="showDetails()">
        <h4 class="gold-text text-center mb-1">Apuestas del Grupo</h4>
        
        <div class="bets-list" *ngIf="matchBets().length > 0; else noBets">
          <div class="bet-entry" *ngFor="let mBet of matchBets()">
            <span class="better-name"><i class="fas fa-user-circle"></i> {{mBet.userName}}</span>
            <span class="better-score gold-text">{{mBet.score1}} - {{mBet.score2}}</span>
          </div>
        </div>
        <ng-template #noBets>
          <p class="text-center text-muted text-sm my-2">Nadie ha apostado aún en este partido.</p>
        </ng-template>

        <button class="btn-secondary w-full mt-2" (click)="closeDetails()">Cerrar</button>
      </div>
    </div>
  `,
  styles: `
    .match-card {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      position: relative;
    }
    .match-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border-color);
    }
    .venue {
      font-size: 0.7rem;
      color: var(--text-muted);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .venue i { color: var(--gold-primary); margin-right: 5px; }
    .match-time {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--gold-primary);
    }
    .match-teams {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }
    .team {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.8rem;
      flex: 1;
    }
    .flag-wrapper {
      width: 50px;
      height: 50px;
      padding: 3px;
      background: var(--gold-gradient);
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    }
    .team img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
      border: 2px solid var(--bg-card);
    }
    .team-name {
      font-size: 0.9rem;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-align: center;
    }
    .match-score {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .score-box {
      background: rgba(255, 255, 255, 0.03);
      padding: 0.5rem 1.2rem;
      border-radius: 12px;
      font-size: 2rem;
      font-weight: 900;
      display: flex;
      align-items: center;
      gap: 10px;
      border: 1px solid var(--border-color);
      letter-spacing: 2px;
    }
    .score-box.live {
      border-color: var(--gold-primary);
      background: rgba(212, 175, 55, 0.05);
    }
    .score-val { color: #fff; }
    .separator { color: var(--gold-primary); opacity: 0.5; }
    
    .live-indicator {
      font-size: 0.65rem;
      font-weight: 800;
      color: #ff4d4d;
      display: flex;
      align-items: center;
      gap: 4px;
      letter-spacing: 1px;
    }
    .final-indicator {
      font-size: 0.65rem;
      font-weight: 800;
      color: var(--text-muted);
      letter-spacing: 1px;
    }
    .dot {
      width: 6px;
      height: 6px;
      background: #ff4d4d;
      border-radius: 50%;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.5); opacity: 0.5; }
      100% { transform: scale(1); opacity: 1; }
    }
    
    .betting-overlay {
        background: var(--bg-card);
        display: flex;
        flex-direction: column;
        gap: 1rem;
        align-items: center;
        padding: 1rem 0;
    }
    .bet-inputs {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    .score-input {
        width: 70px;
        background: rgba(255,255,255,0.05);
        border: 1px solid var(--border-color);
        color: #fff;
        text-align: center;
        padding: 0.8rem;
        border-radius: 12px;
        font-size: 1.5rem;
        font-weight: 900;
    }
    .sep { color: var(--gold-primary); font-weight: 800; font-size: 1.5rem; }
    .bet-actions { display: flex; gap: 1rem; width: 100%; }
    
    .user-bet-info {
        text-align: center;
        font-size: 0.85rem;
        color: var(--text-muted);
        font-weight: 700;
        background: rgba(212, 175, 55, 0.05);
        padding: 0.6rem;
        border-radius: 10px;
        border: 1px dashed var(--border-color);
    }

    .match-actions {
      display: flex;
      gap: 1rem;
    }
    .flex-1 { flex: 1; }
    .btn-secondary, .btn-premium {
      padding: 0.8rem;
      font-size: 0.8rem;
    }
    
    .details-overlay {
      background: rgba(255, 255, 255, 0.02);
      border-radius: 12px;
      padding: 1rem;
      border: 1px solid var(--border-color);
    }
    .text-center { text-align: center; }
    .mb-1 { margin-bottom: 1rem; }
    .mt-2 { margin-top: 1rem; }
    .my-2 { margin: 1rem 0; }
    .text-muted { color: var(--text-muted); }
    .text-sm { font-size: 0.85rem; }
    .w-full { width: 100%; }
    .mr-2 { margin-right: 0.5rem; }
    .gold-text { color: var(--gold-primary); }
    
    .bets-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-height: 150px;
      overflow-y: auto;
      padding-right: 5px;
    }
    /* Custom Scrollbar */
    .bets-list::-webkit-scrollbar { width: 4px; }
    .bets-list::-webkit-scrollbar-track { background: transparent; }
    .bets-list::-webkit-scrollbar-thumb { background: var(--gold-primary); border-radius: 4px; }

    .bet-entry {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.6rem 0.8rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      font-size: 0.85rem;
    }
    .better-name { font-weight: 600; }
    .better-name i { margin-right: 5px; color: var(--gold-primary); opacity: 0.7;}
    .better-score { font-weight: 900; letter-spacing: 1px; }

    .animate-fade-in { animation: fadeIn 0.3s ease forwards; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 480px) {
      .score-box { font-size: 1.5rem; padding: 0.4rem 0.8rem; }
      .flag-wrapper { width: 40px; height: 40px; }
      .team-name { font-size: 0.8rem; }
    }
  `
})
export class MatchCard {
  @Input() match!: Match;

  public appService = inject(AppService);

  showBetForm = signal(false);
  showDetails = signal(false);
  matchBets = signal<MatchBetSummary[]>([]);
  betScore1 = 0;
  betScore2 = 0;

  formatTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) + ' ' + d.toLocaleDateString([], { day: '2-digit', month: 'short', timeZone: 'UTC' }).toUpperCase();
  }


  openBet() {
    if (!this.appService.isLoggedIn()) {
      alert('Debes unirte primero para apostar');
      return;
    }
    const currentBet = this.appService.getBetForMatch(this.match.id);
    if (currentBet) {
      this.betScore1 = currentBet.score1;
      this.betScore2 = currentBet.score2;
    }
    this.showDetails.set(false);
    this.showBetForm.set(true);
  }

  confirmBet() {
    this.appService.placeBet(this.match.id, this.betScore1, this.betScore2).subscribe(res => {
      if (res) {
        this.showBetForm.set(false);
      } else {
        alert('Error al realizar apuesta o partido bloqueado (10 min antes)');
      }
    });
  }

  viewDetails() {
    this.showBetForm.set(false);
    this.appService.fetchMatchBets(this.match.id).subscribe(bets => {
      this.matchBets.set(bets);
      this.showDetails.set(true);
    });
  }

  closeDetails() {
    this.showDetails.set(false);
  }
}
