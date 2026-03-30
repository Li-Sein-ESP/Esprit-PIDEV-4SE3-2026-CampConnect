import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { DynamicCalendar } from './dynamic-calendar';

describe('DynamicCalendar', () => {
  let component: DynamicCalendar;
  let fixture: ComponentFixture<DynamicCalendar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicCalendar],
      providers: [provideRouter([])]
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
