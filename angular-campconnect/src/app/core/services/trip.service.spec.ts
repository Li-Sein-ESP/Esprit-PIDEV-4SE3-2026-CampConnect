import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TripService, Trip } from './trip.service';
import { environment } from '../../../environments/environment';

describe('TripService', () => {
    let service: TripService;
    let httpMock: HttpTestingController;

    const mockTrips: Trip[] = [
        { id: 'trip-1', title: 'Yosemite Valley Adventure', destination: { address: 'Yosemite' }, startDate: '2026-06-01', endDate: '2026-06-07', status: 'planned', participants: 4, userId: 'user-1' },
        { id: 'trip-2', title: 'Alpine Trekking', destination: { address: 'Alps' }, startDate: '2026-07-15', endDate: '2026-07-22', status: 'planned', participants: 2, userId: 'user-1' }
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [TripService]
        });
        service = TestBed.inject(TripService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should fetch trips from API', () => {
        service.getTrips().subscribe(trips => {
            expect(trips.length).toBe(2);
            expect(trips[0].title).toBe('Yosemite Valley Adventure');
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/trips`);
        expect(req.request.method).toBe('GET');
        req.flush(mockTrips);
    });

    it('should get trip by id', () => {
        service.getTripById('trip-1').subscribe(trip => {
            expect(trip.id).toBe('trip-1');
            expect(trip.title).toBe('Yosemite Valley Adventure');
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/trips/trip-1`);
        expect(req.request.method).toBe('GET');
        req.flush(mockTrips[0]);
    });

    it('should create a new trip', () => {
        const newTripData = { title: 'New Test Trip' };
        const createdResponse = { id: 'trip-999', title: 'New Test Trip' } as Trip;

        service.createTrip(newTripData).subscribe(trip => {
            expect(trip.title).toBe('New Test Trip');
            expect(trip.id).toBe('trip-999');
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/trips`);
        expect(req.request.method).toBe('POST');
        req.flush(createdResponse);
    });
});
