import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { Course, Badge, Certification, UserCertification, Video } from '../models/academy.model';

const API_URL = 'http://localhost:8081/api/academy';

@Injectable({
    providedIn: 'root'
})
export class AcademyService {
    private coursesCache = signal<Course[]>([]);
    private badgesCache = signal<Badge[]>([]);

    constructor(private http: HttpClient) { }

    // ─── Courses ───
    getCourses(): Observable<Course[]> {
        return this.http.get<Course[]>(`${API_URL}/courses`).pipe(
            tap(courses => this.coursesCache.set(courses))
        );
    }

    getCourseById(id: string): Observable<Course> {
        return this.http.get<Course>(`${API_URL}/courses/${id}`);
    }

    createCourse(course: Course): Observable<Course> {
        return this.http.post<Course>(`${API_URL}/courses`, course);
    }

    updateCourse(id: string, course: Course): Observable<Course> {
        return this.http.put<Course>(`${API_URL}/courses/${id}`, course);
    }

    deleteCourse(id: string): Observable<void> {
        return this.http.delete<void>(`${API_URL}/courses/${id}`);
    }

    // ─── Experts ───
    getExperts(): Observable<any[]> {
        return this.http.get<any[]>(`${API_URL}/experts`);
    }

    // ─── Badges ───
    getBadges(): Observable<Badge[]> {
        return this.http.get<Badge[]>(`${API_URL}/badges`).pipe(
            tap(badges => this.badgesCache.set(badges))
        );
    }

    getBadgeById(id: string): Observable<Badge> {
        return this.http.get<Badge>(`${API_URL}/badges/${id}`);
    }

    createBadge(badge: Badge): Observable<Badge> {
        return this.http.post<Badge>(`${API_URL}/badges`, badge);
    }

    updateBadge(id: string, badge: Badge): Observable<Badge> {
        return this.http.put<Badge>(`${API_URL}/badges/${id}`, badge);
    }

    deleteBadge(id: string): Observable<void> {
        return this.http.delete<void>(`${API_URL}/badges/${id}`);
    }

    // ─── Certifications ───
    getCertifications(): Observable<Certification[]> {
        return this.http.get<Certification[]>(`${API_URL}/certifications`);
    }

    getCertificationById(id: string): Observable<Certification> {
        return this.http.get<Certification>(`${API_URL}/certifications/${id}`);
    }

    createCertification(cert: Certification): Observable<Certification> {
        return this.http.post<Certification>(`${API_URL}/certifications`, cert);
    }

    updateCertification(id: string, cert: Certification): Observable<Certification> {
        return this.http.put<Certification>(`${API_URL}/certifications/${id}`, cert);
    }

    deleteCertification(id: string): Observable<void> {
        return this.http.delete<void>(`${API_URL}/certifications/${id}`);
    }

    // ─── User Certifications ───
    getUserCertifications(userId: string): Observable<UserCertification[]> {
        return this.http.get<UserCertification[]>(`${API_URL}/users/${userId}/certifications`);
    }

    earnCertification(userCert: UserCertification): Observable<UserCertification> {
        return this.http.post<UserCertification>(`${API_URL}/users/certifications`, userCert);
    }

    // ─── Videos ───
    getVideos(): Observable<Video[]> {
        return this.http.get<Video[]>(`${API_URL}/videos`).pipe(
            map(videos => videos.map(v => ({ ...v, id: (v as any)._id || v.id })))
        );
    }

    getVideoById(id: string): Observable<Video> {
        return this.http.get<Video>(`${API_URL}/videos/${id}`).pipe(
            map(v => ({ ...v, id: (v as any)._id || v.id }))
        );
    }

    createVideo(video: Partial<Video>): Observable<Video> {
        return this.http.post<Video>(`${API_URL}/videos`, video);
    }

    updateVideo(id: string, video: Partial<Video>): Observable<Video> {
        return this.http.put<Video>(`${API_URL}/videos/${id}`, video);
    }

    deleteVideo(id: string): Observable<void> {
        return this.http.delete<void>(`${API_URL}/videos/${id}`);
    }

    getVideosByCategory(category: string): Observable<Video[]> {
        return this.http.get<Video[]>(`${API_URL}/videos/category/${category}`);
    }
}
