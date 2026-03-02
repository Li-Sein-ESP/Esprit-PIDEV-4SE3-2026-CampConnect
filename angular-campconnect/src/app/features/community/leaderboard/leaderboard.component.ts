import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

export interface CamperBadge {
    title: string;
    theme: string; // 'forest' | 'amber' | 'gold' | 'terra' | 'slate' | 'sage' | 'teal'
    icon: string;  // SVG path key
}

export interface Camper {
    id: number;
    username: string;
    handle: string;
    avatar: string | null;   // URL or null for initials fallback
    initials: string;
    avatarBg: string;
    avatarColor: string;
    trustScore: number;
    points: number;
    badges: CamperBadge[];
    rankChange: number;      // positive = up, negative = down, 0 = same
    trips: number;
    joinedDate: string;
    isSelf?: boolean;
}

@Component({
    selector: 'app-leaderboard',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './leaderboard.component.html',
    styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit {

    selectedPeriod: 'week' | 'month' | 'year' | 'all' = 'month';
    searchQuery = '';
    podiumVisible = false;
    tableVisible = false;
    statsVisible = false;
    yourPositionVisible = false;

    periods = [
        { key: 'week', label: 'This Week' },
        { key: 'month', label: 'This Month' },
        { key: 'year', label: 'This Year' },
        { key: 'all', label: 'All Time' }
    ] as const;

    campers: Camper[] = [
        {
            id: 1,
            username: 'Sarah Mitchell',
            handle: '@sarah.trails',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face',
            initials: 'SM',
            avatarBg: '#f5ecd0',
            avatarColor: '#b8922e',
            trustScore: 96,
            points: 4520,
            badges: [
                { title: 'First Camp', theme: 'forest', icon: 'tent' },
                { title: 'Fire Starter', theme: 'amber', icon: 'fire' },
                { title: 'Gear Master', theme: 'gold', icon: 'star' },
                { title: 'Trailblazer', theme: 'terra', icon: 'trail' },
                { title: 'Wildlife Spotter', theme: 'teal', icon: 'binoculars' }
            ],
            rankChange: 0,
            trips: 47,
            joinedDate: 'Oct 2021'
        },
        {
            id: 2,
            username: 'Jake Calloway',
            handle: '@jake_outdoors',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face',
            initials: 'JC',
            avatarBg: '#e8ecef',
            avatarColor: '#8a9299',
            trustScore: 82,
            points: 3840,
            badges: [
                { title: 'First Camp', theme: 'forest', icon: 'tent' },
                { title: 'Trailblazer', theme: 'terra', icon: 'trail' },
                { title: 'Night Owl', theme: 'slate', icon: 'moon' },
                { title: 'Eco Warrior', theme: 'sage', icon: 'leaf' }
            ],
            rankChange: 1,
            trips: 38,
            joinedDate: 'Jan 2022'
        },
        {
            id: 3,
            username: 'Marcus Webb',
            handle: '@marcus.camp',
            avatar: null,
            initials: 'MW',
            avatarBg: '#f5e8e0',
            avatarColor: '#b06040',
            trustScore: 74,
            points: 3120,
            badges: [
                { title: 'First Camp', theme: 'forest', icon: 'tent' },
                { title: 'Eco Warrior', theme: 'sage', icon: 'leaf' },
                { title: 'Fire Starter', theme: 'amber', icon: 'fire' }
            ],
            rankChange: -1,
            trips: 29,
            joinedDate: 'Feb 2022'
        },
        {
            id: 4,
            username: 'Priya Singh',
            handle: '@priya_wild',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face',
            initials: 'PS',
            avatarBg: '#edf2f7',
            avatarColor: '#4a6b8a',
            trustScore: 78,
            points: 2950,
            badges: [
                { title: 'First Camp', theme: 'forest', icon: 'tent' },
                { title: 'Fire Starter', theme: 'amber', icon: 'fire' },
                { title: 'Wildlife Spotter', theme: 'teal', icon: 'binoculars' }
            ],
            rankChange: 2,
            trips: 32,
            joinedDate: 'Jan 2022'
        },
        {
            id: 5,
            username: 'Lucas Torres',
            handle: '@lucas_hiker',
            avatar: null,
            initials: 'LT',
            avatarBg: '#eff5ef',
            avatarColor: '#6b8f6b',
            trustScore: 71,
            points: 2710,
            badges: [
                { title: 'First Camp', theme: 'forest', icon: 'tent' },
                { title: 'Eco Warrior', theme: 'sage', icon: 'leaf' }
            ],
            rankChange: -1,
            trips: 28,
            joinedDate: 'Mar 2022'
        },
        {
            id: 6,
            username: 'Jordan Rivers',
            handle: '@jordan_trails',
            avatar: 'https://images.unsplash.com/photo-1535930749574-1399327ce78f?w=120&h=120&fit=crop&crop=face',
            initials: 'JR',
            avatarBg: '#dceee2',
            avatarColor: '#2d5a3d',
            trustScore: 68,
            points: 2480,
            badges: [
                { title: 'First Camp', theme: 'forest', icon: 'tent' },
                { title: 'Trailblazer', theme: 'terra', icon: 'trail' }
            ],
            rankChange: 3,
            trips: 19,
            joinedDate: 'Jun 2023',
            isSelf: true
        },
        {
            id: 7,
            username: 'Emma Rodriguez',
            handle: '@emma_wild',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=face',
            initials: 'ER',
            avatarBg: '#f8f0e0',
            avatarColor: '#a67c3d',
            trustScore: 65,
            points: 2340,
            badges: [
                { title: 'First Camp', theme: 'forest', icon: 'tent' },
                { title: 'Fire Starter', theme: 'amber', icon: 'fire' },
                { title: 'Night Owl', theme: 'slate', icon: 'moon' },
                { title: 'Gear Master', theme: 'gold', icon: 'star' }
            ],
            rankChange: 0,
            trips: 22,
            joinedDate: 'Aug 2022'
        },
        {
            id: 8,
            username: 'David Nakamura',
            handle: '@david_peaks',
            avatar: null,
            initials: 'DN',
            avatarBg: '#eaf5f5',
            avatarColor: '#2e7d7b',
            trustScore: 61,
            points: 2180,
            badges: [
                { title: 'First Camp', theme: 'forest', icon: 'tent' },
                { title: 'Wildlife Spotter', theme: 'teal', icon: 'binoculars' }
            ],
            rankChange: 5,
            trips: 15,
            joinedDate: 'Nov 2022'
        },
        {
            id: 9,
            username: 'Olivia Martinez',
            handle: '@olivia_camp',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face',
            initials: 'OM',
            avatarBg: '#f5e8e0',
            avatarColor: '#b06040',
            trustScore: 55,
            points: 1990,
            badges: [
                { title: 'First Camp', theme: 'forest', icon: 'tent' },
                { title: 'Eco Warrior', theme: 'sage', icon: 'leaf' },
                { title: 'Trailblazer', theme: 'terra', icon: 'trail' }
            ],
            rankChange: -2,
            trips: 18,
            joinedDate: 'Apr 2023'
        },
        {
            id: 10,
            username: 'Kai Chen',
            handle: '@kai_explorer',
            avatar: null,
            initials: 'KC',
            avatarBg: '#f5eff6',
            avatarColor: '#7a5f80',
            trustScore: 49,
            points: 1840,
            badges: [
                { title: 'First Camp', theme: 'forest', icon: 'tent' },
                { title: 'Fire Starter', theme: 'amber', icon: 'fire' }
            ],
            rankChange: 8,
            trips: 12,
            joinedDate: 'Sep 2023'
        }
    ];

    get podiumCampers(): Camper[] {
        // Return rank 1 (index 0), rank 2 (index 1), rank 3 (index 2)
        return this.campers.slice(0, 3);
    }

    get tableCampers(): Camper[] {
        const rest = this.campers.slice(3);
        if (!this.searchQuery.trim()) return rest;
        const q = this.searchQuery.toLowerCase();
        return rest.filter(c =>
            c.username.toLowerCase().includes(q) ||
            c.handle.toLowerCase().includes(q)
        );
    }

    get selfCamper(): Camper | undefined {
        return this.campers.find(c => c.isSelf);
    }

    get selfRank(): number {
        return this.campers.findIndex(c => c.isSelf) + 1;
    }

    trustStrokeDashoffset(score: number): number {
        return 113 - (113 * score / 100);
    }

    getTrustStrokeColor(rank: number): string {
        if (rank === 1) return 'var(--lb-gold)';
        if (rank === 2) return 'var(--lb-green-400)';
        return 'var(--lb-green-500)';
    }

    setBadgeIcons(icon: string): string {
        return icon;
    }

    getInitials(username: string): string {
        return username.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    }

    ngOnInit(): void {
        setTimeout(() => { this.statsVisible = true; }, 100);
        setTimeout(() => { this.podiumVisible = true; }, 200);
        setTimeout(() => { this.tableVisible = true; }, 400);
        setTimeout(() => { this.yourPositionVisible = true; }, 1200);
    }

    selectPeriod(period: 'week' | 'month' | 'year' | 'all'): void {
        this.selectedPeriod = period;
    }
}
