import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationTimeline } from './reservation-timeline';

describe('ReservationTimeline', () => {
  let component: ReservationTimeline;
  let fixture: ComponentFixture<ReservationTimeline>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationTimeline]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservationTimeline);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
