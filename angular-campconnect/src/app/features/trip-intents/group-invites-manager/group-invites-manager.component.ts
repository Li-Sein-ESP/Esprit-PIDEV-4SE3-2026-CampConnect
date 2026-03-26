import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GroupInviteService } from '../../groups/services/group-invite.service';
import { InviteStatus } from '../../groups/models/group-invite.model';
import { AuthService } from '../../../core/services/auth.service';
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

    constructor(
        private inviteService: GroupInviteService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.authService.getCurrentUser().subscribe(user => {
            if (user?.id) {
                this.currentUserId = user.id;
                this.loadInvites(user.id);
            }
        });
    }
    currentUserId: string | null = null;

    loadInvites(userId: string) {
        this.loading = true;
        this.inviteService.getInvitesWithDetails(userId).subscribe({
            next: (data: any[]) => {
                this.invites = data;
                this.loading = false;
            },
            error: (err: any) => {
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
        // API Call
        this.inviteService.acceptInvite(inviteId).subscribe({
            next: () => {
                console.log('Invite accepted');
                if (this.currentUserId) this.loadInvites(this.currentUserId);
            },
            error: (err) => {
                console.error('Failed to accept invite', err);
                const msg = err.error?.message || err.message || 'Problème de connexion au serveur.';
                alert(`Erreur lors de l'acceptation : ${msg}\nStatus: ${err.status}`);
            }
        });
    }

    declineInvite(inviteId: string) {
        this.inviteService.declineInvite(inviteId).subscribe({
            next: () => {
                if (this.currentUserId) this.loadInvites(this.currentUserId);
            }
        });
    }

    cancelInvite(inviteId: string) {
        this.inviteService.cancelInvite(inviteId).subscribe({
            next: () => {
                if (this.currentUserId) this.loadInvites(this.currentUserId);
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
