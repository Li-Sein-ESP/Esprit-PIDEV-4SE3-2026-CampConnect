import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GroupInviteService } from '../services/group-invite.service';
import { LucideAngularModule, Mail, MailOpen, Check, X, Send, Calendar, Tent, BellRing, Navigation } from 'lucide-angular';

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

    activeTab: 'received' | 'sent' = 'received';
    invites: any[] = [];
    loading = true;

    constructor(private inviteService: GroupInviteService) { }

    ngOnInit(): void {
        this.loadInvites();
    }

    loadInvites() {
        this.loading = true;
        // Using the mock method for showcase while actual backend DTOs might differ
        this.inviteService.getMockInvitesWithDetails().subscribe({
            next: (data) => {
                this.invites = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to load invites', err);
                this.loading = false;
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
        this.activeTab = tab;
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

    acceptInvite(inviteId: string) {
        // Optimistic UI update
        const index = this.invites.findIndex(i => i.invite.id === inviteId);
        if (index > -1) {
            this.invites[index].invite.status = 'ACCEPTED';
        }

        // API Call
        this.inviteService.acceptInvite(inviteId).subscribe({
            next: () => console.log('Invite accepted'),
            error: () => console.log('Simulating success for frontend UI demo')
        });
    }

    declineInvite(inviteId: string) {
        const index = this.invites.findIndex(i => i.invite.id === inviteId);
        if (index > -1) {
            this.invites[index].invite.status = 'DECLINED';
        }
        this.inviteService.declineInvite(inviteId).subscribe();
    }

    cancelInvite(inviteId: string) {
        const index = this.invites.findIndex(i => i.invite.id === inviteId);
        if (index > -1) {
            this.invites[index].invite.status = 'CANCELLED';
        }
        this.inviteService.cancelInvite(inviteId).subscribe();
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
