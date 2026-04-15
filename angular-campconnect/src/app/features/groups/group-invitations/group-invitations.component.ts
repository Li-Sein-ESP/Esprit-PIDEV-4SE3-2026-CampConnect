import { Component, OnInit } from "@angular/core";
import { CommonModule, Location } from "@angular/common";
import { RouterModule, Router } from "@angular/router";
import {
  LucideAngularModule,
  ArrowLeft,
  Check,
  X,
  Users,
  Clock,
} from "lucide-angular";
import { GroupService } from "../services/group";
import { AuthService } from "../../../core/services/auth.service";
import { GroupInvite } from "../models/group-invite.model";

@Component({
  selector: "app-group-invitations",
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="container py-8">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <button
          (click)="location.back()"
          class="p-2 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <lucide-icon
            [img]="ArrowLeftIcon"
            [size]="20"
            class="text-stone-600"
          ></lucide-icon>
        </button>
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Group Invitations</h1>
          <p class="text-slate-600 mt-1">Manage your group invitations</p>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="text-center py-12">
        <div
          class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"
        ></div>
        <p class="text-slate-600 mt-4">Loading invitations...</p>
      </div>

      <!-- Error State -->
      <div
        *ngIf="error && !loading"
        class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6"
      >
        {{ error }}
      </div>

      <!-- No Invitations -->
      <div
        *ngIf="!loading && invitations.length === 0"
        class="bg-white rounded-2xl shadow-lg p-12 text-center"
      >
        <lucide-icon
          [img]="UsersIcon"
          [size]="48"
          class="text-slate-300 mx-auto mb-4"
        ></lucide-icon>
        <p class="text-slate-600 text-lg">No pending invitations</p>
        <p class="text-slate-500 mt-2">
          You don't have any group invitations at the moment
        </p>
      </div>

      <!-- Invitations List -->
      <div *ngIf="!loading && invitations.length > 0" class="space-y-4">
        <div
          *ngFor="let invite of invitations"
          class="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
        >
          <div class="flex items-start justify-between gap-4">
            <!-- Group Info -->
            <div class="flex-1">
              <h3 class="text-lg font-bold text-slate-900">
                {{ invite.groupName }}
              </h3>
              <div class="flex items-center gap-2 text-slate-600 mt-2">
                <lucide-icon [img]="UsersIcon" [size]="16"></lucide-icon>
                <span>{{ invite.description || "No description" }}</span>
              </div>
              <div class="flex items-center gap-2 text-slate-500 mt-2">
                <lucide-icon [img]="ClockIcon" [size]="16"></lucide-icon>
                <span>Invited {{ formatDate(invite.invitedAt) }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-2">
              <button
                (click)="acceptInvitation(invite.id)"
                [disabled]="processingId === invite.id"
                class="px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <lucide-icon [img]="CheckIcon" [size]="18"></lucide-icon>
                <span>Accept</span>
              </button>
              <button
                (click)="declineInvitation(invite.id)"
                [disabled]="processingId === invite.id"
                class="px-4 py-2.5 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <lucide-icon [img]="XIcon" [size]="18"></lucide-icon>
                <span>Decline</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class GroupInvitationsComponent implements OnInit {
  invitations: GroupInvite[] = [];
  loading = true;
  error: string | null = null;
  currentUserId: string | null = null;
  processingId: string | null = null;

  // Icons
  readonly ArrowLeftIcon = ArrowLeft;
  readonly CheckIcon = Check;
  readonly XIcon = X;
  readonly UsersIcon = Users;
  readonly ClockIcon = Clock;

  constructor(
    public location: Location,
    private groupService: GroupService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe((user) => {
      this.currentUserId = user?.id || null;
      if (this.currentUserId) {
        this.loadInvitations();
      } else {
        this.loading = false;
        this.error = "You must be logged in to view invitations";
      }
    });
  }

  loadInvitations(): void {
    if (!this.currentUserId) return;

    this.groupService.getMyInvitations(this.currentUserId).subscribe({
      next: (invites) => {
        this.invitations = invites || [];
        this.loading = false;
      },
      error: (err) => {
        console.error("Failed to load invitations", err);
        this.error = "Failed to load invitations";
        this.loading = false;
        // Fallback to empty list if service doesn't exist
        this.invitations = [];
      },
    });
  }

  acceptInvitation(inviteId: string): void {
    this.processingId = inviteId;
    this.groupService.acceptInvitation(inviteId).subscribe({
      next: () => {
        this.invitations = this.invitations.filter((i) => i.id !== inviteId);
        this.processingId = null;
      },
      error: (err) => {
        console.error("Failed to accept invitation", err);
        this.error = "Failed to accept invitation";
        this.processingId = null;
      },
    });
  }

  declineInvitation(inviteId: string): void {
    this.processingId = inviteId;
    this.groupService.declineInvitation(inviteId).subscribe({
      next: () => {
        this.invitations = this.invitations.filter((i) => i.id !== inviteId);
        this.processingId = null;
      },
      error: (err) => {
        console.error("Failed to decline invitation", err);
        this.error = "Failed to decline invitation";
        this.processingId = null;
      },
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "today";
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
}
