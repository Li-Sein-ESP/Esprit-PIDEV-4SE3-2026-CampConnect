import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CompanionsLayout } from './companions-layout';

describe('CompanionsLayout', () => {
  let component: CompanionsLayout;
  let fixture: ComponentFixture<CompanionsLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanionsLayout],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanionsLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
