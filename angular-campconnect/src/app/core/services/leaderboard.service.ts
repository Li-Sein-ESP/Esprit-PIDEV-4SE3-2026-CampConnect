import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LeaderboardBadgeDto {
    title: string;
    theme: string;
    icon: string;
}

export interface LeaderboardEntryDTO {
    id: string;
    userId: string;
    username: string;
    handle: string;
    avatar: string | null;
    initials: string;
    avatarBg: string;
    avatarColor: string;
    rank: number;
    trustScore: number;
    points: number;
    rankChange: number;
    trips: number;
    joinedDate: string;
    badges: LeaderboardBadgeDto[];
    self: boolean;
}

export interface LeaderboardResponseDTO {
    period: string;
    entries: LeaderboardEntryDTO[];
    activeCampers: number;
    totalBadges: number;
    totalTrips: number;
    avgTrustScore: number;
}

@Injectable({
    providedIn: 'root'
})
export class LeaderboardService {
    private readonly apiUrl = `${environment.apiUrl}/leaderboard`;

    constructor(private http: HttpClient) { }

    getLeaderboard(period: 'week' | 'month' | 'year' | 'all', currentUserId?: string): Observable<LeaderboardResponseDTO> {
        let params = new HttpParams().set('period', period);
        if (currentUserId) {
            params = params.set('currentUserId', currentUserId);
        }
        return this.http.get<LeaderboardResponseDTO>(this.apiUrl, { params });
    }
}
