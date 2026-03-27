import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AcademyService } from './academy.service';

describe('AcademyService', () => {
  let service: AcademyService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AcademyService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(AcademyService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve all courses', () => {
    const mockCourses = [{ id: '1', title: 'Test Course 1' }, { id: '2', title: 'Test Course 2' }];
    
    service.getCourses().subscribe(courses => {
      expect(courses.length).toBe(2);
      expect(courses).toEqual(mockCourses as any);
    });

    const req = httpTestingController.expectOne('http://localhost:8081/api/academy/courses');
    expect(req.request.method).toBe('GET');
    req.flush(mockCourses);
  });

  it('should create a course', () => {
    const newCourse = { title: 'New Course' };
    const mockResponse = { id: '123', ...newCourse };

    service.createCourse(newCourse as any).subscribe(course => {
      expect(course.id).toBe('123');
      expect(course.title).toBe('New Course');
    });

    const req = httpTestingController.expectOne('http://localhost:8081/api/academy/courses');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should delete a course', () => {
    service.deleteCourse('1').subscribe(res => {
      expect(res).toBeNull();
    });

    const req = httpTestingController.expectOne('http://localhost:8081/api/academy/courses/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
