import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface FixtureDay {
  /** Fecha local YYYY-MM-DD */
  key: string;
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
          *ngFor="let day of days"
          class="date-item"
          [class.active]="day.key === selectedKey"
          (click)="selectDay(day.key)"
          [id]="'date-' + day.key"
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
export class DateSelector {
  /** Días con partidos (los arma la pantalla de partidos desde el fixture real) */
  @Input() days: FixtureDay[] = [];
  @Input() selectedKey = '';
  @Output() dateSelected = new EventEmitter<string>();

  selectDay(key: string) {
    this.selectedKey = key;
    this.dateSelected.emit(key);
  }
}
