import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, MoreHorizontal, Pencil, Trash2 } from 'lucide-angular';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Post, AuthorPreview, UserRole } from '../models/community.model';
import { TrustScoreComponent } from '../../../shared/components/trust-score/trust-score.component';
import { CampBadgeComponent } from '../../../shared/components/badge/badge.component';
import { CommunityService } from '../../../core/services/community.service';
import { AuthService } from '../../../core/services/auth.service';

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

    constructor(
        private router: Router,
        private communityService: CommunityService,
        private cdr: ChangeDetectorRef,
        private ngZone: NgZone,
        private authService: AuthService
    ) { }

    MoreHorizontalIcon = MoreHorizontal;
    PencilIcon = Pencil;
    TrashIcon = Trash2;

    ngOnInit(): void {
        this.loadPosts();
    }

    loadPosts(): void {
        this.loading = true;
        this.ngZone.run(() => {
            this.communityService.getPosts().subscribe({
                next: (posts) => {
                    this.posts = posts;
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

    toggleLike(post: Post) {
        if (!post.isLiked) {
            this.communityService.likePost(post.id.toString()).subscribe({
                next: () => {
                    post.isLiked = true;
                    post.likes++;
                    this.cdr.detectChanges();
                }
            });
        }
    }

    toggleSave(post: Post) {
        post.saved = !post.saved;
    }

    goToPost(id: any) {
        this.communityService.recordView(id.toString()).subscribe();
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
            id: this.editingPost.id,
            title: this.editingPost.title,
            description: this.editContent,
            category: this.editingPost.category || 'General'
        };

        this.communityService.updatePost(this.editingPost.id.toString(), payload).subscribe({
            next: () => {
                if (this.editingPost) {
                    this.editingPost.content = this.editContent;
                }
                this.editingPost = null;
                this.editContent = '';
            },
            error: (err) => {
                console.error('Failed to update post', err);
                alert('Failed to update post');
            }
        });
    }

    submitQuickPost() {
        if (!this.quickPostContent.trim()) return;

        const payload = {
            title: 'New Adventure', // Backend requires a title
            description: this.quickPostContent,
            category: 'General',
            authorId: this.authService.currentUserValue?.id || '' // Use authenticated user
        };

        this.communityService.createPost(payload).subscribe({
            next: (newThread) => {
                // Prepend the new post to the list (mapping DTO to Post UI model)
                this.loadPosts(); // Refreshing is safer to get all metadata
                this.quickPostContent = '';
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed to create post', err);
                alert('Failed to create post');
            }
        });
    }

    deletePost(post: Post, event: Event) {
        event.stopPropagation();
        this.activeDropdown = null;
        if (confirm('Are you sure you want to delete this post?')) {
            this.communityService.deletePost(post.id.toString()).subscribe({
                next: () => {
                    this.posts = this.posts.filter(p => p.id !== post.id);
                },
                error: (err) => {
                    console.error('Failed to delete post', err);
                    alert('Failed to delete post');
                }
            });
        }
    }
}
