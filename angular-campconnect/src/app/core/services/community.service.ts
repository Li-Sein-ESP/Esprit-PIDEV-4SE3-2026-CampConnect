import { Injectable } from '@angular/core';
<<<<<<< HEAD
import { Observable, of, delay } from 'rxjs';
=======
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)

export interface Post {
    id: string;
    title: string;
    content: string;
    author: {
<<<<<<< HEAD
        name: string;
        avatar: string;
=======
        id?: string;
        name: string;
        avatar: string;
        role?: string;
        trustScore?: number;
        badges?: any[];
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
    };
    category: string;
    tags: string[];
    createdAt: string;
    likes: number;
    replies: number;
    views: number;
<<<<<<< HEAD
=======
    // UI display fields
    media?: string[];
    location?: string;
    timestamp?: string;
    videoLength?: string;
    products?: { icon: string; name: string }[];
    isLiked?: boolean;
    saved?: boolean;
    comments?: any[];
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
}

export interface Reply {
    id: string;
    postId: string;
    author: {
<<<<<<< HEAD
=======
        id?: string;
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
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
<<<<<<< HEAD
    private posts: Post[] = this.getMockPosts();
    private replies: Reply[] = this.getMockReplies();

    getPosts(filters?: { category?: string; search?: string }): Observable<Post[]> {
        let filtered = [...this.posts];

        if (filters?.category) {
            filtered = filtered.filter(p => p.category === filters.category);
        }

        if (filters?.search) {
            const query = filters.search.toLowerCase();
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(query) ||
                p.content.toLowerCase().includes(query)
            );
        }

        return of(filtered).pipe(delay(300));
    }

    getPostById(id: string): Observable<Post | undefined> {
        return of(this.posts.find(p => p.id === id)).pipe(delay(300));
    }

    getRepliesByPostId(postId: string): Observable<Reply[]> {
        return of(this.replies.filter(r => r.postId === postId)).pipe(delay(300));
    }

    createPost(post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'replies' | 'views'>): Observable<Post> {
        const newPost: Post = {
            ...post,
            id: `post-${Date.now()}`,
            createdAt: new Date().toISOString(),
            likes: 0,
            replies: 0,
            views: 0
        };
        this.posts = [newPost, ...this.posts];
        return of(newPost).pipe(delay(500));
    }

    createReply(reply: Omit<Reply, 'id' | 'createdAt' | 'likes'>): Observable<Reply> {
        const newReply: Reply = {
            ...reply,
            id: `reply-${Date.now()}`,
            createdAt: new Date().toISOString(),
            likes: 0
        };
        this.replies = [...this.replies, newReply];

        // Update post reply count
        const post = this.posts.find(p => p.id === reply.postId);
        if (post) {
            post.replies++;
        }

        return of(newReply).pipe(delay(500));
    }

    private getMockPosts(): Post[] {
        return [
            {
                id: 'post-1',
                title: 'Best camping spots in Yosemite?',
                content: 'Planning a trip to Yosemite next month and looking for recommendations...',
                author: {
                    name: 'Sarah Johnson',
                    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80'
                },
                category: 'Trip Planning',
                tags: ['yosemite', 'camping', 'hiking'],
                createdAt: '2026-02-10T14:30:00',
                likes: 24,
                replies: 8,
                views: 156
            },
            {
                id: 'post-2',
                title: 'Gear recommendations for winter camping',
                content: 'First time winter camping. What gear is essential?',
                author: {
                    name: 'Mike Chen',
                    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'
                },
                category: 'Gear Talk',
                tags: ['winter', 'gear', 'beginner'],
                createdAt: '2026-02-11T09:15:00',
                likes: 18,
                replies: 12,
                views: 203
            }
        ];
    }

    private getMockReplies(): Reply[] {
        return [
            {
                id: 'reply-1',
                postId: 'post-1',
                author: {
                    name: 'Emma Rodriguez',
                    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80'
                },
                content: 'Upper Pines is great! Close to trails and has all amenities.',
                createdAt: '2026-02-10T15:45:00',
                likes: 12
            }
        ];
=======
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
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
    }
}
