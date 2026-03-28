import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportCenter } from './report-center';

describe('ReportCenter', () => {
  let component: ReportCenter;
  let fixture: ComponentFixture<ReportCenter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportCenter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportCenter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
