import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateSelector } from './date-selector';

describe('DateSelector', () => {
  let component: DateSelector;
  let fixture: ComponentFixture<DateSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateSelector],
    }).compileComponents();

    fixture = TestBed.createComponent(DateSelector);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
