import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, MoreHorizontal, Pencil, Trash2 } from 'lucide-angular';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Post, AuthorPreview, UserRole } from '../models/community.model';
import { TrustScoreComponent } from '../../../shared/components/trust-score/trust-score.component';
import { CampBadgeComponent } from '../../../shared/components/camp-badge/camp-badge.component';
import { CommunityService } from '../../../core/services/community.service';
import { AuthService } from '../../../core/services/auth.service';
import { FollowService } from '../../../core/services/follow.service';
import { User } from '../../../core/models/auth.models';

@Component({
    selector: 'app-community-feed',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, TrustScoreComponent, CampBadgeComponent, LucideAngularModule],
    templateUrl: './community-feed.component.html',
    styleUrl: './community-feed.component.scss',
    encapsulation: ViewEncapsulation.Emulated
})
export class CommunityFeedComponent implements OnInit {
    posts: Post[] = [];
    loading: boolean = true;
    currentUser: User | null = null;
    followersCount: number = 0;
    followingCount: number = 0;
    followStatusMap: Map<string, boolean> = new Map();
    isSubmitting: boolean = false;
    feedMode: 'ALL' | 'FOLLOWING' = 'ALL';

    get isBanned(): boolean {
        const status = (this.currentUser as any)?.profileDetails?.moderationStatus;
        return status === 'BANNED' || status === 'PERMANENTLY_BANNED';
    }

    get isPermanentlyBanned(): boolean {
        return (this.currentUser as any)?.profileDetails?.moderationStatus === 'PERMANENTLY_BANNED';
    }

    get myPostsCount(): number {
        if (!this.currentUser) return 0;
        return this.posts.filter(p => p.author.id === this.currentUser?.id).length;
    }

    constructor(
        private router: Router,
        private communityService: CommunityService,
        private followService: FollowService,
        private cdr: ChangeDetectorRef,
        private ngZone: NgZone,
        private authService: AuthService
    ) { }

    MoreHorizontalIcon = MoreHorizontal;
    PencilIcon = Pencil;
    TrashIcon = Trash2;

    ngOnInit(): void {
        this.currentUser = this.authService.currentUserValue;
        this.authService.getCurrentUser().subscribe(user => {
            this.currentUser = user;
            if (user?.id) {
                this.loadFollowCounts(user.id);
            }
            this.cdr.detectChanges();
        });
        this.loadPosts();
    }

    loadFollowCounts(userId: string): void {
        this.followService.getFollowCounts(userId).subscribe({
            next: (counts) => {
                this.followersCount = counts.followersCount;
                this.followingCount = counts.followingCount;
                this.cdr.detectChanges();
            }
        });
    }

    toggleFollow(userId: string, event?: Event): void {
        if (event) event.stopPropagation();
        if (!this.currentUser || this.currentUser.id === userId) return;

        const currentlyFollowing = this.followStatusMap.get(userId) || false;
        if (currentlyFollowing) {
            this.followService.unfollow(userId).subscribe(() => {
                this.followStatusMap.set(userId, false);
                if (this.currentUser) this.loadFollowCounts(this.currentUser.id);
                this.cdr.detectChanges();
            });
        } else {
            this.followService.follow(userId).subscribe(() => {
                this.followStatusMap.set(userId, true);
                if (this.currentUser) this.loadFollowCounts(this.currentUser.id);
                this.cdr.detectChanges();
            });
        }
    }

    isUserFollowing(userId: string): boolean {
        if (!this.followStatusMap.has(userId)) {
            // Initialize with false to avoid infinite loops, then fetch
            this.followStatusMap.set(userId, false);
            this.followService.getFollowStatus(userId).subscribe(status => {
                this.followStatusMap.set(userId, status.isFollowing);
                this.cdr.detectChanges();
            });
            return false;
        }
        return this.followStatusMap.get(userId) || false;
    }

