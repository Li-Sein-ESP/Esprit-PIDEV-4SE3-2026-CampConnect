import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GroupInviteService } from '../../groups/services/group-invite.service';
import { InviteStatus } from '../../groups/models/group-invite.model';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule, Mail, MailOpen, Check, X, Send, Calendar, Tent, BellRing, Navigation, Brain, Sparkles, Target } from 'lucide-angular';

@Component({
    selector: 'app-group-invites-manager',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        LucideAngularModule
    ],
    templateUrl: './group-invites-manager.component.html',
    styleUrl: './group-invites-manager.component.css'
})
export class GroupInvitesManagerComponent implements OnInit {
    // Icons
    readonly Mail = Mail;
    readonly MailOpen = MailOpen;
    readonly Check = Check;
    readonly XList = X;
    readonly Send = Send;
    readonly Calendar = Calendar;
    readonly Tent = Tent;
    readonly BellRing = BellRing;
    readonly Navigation = Navigation;
    readonly Brain = Brain;
    readonly Sparkles = Sparkles;
    readonly Target = Target;

    activeTab: 'received' | 'sent' = 'received';
    invites: any[] = [];
    loading = true;

    constructor(
        private inviteService: GroupInviteService,
        private authService: AuthService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.authService.getCurrentUser().subscribe(user => {
            if (user?.id) {
                this.currentUserId = user.id;
                this.loadInvites(user.id);
            }
            this.cdr.detectChanges();
        });
    }
    currentUserId: string | null = null;

    loadInvites(userId: string) {
        this.loading = true;
        this.inviteService.getInvitesWithDetails(userId).subscribe({
            next: (data: any[]) => {
                this.invites = data;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('Failed to load invites', err);
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    get receivedPending() {
        return this.invites.filter(i => i.type === 'received' && i.invite.status === 'PENDING');
    }

    get receivedHistory() {
        return this.invites.filter(i => i.type === 'received' && i.invite.status !== 'PENDING');
    }

    get sentInvites() {
        return this.invites.filter(i => i.type === 'sent');
    }

    setTab(tab: 'received' | 'sent') {
        if (this.activeTab === tab) return;
        this.activeTab = tab;
        setTimeout(() => {
            this.cdr.detectChanges();
        }, 10);
    }

    formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    }

    formatTimeAgo(dateStr: string): string {
        const d = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffHours = Math.round(diffMs / (1000 * 60 * 60));
        const diffDays = Math.round(diffHours / 24);

        if (diffHours < 24) return `Il y a ${diffHours}h`;
        if (diffDays === 1) return `Hier`;
        return `Il y a ${diffDays} jours`;
    }

    // Feedback Modal State
    showFeedbackModal = false;
    pendingDecision: { inviteId: string, action: 'accept' | 'decline' } | null = null;
    selectedReason = '';
    helpfulPrediction: boolean | null = null;
    readonly traitsList = ['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism'];

    successState: 'accept' | 'decline' | null = null;

    openFeedbackModal(inviteId: string, action: 'accept' | 'decline') {
        this.pendingDecision = { inviteId, action };
        this.showFeedbackModal = true;
        this.selectedReason = '';
        this.helpfulPrediction = null;
        this.successState = null;
    }

    closeFeedbackModal() {
        this.showFeedbackModal = false;
        this.pendingDecision = null;
        this.successState = null;
    }

    submitDecision() {
        if (!this.pendingDecision) return;
        
        const { inviteId, action } = this.pendingDecision;
        const call = action === 'accept' ? 
            this.inviteService.acceptInvite(inviteId, this.selectedReason, this.helpfulPrediction === true) :
            this.inviteService.declineInvite(inviteId, this.selectedReason, this.helpfulPrediction === true);

        call.subscribe({
            next: () => {
                this.successState = action;
                this.cdr.detectChanges();
                // Auto-close after 2 seconds
                setTimeout(() => {
                    this.closeFeedbackModal();
                    if (this.currentUserId) this.loadInvites(this.currentUserId);
                    this.cdr.detectChanges();
                }, 2000);
            },
            error: (err) => {
                console.error(`Failed to ${action} invite`, err);
                this.closeFeedbackModal();
                this.cdr.detectChanges();
            }
        });
    }

    cancelInvite(inviteId: string) {
        this.inviteService.cancelInvite(inviteId).subscribe({
            next: () => {
                if (this.currentUserId) this.loadInvites(this.currentUserId);
                this.cdr.detectChanges();
            }
        });
    }

    getStatusClass(status: string): string {
        const map: Record<string, string> = {
            PENDING: 'status-pending',
            ACCEPTED: 'status-accepted',
            DECLINED: 'status-declined',
            EXPIRED: 'status-expired',
            CANCELLED: 'status-cancelled'
        };
        return map[status] || 'status-default';
    }

    getStyleLabel(style: string): string {
        const map: Record<string, string> = {
            WILD: 'Sauvage', GLAMPING: 'Glamping', CABIN: 'Chalet',
            CAR_CAMPING: 'Camping Car', BACKPACKING: 'Backpacking',
            RV: 'Van', TRADITIONAL: 'Traditionnel'
        };
        return map[style] || style;
    }
}
