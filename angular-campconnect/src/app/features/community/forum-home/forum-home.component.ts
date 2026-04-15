import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TrustScoreComponent } from '../../../shared/components/trust-score/trust-score.component';
import { AuthService } from '../../../core/services/auth.service';
import { CommunityService } from '../../../core/services/community.service';
import { Post, CategoryMeta } from '../models/community.model';

export interface RecentTopic {
    id: string;
    title: string;
    author: string;
    authorInitials: string;
    avatarSeed?: string;
    avatarBg?: string;
    replies: number;
    lastReplyDate: string;
    trustScore: number;
    trustLevel: 'high' | 'mid' | 'new';
    categoryTag: string;
    isHot: boolean;
    isPinned: boolean;
}

@Component({
    selector: 'app-forum-home',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, TrustScoreComponent],
    templateUrl: './forum-home.component.html',
    styleUrls: ['./forum-home.component.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class ForumHomeComponent implements OnInit {

    searchQuery = '';
    activeCategoryFilter = 'all';
    activeSortFilter = 'latest';
    loading = true;

    categories: (CategoryMeta & { colorClass: string, avatarSeed: string, avatarBg: string })[] = [
        {
            id: '1',
            name: 'Gear & Equipment',
            description: 'Discuss tents, sleeping bags, backpacks, stoves, and all the gear that makes your camping trips unforgettable.',
            icon: '🎒',
            colorClass: 'gear',
            topicsCount: 0,
            membersCount: '1.2k',
            lastActive: 'Recent',
            lastUser: 'User',
            avatarSeed: 'Felix',
            avatarBg: 'ccf1f1'
        },
        {
            id: '2',
            name: 'Campsites & Locations',
            description: 'Discover hidden gems, share campsite reviews, and get location-specific tips from locals and seasoned campers.',
            icon: '🗺️',
            colorClass: 'locations',
            topicsCount: 0,
            membersCount: '2.1k',
            lastActive: 'Recent',
            lastUser: 'User',
            avatarSeed: 'Aneka',
            avatarBg: 'f5e6ff'
        },
        {
            id: '3',
            name: 'Survival & Safety',
            description: 'First aid, wildlife encounters, weather preparedness, and essential survival skills for the outdoors.',
            icon: '🧭',
            colorClass: 'safety',
            topicsCount: 0,
            membersCount: '980',
            lastActive: 'Recent',
            lastUser: 'User',
            avatarSeed: 'Patches',
            avatarBg: 'ffe6e6'
        },
        {
            id: '4',
            name: 'Trip Planning',
            description: 'Itineraries, packing lists, budget tips, group coordination, and route planning advice for your next adventure.',
            icon: '📋',
            colorClass: 'planning',
            topicsCount: 0,
            membersCount: '1.5k',
            lastActive: 'Recent',
            lastUser: 'User',
            avatarSeed: 'Buster',
            avatarBg: 'e6f2ff'
        },
        {
            id: '5',
            name: 'Stories & Experiences',
            description: 'Share your trip tales, unforgettable moments, lessons learned, and photos from the wild.',
            icon: '📖',
            colorClass: 'stories',
            topicsCount: 0,
            membersCount: '1.8k',
            lastActive: 'Recent',
            lastUser: 'User',
            avatarSeed: 'Missy',
            avatarBg: 'fff2e6'
        },
        {
            id: '6',
            name: "Beginners' Corner",
            description: 'No question is too basic. Get friendly help, starter guides, and warm welcomes from the community.',
            icon: '🌱',
            colorClass: 'beginners',
            topicsCount: 0,
            membersCount: '760',
            lastActive: 'Recent',
            lastUser: 'User',
            avatarSeed: 'Garfield',
            avatarBg: 'f2ffe6'
        }
    ];

    allTopics: RecentTopic[] = [];

    constructor(
        private router: Router,
        public authService: AuthService,
        private communityService: CommunityService
    ) { }

    ngOnInit(): void {
        this.loadTopics();
    }

    loadTopics(): void {
        this.loading = true;
        this.communityService.getPosts().subscribe({
            next: (posts) => {
                this.allTopics = posts.map(p => this.mapToRecentTopic(p as any));
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading topics', err);
                this.loading = false;
            }
        });
    }

    private mapToRecentTopic(post: any): RecentTopic {
        return {
            id: post.id.toString(),
            title: post.title,
            author: post.author.name,
            authorInitials: post.author.name.split(' ').map((n: string) => n[0]).join(''),
            replies: typeof post.comments === 'number' ? post.comments : (post.comments?.length || 0),
            lastReplyDate: 'Recent',
            trustScore: post.author.trustScore,
            trustLevel: post.author.trustScore > 80 ? 'high' : 'mid',
            categoryTag: post.category,
            isHot: false,
            isPinned: post.isPinned
        };
    }

    get filteredTopics(): RecentTopic[] {
        if (!this.searchQuery.trim()) return this.allTopics;
        const q = this.searchQuery.toLowerCase();
        return this.allTopics.filter(t =>
            t.title.toLowerCase().includes(q) ||
            t.author.toLowerCase().includes(q) ||
            t.categoryTag.toLowerCase().includes(q)
        );
    }

    navigateToCategory(id: string): void {
        this.router.navigate(['/community/forum/category', id]);
    }

    navigateToTopic(id: string): void {
        this.router.navigate(['/community/forum/topic', id]);
    }

    navigateToCreate(): void {
        this.router.navigate(['/community/forum/create']);
    }

    setActiveCategoryFilter(filter: string): void {
        this.activeCategoryFilter = filter;
    }

    setActiveSortFilter(filter: string): void {
        this.activeSortFilter = filter;
    }

    formatTopicsCount(count: number): string {
        if (count >= 1000) return (count / 1000).toFixed(1).replace('.0', '') + 'k';
        return count.toString();
    }
}

