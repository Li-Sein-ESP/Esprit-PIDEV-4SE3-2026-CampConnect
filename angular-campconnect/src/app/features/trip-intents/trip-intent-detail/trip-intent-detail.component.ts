import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TripIntentService } from '../services/trip-intent.service';

import { AuthService } from '../../../core/services/auth.service';
import { TripIntent } from '../models/trip-intent.model';
import { LucideAngularModule, ArrowLeft, Calendar, MapPin, DollarSign, Target, Tent, Clock, Share2, Users, Trash2, Loader2, Check, Compass, Flame, Settings } from 'lucide-angular';
import { BadgeComponent } from '../../../shared/components/badge.component';
import { GroupService } from '../../groups/services/group';
import { GroupInviteService } from '../../groups/services/group-invite.service';
import { InviteStatus } from '../../groups/models/group-invite.model';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-trip-intent-detail',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        LucideAngularModule,
        BadgeComponent
    ],
    templateUrl: './trip-intent-detail.component.html',
    styleUrl: './trip-intent-detail.component.css'
})
export class TripIntentDetailComponent implements OnInit {
    // Icons
    readonly ArrowLeft = ArrowLeft;
    readonly Calendar = Calendar;
    readonly MapPin = MapPin;
    readonly DollarSign = DollarSign;
    readonly Target = Target;
    readonly Tent = Tent;
    readonly Clock = Clock;
    readonly Share2 = Share2;
    readonly Users = Users;
    readonly Trash2 = Trash2;
    readonly Compass = Compass;
    readonly Flame = Flame;
    readonly Settings = Settings;

    intentId: string | null = null;
    intent: TripIntent | null = null;
    loading = true;
    error = false;
    currentUserId: string | null = null;
    isCreator = false;
    isDeleting = false;

    // Join Request States
    isJoining = false;
    hasRequested = false;
    isMember = false;
    requestSuccess = false;
    pendingInviteId: string | null = null;

    readonly Loader2 = Loader2;
    readonly Check = Check;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private tripIntentService: TripIntentService,
        private authService: AuthService,
        private groupService: GroupService,
        private inviteService: GroupInviteService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.authService.getCurrentUser().subscribe(user => {
            this.currentUserId = user?.id || null;
            this.updateIsCreator();
            this.checkIfRequested();
            this.cdr.detectChanges();
        });

