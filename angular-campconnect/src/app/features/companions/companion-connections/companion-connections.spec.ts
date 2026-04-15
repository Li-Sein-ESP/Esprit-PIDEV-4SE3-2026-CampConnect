import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanionConnections } from './companion-connections';

describe('CompanionConnections', () => {
  let component: CompanionConnections;
  let fixture: ComponentFixture<CompanionConnections>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanionConnections]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanionConnections);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
