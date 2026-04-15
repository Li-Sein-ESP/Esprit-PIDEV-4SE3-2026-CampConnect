import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicCalendar } from './dynamic-calendar';

describe('DynamicCalendar', () => {
  let component: DynamicCalendar;
  let fixture: ComponentFixture<DynamicCalendar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicCalendar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DynamicCalendar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
