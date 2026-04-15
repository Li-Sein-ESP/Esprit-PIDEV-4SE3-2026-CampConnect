import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConnectionRequestService } from '../services/connection-request.service';
import { ConnectionRequest } from '../models/companion.model';
import { Subscription } from 'rxjs';

type Tab = 'received' | 'sent' | 'accepted';

@Component({
  selector: 'app-companion-connections',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './companion-connections.html',
  styleUrl: './companion-connections.css',
})
export class CompanionConnections implements OnInit, OnDestroy {
  activeTab: Tab = 'received';
  received: ConnectionRequest[] = [];
  sent: ConnectionRequest[] = [];
  accepted: ConnectionRequest[] = [];
  pendingCount = 0;

  confirmUnmatchId: string | null = null;

  toastMessage = '';
  toastVisible = false;

  private subs: Subscription[] = [];

  constructor(private connectionService: ConnectionRequestService) { }

  ngOnInit(): void {
    this.subs.push(
      this.connectionService.getReceived().subscribe(r => this.received = r),
      this.connectionService.getSent().subscribe(s => this.sent = s),
      this.connectionService.getAccepted().subscribe(a => this.accepted = a),
      this.connectionService.getPendingCount().subscribe(c => this.pendingCount = c),
    );
  }

  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }

  setTab(tab: Tab) { this.activeTab = tab; this.confirmUnmatchId = null; }

  // ── CRUD Actions ─────────────────────────────────────────────────────────

  accept(id: string, name: string) {
    this.connectionService.acceptRequest(id);
    this.toast(`✅ You're now connected with ${name}!`);
  }

  decline(id: string, name: string) {
    this.connectionService.declineRequest(id);
    this.toast(`Request from ${name} declined.`);
  }

  cancel(id: string, name: string) {
    this.connectionService.cancelRequest(id);
    this.toast(`Request to ${name} cancelled.`);
  }

  confirmUnmatch(id: string) { this.confirmUnmatchId = id; }
  cancelUnmatch() { this.confirmUnmatchId = null; }

  unmatch(id: string, name: string) {
    this.connectionService.unmatch(id);
    this.confirmUnmatchId = null;
    this.toast(`💔 Unmatched from ${name}.`);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  partnerName(req: ConnectionRequest): string {
    return req.fromUserId === 'me' ? req.toUserName : req.fromUserName;
  }

  partnerAvatar(req: ConnectionRequest): string {
    return req.fromUserId === 'me' ? req.toUserAvatar : req.fromUserAvatar;
  }

  timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.round(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.round(hrs / 24)}d ago`;
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      pending: 'Pending', accepted: 'Accepted', declined: 'Declined', cancelled: 'Cancelled'
    };
    return map[status] ?? status;
  }

  statusColor(status: string): string {
    const map: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700',
      accepted: 'bg-green-100 text-green-700',
      declined: 'bg-red-100 text-red-600',
      cancelled: 'bg-gray-100 text-gray-500',
    };
    return map[status] ?? '';
  }

  private toast(msg: string) {
    this.toastMessage = msg;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 3500);
  }
}