    loadPosts(): void {
        this.loading = true;
        this.ngZone.run(() => {
            const fetchObservable = this.feedMode === 'FOLLOWING' 
                ? this.communityService.getFollowingPosts()
                : this.communityService.getPosts();

            fetchObservable.subscribe({
                next: (posts) => {
                    this.posts = posts as any;
                    this.loading = false;
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    console.error('Error loading posts', err);
                    this.loading = false;
                    this.cdr.detectChanges();
                }
            });
        });
    }

    setFeedMode(mode: 'ALL' | 'FOLLOWING'): void {
        if (this.feedMode !== mode) {
            this.feedMode = mode;
            this.loadPosts();
        }
    }

    toggleLike(post: Post) {
        if (!this.currentUser) return;
        this.communityService.toggleLikePost(post.id).subscribe({
            next: (updatedPost) => {
                post.likes = updatedPost.likes;
                // Force update from server response
                post.isLiked = !!updatedPost.isLiked;
                this.cdr.detectChanges();
            },
            error: (err) => console.error('Error liking post', err)
        });
    }

    toggleSave(post: Post) {
        post.saved = !post.saved;
    }

    goToPost(id: any) {
        this.router.navigate(['/community/post', id]);
    }

    goToProfile(id: any) {
        this.router.navigate(['/community/profile', id]);
    }

    asArray(val: any): any[] {
        return Array.isArray(val) ? val : [];
    }

    getCommentCount(val: any): number {
        return Array.isArray(val) ? val.length : (val || 0);
    }

    // --- Edit / Delete Logic ---
    activeDropdown: any = null;
    editingPost: Post | null = null;
    editContent: string = '';
    quickPostContent: string = '';

    toggleDropdown(postId: any, event: Event) {
        event.stopPropagation();
        this.activeDropdown = this.activeDropdown === postId ? null : postId;
    }

    startEdit(post: Post, event: Event) {
        event.stopPropagation();
        this.activeDropdown = null;
        this.editingPost = post;
        // The backend model uses description for content, so post.content is the HTML text
        this.editContent = post.content || '';
    }

    cancelEdit(event?: Event) {
        if (event) event.stopPropagation();
        this.editingPost = null;
        this.editContent = '';
    }

    saveEdit(event: Event) {
        event.stopPropagation();
        if (!this.editingPost) return;
        
        const payload = {
            title: this.editingPost.title || 'Updated Title',
            content: this.editContent
        };

        this.communityService.updatePost(this.editingPost.id, payload).subscribe({
            next: (updated) => {
                if (this.editingPost) {
                    this.editingPost.content = updated.content;
                    this.editingPost.title = updated.title;
                }
                this.editingPost = null;
                this.editContent = '';
                this.cdr.detectChanges();
            },
            error: (err) => console.error('Failed to update post', err)
        });
    }

    submitQuickPost() {
        if (!this.quickPostContent.trim() || this.isBanned) return;

        const currentUser = this.authService.currentUserValue;
        this.isSubmitting = true;
        const payload: any = {
            title: 'New Adventure', 
            content: this.quickPostContent,
            authorId: currentUser?.id,
            authorName: currentUser?.username || 'Camper',
            authorUsername: currentUser?.username || 'explorer',
            category: 'General',
            tags: []
        };

        this.communityService.createPost(payload).subscribe({
            next: (newThread) => {
                this.loadPosts();
                this.quickPostContent = '';
                this.isSubmitting = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed to create post', err);
                this.isSubmitting = false;
                const errorMsg = err.error?.message || 'Failed to create post. You might be banned or there is a server error.';
                alert(errorMsg);
                this.cdr.detectChanges();
            }
        });
    }

    deletePost(post: Post, event: Event) {
        event.stopPropagation();
        this.activeDropdown = null;
        if (confirm('Are you sure you want to delete this post?')) {
            this.communityService.deletePost(post.id).subscribe({
                next: () => {
                    this.posts = this.posts.filter(p => p.id !== post.id);
                    this.cdr.detectChanges();
                },
                error: (err) => console.error('Failed to delete post', err)
            });
        }
    }
}
