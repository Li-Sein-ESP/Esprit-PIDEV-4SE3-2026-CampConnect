import { TestBed, ComponentFixture } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BookingManagementComponent } from './booking-management.component';
import { ReservationService } from '../../../core/services/reservation.service';
import { AuthService } from '../../../core/services/auth.service';
import { of } from 'rxjs';
import { ReservationStatus } from '../../../core/models/reservation.model';

describe('BookingManagementComponent', () => {
    let component: BookingManagementComponent;
    let fixture: ComponentFixture<BookingManagementComponent>;
    let reservationService: jasmine.SpyObj<ReservationService>;
    let authService: jasmine.SpyObj<AuthService>;

    const mockReservations = [
        {
            id: '1',
            targetId: 'Campsite A',
            startDate: new Date(Date.now() + 86400000).toISOString(), // Demain
            endDate: new Date(Date.now() + 172800000).toISOString(),
            status: ReservationStatus.CONFIRMED,
            userId: 'user-1'
        },
        {
            id: '2',
            targetId: 'Campsite B',
            startDate: new Date(Date.now() - 172800000).toISOString(), // Hier
            endDate: new Date(Date.now() - 86400000).toISOString(),
            status: ReservationStatus.COMPLETED,
            userId: 'user-1'
        }
    ];

    beforeEach(async () => {
        const resSpy = jasmine.createSpyObj('ReservationService', ['getUserReservations']);
        const authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);

        await TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                RouterTestingModule,
                BookingManagementComponent // Composant standalone
            ],
            providers: [
                { provide: ReservationService, useValue: resSpy },
                { provide: AuthService, useValue: authSpy }
            ]
        }).compileComponents();

        reservationService = TestBed.inject(ReservationService) as jasmine.SpyObj<ReservationService>;
        authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

        authService.getCurrentUser.and.returnValue(of({ id: 'user-1', username: 'test' } as any));
        reservationService.getUserReservations.and.returnValue(of(mockReservations as any));

        fixture = TestBed.createComponent(BookingManagementComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('doit charger les réservations au démarrage', () => {
        expect(component.reservations.length).toBe(2);
        expect(reservationService.getUserReservations).toHaveBeenCalled();
    });

    it('doit filtrer les réservations "À venir" (Upcoming)', () => {
        component.setFilter('upcoming');
        const filtered = component.filteredBookings;
        expect(filtered.length).toBe(1);
        expect(filtered[0].id).toBe('1');
    });

    it('doit filtrer les réservations "Passées" (Past)', () => {
        component.setFilter('past');
        const filtered = component.filteredBookings;
        expect(filtered.length).toBe(1);
        expect(filtered[0].id).toBe('2');
    });

    it('doit filtrer par recherche textuelle (Search)', () => {
        component.onSearch({ target: { value: 'Campsite B' } });
        const filtered = component.filteredBookings;
        expect(filtered.length).toBe(1);
        expect(filtered[0].targetId).toBe('Campsite B');
    });
});
