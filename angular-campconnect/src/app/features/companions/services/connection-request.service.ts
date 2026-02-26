import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConnectionRequest, ConnectionStatus } from '../models/companion.model';

const STORAGE_KEY = 'campconnect_connection_requests';
const CURRENT_USER_ID = 'me'; // Simulated logged-in user

@Injectable({ providedIn: 'root' })
export class ConnectionRequestService {

    private readonly requests$ = new BehaviorSubject<ConnectionRequest[]>(this.load());

    // ── Public Observables ────────────────────────────────────────────────────

    /** Requests received by the current user that are still pending */
    getReceived(): Observable<ConnectionRequest[]> {
        return this.requests$.pipe(
            map(all => all.filter(r => r.toUserId === CURRENT_USER_ID && r.status === 'pending'))
        );
    }

    /** Requests sent by the current user (all statuses) */
    getSent(): Observable<ConnectionRequest[]> {
        return this.requests$.pipe(
            map(all => all.filter(r => r.fromUserId === CURRENT_USER_ID && r.status !== 'cancelled'))
        );
    }

    /** All accepted connections involving the current user */
    getAccepted(): Observable<ConnectionRequest[]> {
        return this.requests$.pipe(
            map(all => all.filter(r =>
                (r.fromUserId === CURRENT_USER_ID || r.toUserId === CURRENT_USER_ID)
                && r.status === 'accepted'
            ))
        );
    }

    /** Count of pending received requests (for badge) */
    getPendingCount(): Observable<number> {
        return this.requests$.pipe(
            map(all => all.filter(r => r.toUserId === CURRENT_USER_ID && r.status === 'pending').length)
        );
    }

    /** Status of a request toward a specific user, if any */
    getStatusTo(toUserId: string): Observable<ConnectionStatus | null> {
        return this.requests$.pipe(
            map(all => {
                const req = all.find(r =>
                    r.fromUserId === CURRENT_USER_ID && r.toUserId === toUserId
                );
                return req ? req.status : null;
            })
        );
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    sendRequest(params: {
        toUserId: string;
        toUserName: string;
        toUserAvatar: string;
        campingStyle: string;
        experienceLevel: string;
        matchScore: number;
        message?: string;
    }): ConnectionRequest {
        const existing = this.requests$.value.find(
            r => r.fromUserId === CURRENT_USER_ID && r.toUserId === params.toUserId && r.status === 'pending'
        );
        if (existing) return existing; // prevent duplicates

        const now = new Date().toISOString();
        const request: ConnectionRequest = {
            id: crypto.randomUUID(),
            fromUserId: CURRENT_USER_ID,
            fromUserName: 'You',
            fromUserAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&q=80',
            toUserId: params.toUserId,
            toUserName: params.toUserName,
            toUserAvatar: params.toUserAvatar,
            campingStyle: params.campingStyle,
            experienceLevel: params.experienceLevel,
            matchScore: params.matchScore,
            message: params.message,
            status: 'pending',
            createdAt: now,
            updatedAt: now,
        };
        this.mutate(all => [...all, request]);

        // Simulate receiving a request from u2 if none exists yet (demo)
        this.seedIncomingDemo();

        return request;
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    acceptRequest(id: string): void {
        this.updateStatus(id, 'accepted');
    }

    declineRequest(id: string): void {
        this.updateStatus(id, 'declined');
    }

    cancelRequest(id: string): void {
        this.updateStatus(id, 'cancelled');
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    unmatch(id: string): void {
        this.mutate(all => all.filter(r => r.id !== id));
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    private updateStatus(id: string, status: ConnectionStatus): void {
        this.mutate(all =>
            all.map(r => r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r)
        );
    }

    private mutate(fn: (all: ConnectionRequest[]) => ConnectionRequest[]): void {
        const updated = fn(this.requests$.value);
        this.requests$.next(updated);
        this.save(updated);
    }

    private save(data: ConnectionRequest[]): void {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
    }

    private load(): ConnectionRequest[] {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : this.defaultRequests();
        } catch {
            return this.defaultRequests();
        }
    }

    /** Pre-seed one incoming demo request so the UI is not empty on first load */
    private defaultRequests(): ConnectionRequest[] {
        return [{
            id: 'demo-incoming-1',
            fromUserId: 'u3',
            fromUserName: 'Elena Rodriguez',
            fromUserAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
            toUserId: CURRENT_USER_ID,
            toUserName: 'You',
            toUserAvatar: '',
            campingStyle: 'Car Camping',
            experienceLevel: 'Beginner',
            matchScore: 88,
            message: "Hey! I saw your profile and I think we'd make a great camping team 🏕️",
            status: 'pending',
            createdAt: new Date(Date.now() - 3600_000).toISOString(),
            updatedAt: new Date(Date.now() - 3600_000).toISOString(),
        }];
    }

    private seedIncomingDemo(): void {
        const already = this.requests$.value.some(r => r.fromUserId === 'u2' && r.toUserId === CURRENT_USER_ID);
        if (already) return;
        const now = new Date().toISOString();
        const demo: ConnectionRequest = {
            id: 'demo-incoming-2',
            fromUserId: 'u2',
            fromUserName: 'Marcus Thorne',
            fromUserAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&q=80',
            toUserId: CURRENT_USER_ID,
            toUserName: 'You',
            toUserAvatar: '',
            campingStyle: 'Vanlife',
            experienceLevel: 'Intermediate',
            matchScore: 65,
            message: "I'm planning a national parks road trip, want to join?",
            status: 'pending',
            createdAt: now,
            updatedAt: now,
        };
        this.mutate(all => [...all, demo]);
    }
}
