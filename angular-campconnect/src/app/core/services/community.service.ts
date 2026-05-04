import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Post {
    id: string;
    title: string;
    content: string;
    author: {
        id?: string;
        name: string;
        avatar: string;
        role?: string;
        trustScore?: number;
        badges?: any[];
    };
    category: string;
    tags: string[];
    createdAt: string;
    likes: number;
    replies: number;
    views: number;
    // UI display fields
    media?: string[];
    location?: string;
    timestamp?: string;
    videoLength?: string;
    products?: { icon: string; name: string }[];
    isLiked?: boolean;
    saved?: boolean;
    comments?: any[];
}

export interface Reply {
    id: string;
    postId: string;
    author: {
        id?: string;
        name: string;
        avatar: string;
    };
    content: string;
    createdAt: string;
    likes: number;
}

@Injectable({
    providedIn: 'root'
})
export class CommunityService {
    private apiUrl = `${environment.apiUrl}/posts`;
    private commentsUrl = `${environment.apiUrl}/comments`;

    constructor(private http: HttpClient) {}

    getPosts(filters?: { category?: string; search?: string }): Observable<Post[]> {
        return this.http.get<any[]>(this.apiUrl).pipe(
            map(posts => {
                let mapped = posts.map(p => this.mapBackendToFrontendPost(p));

                if (filters?.category) {
                    mapped = mapped.filter(p => p.category === filters.category);
                }

                if (filters?.search) {
                    const query = filters.search.toLowerCase();
                    mapped = mapped.filter(p => 
                        (p.title && p.title.toLowerCase().includes(query)) || 
                        (p.content && p.content.toLowerCase().includes(query))
                    );
                }

                // Sort newest first
                return mapped.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            })
        );
    }

    getPostById(id: string): Observable<Post | undefined> {
        return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
            map(p => this.mapBackendToFrontendPost(p))
        );
    }

    getRepliesByPostId(postId: string): Observable<Reply[]> {
        return this.http.get<any[]>(`${this.commentsUrl}/post/${postId}`).pipe(
            map(replies => replies.map(r => this.mapBackendToFrontendReply(r)))
        );
    }

    createPost(post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'replies' | 'views'>): Observable<Post> {
        const content = post.content || (post as any).description || '';
        const authorId = post.author?.id || (post as any).authorId;
        const authorName = post.author?.name || (post as any).authorName;
        const authorUsername = (post as any).authorUsername || authorName?.toLowerCase().replace(' ', '');
        const media = post.media || (post as any).imageUrls || (post as any).images || [];
        const payload = {
            title: post.title,
            content: content,
            description: content,
            authorId: authorId,
            authorName: authorName,
            authorUsername: authorUsername,
            tags: post.tags,
            category: post.category,
            location: (post as any).location || '',
            imageUrls: media,
            media: media,
            images: media
        };

        return this.http.post<any>(this.apiUrl, payload).pipe(
            map(p => this.mapBackendToFrontendPost(p))
        );
    }

    createReply(reply: Omit<Reply, 'id' | 'createdAt' | 'likes'>): Observable<Reply> {
        const payload = {
            postId: reply.postId,
            authorId: reply.author?.id,
            authorName: reply.author?.name,
            content: reply.content
        };

        return this.http.post<any>(this.commentsUrl, payload).pipe(
            map(r => this.mapBackendToFrontendReply(r))
        );
    }

    updateReply(commentId: string, content: string): Observable<Reply> {
        const payload = { content };
        return this.http.put<any>(`${this.commentsUrl}/${commentId}`, payload).pipe(
            map(r => this.mapBackendToFrontendReply(r))
        );
    }

    deleteReply(commentId: string): Observable<void> {
        return this.http.delete<void>(`${this.commentsUrl}/${commentId}`);
    }

    private mapBackendToFrontendPost(dto: any): Post {
        // Format the timestamp for display
        const createdAt = dto.createdAt || new Date().toISOString();
        const timestamp = this.formatTimestamp(createdAt);
        
        // Check if backend provides media/images
        // Backend uses 'imageUrls', frontend model uses 'media' or 'images'
        const backendMedia = dto.imageUrls || dto.media || dto.images;
        const hasBackendMedia = backendMedia && Array.isArray(backendMedia) && backendMedia.length > 0;
        
        // Only use sample images as fallback when no images from backend
        let mediaToUse: string[] | undefined = undefined;
        
        if (hasBackendMedia) {
            // Use the images from the backend
            mediaToUse = backendMedia;
        }
        // Don't add sample images - only show actual post images
        
        return {
            id: dto.id || '',
            title: dto.title || (dto.content ? dto.content.substring(0, 30) + '...' : 'Untitled Post'),
            content: dto.content || dto.description || '',
            author: {
                id: dto.authorId,
                name: dto.authorName || 'Explorer',
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(dto.authorName || 'Explorer')}&background=3A5F4B&color=fff`,
                role: dto.authorRole || 'Camper',
                trustScore: dto.trustScore || Math.floor(Math.random() * 30) + 70,
                badges: dto.badges || []
            },
            category: dto.category || 'General',
            tags: dto.tags || [],
            createdAt: createdAt,
            likes: dto.likes || 0,
            replies: dto.commentCount || 0,
            views: dto.views || 0,
            // UI display fields - only use actual images from backend
            media: mediaToUse,
            location: dto.location || '',
            timestamp: timestamp,
            videoLength: dto.videoLength,
            products: dto.products,
            isLiked: dto.isLiked || false,
            saved: dto.saved || false,
            comments: dto.comments || []
        };
    }
    
    private formatTimestamp(dateString: string): string {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    private mapBackendToFrontendReply(dto: any): Reply {
        return {
            id: dto.id || '',
            postId: dto.postId || '',
            author: {
                id: dto.authorId,
                name: dto.authorName || 'Explorer',
                avatar: `https://ui-avatars.com/api/?name=${dto.authorName || 'Explorer'}&background=random`
            },
            content: dto.content || '',
            createdAt: dto.createdAt || new Date().toISOString(),
            likes: dto.likes || 0
        };
    }
}
