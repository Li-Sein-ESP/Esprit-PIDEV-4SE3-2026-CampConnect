import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, Compass, User, Users } from 'lucide-angular';
import { ConnectionRequestService } from '../services/connection-request.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-companions-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-[var(--color-background)]">
      <!-- Section Header -->
      <div class="bg-white border-b border-[var(--color-border-light)]">
        <div class="container py-8">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 class="text-3xl font-bold text-[var(--color-primary-600)] mb-2">Companion Matcher</h1>
              <p class="text-[var(--color-text-secondary)] max-w-2xl">Find your perfect camping and outdoor adventure buddy based on compatibility, style, and pace.</p>
            </div>
            
            <!-- Navigation Tabs -->
            <div class="flex bg-[var(--color-neutral-50)] p-1 rounded-xl border border-[var(--color-border-light)] self-start md:self-auto">
              <a routerLink="/companions" 
                 routerLinkActive="bg-white shadow-sm text-[var(--color-primary-600)]" 
                 [routerLinkActiveOptions]="{exact: true}"
                 class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all">
                <lucide-icon [img]="Compass" class="w-4 h-4"></lucide-icon>
                Discovery
              </a>
              <a routerLink="/companions/connections" 
                 routerLinkActive="bg-white shadow-sm text-[var(--color-primary-600)]"
                 class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all relative">
                <lucide-icon [img]="Users" class="w-4 h-4"></lucide-icon>
                My Matches
                <!-- Pending badge -->
                <span *ngIf="pendingCount > 0"
                  class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {{ pendingCount }}
                </span>
              </a>
              <a routerLink="/companions/profile" 
                 routerLinkActive="bg-white shadow-sm text-[var(--color-primary-600)]"
                 class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all">
                <lucide-icon [img]="User" class="w-4 h-4"></lucide-icon>
                My Profile
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Child Components Mount Here -->
      <main class="py-8">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class CompanionsLayout implements OnInit, OnDestroy {
  readonly Compass = Compass;
  readonly User = User;
  readonly Users = Users;

  pendingCount = 0;
  private sub!: Subscription;

  constructor(private connectionService: ConnectionRequestService) { }

  ngOnInit(): void {
    this.sub = this.connectionService.getPendingCount().subscribe(c => this.pendingCount = c);
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }
}
