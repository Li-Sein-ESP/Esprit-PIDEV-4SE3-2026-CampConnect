import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanionDiscovery } from './companion-discovery';

describe('CompanionDiscovery', () => {
  let component: CompanionDiscovery;
  let fixture: ComponentFixture<CompanionDiscovery>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanionDiscovery]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanionDiscovery);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
