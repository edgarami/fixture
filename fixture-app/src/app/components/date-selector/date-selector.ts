import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FixtureDay {
  id: number;
  dayName: string;
  dayNumber: string;
  month: string;
}

@Component({
  selector: 'app-date-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="date-selector-wrapper">
      <div class="date-scroll-container">
        <div 
          *ngFor="let day of fixtureDays" 
          class="date-item" 
          [class.active]="day.id === selectedId"
          (click)="selectDay(day.id)"
          [id]="'date-' + day.id"
        >
          <span class="day-name">{{day.dayName}}</span>
          <span class="day-number">{{day.dayNumber}}</span>
          <span class="month">{{day.month}}</span>
          <div class="active-indicator"></div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .date-selector-wrapper {
      padding: 1rem 0;
      background: linear-gradient(to bottom, rgba(15, 15, 15, 0.8), transparent);
      backdrop-filter: blur(10px);
      margin-bottom: 1rem;
      border-bottom: 1px solid var(--glass-border);
      position: sticky;
      top: 60px;
      z-index: 10;
    }
    .date-scroll-container {
      display: flex;
      gap: 1rem;
      overflow-x: auto;
      padding: 0 1rem 0.8rem;
      scroll-behavior: smooth;
      scrollbar-width: thin;
      scrollbar-color: var(--gold-primary) transparent;
    }
    .date-scroll-container::-webkit-scrollbar {
      height: 3px;
    }
    .date-scroll-container::-webkit-scrollbar-thumb {
      background: var(--gold-primary);
      border-radius: 10px;
    }
    .date-item {
      min-width: 65px;
      height: 75px;
      border-radius: 14px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border: 1px solid var(--glass-border);
      transition: all 0.3s ease;
      background: rgba(255, 255, 255, 0.02);
      flex-shrink: 0;
    }
    .date-item:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(212, 175, 55, 0.3);
    }
    .date-item.active {
      background: rgba(212, 175, 55, 0.1);
      border-color: var(--gold-primary);
      box-shadow: 0 5px 15px rgba(212, 175, 55, 0.1);
    }
    .day-name { font-size: 0.6rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
    .day-number { font-size: 1.2rem; font-weight: 800; color: #fff; margin: 1px 0; }
    .month { font-size: 0.6rem; font-weight: 700; color: var(--gold-primary); }
    .active-indicator {
      width: 4px; height: 4px; background: var(--gold-primary); border-radius: 50%;
      margin-top: 4px; opacity: 0; transition: opacity 0.3s;
    }
    .date-item.active .active-indicator { opacity: 1; }
  `
})
export class DateSelector implements OnInit {
  @Input() selectedId: number = 1;
  @Output() dateSelected = new EventEmitter<number>();

  fixtureDays: FixtureDay[] = [];

  ngOnInit() {
    this.generateDays();
  }

  generateDays() {
    const startDate = new Date('2026-06-11T12:00:00Z');
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    const monthNames = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

    const excludeDates = [
      '2026-07-08',
      '2026-07-12',
      '2026-07-13',
      '2026-07-16',
      '2026-07-17'
    ];

    for (let i = 0; i < 39; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      
      const dateKey = d.toISOString().split('T')[0];
      if (excludeDates.includes(dateKey)) continue;

      this.fixtureDays.push({
        id: i + 1,
        dayName: dayNames[d.getUTCDay()],
        dayNumber: d.getUTCDate().toString(),
        month: monthNames[d.getUTCMonth()]
      });
    }
  }

  selectDay(id: number) {
    this.selectedId = id;
    this.dateSelected.emit(id);
  }
}
