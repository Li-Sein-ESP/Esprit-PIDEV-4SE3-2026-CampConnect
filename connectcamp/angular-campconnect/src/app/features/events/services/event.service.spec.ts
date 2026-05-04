import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EventService } from './event.service';

describe('EventService', () => {
  let service: EventService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EventService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(EventService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve events from API', () => {
    const mockEventsResponse = [{ id: 'evt-1', title: 'Test Event', type: 'hike' }];
    
    service.getEvents().subscribe(events => {
      expect(events.length).toBeGreaterThan(0);
      expect(events[0].title).toBe('Test Event');
    });

    const req = httpTestingController.expectOne('http://localhost:8082/api/events');
    expect(req.request.method).toBe('GET');
    req.flush(mockEventsResponse);
  });

  it('should create an event', () => {
    const newEvent = { title: 'New Hike' };
    const mockResponse = { id: 'evt-123', ...newEvent };

    service.createEvent(newEvent as any).subscribe(event => {
      expect(event.id).toBe('evt-123');
      expect(event.title).toBe('New Hike');
    });

    const req = httpTestingController.expectOne('http://localhost:8082/api/events');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should update an event', () => {
    const updatedEvent = { title: 'Updated Hike' };
    const mockResponse = { id: '1', ...updatedEvent };

    service.updateEvent('1', updatedEvent as any).subscribe(event => {
      expect(event.id).toBe('1');
      expect(event.title).toBe('Updated Hike');
    });

    const req = httpTestingController.expectOne('http://localhost:8082/api/events/1');
    expect(req.request.method).toBe('PUT');
    req.flush(mockResponse);
  });

  it('should delete an event', () => {
    service.deleteEvent('1').subscribe(res => {
      expect(res).toBeNull();
    });

    const req = httpTestingController.expectOne('http://localhost:8082/api/events/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
