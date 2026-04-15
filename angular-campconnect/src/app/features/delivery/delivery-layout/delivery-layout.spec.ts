import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryLayout } from './delivery-layout';

describe('DeliveryLayout', () => {
  let component: DeliveryLayout;
  let fixture: ComponentFixture<DeliveryLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveryLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
