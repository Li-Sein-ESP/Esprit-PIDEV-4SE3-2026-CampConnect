import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupDashboardComponent } from './group-dashboard.component';
import { GroupService } from '../services/group';
import { AuthService } from '../../../core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('GroupDashboardComponent', () => {
    let component: GroupDashboardComponent;
    let fixture: ComponentFixture<GroupDashboardComponent>;
    let groupService: jasmine.SpyObj<GroupService>;
    let authService: jasmine.SpyObj<AuthService>;
    let router: jasmine.SpyObj<Router>;

    const mockGroupDetail = {
        id: 'group-1',
        name: 'Voyage Test',
        status: 'ACTIVE',
        tripId: 'trip-1',
        members: [{ id: 'user-1', name: 'Alice' }]
    };

    beforeEach(async () => {
        groupService = jasmine.createSpyObj('GroupService', ['getGroupDetail', 'updateGroup', 'deleteGroup', 'leaveGroup']);
        authService = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
        router = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [GroupDashboardComponent, ReactiveFormsModule],
            providers: [
                FormBuilder,
                { provide: GroupService, useValue: groupService },
                { provide: AuthService, useValue: authService },
                { provide: Router, useValue: router },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            paramMap: {
                                get: (key: string) => 'group-1'
                            }
                        }
                    }
                }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        })
        .compileComponents();
    });

    beforeEach(() => {
        authService.getCurrentUser.and.returnValue(of({ id: 'user-1' } as any));
        groupService.getGroupDetail.and.returnValue(of(mockGroupDetail as any));

        // Mock router url
        Object.defineProperty(router, 'url', { get: () => '/groups/group-1/chat' });

        fixture = TestBed.createComponent(GroupDashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('devrait créer le composant', () => {
        expect(component).toBeTruthy();
    });

    it('devrait charger les détails du groupe à l\'initialisation', () => {
        expect(groupService.getGroupDetail).toHaveBeenCalledWith('group-1');
        expect(component.group).toEqual(mockGroupDetail as any);
        expect(component.loading).toBeFalse();
    });

    it('devrait initialiser le formulaire du groupe avec les données', () => {
        expect(component.groupForm.value.name).toBe('Voyage Test');
        expect(component.groupForm.value.status).toBe('ACTIVE');
    });

    it('devrait changer l\'onglet actif', () => {
        component.switchTab('expenses');
        expect(component.activeTab).toBe('expenses');
    });

    it('ne devrait pas mettre à jour le groupe si le formulaire est invalide', () => {
        component.groupForm.controls['name'].setValue('');
        component.onUpdateGroup();
        expect(groupService.updateGroup).not.toHaveBeenCalled();
    });

    it('devrait mettre à jour le groupe si le formulaire est valide', () => {
        groupService.updateGroup.and.returnValue(of({ name: 'Nouveau Nom', status: 'ACTIVE' } as any));
        component.groupForm.controls['name'].setValue('Nouveau Nom');
        
        component.onUpdateGroup();

        expect(groupService.updateGroup).toHaveBeenCalledWith('group-1', jasmine.any(Object));
        expect(component.group?.name).toBe('Nouveau Nom');
        expect(component.updateMessage).toBe('Groupe mis à jour avec succès !');
        expect(component.isUpdating).toBeFalse();
    });
});
