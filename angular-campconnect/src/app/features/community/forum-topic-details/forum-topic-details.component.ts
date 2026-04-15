import { Component, OnInit, ViewEncapsulation, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TrustScoreComponent } from '../../../shared/components/trust-score/trust-score.component';
import { CampBadgeComponent } from '../../../shared/components/camp-badge/camp-badge.component';
import { AuthService } from '../../../core/services/auth.service';
import { CommunityService } from '../../../core/services/community.service';
import { ForumTopic, ForumReply, AuthorPreview, UserRole, Post } from '../models/community.model';

@Component({
    selector: 'app-forum-topic-details',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, TrustScoreComponent, CampBadgeComponent],
    templateUrl: './forum-topic-details.component.html',
    styleUrl: './forum-topic-details.component.scss',
    encapsulation: ViewEncapsulation.Emulated
})
export class ForumTopicDetailsComponent implements OnInit {

    topicId: string = '0';
    replyText = '';
    readonly MAX_CHARS = 2000;
    loading = true;

    // Lightbox state
    lightboxOpen = false;
    lightboxSrc = '';
    lightboxAlt = '';

    topic!: ForumTopic;
    replies: ForumReply[] = [];

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        public authService: AuthService,
        private communityService: CommunityService
    ) { }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.topicId = params['id'];
            if (this.topicId) {
                this.loadTopicData(this.topicId);
            }
        });
    }

    loadTopicData(id: string): void {
        this.loading = true;
        this.communityService.getPostById(id).subscribe({
            next: (post) => {
                if (post) {
                    this.topic = this.mapPostToForumTopic(post as any);
                    this.loadReplies(id);
                } else {
                    this.loading = false;
                }
            },
            error: (err) => {
                console.error('Error loading topic', err);
                this.loading = false;
            }
        });
    }

    loadReplies(threadId: string): void {
        this.communityService.getRepliesByPostId(threadId).subscribe({
            next: (posts) => {
                this.replies = posts.map(p => this.mapPostDTOToForumReply(p));
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading replies', err);
                this.loading = false;
            }
        });
    }

    private mapPostToForumTopic(post: Post): ForumTopic {
        return {
            id: post.id,
            categoryId: '1', // Defaulting for now
            categoryName: post.category || 'General',
            title: post.title,
            content: [post.content],
            tags: post.tags || [],
            author: post.author,
            date: 'Recent',
            dateIso: post.createdAt,
            media: [],
            likes: post.likes,
            isLiked: post.isLiked,
            views: post.views.toString(),
            replyCount: typeof post.comments === 'number' ? post.comments : post.comments.length
        };
    }

    private mapPostDTOToForumReply(post: any): ForumReply {
        return {
            id: post.id || Date.now().toString(),
            parentReplyId: null, // Basic flat list for now
            date: 'Recent',
            isOP: post.authorId === this.topic?.author.id.toString(),
            isLiked: false,
            likes: 0,
            content: post.content,
            author: {
                id: post.authorId || '0',
                username: post.authorUsername || ('author_' + post.authorId),
                name: post.authorName || (post.authorId ? 'User ' + post.authorId : 'Anonymous Camper'),
                avatar: `https://ui-avatars.com/api/?name=${post.authorName || 'Guest'}&background=random`,
                role: 'Camper',
                trustScore: 75
            }
        };
    }

    // ---- Derived getters ----
    get rootReplies(): ForumReply[] {
        return this.replies.filter(r => r.parentReplyId === null);
    }

    getNestedReplies(parentId: string): ForumReply[] {
        return this.replies.filter(r => r.parentReplyId === parentId);
    }

    get charCount(): number {
        return this.replyText.length;
    }

    get charCountClass(): string {
        if (this.charCount > 1800) return 'cc-composer__char-count cc-composer__char-count--danger';
        if (this.charCount > 1500) return 'cc-composer__char-count cc-composer__char-count--warn';
        return 'cc-composer__char-count';
    }

    get canSubmit(): boolean {
        return this.replyText.trim().length > 0 && this.charCount <= this.MAX_CHARS;
    }

    // ---- Interactions ----
    togglePostLike(): void {
        this.topic.isLiked = !this.topic.isLiked;
        this.topic.likes += this.topic.isLiked ? 1 : -1;
    }

    toggleReplyLike(reply: ForumReply): void {
        reply.isLiked = !reply.isLiked;
        reply.likes += reply.isLiked ? 1 : -1;
    }

    addReply(): void {
        const text = this.replyText.trim();
        if (!text) return;

        const user = this.authService.currentUserValue;
        const replyDTO = {
            content: text,
            postId: this.topicId,
            author: {
                name: user?.username || 'Explorer',
                avatar: `https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=random`
            }
        };

        this.communityService.createReply(replyDTO).subscribe({
            next: (savedPost) => {
                const newReply = this.mapPostDTOToForumReply(savedPost as any);
                this.replies = [...this.replies, newReply];
                this.topic.replyCount++;
                this.replyText = '';
            },
            error: (err: any) => {
                console.error('Error adding reply', err);
                alert('Failed to add reply.');
            }
        });
    }

    reportContent(type: string): void {
        console.log('Reported:', { type, topicId: this.topicId });
    }

    scrollToComposer(): void {
        const el = document.getElementById('reply-composer');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
                const ta = document.getElementById('reply-textarea') as HTMLTextAreaElement;
                if (ta) ta.focus();
            }, 400);
        }
    }

    // ---- Lightbox ----
    openLightbox(media: { url: string; alt: string }): void {
        this.lightboxSrc = media.url;
        this.lightboxAlt = media.alt;
        this.lightboxOpen = true;
        document.body.style.overflow = 'hidden';
    }

    closeLightbox(): void {
        this.lightboxOpen = false;
        document.body.style.overflow = '';
    }

    @HostListener('document:keydown.escape')
    onEscKeydown(): void {
        if (this.lightboxOpen) this.closeLightbox();
    }

    // ---- Navigation ----
    navigateToForum(): void {
        this.router.navigate(['/community/forum']);
    }

    navigateToCategory(): void {
        if (this.topic) {
            this.router.navigate(['/community/forum/category', this.topic.categoryId]);
        }
    }

    goToProfile(userId: string): void {
        this.router.navigate(['/community/profile', userId]);
    }

    formatNumber(n: number): string {
        if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
        return n.toString();
    }
}

