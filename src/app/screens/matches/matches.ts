import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateSelector, FixtureDay } from '../../components/date-selector/date-selector';
import { MatchCard } from '../../components/match-card/match-card';
import { AppService, Match } from '../../services/app.service';

@Component({
  selector: 'app-matches',
  standalone: true,
  imports: [CommonModule, DateSelector, MatchCard],
  template: `
    <div class="container animate-fade-in">
      <header class="page-header">
        <h1 class="gold-text">PARTIDOS</h1>
        <p class="subtitle">Fixture Oficial Mundial 2026 - 48 Selecciones</p>
      </header>

      <app-date-selector
        [days]="fixtureDays()"
        [selectedKey]="effectiveKey()"
        (dateSelected)="onDateChange($event)"
      ></app-date-selector>

      <div class="stage-section" *ngIf="filteredMatches().length > 0; else noMatches">
        <div class="section-title-wrap">
          <h2 class="stage-title">
            {{filteredMatches()[0].group | uppercase}}
          </h2>
          <span class="match-count">{{filteredMatches().length}} Partidos</span>
        </div>
        
        <div class="matches-list animate-slide-up">
            <div class="date-header gold-text">
                {{selectedDate() | date:'EEEE, d MMMM' | uppercase}}
            </div>
            <div class="matches-grid">
                <app-match-card 
                  *ngFor="let m of filteredMatches()" 
                  [match]="m">
                </app-match-card>
            </div>
        </div>
      </div>

      <ng-template #noMatches>
        <div class="no-matches premium-card">
            <i class="fas fa-calendar-times"></i>
            <p>No hay partidos programados para esta fecha.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: `
    .page-header { margin-bottom: 1.5rem; padding: 0 1rem; }
    .subtitle { color: var(--text-muted); font-size: 0.95rem; }
    
    .section-title-wrap {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 2rem 1rem 0.5rem;
      border-left: 3px solid var(--gold-primary);
      padding-left: 1rem;
    }
    
    .stage-title {
      font-size: 1.1rem;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 0;
    }

    .match-count {
      font-size: 0.75rem;
      color: var(--gold-primary);
      font-weight: 700;
      text-transform: uppercase;
    }

    .date-header {
        margin: 0 1rem 1rem;
        font-size: 0.8rem;
        font-weight: 800;
        letter-spacing: 1px;
        opacity: 0.8;
    }

    .matches-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
      padding: 1rem;
    }

    .no-matches {
        margin: 2rem 1rem;
        padding: 4rem;
        text-align: center;
        color: var(--text-muted);
    }
    .no-matches i { font-size: 3rem; margin-bottom: 1rem; color: rgba(212,175,55,0.1); }

    .animate-fade-in {
      animation: fadeIn 0.5s ease forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 768px) {
      .matches-grid { grid-template-columns: 1fr; }
    }
  `
})
export class MatchesComponent {
  public appService = inject(AppService);

  private readonly dayNames = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
  private readonly monthNames = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

  /** Fecha local YYYY-MM-DD (el partido se agrupa en el día que se ve en la zona horaria del usuario) */
  private localDateKey(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  selectedKey = signal<string | null>(null);

  /** Días del selector: solo fechas (locales) que tienen partidos en el fixture */
  fixtureDays = computed<FixtureDay[]>(() => {
    const seen = new Set<string>();
    const days: FixtureDay[] = [];
    for (const m of this.appService.matches()) {
      const d = new Date(m.time);
      if (Number.isNaN(d.getTime())) continue;
      const key = this.localDateKey(d);
      if (seen.has(key)) continue;
      seen.add(key);
      days.push({
        key,
        dayName: this.dayNames[d.getDay()],
        dayNumber: String(d.getDate()),
        month: this.monthNames[d.getMonth()],
      });
    }
    return days.sort((a, b) => a.key.localeCompare(b.key));
  });

  /** Día activo: el elegido por el usuario, o el día de hoy, o el próximo día con partidos */
  effectiveKey = computed(() => {
    const chosen = this.selectedKey();
    if (chosen) return chosen;
    const days = this.fixtureDays();
    const today = this.localDateKey(new Date());
    if (days.some(d => d.key === today)) return today;
    return days.find(d => d.key > today)?.key ?? days[0]?.key ?? today;
  });

  selectedDate = computed(() => new Date(`${this.effectiveKey()}T12:00:00`));

  filteredMatches = computed(() => {
    const key = this.effectiveKey();
    return this.appService
      .matches()
      .filter(m => this.localDateKey(new Date(m.time)) === key)
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  });

  onDateChange(key: string) {
    this.selectedKey.set(key);
  }
}
