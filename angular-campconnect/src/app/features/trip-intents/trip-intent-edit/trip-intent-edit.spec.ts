import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripIntentEdit } from './trip-intent-edit';

describe('TripIntentEdit', () => {
  let component: TripIntentEdit;
  let fixture: ComponentFixture<TripIntentEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripIntentEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TripIntentEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
