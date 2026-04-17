import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AppService } from '../../services/app.service';

@Component({
  selector: 'app-extras',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  template: `
    <div class="container animate-fade-in">
      <header class="page-header">
        <h1 class="gold-text">APUESTAS EXTRAS</h1>
        <p class="subtitle">Pronostica los resultados especiales y posiciones de grupo</p>
      </header>

      <div class="extras-grid">
        <!-- Champion Selection Card -->
        <div class="premium-card champion-card">
          <div class="card-header">
            <i class="fas fa-trophy gold-text header-icon"></i>
            <h3 class="gold-text">¿QUIÉN SERÁ EL CAMPEÓN?</h3>
          </div>
          <p class="card-desc">Selecciona tu equipo ganador antes de que inicie el torneo para ganar 20 puntos extra.</p>
          <p class="mandatory-text">(Obligatorio antes de comenzar todos los juegos)</p>
          
          <div class="champion-selection" *ngIf="!appService.currentUser()?.championId; else championSelected">
            <div class="select-wrapper">
              <select [(ngModel)]="selectedTeamId" class="premium-select">
                <option value="" disabled selected>Elige tu selección...</option>
                <option *ngFor="let team of teams" [value]="team.name">{{team.name}}</option>
              </select>
              <i class="fas fa-chevron-down select-arrow"></i>
            </div>
            <button class="btn-premium w-full confirm-btn" (click)="confirmChampion()" [disabled]="!selectedTeamId">
              <i class="fas fa-check"></i> CONFIRMAR CAMPEÓN 
              <span class="btn-subtitle">(Obligatorio antes de comenzar todos los juegos)</span>
            </button>
          </div>

          <ng-template #championSelected>
            <div class="selected-champion-info animate-pop-in">
              <div class="flag-circle">
                <img [src]="getFlag(appService.currentUser()?.championId!)" alt="flag">
              </div>
              <h4>{{appService.currentUser()?.championId}}</h4>
              <span class="status-badge"><i class="fas fa-check-circle"></i> SELECCIÓN REGISTRADA</span>
              <p class="lock-msg">Esta apuesta ya está cerrada y no se puede modificar.</p>
            </div>
          </ng-template>
        </div>

        <div class="section-divider">
          <h2 class="gold-text">APUESTAS DE GRUPO</h2>
          <p class="subtitle">Arrastra los equipos para predecir las posiciones finales (1º a 4º)</p>
        </div>

        <!-- Group Predictions Grid -->
        <div class="groups-prediction-grid">
          <div *ngFor="let group of groups()" class="premium-card group-prediction-card">
            <div class="group-header">
              <h3 class="group-title">Grupo {{group.name}}</h3>
            </div>

            <div class="drag-container" 
                 cdkDropList 
                 [cdkDropListData]="group.predictions"
                 (cdkDropListDropped)="drop($event, group.name, group.teams)"
                 [cdkDropListDisabled]="isGroupLocked(group.name) || isPastDeadline()">
              
              <div *ngFor="let team of group.predictions; let i = index" 
                   class="prediction-item" 
                   cdkDrag
                   [cdkDragDisabled]="isGroupLocked(group.name) || isPastDeadline()">
                
                <div class="pred-rank">{{i + 1}}</div>
                <div class="pred-team">
                  <img [src]="team.flag" class="pred-flag">
                  <span class="pred-name">{{ team.name }}</span>
                </div>
                <div class="pred-handle" *ngIf="!isGroupLocked(group.name) && !isPastDeadline()">
                  <i class="fas fa-bars"></i>
                </div>
                <div class="pred-lock" *ngIf="isGroupLocked(group.name) || isPastDeadline()">
                  <i class="fas fa-lock"></i>
                </div>

                <div class="custom-placeholder" *cdkDragPlaceholder></div>
              </div>
            </div>

            <div class="challenge-actions">
                <div class="confirm-flow" *ngIf="confirmingGroup() === group.name">
                  <button class="btn-cancel-small" (click)="cancelConfirmation()">DESCARTAR</button>
                  <button class="btn-confirm-small" (click)="finalizeBet(group.name)">CONFIRMAR</button>
                </div>

                <button class="btn-save-prediction" 
                        *ngIf="confirmingGroup() !== group.name && !isGroupLocked(group.name) && !isPastDeadline()"
                        (click)="saveBet(group.name)">
                  GUARDAR GRUPO {{group.name}}
                  <span class="btn-subtitle">(Obligatorio antes de comenzar todos los juegos)</span>
                </button>

                <div class="sealed-badge" *ngIf="isGroupLocked(group.name) || isPastDeadline()">
                   <i class="fas fa-check-circle"></i> PREDICCIÓN CERRADA
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .container { padding: 2rem 1rem; max-width: 1000px; margin: 0 auto; }
    .page-header { margin-bottom: 3rem; text-align: center; }
    .subtitle { color: var(--text-muted); font-size: 0.9rem; margin-top: 0.5rem; }

    .extras-grid {
      display: flex;
      flex-direction: column;
      gap: 3rem;
    }

    .section-divider {
      text-align: center;
      padding: 2rem 0;
      border-top: 1px solid rgba(255,255,255,0.05);
    }

    .champion-card {
      padding: 3rem 2rem;
      max-width: 600px;
      margin: 0 auto;
      width: 100%;
    }

    .card-header { display: flex; flex-direction: column; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
    .header-icon { font-size: 3rem; filter: drop-shadow(0 0 15px rgba(212,175,55,0.4)); }

    .card-desc {
      color: var(--text-muted);
      font-size: 0.95rem;
      text-align: center;
      margin-bottom: 0.5rem;
      line-height: 1.6;
    }

    .mandatory-text {
      color: var(--gold-primary);
      font-size: 0.8rem;
      font-weight: 700;
      text-align: center;
      margin-bottom: 2.5rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .select-wrapper { position: relative; margin-bottom: 1.5rem; }
    .premium-select {
      width: 100%;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(212,175,55,0.3);
      color: #fff;
      padding: 1.2rem 1.5rem;
      border-radius: 15px;
      font-size: 1.1rem;
      appearance: none;
      cursor: pointer;
    }
    .select-arrow { position: absolute; right: 1.5rem; top: 50%; transform: translateY(-50%); color: var(--gold-primary); pointer-events: none; }

    .confirm-btn {
      padding: 1.2rem;
      font-size: 1rem;
      font-weight: 800;
      letter-spacing: 1px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 5px;
    }

    .btn-subtitle {
      font-size: 0.65rem;
      font-weight: 600;
      opacity: 0.8;
      text-transform: none;
      letter-spacing: 0;
    }

    .selected-champion-info { text-align: center; }
    .flag-circle {
      width: 120px; height: 120px; margin: 0 auto 1.5rem; padding: 6px;
      background: var(--gold-gradient); border-radius: 50%; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .flag-circle img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; border: 4px solid var(--bg-card); }

    .status-badge {
      display: inline-block; font-size: 0.8rem; font-weight: 900; color: #2ecc71;
      padding: 0.5rem 1.5rem; background: rgba(46, 204, 113, 0.1); border-radius: 30px; margin-bottom: 1rem;
    }

    .groups-prediction-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .group-prediction-card { padding: 1.5rem; background: #111; }
    .group-header { margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem; }
    .group-title { font-size: 1.1rem; color: #fff; font-weight: 700; }

    .drag-container { display: flex; flex-direction: column; gap: 0.5rem; }
    .prediction-item {
      display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.03);
      padding: 0.6rem 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); cursor: grab;
    }
    .pred-rank { font-weight: 800; font-size: 0.8rem; opacity: 0.5; width: 15px; }
    .pred-team { flex: 1; display: flex; align-items: center; gap: 10px; }
    .pred-flag { width: 20px; height: 14px; object-fit: cover; border-radius: 2px; }
    .pred-name { font-size: 0.85rem; font-weight: 600; color: #eee; }
    .pred-handle { opacity: 0.2; }
    .pred-lock { color: var(--gold-primary); font-size: 0.7rem; }

    .custom-placeholder { background: rgba(212,175,55,0.05); border: 1px dashed var(--gold-primary); height: 40px; border-radius: 8px; }

    .challenge-actions { margin-top: 1.5rem; }
    .btn-save-prediction {
      width: 100%; background: transparent; border: 1px solid var(--gold-primary);
      color: var(--gold-primary); padding: 0.75rem; border-radius: 8px; font-weight: 800; cursor: pointer; transition: 0.3s;
      display: flex; flex-direction: column; align-items: center; gap: 4px;
    }
    .btn-save-prediction:hover { background: var(--gold-primary); color: #000; }

    .confirm-flow { display: flex; gap: 10px; }
    .btn-cancel-small { flex: 1; background: #333; color: #fff; border: none; padding: 0.75rem; border-radius: 8px; font-weight: 700; font-size: 0.7rem; cursor: pointer; }
    .btn-confirm-small { flex: 2; background: #2ecc71; color: #fff; border: none; padding: 0.75rem; border-radius: 8px; font-weight: 800; font-size: 0.7rem; cursor: pointer; }

    .sealed-badge { font-size: 0.8rem; font-weight: 800; color: #2ecc71; display: flex; align-items: center; justify-content: center; gap: 8px; }

    .w-full { width: 100%; }
    .animate-pop-in { animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
    @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

    @media (max-width: 600px) {
      .groups-prediction-grid { grid-template-columns: 1fr; }
    }
  `
})
export class ExtrasComponent {
  public appService = inject(AppService);
  selectedTeamId = '';
  confirmingGroup = signal<string | null>(null);
  predictionsMap = signal<Record<string, any[]>>({});