        this.route.paramMap.subscribe(params => {
            this.intentId = params.get('id');
            if (this.intentId) {
                this.loadIntentDetails(this.intentId);
            } else {
                this.error = true;
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    loadIntentDetails(id: string) {
        this.loading = true;
        this.tripIntentService.getTripIntentById(id).subscribe({
            next: (data) => {
                this.intent = data;
                this.updateIsCreator();
                this.checkIfRequested();
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error fetching intent details', err);
                this.error = true;
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    private checkIfRequested() {
        if (!this.currentUserId || !this.intentId) return;

        // 1. Check if already a member
        this.groupService.getGroupByTripId(this.intentId).subscribe({
            next: (group) => {
                this.isMember = group.memberUserIds?.includes(this.currentUserId!) || false;
                
                // 2. If not a member, check for pending requests
                if (!this.isMember) {
                    this.inviteService.getInvitesByFromUser(this.currentUserId!).subscribe(invites => {
                        const pending = invites.find(inv => 
                            inv.tripIntentId === this.intentId && 
                            inv.status === InviteStatus.PENDING
                        );
                        this.hasRequested = !!pending;
                        this.pendingInviteId = pending?.id || null;
                        this.cdr.detectChanges();
                    });
                }
                this.cdr.detectChanges();
            },
            error: () => {
                // If group not found, user definitely not a member
                this.isMember = false;
                this.cdr.detectChanges();
            }
        });
    }

    requestToJoin() {
        if (!this.intent || !this.currentUserId || this.isJoining || this.hasRequested) return;

        this.isJoining = true;

        // 1. Find the associated group
        this.groupService.getGroupByTripId(this.intent.id!).subscribe({
            next: (group) => {
                // 2. Send the invitation/request
                const invite = {
                    tripIntentId: this.intent!.id!,
                    groupId: group.id,
                    fromUserId: this.currentUserId!,
                    toUserId: this.intent!.creatorUserId,
                    message: `I would like to join your project: ${this.intent!.title}`,
                    status: InviteStatus.PENDING
                };

                this.inviteService.sendInvite(invite).pipe(
                    finalize(() => this.isJoining = false)
                ).subscribe({
                    next: (res) => {
                        this.hasRequested = true;
                        this.pendingInviteId = res.id || null;
                        this.requestSuccess = true;
                        setTimeout(() => this.requestSuccess = false, 5000);
                    },
                    error: (err) => {
                        console.error('Failed to send join request', err);
                        alert('Error while sending the request.');
                    }
                });
            },
            error: (err) => {
                console.error('Failed to find associated group', err);
                this.isJoining = false;
                alert('This project does not have an active group yet.');
            }
        });
    }

    cancelJoinRequest() {
        if (!this.pendingInviteId || this.isJoining) return;

        this.isJoining = true;
        this.inviteService.cancelInvite(this.pendingInviteId).pipe(
            finalize(() => this.isJoining = false)
        ).subscribe({
            next: () => {
                this.hasRequested = false;
                this.pendingInviteId = null;
                alert('Request cancelled.');
            },
            error: (err) => {
                console.error('Failed to cancel request', err);
                alert('Error while cancelling.');
            }
        });
    }

    private updateIsCreator() {
        if (this.intent && this.currentUserId) {
            this.isCreator = this.intent.creatorUserId === this.currentUserId;
        } else {
            this.isCreator = false;
        }
    }

    // --- Formatting Helpers ---
    formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });
    }

    getDaysDifference(d1: string, d2: string): number {
        const diffTime = Math.abs(new Date(d2).getTime() - new Date(d1).getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive days
    }

    getStyleLabel(style: string): string {
        const map: Record<string, string> = {
            WILD: 'Wild', GLAMPING: 'Glamping', CABIN: 'Cabin',
            CAR_CAMPING: 'Car Camping', BACKPACKING: 'Backpacking',
            RV: 'Van', TRADITIONAL: 'Traditional'
        };
        return map[style] || style;
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'OPEN': return 'Open for Guests';
            case 'DRAFT': return 'Draft';
            case 'CLOSED': return 'Group Full / Project Closed';
            default: return status;
        }
    }

    get participantScoresArray(): { name: string, score: number }[] {
        if (!this.intent?.participantScores) return [];
        return Object.entries(this.intent.participantScores).map(([name, score]) => ({ name, score }));
    }

    getCompatibilityMessage(): { message: string, styleClass: string } {
        const score = this.intent?.compatibilityScore || 0;
        if (score >= 80) {
            return { 
                message: "Excellent match! This group perfectly matches your profile and habits.",
                styleClass: "text-green-700 bg-green-50 border-green-200"
            };
        } else if (score >= 50) {
            return {
                message: "Good compatibility. The atmosphere looks interesting with some nice differences.",
                styleClass: "text-blue-700 bg-blue-50 border-blue-200"
            };
        } else {
            return {
                message: "Bold adventure. Your styles differ, prepare to get out of your comfort zone!",
                styleClass: "text-orange-700 bg-orange-50 border-orange-200"
            };
        }
    }

    deleteIntent() {
        if (!this.intentId) return;
        if (confirm('Are you sure you want to delete this trip project? This action is irreversible.')) {
            this.isDeleting = true;
            this.tripIntentService.deleteTripIntent(this.intentId).subscribe({
                next: () => {
                    this.isDeleting = false;
                    this.router.navigate(['/my-trip-intents']);
                },
                error: (err) => {
                    console.error('Error deleting intent', err);
                    this.isDeleting = false;
                    alert('Error during deletion.');
                }
            });
        }
    }

    navigateToGroup(groupId: string | undefined) {
        if (groupId) {
            this.router.navigate(['/groups', groupId]);
        }
    }

    getFallbackImage(style: string): string {
        const fallbacks: Record<string, string> = {
            WILD: 'https://images.unsplash.com/photo-1517823382935-51bfcb0ec6bc?auto=format&fit=crop&q=80&w=1200',
            GLAMPING: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80&w=1200',
            CAR_CAMPING: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&q=80&w=1200',
            TRADITIONAL: 'https://images.unsplash.com/photo-1486915307817-2d5fc41b31f2?auto=format&fit=crop&q=80&w=1200',
            BACKPACKING: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=1200'
        };
        return fallbacks[style] || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=1200';
    }
}

