import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TrustScoreComponent } from '../../../shared/components/trust-score/trust-score.component';
import { AuthService } from '../../../core/services/auth.service';
import { CommunityService } from '../../../core/services/community.service';
import { CategoryMeta, CategoryTopic } from '../models/community.model';

@Component({
    selector: 'app-forum-category',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, TrustScoreComponent],
    templateUrl: './forum-category.component.html',
    styleUrls: ['./forum-category.component.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class ForumCategoryComponent implements OnInit {

    categoryId = '';
    searchQuery = '';
    activeFilter = 'latest';
    currentPage = 1;
    totalPages = 1;
    loading = true;

    categoryMap: Record<string, any> = {
        '1': { id: '1', name: 'Gear & Equipment', description: 'Discuss tents, sleeping bags, backpacks, stoves, and all the gear that makes your camping trips unforgettable.', icon: '🎒', topicsCount: 0, membersCount: '1.2k', lastActive: 'Recent' },
        '2': { id: '2', name: 'Campsites & Locations', description: 'Discover hidden gems, share campsite reviews, and get location-specific tips from locals.', icon: '🗺️', topicsCount: 0, membersCount: '2.1k', lastActive: 'Recent' },
        '3': { id: '3', name: 'Survival & Safety', description: 'First aid, wildlife encounters, weather preparedness, and essential survival skills.', icon: '🧭', topicsCount: 0, membersCount: '980', lastActive: 'Recent' },
        '4': { id: '4', name: 'Trip Planning', description: 'Itineraries, packing lists, budget tips, group coordination, and route planning advice.', icon: '📋', topicsCount: 0, membersCount: '1.5k', lastActive: 'Recent' },
        '5': { id: '5', name: 'Stories & Experiences', description: 'Share your trip tales, unforgettable moments, lessons learned, and photos from the wild.', icon: '📖', topicsCount: 0, membersCount: '1.8k', lastActive: 'Recent' },
        '6': { id: '6', name: "Beginners' Corner", description: 'No question is too basic. Get friendly help, starter guides, and warm welcomes.', icon: '🌱', topicsCount: 0, membersCount: '760', lastActive: 'Recent' }
    };

    category: any = this.categoryMap['1'];
    allTopics: CategoryTopic[] = [];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        public authService: AuthService,
        private communityService: CommunityService
    ) { }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.categoryId = params['id'] || '1';
            this.category = this.categoryMap[this.categoryId] || this.categoryMap['1'];
            this.loadCategoryTopics();
        });
    }

    loadCategoryTopics(): void {
        this.loading = true;
        this.communityService.getPosts().subscribe({
            next: (posts) => {
                // Filter posts by category name
                this.allTopics = posts
                    .filter(p => p.category === this.category.name)
                    .map(p => ({
                        id: p.id.toString(),
                        title: p.title,
                        author: p.author.name,
                        avatar: p.author.avatar,
                        trustScore: p.author.trustScore,
                        replies: typeof p.comments === 'number' ? p.comments : (p.comments?.length || 0),
                        views: p.views || 0,
                        lastActivity: 'Recent',
                        lastUser: 'User',
                        pinned: p.isPinned,
                        locked: p.status === 'locked',
                        hot: (p.likes + (typeof p.comments === 'number' ? p.comments : (p.comments?.length || 0))) > 20
                    }));
                this.category.topicsCount = this.allTopics.length;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading category topics', err);
                this.loading = false;
            }
        });
    }

    get filteredTopics(): CategoryTopic[] {
        let topics = [...this.allTopics];

        // Search filter
        if (this.searchQuery.trim()) {
            const q = this.searchQuery.toLowerCase();
            topics = topics.filter(t =>
                t.title.toLowerCase().includes(q) ||
                t.author.toLowerCase().includes(q)
            );
        }

        // Tab filter
        switch (this.activeFilter) {
            case 'top':
                topics.sort((a, b) => b.views - a.views);
                break;
            case 'unanswered':
                topics = topics.filter(t => t.replies === 0);
                break;
            case 'hot':
                topics = topics.filter(t => t.hot);
                break;
            default: // 'latest'
                break;
        }

        return topics;
    }

    setActiveFilter(filter: string): void {
        this.activeFilter = filter;
    }

    navigateToTopic(id: string): void {
        this.router.navigate(['/community/forum/topic', id]);
    }

    navigateToCreate(): void {
        this.router.navigate(['/community/forum/create'], { queryParams: { categoryId: this.categoryId } });
    }

    navigateToForum(): void {
        this.router.navigate(['/community/forum']);
    }

    formatNumber(n: number): string {
        if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
        return n.toString();
    }

    getPages(): number[] {
        const pages: number[] = [];
        for (let i = 1; i <= Math.min(this.totalPages, 5); i++) {
            pages.push(i);
        }
        return pages;
    }

    setPage(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
        }
    }
}

