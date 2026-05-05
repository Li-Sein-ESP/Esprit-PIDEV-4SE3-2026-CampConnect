import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TripIntentEditComponent } from './trip-intent-edit';
import { TripIntentService } from '../services/trip-intent.service';
import { AuthService } from '../../../core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('TripIntentEditComponent', () => {
  let component: TripIntentEditComponent;
  let fixture: ComponentFixture<TripIntentEditComponent>;
  let tripIntentService: jasmine.SpyObj<TripIntentService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    tripIntentService = jasmine.createSpyObj('TripIntentService', ['getTripIntentById', 'updateTripIntent']);
    authService = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [TripIntentEditComponent],
      providers: [
        { provide: TripIntentService, useValue: tripIntentService },
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: () => '123' })
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    authService.getCurrentUser.and.returnValue(of({ id: 'user-1' } as any));
    tripIntentService.getTripIntentById.and.returnValue(of({ id: '123', creatorUserId: 'user-1', title: 'Test Intent' } as any));

    fixture = TestBed.createComponent(TripIntentEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('devrait créer le composant', () => {
    expect(component).toBeTruthy();
  });
});
