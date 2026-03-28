import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TrustScoreComponent } from '../../../shared/components/trust-score/trust-score.component';
import { CampBadgeComponent } from '../../../shared/components/camp-badge/camp-badge.component';
import { Post, Comment, AuthorPreview, UserRole } from '../models/community.model';
import { CommunityService } from '../../../core/services/community.service';
import { AuthService } from '../../../core/services/auth.service';

interface PostUser extends AuthorPreview {
    verified: boolean;
}

interface ThreadReply {
    id: string;
    author: AuthorPreview;
    text: string;
    time: string;
    likes: number;
    liked: boolean;
}

interface ThreadComment {
    id: string;
    author: AuthorPreview;
    text: string;
    time: string;
    likes: number;
    liked: boolean;
    replies: ThreadReply[];
    showReplies?: boolean;
}

@Component({
    selector: 'app-post-details',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, TrustScoreComponent, CampBadgeComponent],
    templateUrl: './post-details.component.html',
    styleUrl: './post-details.component.scss'
})
export class PostDetailsComponent implements OnInit {

    // Mocked state (fallback while loading)
    post: Post = {
        id: '0',
        author: { id: '0', name: 'Loading...', username: 'loading', avatar: '', role: 'Camper', trustScore: 0 },
        title: 'Loading post...',
        category: 'General',
        tags: [],
        createdAt: '',
        views: 0,
        isLiked: false,
        isBookmarked: false,
        isPinned: false,
        status: 'active',
        content: `Please wait, loading...`,
        likes: 0,
        comments: 0
    };

    // UI State Options
    isLiked = false;
    isSaved = false;
    isPostFollowing = false;

    newCommentText = '';
    currentSlide = 0;
    toastMsg = '';
    showToastVisible = false;

    // Track double tap
    lastTap = 0;
    showHeartPop = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private communityService: CommunityService,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.loadPost(id);
            }
        });
    }

    loadPost(id: string) {
        this.communityService.getPostById(id).subscribe({
            next: (realPost) => {
                if (realPost) {
                    this.post = realPost as any;
                    this.loadComments(id);
                }
            },
            error: (err) => {
                console.error('Error loading real post', err);
                this.showToast('Error loading post: ' + err.message);
            }
        });
    }

    loadComments(postId: string) {
        this.communityService.getRepliesByPostId(postId).subscribe({
            next: (replies) => {
                // Map backend Reply to UI ThreadComment format
                this.post.comments = (replies || []).map(r => ({
                    id: r.id,
                    author: {
                        id: '0',
                        name: r.author?.name || 'Explorer',
                        username: r.author?.name?.toLowerCase().replace(' ', '_') || 'explorer',
                        avatar: r.author?.avatar || `https://ui-avatars.com/api/?name=User&background=random`,
                        role: 'Camper' as UserRole,
                        trustScore: 85
                    },
                    text: r.content || '',
                    time: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Long ago',
                    likes: r.likes || 0,
                    liked: false,
                    replies: []
                }));
            },
            error: (err) => console.error('Error loading comments', err)
        });
    }

    asArray(val: any): any[] {
        return Array.isArray(val) ? val : [];
    }

    getCommentCount(val: any): number {
        return Array.isArray(val) ? val.length : (val || 0);
    }

    toggleLike() {
        this.isLiked = !this.isLiked;
        if (this.isLiked) {
            this.post.likes++;
            this.showToast('❤️ You liked this post');
        } else {
            this.post.likes--;
        }
    }

    toggleSave() {
        this.isSaved = !this.isSaved;
        this.showToast(this.isSaved ? '🔖 Post saved to your collection' : 'Removed from saved');
    }

    toggleFollow() {
        this.isPostFollowing = !this.isPostFollowing;
        this.showToast(this.isPostFollowing ? '✅ Now following ' + this.post.author.name : 'Unfollowed ' + this.post.author.name);
    }

    toggleCommentLike(comment: any) {
        comment.liked = !comment.liked;
        comment.likes += comment.liked ? 1 : -1;
    }

    changeSlide(dir: number) {
        const media = this.post.media as string[];
        this.currentSlide = (this.currentSlide + dir + media.length) % media.length;
    }

    goToSlide(index: number) {
        this.currentSlide = index;
    }

    addComment() {
        const text = this.newCommentText.trim();
        if (!text) return;

        const currentUser = this.authService.currentUserValue;
        
        const commentData = {
            postId: this.post.id,
            content: text,
            author: {
                name: currentUser?.username || 'Explorer',
                avatar: `https://ui-avatars.com/api/?name=${currentUser?.username || 'User'}&background=random`
            }
        };

        this.communityService.createReply(commentData).subscribe({
            next: (savedComment) => {
                if (!Array.isArray(this.post.comments)) {
                    this.post.comments = [];
                }
                
                const comments = this.post.comments as any[];
                comments.unshift({
                    id: savedComment.id || Date.now().toString(),
                    author: {
                        id: currentUser?.id || '100',
                        name: currentUser?.username || 'Explorer',
                        username: currentUser?.username || 'explorer',
                        avatar: `https://ui-avatars.com/api/?name=${currentUser?.username || 'User'}&background=2f5d44&color=fff`,
                        role: (currentUser?.roles && currentUser.roles.length > 0 ? currentUser.roles[0] : 'Camper') as UserRole,
                        trustScore: 100
                    },
                    text: text,
                    time: 'Just now',
                    likes: 0,
                    liked: false,
                    replies: []
                });
                
                this.newCommentText = '';
                this.showToast('💬 Comment posted!');
            },
            error: (err) => {
                console.error('Error posting comment', err);
                this.showToast('❌ Failed to post comment. Try again.');
            }
        });
    }

    handleEnter(event: Event) {
        const kbEvent = event as KeyboardEvent;
        if (!kbEvent.shiftKey) {
            kbEvent.preventDefault();
            this.addComment();
        }
    }

    handleDoubleTap() {
        const now = Date.now();
        if (now - this.lastTap < 350) {
            if (!this.isLiked) {
                this.toggleLike();
            }
            this.triggerHeartPop();
        }
        this.lastTap = now;
    }

    triggerHeartPop() {
        this.showHeartPop = false;
        setTimeout(() => {
            this.showHeartPop = true;
        }, 10);
    }

    replyTo(authorName: string) {
        this.newCommentText = `@${authorName} `;
    }

    toggleReplies(comment: ThreadComment) {
        comment.showReplies = !comment.showReplies;
    }

    showToast(msg: string) {
        this.toastMsg = msg;
        this.showToastVisible = true;
        setTimeout(() => {
            if (this.toastMsg === msg) {
                this.showToastVisible = false;
            }
        }, 2800);
    }

    goToProfile(userId: string) {
        this.router.navigate(['/community/profile', userId]);
    }
}
