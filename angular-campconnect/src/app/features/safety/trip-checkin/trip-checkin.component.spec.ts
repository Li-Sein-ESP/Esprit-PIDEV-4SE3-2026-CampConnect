import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TripCheckinComponent } from './trip-checkin.component';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('TripCheckinComponent', () => {
  let component: TripCheckinComponent;
  let fixture: ComponentFixture<TripCheckinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TripCheckinComponent, FormsModule ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { params: of({}) }
        }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TripCheckinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with mock trips and contacts', () => {
    expect(component.trips.length).toBe(3);
    expect(component.contacts.length).toBe(2);
  });

  it('should update trip status to checked-in when checkInNow is called', () => {
    // Action
    component.checkInNow('3'); // Trip 3 is initially pending
    
    // Assertion
    const updatedTrip = component.trips.find(t => t.id === '3');
    expect(updatedTrip).toBeDefined();
    expect(updatedTrip?.status).toBe('checked-in');
    expect(updatedTrip?.lastCheckedIn).toBe('Just now');
  });

  it('should add a new contact when form is valid', () => {
    component.newContact = {
      name: 'Test Setup',
      relationship: 'Friend',
      phone: '123-456-7890',
      email: 'test@email.com'
    };
    
    component.submitNewContact();
    
    expect(component.contacts.length).toBe(3);
    expect(component.contacts[2].name).toBe('Test Setup');
    // Ensure the modal was closed and form reset
    expect(component.showAddContactModal).toBeFalse();
    expect(component.newContact.name).toBe('');
  });

  it('should not add a contact if form is incomplete', () => {
    component.newContact = {
       name: 'Incomplete', 
       relationship: '', 
       phone: '', 
       email: '' 
    };
    
    component.submitNewContact();
    
    // Original contacts length is 2
    expect(component.contacts.length).toBe(2); 
  });
});
