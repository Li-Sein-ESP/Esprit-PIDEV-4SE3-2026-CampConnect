import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanionProfileForm } from './companion-profile-form';

describe('CompanionProfileForm', () => {
  let component: CompanionProfileForm;
  let fixture: ComponentFixture<CompanionProfileForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanionProfileForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanionProfileForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
