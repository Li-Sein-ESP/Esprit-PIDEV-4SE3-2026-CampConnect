import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export interface Post {
    id: string;
    title: string;
    content: string;
    author: {
        name: string;
        avatar: string;
    };
    category: string;
    tags: string[];
    createdAt: string;
    likes: number;
    replies: number;
    views: number;
}

export interface Reply {
    id: string;
    postId: string;
    author: {
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
    }
}