  teams = [
    { name: 'Alemania' }, { name: 'Argentina' }, { name: 'Australia' }, { name: 'Bélgica' },
    { name: 'Brasil' }, { name: 'Canadá' }, { name: 'Catar' }, { name: 'Chile' },
    { name: 'China PR' }, { name: 'Colombia' }, { name: 'Costa Rica' }, { name: 'Croacia' },
    { name: 'Dinamarca' }, { name: 'Ecuador' }, { name: 'Egipto' }, { name: 'España' },
    { name: 'Estados Unidos' }, { name: 'Francia' }, { name: 'Ghana' }, { name: 'Gales' },
    { name: 'Irán' }, { name: 'Japón' }, { name: 'México' }, { name: 'Marruecos' },
    { name: 'Países Bajos' }, { name: 'Polonia' }, { name: 'Portugal' }, { name: 'Qatar' },
    { name: 'Rusia' }, { name: 'Arabia Saudita' }, { name: 'Senegal' }, { name: 'Serbia' },
    { name: 'Suiza' }, { name: 'Túnez' }, { name: 'Uruguay' }, { name: 'Corea del Sur' },
    { name: 'Nigeria' }, { name: 'Suecia' }, { name: 'Escocia' }, { name: 'Turquía' },
    { name: 'Ucrania' }, { name: 'Venezuela' }, { name: 'República Checa' }, { name: 'Islandia' },
    { name: 'Noruega' }, { name: 'Finlandia' }
  ];

