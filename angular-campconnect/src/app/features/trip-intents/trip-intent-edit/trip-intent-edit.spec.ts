import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TripIntentEditComponent } from './trip-intent-edit';

describe('TripIntentEditComponent', () => {
  let component: TripIntentEditComponent;
  let fixture: ComponentFixture<TripIntentEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripIntentEditComponent],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TripIntentEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
