import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Post, AuthorPreview, UserRole } from '../models/community.model';
import { TrustScoreComponent } from '../../../shared/components/trust-score/trust-score.component';
import { CampBadgeComponent } from '../../../shared/components/badge/badge.component';
import { CommunityService } from '../../../core/services/community.service';

@Component({
    selector: 'app-community-feed',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, TrustScoreComponent, CampBadgeComponent],
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
        private ngZone: NgZone
    ) { }

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
}