  getFlag(team: string): string {
    const flagMap: Record<string, string> = {
      'Alemania': 'de', 'Argentina': 'ar', 'Australia': 'au', 'Bélgica': 'be',
      'Brasil': 'br', 'Canadá': 'ca', 'Catar': 'qa', 'Chile': 'cl',
      'China PR': 'cn', 'Colombia': 'co', 'Costa Rica': 'cr', 'Croacia': 'hr',
      'Dinamarca': 'dk', 'Ecuador': 'ec', 'Egipto': 'eg', 'España': 'es',
      'Estados Unidos': 'us', 'Francia': 'fr', 'Ghana': 'gh', 'Gales': 'gb-wls',
      'Irán': 'ir', 'Japón': 'jp', 'México': 'mx', 'Marruecos': 'ma',
      'Países Bajos': 'nl', 'Polonia': 'pl', 'Portugal': 'pt', 'Qatar': 'qa',
      'Rusia': 'ru', 'Arabia Saudita': 'sa', 'Senegal': 'sn', 'Serbia': 'rs',
      'Suiza': 'ch', 'Túnez': 'tn', 'Uruguay': 'uy', 'Corea del Sur': 'kr',
      'Nigeria': 'ng', 'Suecia': 'se', 'Escocia': 'gb-sct', 'Turquía': 'tr',
      'Ucrania': 'ua', 'Venezuela': 've', 'República Checa': 'cz', 'Islandia': 'is',
      'Noruega': 'no', 'Finlandia': 'fi'
    };
    const code = flagMap[team] || 'un';
    return `https://flagcdn.com/w160/${code}.png`;
  }

