import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TripService, Trip } from './trip.service';

describe('TripService', () => {
  let service: TripService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TripService]
    });
    service = TestBed.inject(TripService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should format and return mock trips initially', (done) => {
    service.getTrips().subscribe(trips => {
      expect(trips.length).toBe(3); // Based on getMockTrips()
      expect(trips[0].name).toBe('Yosemite Valley Adventure');
      done();
    });
  });

  it('should return a trip by id', fakeAsync(() => {
    let result: Trip | undefined;
    service.getTripById('trip-1').subscribe(trip => {
      result = trip;
    });
    
    // Simulate the 300ms delay in the service
    tick(300);
    
    expect(result).toBeDefined();
    expect(result?.id).toBe('trip-1');
  }));

  it('should create a new trip', fakeAsync(() => {
    const newTrip = {
      name: 'New Test Trip',
      destination: 'Test City',
      startDate: '2026-01-01',
      endDate: '2026-01-05',
      status: 'draft' as const,
      image: '',
      groupSize: 2,
      activities: [],
      packingProgress: 0,
      budgetSpent: 0,
      budgetTotal: 100
    };

    let createdTrip: Trip | undefined;
    service.createTrip(newTrip).subscribe(trip => {
      createdTrip = trip;
    });

    // Simulate 500ms delay
    tick(500);

    expect(createdTrip).toBeDefined();
    expect(createdTrip?.name).toBe('New Test Trip');
    expect(createdTrip?.id).toMatch(/^trip-\d+$/);
    
    // Verify it was added to the state
    service.getTrips().subscribe(trips => {
      expect(trips.length).toBe(4);
    });
  }));

  it('should delete a trip', fakeAsync(() => {
    let success = false;
    service.deleteTrip('trip-1').subscribe(res => {
      success = res;
    });

    tick(500);

    expect(success).toBeTrue();
    service.getTrips().subscribe(trips => {
      expect(trips.length).toBe(2);
      expect(trips.find(t => t.id === 'trip-1')).toBeUndefined();
    });
  }));
});
