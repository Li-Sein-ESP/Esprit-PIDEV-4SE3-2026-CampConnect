import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrustScore } from './trust-score';

describe('TrustScore', () => {
  let component: TrustScore;
  let fixture: ComponentFixture<TrustScore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrustScore]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrustScore);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