  confirmChampion() {
    if (!this.selectedTeamId) return;
    this.appService.selectChampion(this.selectedTeamId).subscribe(() => {
      alert(`¡Has seleccionado a ${this.selectedTeamId} como campeón!`);
    });
  }

  // --- Group Prediction Methods ---

  isPastDeadline() {
    const matches = this.appService.matches();
    if (matches.length === 0) return false;
    const firstMatch = [...matches].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())[0];
    const deadline = new Date(firstMatch.time).getTime() - (10 * 60 * 1000);
    return Date.now() > deadline;
  }

  isGroupLocked(groupName: string) {
    return this.appService.groupBets().some(b => b.groupName === groupName);
  }

  drop(event: CdkDragDrop<any[]>, groupName: string, originalTeams: any[]) {
    if (this.isGroupLocked(groupName) || this.isPastDeadline()) return;
    const currentPredictions = { ...this.predictionsMap() };
    const groupPredictions = [...(currentPredictions[groupName] || originalTeams)];
    moveItemInArray(groupPredictions, event.previousIndex, event.currentIndex);
    this.predictionsMap.update(prev => ({ ...prev, [groupName]: groupPredictions }));
  }

  saveBet(groupName: string) {
    if (this.isPastDeadline()) {
      alert('Lo sentimos, el tiempo para apostar ha terminado.');
      return;
    }
    this.confirmingGroup.set(groupName);
  }

  cancelConfirmation() {
    this.confirmingGroup.set(null);
  }

  finalizeBet(groupName: string) {
    const prediction = this.predictionsMap()[groupName] || this.groups().find(g => g.name === groupName)?.teams;
    if (!prediction) return;
    this.appService.placeGroupBet(groupName, prediction).subscribe(res => {
      this.confirmingGroup.set(null);
      if (res && res.error) alert(res.error);
    });
  }

  groups = computed(() => {
    const matches = this.appService.matches();
    const groupBets = this.appService.groupBets();
    const groupMap: Record<string, any> = {};

    matches.forEach(m => {
      if (!m.group.startsWith('Grupo ')) return;
      const groupName = m.group.replace('Grupo ', '');
      if (!groupMap[groupName]) groupMap[groupName] = { name: groupName, teams: {} };

      [
        { name: m.team1, flag: m.team1Flag, score: m.score1, oppScore: m.score2 },
        { name: m.team2, flag: m.team2Flag, score: m.score2, oppScore: m.score1 }
      ].forEach(t => {
        if (!t.name) return;
        if (!groupMap[groupName].teams[t.name]) {
          groupMap[groupName].teams[t.name] = { name: t.name, flag: t.flag, pts: 0, dg: 0, gf: 0 };
        }
        const team = groupMap[groupName].teams[t.name];
        if (m.isFinished && t.score !== null && t.oppScore !== null) {
          team.gf += t.score;
          team.dg += (t.score - t.oppScore);
          if (t.score > t.oppScore) team.pts += 3;
          else if (t.score === t.oppScore) team.pts += 1;
        }
      });
    });

    return Object.values(groupMap).map((g: any) => {
      const teams = Object.values(g.teams).sort((a: any, b: any) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf);
      const lockedBet = groupBets.find(b => b.groupName === g.name);
      const prediction = lockedBet ? lockedBet.positions : (this.predictionsMap()[g.name] || teams);
      return { ...g, teams, predictions: prediction };
    }).sort((a, b) => a.name.localeCompare(b.name));
  });
}
