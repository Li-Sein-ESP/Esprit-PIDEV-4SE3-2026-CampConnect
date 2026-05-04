import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { LeaderboardService, LeaderboardResponseDTO } from '../../../core/services/leaderboard.service';

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
    styleUrls: ['./leaderboard.component.scss'],
    encapsulation: ViewEncapsulation.None
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

    campers: Camper[] = [];
    stats = {
        activeCampers: 0,
        totalBadges: 0,
        totalTrips: 0,
        avgTrustScore: 0
    };

    loading = false;

    get podiumCampers(): Camper[] {
        // Return rank 1 (index 0), rank 2 (index 1), rank 3 (index 2)
        return this.campers.slice(0, 3);
    }

    get tableCampers(): Camper[] {
        const rest = this.campers.filter(c => (c.id || 0) > 3);
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

    constructor(
        private leaderboardService: LeaderboardService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.fetchLeaderboard();
        setTimeout(() => { this.statsVisible = true; }, 100);
        setTimeout(() => { this.podiumVisible = true; }, 200);
        setTimeout(() => { this.tableVisible = true; }, 400);
        setTimeout(() => { this.yourPositionVisible = true; }, 1200);
    }

    selectPeriod(period: 'week' | 'month' | 'year' | 'all'): void {
        this.selectedPeriod = period;
        this.fetchLeaderboard();
    }

    private fetchLeaderboard(): void {
        const currentUserId = this.authService.currentUserValue?.id;
        this.loading = true;
        this.leaderboardService.getLeaderboard(this.selectedPeriod, currentUserId).subscribe({
            next: (res: LeaderboardResponseDTO) => {
                this.campers = (res.entries || []).map((e, index) => ({
                    id: e.rank || Number(index + 1),
                    username: e.username,
                    handle: e.handle,
                    avatar: e.avatar,
                    initials: e.initials,
                    avatarBg: e.avatarBg,
                    avatarColor: e.avatarColor,
                    trustScore: e.trustScore,
                    points: e.points,
                    badges: e.badges || [],
                    rankChange: e.rankChange,
                    trips: e.trips,
                    joinedDate: e.joinedDate,
                    isSelf: e.self
                }));
                this.stats = {
                    activeCampers: res.activeCampers || 0,
                    totalBadges: res.totalBadges || 0,
                    totalTrips: res.totalTrips || 0,
                    avgTrustScore: res.avgTrustScore || 0
                };
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to load leaderboard', err);
                this.loading = false;
            }
        });
    }
}
