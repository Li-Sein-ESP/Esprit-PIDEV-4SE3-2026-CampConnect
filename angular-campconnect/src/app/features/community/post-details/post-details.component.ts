import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TrustScoreComponent } from '../../../shared/components/trust-score/trust-score.component';
import { CampBadgeComponent } from '../../../shared/components/badge/badge.component';
import { Post, Comment, AuthorPreview, UserRole } from '../models/community.model';

interface PostUser extends AuthorPreview {
    verified: boolean;
}

interface ThreadReply {
    id: number;
    author: AuthorPreview;
    text: string;
    time: string;
    likes: number;
    liked: boolean;
}

interface ThreadComment {
    id: number;
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

    // Mocked state
    post: Post = {
        id: 1,
        author: {
            id: 101,
            name: 'Alex Wanderer',
            username: 'alex_w',
            avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&h=120&fit=crop&crop=face',
            role: 'Verified Camper' as UserRole,
            trustScore: 82,
            badges: [
                { title: 'Trailblazer', description: 'Completed 5 unique trails.', icon: 'terra', unlocked: true },
                { title: 'Night Owl', description: 'Stargazer', icon: 'slate', unlocked: true },
                { title: 'Community Leader', description: '5 group events', icon: 'dusk', unlocked: false }
            ]
        },
        title: 'Morning Golden Hour at El Capitan',
        category: 'Camping',
        tags: ['Yosemite', 'GoldenHour', 'ElCapitan'],
        createdAt: '2025-01-12T06:30:00Z',
        views: 1245,
        isLiked: false,
        isBookmarked: false,
        isPinned: false,
        status: 'active',
        location: 'Yosemite Valley, CA',
        timestamp: '2 hours ago',
        content: `First light hitting El Capitan from our basecamp this morning. We woke up at 4:30 AM and it was absolutely worth every minute of lost sleep. The way the granite face glows during golden hour is something you have to witness in person. 🌄<br><br>
This trip has been a masterclass in patience — the weather didn't cooperate for the first two days, but this morning everything aligned. Set up the new tent from <a href="#">@MountainHardwear</a> and it handled everything beautifully.<br><br>
Pro tip: Camp at site #47 for this exact view. Arrive Thursday to snag it for the weekend. Trust me on this one.`,
        media: [
            'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1000&h=700&fit=crop',
            'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000&h=700&fit=crop',
            'https://images.unsplash.com/photo-1537905569824-f89f14cceb68?w=1000&h=700&fit=crop'
        ],
        likes: 341,
        comments: [
            {
                id: 1,
                author: {
                    id: 102,
                    name: 'Sarah Chen',
                    username: 'sarah_c',
                    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
                    role: 'Camper' as UserRole,
                    trustScore: 91
                },
                text: 'This is absolutely stunning, Alex! Site #47 is now at the top of my list. How busy was it on a Thursday? Trying to plan a trip next month.',
                time: '1 hour ago',
                likes: 12,
                liked: false,
                showReplies: true,
                replies: [
                    {
                        id: 11,
                        author: {
                            id: 101,
                            name: 'Alex Wanderer',
                            username: 'alex_w',
                            avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&h=120&fit=crop&crop=face',
                            role: 'Verified Camper' as UserRole,
                            trustScore: 82
                        },
                        text: 'Thanks Sarah! Thursday was pretty quiet — maybe 60% full. By Friday evening it was completely packed though. Definitely arrive early!',
                        time: '45 min ago',
                        likes: 8,
                        liked: false,
                    },
                    {
                        id: 12,
                        author: {
                            id: 102,
                            name: 'Sarah Chen',
                            username: 'sarah_c',
                            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
                            role: 'Camper' as UserRole,
                            trustScore: 91
                        },
                        text: 'Perfect, adding it to the calendar right now! 🗓️',
                        time: '30 min ago',
                        likes: 3,
                        liked: false,
                    }
                ]
            },
            {
                id: 2,
                author: {
                    id: 104,
                    name: 'Marcus Rivera',
                    username: 'marcus_r',
                    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face',
                    role: 'Camper' as UserRole,
                    trustScore: 85
                },
                text: 'The Trango 3 is such a solid tent! I\'ve been using it for about 6 months now and it handles wind like a champ. How did it do with condensation?',
                time: '1.5 hours ago',
                likes: 7,
                liked: false,
                replies: [
                    {
                        id: 21,
                        author: {
                            id: 101,
                            name: 'Alex Wanderer',
                            username: 'alex_w',
                            avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&h=120&fit=crop&crop=face',
                            role: 'Verified Camper' as UserRole,
                            trustScore: 82
                        },
                        text: 'Minimal condensation honestly! The dual vestibule design really helps with airflow. Only noticed some on the second night when temps dropped below 30°F.',
                        time: '1 hour ago',
                        likes: 5,
                        liked: false,
                    }
                ]
            },
            {
                id: 3,
                author: {
                    id: 105,
                    name: 'Jamie Okafor',
                    username: 'jamie_o',
                    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=face',
                    role: 'Verified Camper' as UserRole,
                    trustScore: 94
                },
                text: 'That golden hour shot is unreal 📸 What time exactly did you take this? I\'m heading there in August and want to get a similar shot.',
                time: '2 hours ago',
                likes: 15,
                liked: false,
                replies: []
            }
        ]
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
        private router: Router
    ) { }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            // Read route id if necessary
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

        if (Array.isArray(this.post.comments)) {
            this.post.comments.unshift({
                id: Date.now(),
                author: {
                    id: 100, // Current user
                    name: 'You',
                    username: 'you',
                    avatar: 'https://images.unsplash.com/photo-1535930749574-1399327ce78f?w=100&h=100&fit=crop&crop=face',
                    role: 'Camper' as UserRole,
                    trustScore: 100
                },
                text: text,
                time: 'Just now',
                likes: 0,
                liked: false,
                replies: []
            });
        }
        this.newCommentText = '';
        this.showToast('💬 Comment posted!');
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

    goToProfile(userId: number) {
        this.router.navigate(['/community/profile', userId]);
    }
}
