import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule, ChevronLeft, ThumbsUp, MessageSquare, Share2, Flag, User, Calendar, Tag } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { BadgeComponent } from '../../../shared/components/badge.component';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';

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

    // Icons
    readonly ChevronLeft = ChevronLeft;
    readonly ThumbsUp = ThumbsUp;
    readonly MessageSquare = MessageSquare;
    readonly Share2 = Share2;
    readonly Flag = Flag;
    readonly User = User;
    readonly Calendar = Calendar;
    readonly Tag = Tag;

    // Mock Data
    post: any = {
        id: 'post-1',
        title: 'Best camping spots in Yosemite?',
        content: 'Planning a trip to Yosemite next month and looking for recommendations on the best camping spots. We\'re a group of 4 and prefer sites with good access to hiking trails. Any suggestions?',
        author: {
            name: 'Sarah Johnson',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
            joinedDate: '2025-06-15',
        },
        category: 'Trip Planning',
        tags: ['yosemite', 'camping', 'hiking'],
        createdAt: '2026-02-10T14:30:00',
        likes: 24,
        replies: 8,
        views: 156,
    };

    mockReplies: any[] = [
        {
            id: 'reply-1',
            author: {
                name: 'Mike Chen',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
            },
            content: 'Upper Pines is great! Close to trails and has all amenities. Book early though, it fills up fast.',
            createdAt: '2026-02-10T15:45:00',
            likes: 12,
        },
        {
            id: 'reply-2',
            author: {
                name: 'Emma Rodriguez',
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
            },
            content: 'I second Upper Pines! Also check out Tuolumne Meadows if you want something more remote.',
            createdAt: '2026-02-10T16:20:00',
            likes: 8,
        },
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.postId = params.get('id');
        });
    }

    navigate(path: string) {
        this.router.navigate([path]);
    }
}
