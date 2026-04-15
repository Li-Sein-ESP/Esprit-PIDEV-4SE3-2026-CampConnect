import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Post, Comment } from '../models/community.model';

const API_URL = 'http://localhost:8081/api/forum';

@Injectable({
    providedIn: 'root'
})
export class CommunityService {
    private threads = signal<any[]>([]);

    constructor(private http: HttpClient) { }

    // Threads
    getThreads(): Observable<any[]> {
        return this.http.get<any[]>(`${API_URL}/threads`).pipe(
            tap(threads => this.threads.set(threads))
        );
    }

    getThreadById(id: string): Observable<any> {
        return this.http.get<any>(`${API_URL}/threads/${id}`);
    }

    createThread(thread: any): Observable<any> {
        return this.http.post<any>(`${API_URL}/threads`, thread);
    }

    updateThread(id: string, thread: any): Observable<any> {
        return this.http.put<any>(`${API_URL}/threads/${id}`, thread);
    }

    deleteThread(id: string): Observable<void> {
        return this.http.delete<void>(`${API_URL}/threads/${id}`);
    }

    // Posts
    getPostsByThread(threadId: string): Observable<Post[]> {
        return this.http.get<Post[]>(`${API_URL}/threads/${threadId}/posts`);
    }

    createPost(post: Partial<Post>): Observable<Post> {
        return this.http.post<Post>(`${API_URL}/posts`, post);
    }

    updatePost(id: string, post: Partial<Post>): Observable<Post> {
        return this.http.put<Post>(`${API_URL}/posts/${id}`, post);
    }

    deletePost(id: string): Observable<void> {
        return this.http.delete<void>(`${API_URL}/posts/${id}`);
    }

    // Comments
    createComment(comment: Partial<Comment>): Observable<Comment> {
        return this.http.post<Comment>(`${API_URL}/comments`, comment);
    }

    updateComment(id: string, comment: Partial<Comment>): Observable<Comment> {
        return this.http.put<Comment>(`${API_URL}/comments/${id}`, comment);
    }

    deleteComment(id: string): Observable<void> {
        return this.http.delete<void>(`${API_URL}/comments/${id}`);
    }
}
