import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { Course, Badge, Certification, UserCertification, Video, CertificationStats } from '../models/academy.model';

import { environment } from '../../../../environments/environment';

const API_URL = `${environment.apiUrl}/academy`;

@Injectable({
    providedIn: 'root'
})
export class AcademyService {
    private coursesCache = signal<Course[]>([]);
    private badgesCache = signal<Badge[]>([]);

    constructor(private http: HttpClient) { }

    // ─── FIle Uploads ───
    uploadFile(file: File): Observable<{ url: string }> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<{ url: string }>(`${environment.apiUrl}/upload`, formData);
    }

    // ─── Courses ───
    getCourses(): Observable<Course[]> {
        return this.http.get<Course[]>(`${API_URL}/courses`).pipe(
            map(courses => courses.map(c => ({
                ...c,
                imageUrl: this.normalizeUrl(c.imageUrl),
                documentUrl: this.normalizeUrl(c.documentUrl)
            }))),
            tap(courses => this.coursesCache.set(courses))
        );
    }

    getCourseById(id: string): Observable<Course> {
        return this.http.get<Course>(`${API_URL}/courses/${id}`).pipe(
            map(c => ({
                ...c,
                imageUrl: this.normalizeUrl(c.imageUrl),
                documentUrl: this.normalizeUrl(c.documentUrl)
            }))
        );
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

    updateCourseStatus(id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED'): Observable<Course> {
        return this.http.patch<Course>(`${API_URL}/courses/${id}/status`, {}, { params: { status } });
    }

    generateCourseQuiz(courseId: string): Observable<any> {
        return this.http.post<any>(`${API_URL}/courses/${courseId}/generate-quiz`, {});
    }

    generateAiQuiz(topic: string, description: string): Observable<any> {
        return this.http.post<any>(`${environment.aiUrl}/quiz/generate`, { topic, description });
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

    searchCertifications(keyword: string): Observable<Certification[]> {
        return this.http.get<Certification[]>(`${API_URL}/certifications/search`, { params: { q: keyword } });
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

    getCertificationByCourseId(courseId: string): Observable<Certification> {
        return this.http.get<Certification>(`${API_URL}/certifications/by-course/${courseId}`);
    }

    // ─── User Certifications ───
    getUserCertifications(userId: string): Observable<UserCertification[]> {
        return this.http.get<UserCertification[]>(`${API_URL}/users/${userId}/certifications`).pipe(
            map(certs => certs.map(c => ({
                ...c,
                id: (c as any)._id || c.id
            })))
        );
    }

    earnCertification(userCert: UserCertification): Observable<UserCertification> {
        return this.http.post<UserCertification>(`${API_URL}/users/certifications`, userCert).pipe(
            map(c => ({
                ...c,
                id: (c as any)._id || c.id
            }))
        );
    }

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
            { params: { status, t: new Date().getTime().toString() } }
        );
    }

    // ─── Videos ───
    public normalizeUrl(url: string | undefined): string {
        if (!url) return '';
        if (url.startsWith('http')) return url;

        const urlObj = new URL(environment.apiUrl);
        const backendBase = `${urlObj.protocol}//${urlObj.host}`;
        const timestamp = new Date().getTime();

        // If it contains /uploads/, extract filename and reconstruct with current backend host
        if (url.includes('/uploads/')) {
            const pathParts = url.split('/uploads/');
            const filename = pathParts[pathParts.length - 1];
            return `${backendBase}/uploads/${filename}?t=${timestamp}`;
        }

        // If it's just a filename (no slash, no http), assume it's in /uploads/
        if (!url.includes('/')) {
            return `${backendBase}/uploads/${url}?t=${timestamp}`;
        }

        return url;
    }

    getVideos(): Observable<Video[]> {
        return this.http.get<Video[]>(`${API_URL}/videos`).pipe(
            map(videos => videos.map(v => ({
                ...v,
                id: (v as any)._id || v.id,
                videoUrl: this.normalizeUrl(v.videoUrl),
                thumbnailUrl: this.normalizeUrl(v.thumbnailUrl)
            })))
        );
    }

    getVideoById(id: string): Observable<Video> {
        return this.http.get<Video>(`${API_URL}/videos/${id}`).pipe(
            map(v => ({
                ...v,
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
