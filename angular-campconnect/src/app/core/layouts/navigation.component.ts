import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, Menu, X, User, Sun, Moon } from 'lucide-angular';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <style>
      @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 0 6px 1px rgba(34,197,94,0.7); }
        50% { box-shadow: 0 0 14px 4px rgba(34,197,94,0.95); }
      }
      .companions-badge {
        animation: pulse-glow 1.8s ease-in-out infinite;
      }
      @keyframes companions-ping {
        0% { transform: scale(1); opacity: 1; }
        75%, 100% { transform: scale(2); opacity: 0; }
      }
      .companions-ping {
        animation: companions-ping 1.4s cubic-bezier(0,0,0.2,1) infinite;
      }
    </style>

    <!-- Desktop Navigation -->
    <nav class="hidden md:flex items-center justify-between px-6 py-4 bg-[var(--color-nav-background)] text-[var(--color-nav-text)]">
      <!-- Logo -->
      <a routerLink="/" class="flex items-center gap-2">
        <div class="w-10 h-10 bg-[var(--color-accent-500)] rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-xl">C</span>
        </div>
        <span class="text-xl font-bold">CampConnect</span>
      </a>

      <!-- Main Navigation Links -->
      <div class="flex items-center gap-5">
        <a routerLink="/" routerLinkActive="text-white" [routerLinkActiveOptions]="{exact: true}" class="hover:text-white transition-colors text-sm">Home</a>
        <a routerLink="/discover" routerLinkActive="text-white" class="hover:text-white transition-colors text-sm">Discover</a>
        <a routerLink="/dashboard/bookings" routerLinkActive="text-white" class="hover:text-white transition-colors text-sm">Bookings</a>
        <a routerLink="/trips" routerLinkActive="text-white" class="hover:text-white transition-colors text-sm">My Trips</a>
        <a routerLink="/plan-trip/create" routerLinkActive="text-white" class="hover:text-white transition-colors text-sm">Plan Trip</a>
        <a routerLink="/events" routerLinkActive="text-white" class="hover:text-white transition-colors text-sm">Events</a>
        <a routerLink="/gear" routerLinkActive="text-white" class="hover:text-white transition-colors text-sm">Gear</a>
        <a routerLink="/community" routerLinkActive="text-white" class="hover:text-white transition-colors text-sm">Community</a>
        <a routerLink="/academy" routerLinkActive="text-white" class="hover:text-white transition-colors text-sm">Academy</a>

        <!-- ✨ Companions — Special Glowing Entry -->
        <a
          routerLink="/companions"
          routerLinkActive="!bg-green-500 !text-white"
          class="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/20 text-green-300 hover:bg-green-500/40 hover:text-white border border-green-500/40 transition-all duration-200 text-sm font-semibold companions-badge"
        >
          <!-- people icon -->
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          Companions
          <!-- Pulsing dot -->
          <span class="relative flex h-2 w-2 ml-0.5">
            <span class="companions-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
          </span>
        </a>
      </div>

      <!-- Right Side: Theme Toggle + User Menu -->
      <div class="flex items-center gap-4">
        <!-- Theme Toggle -->
        <button
          (click)="toggleTheme()"
          class="p-2 rounded-lg hover:bg-[var(--color-nav-hover)] transition-colors"
          [attr.aria-label]="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <lucide-icon *ngIf="!isDarkMode" [img]="MoonIcon" [size]="20"></lucide-icon>
          <lucide-icon *ngIf="isDarkMode" [img]="SunIcon" [size]="20"></lucide-icon>
        </button>

        <!-- User Menu Button -->
        <button
          (click)="toggleUserMenu()"
          class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--color-nav-hover)] transition-colors relative"
        >
          <lucide-icon [img]="UserIcon" [size]="20"></lucide-icon>
          <span class="hidden lg:inline">Account</span>
          
          <!-- User Dropdown -->
          <div
            *ngIf="isUserMenuOpen"
            class="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[var(--color-border-light)] py-2 z-50"
          >
            <a routerLink="/dashboard" class="block px-4 py-2 text-[var(--color-text-primary)] hover:bg-[var(--color-neutral-100)] transition-colors">Dashboard</a>
            <a routerLink="/profile" class="block px-4 py-2 text-[var(--color-text-primary)] hover:bg-[var(--color-neutral-100)] transition-colors">Profile</a>
            <a routerLink="/trips" class="block px-4 py-2 text-[var(--color-text-primary)] hover:bg-[var(--color-neutral-100)] transition-colors">My Trips</a>
            <a routerLink="/companions" class="flex items-center gap-2 px-4 py-2 text-green-600 font-medium hover:bg-green-50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Find Companions
            </a>
            <hr class="my-2 border-[var(--color-border-light)]">
            <a routerLink="/login" class="block px-4 py-2 text-[var(--color-text-primary)] hover:bg-[var(--color-neutral-100)] transition-colors">Sign In</a>
          </div>
        </button>
      </div>
    </nav>

    <!-- Mobile Bottom Navigation -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-border-light)] z-40">
      <div class="flex items-center justify-around py-2">
        <a routerLink="/" routerLinkActive="text-[var(--color-primary-600)]" [routerLinkActiveOptions]="{exact: true}" class="flex flex-col items-center gap-1 px-2 py-2 text-[var(--color-text-tertiary)]">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span class="text-xs">Home</span>
        </a>
        <a routerLink="/campsites" routerLinkActive="text-[var(--color-primary-600)]" class="flex flex-col items-center gap-1 px-2 py-2 text-[var(--color-text-tertiary)]">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span class="text-xs">Sites</span>
        </a>
        <a routerLink="/plan-trip" routerLinkActive="text-[var(--color-primary-600)]" class="flex flex-col items-center gap-1 px-2 py-2 text-[var(--color-text-tertiary)]">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
          </svg>
          <span class="text-xs">Plan</span>
        </a>

        <!-- ✨ Companions Mobile Tab — Special glowing green -->
        <a routerLink="/companions" routerLinkActive="text-green-500" class="relative flex flex-col items-center gap-1 px-2 py-2 text-green-500">
          <span class="relative">
            <!-- ping ring -->
            <span class="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span class="companions-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400"></span>
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </span>
          <span class="text-xs font-semibold">Match</span>
        </a>

        <a routerLink="/dashboard" routerLinkActive="text-[var(--color-primary-600)]" class="flex flex-col items-center gap-1 px-2 py-2 text-[var(--color-text-tertiary)]">
          <lucide-icon [img]="UserIcon" [size]="22"></lucide-icon>
          <span class="text-xs">Account</span>
        </a>
      </div>
    </nav>
  `,
  styles: []
})
export class NavigationComponent implements OnInit {
  UserIcon = User;
  MoonIcon = Moon;
  SunIcon = Sun;
  MenuIcon = Menu;
  XIcon = X;

  isUserMenuOpen = false;
  isDarkMode = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';
    this.applyTheme();
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  private applyTheme(): void {
    if (this.isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }
}
