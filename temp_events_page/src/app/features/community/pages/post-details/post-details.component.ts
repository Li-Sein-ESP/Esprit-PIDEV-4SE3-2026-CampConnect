// ========================================
// CampConnect — Post Details Component
// Route: /community/post/:id
// ========================================

import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  Post,
  PostComment,
  PostReply,
  PostUser,
  TaggedProduct,
  RelatedPost,
} from '../../models/post.model';

@Component({
  selector: 'app-post-details',
  templateUrl: './post-details.component.html',
  styleUrls: ['./post-details.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('commentInput') commentInputRef!: ElementRef<HTMLTextAreaElement>;

  private destroy$ = new Subject<void>();

  // ── Post Data ──
  post!: Post;

  // ── UI State ──
  currentSlide = 0;
  isLiked = false;
  isSaved = false;
  isFollowing = false;
  newCommentText = '';
  newestCommentId: string | null = null;
  sortLabel = 'Most Relevant';

  // ── Double-Tap ──
  showDoubleTapHeart = false;
  private lastTapTime = 0;
  private doubleTapTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Toast ──
  toastVisible = false;
  toastMessage = '';
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  // ════════════════════════════════════
  // LIFECYCLE
  // ════════════════════════════════════

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const postId = params.get('id') || 'post-001';
        this.loadPost(postId);
      });

    // Preload carousel images
    if (this.post?.media) {
      this.post.media.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.toastTimer) clearTimeout(this.toastTimer);
    if (this.doubleTapTimer) clearTimeout(this.doubleTapTimer);
  }

  // ════════════════════════════════════
  // DATA LOADING
  // ════════════════════════════════════

  private loadPost(id: string): void {
    // TODO: Replace with actual API call
    // this.postService.getPost(id).subscribe(post => this.post = post);
    this.post = this.getMockPost(id);

    // Auto-expand first comment's replies
    if (this.post.comments.length > 0 && this.post.comments[0].replies.length > 0) {
      this.post.comments[0].showReplies = true;
    }

    this.cdr.markForCheck();
  }

  // ════════════════════════════════════
  // CAROUSEL
  // ════════════════════════════════════

  goToSlide(index: number): void {
    this.currentSlide = index;
  }

  changeSlide(direction: number): void {
    const total = this.post.media.length;
    this.currentSlide = (this.currentSlide + direction + total) % total;
  }

  onMediaDoubleTap(event: MouseEvent): void {
    // Ignore clicks on nav buttons
    const target = event.target as HTMLElement;
    if (target.closest('.cc-post__media-nav') || target.closest('.cc-post__media-dot')) {
      return;
    }

    const now = Date.now();
    if (now - this.lastTapTime < 350) {
      // Double tap detected
      if (!this.isLiked) {
        this.toggleLike();
      }
      this.triggerDoubleTapHeart();
    }
    this.lastTapTime = now;
  }

  private triggerDoubleTapHeart(): void {
    this.showDoubleTapHeart = false;
    this.cdr.detectChanges();

    requestAnimationFrame(() => {
      this.showDoubleTapHeart = true;
      this.cdr.markForCheck();

      if (this.doubleTapTimer) clearTimeout(this.doubleTapTimer);
      this.doubleTapTimer = setTimeout(() => {
        this.showDoubleTapHeart = false;
        this.cdr.markForCheck();
      }, 1000);
    });
  }

  // ════════════════════════════════════
  // ENGAGEMENT ACTIONS
  // ════════════════════════════════════

  toggleLike(): void {
    this.isLiked = !this.isLiked;
    this.post.likes += this.isLiked ? 1 : -1;

    if (this.isLiked) {
      this.showToast('❤️ You liked this post');
    }
  }

  toggleSave(): void {
    this.isSaved = !this.isSaved;
    this.showToast(
      this.isSaved
        ? '🔖 Post saved to your collection'
        : 'Removed from saved'
    );
  }

  toggleFollow(): void {
    this.isFollowing = !this.isFollowing;
    this.showToast(
      this.isFollowing
        ? `✅ Now following ${this.post.user.name}`
        : `Unfollowed ${this.post.user.name}`
    );
  }

  onShare(): void {
    this.showToast('🔗 Post link copied to clipboard!');
  }

  onReport(): void {
    this.router.navigate(['/safety/report'], {
      queryParams: { postId: this.post.id },
    });
  }

  onLocationClick(event: MouseEvent): void {
    event.stopPropagation();
    this.showToast(`📍 Viewing ${this.post.location} on map...`);
  }

  onHashtagClick(tag: string): void {
    this.showToast(`#${tag} — Searching posts...`);
  }

  // ════════════════════════════════════
  // COMMENTS
  // ════════════════════════════════════

  focusCommentInput(): void {
    if (this.commentInputRef) {
      this.commentInputRef.nativeElement.focus();
      this.commentInputRef.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }

  autoResizeTextarea(event: Event): void {
    const el = event.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }

  onCommentKeydown(event: Event): void {
    const keyEvent = event as KeyboardEvent;
    if (!keyEvent.shiftKey) {
      keyEvent.preventDefault();
      this.postComment();
    }
  }

  postComment(): void {
    const text = this.newCommentText.trim();
    if (!text) return;

    const newId = `comment-${Date.now()}`;
    const newComment: PostComment = {
      id: newId,
      author: {
        id: 'user-self',
        name: 'Alex Wanderer',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&h=120&fit=crop&crop=face',
        initials: 'AW',
        color: 'linear-gradient(135deg, #A4BE8D, #2D5A3D)',
        verified: false,
      },
      badge: 'You',
      text,
      time: 'Just now',
      likes: 0,
      liked: false,
      replies: [],
      showReplies: false,
    };

    // Add to top of comments array
    this.post.comments.unshift(newComment);
    this.newestCommentId = newId;

    // Clear input
    this.newCommentText = '';
    if (this.commentInputRef) {
      this.commentInputRef.nativeElement.style.height = 'auto';
    }

    this.showToast('💬 Comment posted!');

    // Remove animation class after animation completes
    setTimeout(() => {
      this.newestCommentId = null;
      this.cdr.markForCheck();
    }, 500);
  }

  toggleCommentLike(comment: PostComment | PostReply): void {
    comment.liked = !comment.liked;
    comment.likes += comment.liked ? 1 : -1;
    this.cdr.markForCheck();
  }

  toggleReplies(comment: PostComment): void {
    comment.showReplies = !comment.showReplies;
  }

  replyToComment(authorName: string): void {
    this.newCommentText = `@${authorName} `;
    this.focusCommentInput();
  }

  toggleSort(): void {
    this.sortLabel =
      this.sortLabel === 'Most Relevant' ? 'Most Recent' : 'Most Relevant';
    this.showToast(`📊 Sorted by ${this.sortLabel.toLowerCase()}`);
  }

  loadMoreComments(): void {
    this.showToast('Loading more comments...');
  }

  trackByCommentId(index: number, item: PostComment | PostReply): string {
    return item.id;
  }

  // ════════════════════════════════════
  // NAVIGATION
  // ════════════════════════════════════

  navigateToProfile(userId: string): void {
    this.router.navigate(['/community/profile', userId]);
  }

  navigateToProduct(productId: string): void {
    this.router.navigate(['/marketplace/product', productId]);
  }

  navigateToPost(postId: string): void {
    this.router.navigate(['/community/post', postId]);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  // ════════════════════════════════════
  // TOAST
  // ════════════════════════════════════

  showToast(message: string): void {
    this.toastMessage = message;
    this.toastVisible = true;
    this.cdr.markForCheck();

    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastVisible = false;
      this.cdr.markForCheck();
    }, 2800);
  }

  // ════════════════════════════════════
  // MOCK DATA
  // ════════════════════════════════════

  private getMockPost(id: string): Post {
    const users: Record<string, PostUser> = {
      'user-alex': {
        id: 'user-alex',
        name: 'Alex Wanderer',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&h=120&fit=crop&crop=face',
        initials: 'AW',
        color: '#2D5A3D',
        verified: true,
        online: true,
      },
      'user-sarah': {
        id: 'user-sarah',
        name: 'Sarah Chen',
        initials: 'SC',
        color: '#3A7350',
        avatar: '',
        verified: false,
      },
      'user-marcus': {
        id: 'user-marcus',
        name: 'Marcus Rivera',
        initials: 'MR',
        color: '#D4764E',
        avatar: '',
        verified: false,
      },
      'user-jamie': {
        id: 'user-jamie',
        name: 'Jamie Okafor',
        initials: 'JO',
        color: '#5C4033',
        avatar: '',
        verified: false,
      },
      'user-emma': {
        id: 'user-emma',
        name: 'Emma Lawson',
        initials: 'EL',
        color: '#8BAF7A',
        avatar: '',
        verified: false,
      },
      'user-kyle': {
        id: 'user-kyle',
        name: 'Kyle Nguyen',
        initials: 'KN',
        color: '#B85A35',
        avatar: '',
        verified: false,
      },
    };

    const comments: PostComment[] = [
      {
        id: 'c-1',
        author: users['user-sarah'],
        badge: 'Top Camper',
        text: 'This is absolutely stunning, Alex! Site #47 is now at the top of my list. How busy was it on a Thursday? Trying to plan a trip next month.',
        time: '1 hour ago',
        likes: 12,
        liked: false,
        showReplies: false,
        replies: [
          {
            id: 'r-1-1',
            author: users['user-alex'],
            badge: 'Author',
            text: 'Thanks Sarah! Thursday was pretty quiet — maybe 60% full. By Friday evening it was completely packed though. Definitely arrive early!',
            time: '45 min ago',
            likes: 8,
            liked: false,
          },
          {
            id: 'r-1-2',
            author: users['user-sarah'],
            badge: null,
            text: 'Perfect, adding it to the calendar right now! 🗓️',
            time: '30 min ago',
            likes: 3,
            liked: false,
          },
        ],
      },
      {
        id: 'c-2',
        author: users['user-marcus'],
        badge: null,
        text: "The Trango 3 is such a solid tent! I've been using it for about 6 months now and it handles wind like a champ. How did it do with condensation?",
        time: '1.5 hours ago',
        likes: 7,
        liked: false,
        showReplies: false,
        replies: [
          {
            id: 'r-2-1',
            author: users['user-alex'],
            badge: 'Author',
            text: 'Minimal condensation honestly! The dual vestibule design really helps with airflow. Only noticed some on the second night when temps dropped below 30°F.',
            time: '1 hour ago',
            likes: 5,
            liked: false,
          },
        ],
      },
      {
        id: 'c-3',
        author: users['user-jamie'],
        badge: 'Trail Guide',
        text: "That golden hour shot is unreal 📸 What time exactly did you take this? I'm heading there in August and want to get a similar shot.",
        time: '2 hours ago',
        likes: 15,
        liked: false,
        showReplies: false,
        replies: [],
      },
      {
        id: 'c-4',
        author: users['user-emma'],
        badge: null,
        text: 'Living vicariously through this post right now! The Yosemite Valley is pure magic. Does anyone know if permits are still required for overnight camping?',
        time: '3 hours ago',
        likes: 4,
        liked: false,
        showReplies: false,
        replies: [
          {
            id: 'r-4-1',
            author: users['user-kyle'],
            badge: null,
            text: 'Yes, wilderness permits are required for overnight backcountry trips. You can reserve them on recreation.gov — they open up 24 weeks in advance!',
            time: '2.5 hours ago',
            likes: 9,
            liked: false,
          },
          {
            id: 'r-4-2',
            author: users['user-emma'],
            badge: null,
            text: 'Thank you Kyle! Just set a reminder 🙏',
            time: '2 hours ago',
            likes: 2,
            liked: false,
          },
        ],
      },
      {
        id: 'c-5',
        author: users['user-kyle'],
        badge: 'Gear Expert',
        text: "How's the MSR WindBurner performing at altitude? I've had mixed results with pressurized canisters above 8,000ft. Would love your honest take.",
        time: '4 hours ago',
        likes: 11,
        liked: false,
        showReplies: false,
        replies: [],
      },
    ];

    const taggedProducts: TaggedProduct[] = [
      { id: 'prod-001', name: 'Mountain Hardwear Trango 3', icon: '⛺' },
      { id: 'prod-002', name: 'Black Diamond Spot 400', icon: '🔦' },
      { id: 'prod-003', name: 'MSR WindBurner Stove', icon: '🍳' },
      { id: 'prod-004', name: 'Patagonia Nano Puff', icon: '🧥' },
      { id: 'prod-005', name: 'Salomon X Ultra 4', icon: '🥾' },
    ];

    const relatedPosts: RelatedPost[] = [
      {
        id: 'post-002',
        image: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=500&h=400&fit=crop',
        author: users['user-alex'],
        caption: 'New ultralight setup — weighing in at just 8 lbs total. Detailed breakdown coming soon.',
        tag: 'Gear Review',
        likes: 187,
        comments: 15,
      },
      {
        id: 'post-003',
        image: 'https://images.unsplash.com/photo-1475483768296-6163e08872a1?w=500&h=400&fit=crop',
        author: users['user-marcus'],
        caption: 'Fire-starting workshop with the crew. Skills every camper should master.',
        tag: 'Survival',
        likes: 198,
        comments: 12,
      },
      {
        id: 'post-004',
        image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=500&h=400&fit=crop',
        author: users['user-jamie'],
        caption: 'Cascade Falls overnight. The sound of rushing water is the best white noise.',
        tag: 'North Cascades',
        likes: 389,
        comments: 31,
      },
      {
        id: 'post-005',
        image: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=500&h=400&fit=crop',
        author: users['user-sarah'],
        caption: 'Summit selfie at 14,000ft. The air is thin but the views are incredible.',
        tag: 'Summit',
        likes: 612,
        comments: 54,
      },
      {
        id: 'post-006',
        image: 'https://images.unsplash.com/photo-1517824806704-9040b037703b?w=500&h=400&fit=crop',
        author: users['user-emma'],
        caption: 'Milky Way over camp. 30 second exposure, zero editing needed.',
        tag: 'Night Sky',
        likes: 478,
        comments: 41,
      },
      {
        id: 'post-007',
        image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=500&h=400&fit=crop',
        author: users['user-kyle'],
        caption: 'Trail running through the Adirondacks — 12 miles of pure adrenaline.',
        tag: 'Trail Running',
        likes: 276,
        comments: 22,
      },
    ];

    return {
      id: id || 'post-001',
      user: users['user-alex'],
      location: 'Yosemite Valley, CA',
      timestamp: '2 hours ago',
      content: `First light hitting El Capitan from our basecamp this morning. We woke up at 4:30 AM and it was absolutely worth every minute of lost sleep. The way the granite face glows during golden hour is something you have to witness in person. 🌄

This trip has been a masterclass in patience — the weather didn't cooperate for the first two days, but this morning everything aligned. Set up the new tent from @MountainHardwear and it handled everything beautifully.

Pro tip: Camp at site #47 for this exact view. Arrive Thursday to snag it for the weekend. Trust me on this one.`,
      media: [
        'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1000&h=700&fit=crop',
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000&h=700&fit=crop',
        'https://images.unsplash.com/photo-1537905569824-f89f14cceb68?w=1000&h=700&fit=crop',
      ],
      likes: 342,
      comments,
      taggedProducts,
      hashtags: [
        'YosemiteValley',
        'CampLife',
        'GoldenHour',
        'BackpackingAdventures',
        'WildCamping',
      ],
      shares: 14,
      likedByUsers: [
        users['user-sarah'],
        users['user-marcus'],
        users['user-jamie'],
      ],
      relatedPosts,
    };
  }
}
