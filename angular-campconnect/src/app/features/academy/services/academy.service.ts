import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
<<<<<<< HEAD
import { Course, Badge, Certification, UserCertification, Video } from '../models/academy.model';

const API_URL = 'http://localhost:8080/api/academy';
=======
import { Course, Badge, Certification, UserCertification, Video, CertificationStats } from '../models/academy.model';

import { environment } from '../../../../environments/environment';

const API_URL = `${environment.apiUrl}/academy`;
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)

@Injectable({
    providedIn: 'root'
})
export class AcademyService {
    private coursesCache = signal<Course[]>([]);
    private badgesCache = signal<Badge[]>([]);

    constructor(private http: HttpClient) { }

    // ─── FIle Uploads ───
<<<<<<< HEAD
    uploadFile(file: File): Observable<{url: string}> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<{url: string}>(`http://localhost:8080/api/upload`, formData);
=======
    uploadFile(file: File): Observable<{ url: string }> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<{ url: string }>(`${environment.apiUrl}/upload`, formData);
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
    }

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

<<<<<<< HEAD
=======
    getCertificationByCourseId(courseId: string): Observable<Certification> {
        return this.http.get<Certification>(`${API_URL}/certifications/by-course/${courseId}`);
    }

>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
    // ─── User Certifications ───
    getUserCertifications(userId: string): Observable<UserCertification[]> {
        return this.http.get<UserCertification[]>(`${API_URL}/users/${userId}/certifications`);
    }

    earnCertification(userCert: UserCertification): Observable<UserCertification> {
        return this.http.post<UserCertification>(`${API_URL}/users/certifications`, userCert);
    }

<<<<<<< HEAD
    // ─── Videos ───
    private normalizeUrl(url: string | undefined): string {
        if (!url) return '';
        
        const host = window.location.hostname;
        const backendBase = `http://${host}:8080`;
=======
    /**
     * TÂCHE 2 – Complex aggregation (equivalent to JPQL JOIN with GROUP BY).
     * Calls GET /api/academy/certifications/stats
     * Returns statistics per certification: total issued, active count, expired count.
     * Used by the Admin Analytics Dashboard.
     */
    getCertificationStats(): Observable<CertificationStats[]> {
        return this.http.get<CertificationStats[]>(`${API_URL}/certifications/stats`);
    }

    /**
     * TÂCHE 3 – Keyword query involving more than one entity (User + CertificationStatus).
     * Calls GET /api/academy/users/{userId}/certifications/filter?status={status}
     * Spring Data generates: { "user.$id": ObjectId(userId), "status": status }
     * Traverses the User @DBRef AND filters on CertificationStatus simultaneously.
     */
    getUserCertificationsByStatus(userId: string, status: string): Observable<UserCertification[]> {
        return this.http.get<UserCertification[]>(
            `${API_URL}/users/${userId}/certifications/filter`,
            { params: { status } }
        );
    }

    // ─── Videos ───
    private normalizeUrl(url: string | undefined): string {
        if (!url) return '';

        const host = window.location.hostname;
        // Assuming environment.apiUrl is like 'http://localhost:8089/api'
        // we want to get the base without the /api part for static files if needed
        const urlObj = new URL(environment.apiUrl);
        const backendBase = `${urlObj.protocol}//${urlObj.host}`;
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
        const timestamp = new Date().getTime();

        // If it's a relative path OR it's an absolute path containing /uploads/
        // we force it to use the current host's backend port
        if (url.includes('/uploads/')) {
            const pathParts = url.split('/uploads/');
            const filename = pathParts[pathParts.length - 1];
            return `${backendBase}/uploads/${filename}?t=${timestamp}`;
        }

        return url;
    }

    getVideos(): Observable<Video[]> {
        return this.http.get<Video[]>(`${API_URL}/videos`).pipe(
<<<<<<< HEAD
            map(videos => videos.map(v => ({ 
                ...v, 
=======
            map(videos => videos.map(v => ({
                ...v,
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
                id: (v as any)._id || v.id,
                videoUrl: this.normalizeUrl(v.videoUrl),
                thumbnailUrl: this.normalizeUrl(v.thumbnailUrl)
            })))
        );
    }

    getVideoById(id: string): Observable<Video> {
        return this.http.get<Video>(`${API_URL}/videos/${id}`).pipe(
<<<<<<< HEAD
            map(v => ({ 
                ...v, 
=======
            map(v => ({
                ...v,
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
                id: (v as any)._id || v.id,
                videoUrl: this.normalizeUrl(v.videoUrl),
                thumbnailUrl: this.normalizeUrl(v.thumbnailUrl)
            }))
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

    addVideoComment(videoId: string, content: string): Observable<any> {
        return this.http.post<any>(`${API_URL}/videos/${videoId}/comments`, { content });
    }

    toggleVideoHelpful(videoId: string): Observable<Video> {
        return this.http.post<Video>(`${API_URL}/videos/${videoId}/helpful`, {});
    }
}
