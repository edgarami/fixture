import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppService } from '../../services/app.service';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container animate-fade-in">
      <header class="page-header">
        <h1 class="gold-textCaps">POSICIONES</h1>
        <p class="subtitle">Clasificación oficial de los grupos</p>
      </header>

      <div class="groups-grid">
        <div *ngFor="let group of groups()" class="premium-card group-card">
          <div class="group-inner-header">
            <h2 class="group-title">Grupo {{group.name}}</h2>
          </div>
          
          <div class="table-container">
            <table class="standings-table">
              <thead>
                <tr>
                  <th class="col-rank">#</th>
                  <th class="col-team">Equipo</th>
                  <th class="col-stat">PJ</th>
                  <th class="col-stat">G</th>
                  <th class="col-stat">E</th>
                  <th class="col-stat">P</th>
                  <th class="col-stat">GF</th>
                  <th class="col-stat">GC</th>
                  <th class="col-stat">DG</th>
                  <th class="col-stat highlight">Pts</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let team of group.teams; let i = index" [class.qualifier]="i < 2">
                  <td class="col-rank">
                    <span class="rank-indicator" *ngIf="i < 2"></span>
                    {{i + 1}}
                  </td>
                  <td class="col-team">
                    <div class="team-info">
                      <img [src]="team.flag" class="team-flag" alt="flag">
                      <span class="team-name">{{team.name}}</span>
                    </div>
                  </td>
                  <td class="col-stat">{{team.pj}}</td>
                  <td class="col-stat">{{team.g}}</td>
                  <td class="col-stat">{{team.e}}</td>
                  <td class="col-stat">{{team.p}}</td>
                  <td class="col-stat">{{team.gf}}</td>
                  <td class="col-stat">{{team.gc}}</td>
                  <td class="col-stat">{{team.dg}}</td>
                  <td class="col-stat highlight font-bold">{{team.pts}}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .page-header { margin-bottom: 2.5rem; text-align: left; border-left: 4px solid var(--gold-primary); padding-left: 1.5rem; }
    .gold-textCaps { font-size: 2.5rem; font-weight: 900; letter-spacing: 2px; color: #fff; text-transform: uppercase; margin-bottom: 0.2rem; }
    .subtitle { color: var(--text-muted); font-size: 1rem; }

    .groups-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .group-card {
      background: #111;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.05);
      padding: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .group-inner-header {
      padding: 1.25rem 1.5rem;
      background: rgba(255,255,255,0.02);
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }

    .group-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #fff;
    }

    .table-container {
      width: 100%;
      overflow-x: auto;
    }

    .standings-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }

    .standings-table th {
      text-align: center;
      padding: 1rem 0.5rem;
      color: var(--text-muted);
      font-weight: 600;
      font-size: 0.75rem;
      text-transform: uppercase;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }

    .standings-table th.col-team { text-align: left; padding-left: 1rem; }
    .standings-table th.highlight { color: var(--gold-primary); }

    .standings-table td {
      padding: 0.85rem 0.5rem;
      text-align: center;
      border-bottom: 1px solid rgba(255,255,255,0.02);
      color: #ccc;
    }

    .standings-table tr.qualifier {
      background: rgba(52, 152, 219, 0.03); /* Subtle blue for top 2 */
    }

    .col-rank { width: 40px; position: relative; font-weight: 600; }
    .rank-indicator {
      position: absolute;
      left: 0;
      top: 15%;
      bottom: 15%;
      width: 3px;
      background: #3498db; /* The blue bar from the image */
      border-radius: 0 2px 2px 0;
    }

    .col-team { text-align: left !important; padding-left: 1rem !important; }
    .team-info { display: flex; align-items: center; gap: 0.75rem; }
    .team-flag { width: 24px; height: 16px; object-fit: cover; border-radius: 2px; box-shadow: 0 2px 4px rgba(0,0,0,0.3); }
    .team-name { font-weight: 500; color: #fff; }

    .col-stat { width: 35px; }
    .col-stat.highlight { font-weight: 800; color: #fff; }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 600px) {
      .groups-grid { grid-template-columns: 1fr; }
      .col-stat:nth-child(n+7):not(.highlight) { display: none; } /* Hide secondary stats on mobile */
      .gold-textCaps { font-size: 2rem; }
    }
  `
})
export class GroupsComponent {
  private appService = inject(AppService);
  
  groups = computed(() => {
    const matches = this.appService.matches();
    const groupMap: Record<string, any> = {};

    matches.forEach(m => {
      if (!m.group.startsWith('Grupo ')) return;
      const groupName = m.group.replace('Grupo ', '');
      if (!groupMap[groupName]) {
        groupMap[groupName] = { name: groupName, teams: {} };
      }

      [
        { name: m.team1, flag: m.team1Flag, score: m.score1, oppScore: m.score2 },
        { name: m.team2, flag: m.team2Flag, score: m.score2, oppScore: m.score1 }
      ].forEach(t => {
        if (!t.name) return;
        if (!groupMap[groupName].teams[t.name]) {
          groupMap[groupName].teams[t.name] = {
            name: t.name, flag: t.flag,
            pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0
          };
        }

        const team = groupMap[groupName].teams[t.name];
        if (m.isFinished && t.score !== null && t.oppScore !== null) {
          team.pj++;
          team.gf += t.score;
          team.gc += t.oppScore;
          team.dg = team.gf - team.gc;
          if (t.score > t.oppScore) { team.g++; team.pts += 3; }
          else if (t.score === t.oppScore) { team.e++; team.pts += 1; }
          else { team.p++; }
        }
      });
    });

    const result = Object.values(groupMap).map((g: any) => {
      const teams = Object.values(g.teams).sort((a: any, b: any) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf);
      
      return {
        ...g,
        teams: teams
      };
    }).sort((a, b) => a.name.localeCompare(b.name));

    return result;
  });
}
