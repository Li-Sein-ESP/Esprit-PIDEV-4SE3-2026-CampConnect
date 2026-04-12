import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule, ChevronLeft, ThumbsUp, MessageSquare, Share2, Flag, User, Calendar, Tag } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { BadgeComponent } from '../../../shared/components/badge.component';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';
import { CommunityService } from '../../../core/services/community.service';

@Component({
    selector: 'app-post-detail',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        LucideAngularModule,
        ButtonComponent,
        BadgeComponent,
        CardComponent,
        CardContentComponent
    ],
    templateUrl: './post-detail.component.html',
    styles: [`
    :host {
      display: block;
    }
  `]
})
export class PostDetailComponent implements OnInit {
    postId: string | null = null;
    post: any = null;
    replies: any[] = [];
    loading: boolean = true;

    // Icons
    readonly ChevronLeft = ChevronLeft;
    readonly ThumbsUp = ThumbsUp;
    readonly MessageSquare = MessageSquare;
    readonly Share2 = Share2;
    readonly Flag = Flag;
    readonly User = User;
    readonly Calendar = Calendar;
    readonly Tag = Tag;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private communityService: CommunityService
    ) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.postId = params.get('id');
            if (this.postId) {
                this.loadPostData(this.postId);
            }
        });
    }

    loadPostData(id: string) {
        this.loading = true;
        this.communityService.getPostById(id).subscribe({
            next: (post) => {
                this.post = post;
                this.communityService.getRepliesByPostId(id).subscribe({
                    next: (replies) => {
                        this.replies = replies;
                        this.loading = false;
                    },
                    error: () => this.loading = false
                });
            },
            error: (err) => {
                console.error('Error loading post', err);
                this.loading = false;
            }
        });
    }

    navigate(path: string) {
        this.router.navigate([path]);
    }
}
