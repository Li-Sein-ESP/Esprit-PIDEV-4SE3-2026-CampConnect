import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { CamperProfileComponent } from './camper-profile.component';
import { UserApiService } from '../services/user-api.service';
import { GroupInviteService } from '../../groups/services/group-invite.service';
import { AuthService } from '../../../core/services/auth.service';

describe('CamperProfileComponent', () => {
  let component: CamperProfileComponent;
  let fixture: ComponentFixture<CamperProfileComponent>;
  let userApi: jasmine.SpyObj<UserApiService>;
  let inviteService: jasmine.SpyObj<GroupInviteService>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    userApi = jasmine.createSpyObj('UserApiService', ['getProfile', 'getUserStats']);
    inviteService = jasmine.createSpyObj('GroupInviteService', ['getPendingInvitesCount']);
    authService = jasmine.createSpyObj('AuthService', ['getCurrentUser']);

    userApi.getProfile.and.returnValue(of({
      id: 'user-1',
      username: 'camper',
      name: 'Camper One',
      roles: ['ROLE_CAMPER'],
      profileDetails: { bio: 'Bio text' }
    } as any));
    userApi.getUserStats.and.returnValue(of({
      tripsCompleted: 4,
      campsitesVisited: 7,
      reviewsGiven: 2,
      gearRented: 3
    } as any));
    authService.getCurrentUser.and.returnValue(of({ id: 'user-1' } as any));
    inviteService.getPendingInvitesCount.and.returnValue(of(1));

    await TestBed.configureTestingModule({
      imports: [CamperProfileComponent],
      providers: [
        provideRouter([]),
        { provide: UserApiService, useValue: userApi },
        { provide: GroupInviteService, useValue: inviteService },
        { provide: AuthService, useValue: authService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CamperProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load profile and stats on init', () => {
    expect(component.user.name).toBe('Camper One');
    expect(component.user.role).toBe('CAMPER');
    expect(component.user.stats.campsitesVisited).toBe(7);
    expect(component.loading).toBeFalse();
  });

  it('should switch tabs', () => {
    component.setActiveTab('reviews');
    expect(component.activeTab).toBe('reviews');
  });

  it('should handle profile load error', () => {
    userApi.getProfile.and.returnValue(throwError(() => new Error('fail')));

    component.ngOnInit();

    expect(component.error).toBe('Failed to load profile.');
    expect(component.loading).toBeFalse();
  });
});
