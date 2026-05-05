import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpatialMap } from './spatial-map';

describe('SpatialMap', () => {
  let component: SpatialMap;
  let fixture: ComponentFixture<SpatialMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpatialMap]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpatialMap);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
