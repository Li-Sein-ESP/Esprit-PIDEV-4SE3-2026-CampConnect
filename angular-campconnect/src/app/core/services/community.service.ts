import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Post, Comment } from '../../features/community/models/community.model';

@Injectable({
    providedIn: 'root'
})
export class CommunityService {
    private apiThreadsUrl = 'http://localhost:8081/api/threads';
    private apiPostsUrl = 'http://localhost:8081/api/posts';
    private apiCommentsUrl = 'http://localhost:8081/api/comments';

    constructor(private http: HttpClient) { }

    getPosts(): Observable<Post[]> {
        return this.http.get<any[]>(this.apiThreadsUrl).pipe(
            map(threads => threads.map(t => this.mapToPost(t)))
        );
    }

    getPostById(id: string): Observable<Post> {
        return this.http.get<any>(`${this.apiThreadsUrl}/${id}`).pipe(
            map(t => this.mapToPost(t))
        );
    }

    private mapToPost(thread: any): Post {
        return {
            id: thread.id,
            title: thread.title,
            content: thread.description,
            author: {
                id: thread.authorId || '0',
                username: thread.authorUsername || ('user_' + thread.authorId),
                name: thread.authorName || 'Explorer',
                avatar: `https://ui-avatars.com/api/?name=${thread.authorName || 'User'}&background=2f5d44&color=fff`,
                role: 'Camper',
                trustScore: 85
            },
            category: thread.category || 'General',
            tags: thread.tags || [],
            createdAt: thread.createdAt,
            likes: thread.likes || 0,
            comments: [], // Initialized as array to support reactive updates
            views: thread.views || 0,
            isLiked: false,
            isBookmarked: false,
            isPinned: false,
            status: 'active',
            location: 'Wilderness Area' // Default location for UI
        };
    }

    getRepliesByPostId(postId: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiPostsUrl}/thread/${postId}`);
    }

    createPost(post: any): Observable<any> {
        return this.http.post<any>(this.apiThreadsUrl, post);
    }

    createReply(reply: any): Observable<any> {
        return this.http.post<any>(this.apiPostsUrl, reply);
    }

    likePost(postId: string): Observable<any> {
        // In a more complex app, this would be a specialized endpoint
        // For now, we fetch, increment, and save back or assume backend handles it.
        // Assuming we just want to trigger a 'like' logic.
        return this.http.put<any>(`${this.apiThreadsUrl}/${postId}/like`, {});
    }

    recordView(postId: string): Observable<any> {
        return this.http.put<any>(`${this.apiThreadsUrl}/${postId}/view`, {});
    }

    updatePost(id: string, post: any): Observable<any> {
        return this.http.put<any>(`${this.apiThreadsUrl}/${id}`, post);
    }

    deletePost(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiThreadsUrl}/${id}`);
    }
}
