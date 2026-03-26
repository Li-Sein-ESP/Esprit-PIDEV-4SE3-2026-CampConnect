import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyTripsComponent } from './my-trips.component';
import { TripService } from '../../core/services/trip.service';
import { of } from 'rxjs';
import { LucideAngularModule, Calendar, MapPin, Users, Plus, Edit, Trash2 } from 'lucide-angular';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../shared/components/modal/modal.component';

describe('MyTripsComponent', () => {
  let component: MyTripsComponent;
  let fixture: ComponentFixture<MyTripsComponent>;
  let mockTripService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockTripService = {
      getTrips: jasmine.createSpy('getTrips').and.returnValue(of([
        { id: '1', destination: 'Alps', startDate: '2026-06-01', endDate: '2026-06-10', difficulty: 'Moderate' }
      ])),
      deleteTrip: jasmine.createSpy('deleteTrip').and.returnValue(of(null)),
      updateTrip: jasmine.createSpy('updateTrip').and.returnValue(of({ id: '1', destination: 'Alps Updated' }))
    };
    mockRouter = { navigate: jasmine.createSpy('navigate') };

    await TestBed.configureTestingModule({
      imports: [
        MyTripsComponent,
        FormsModule,
        LucideAngularModule.pick({ Calendar, MapPin, Users, Plus, Edit, Trash2 }),
        ModalComponent
      ],
      providers: [
        { provide: TripService, useValue: mockTripService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyTripsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load trips on init', () => {
    expect(mockTripService.getTrips).toHaveBeenCalled();
    expect(component.trips.length).toBe(1);
  });

  it('should open edit modal when editTrip is called', () => {
    const trip = component.trips[0];
    component.editTrip(trip);
    expect(component.showEditModal).toBeTrue();
    expect(component.editingTrip.id).toBe(trip.id);
  });

  it('should call deleteTrip when onDelete is confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.deleteTrip('1');
    expect(mockTripService.deleteTrip).toHaveBeenCalledWith('1');
  });
});
