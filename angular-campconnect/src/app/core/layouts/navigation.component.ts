import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { LucideAngularModule, Menu, X, User, Sun, Moon, Plus, AlertTriangle, Phone, BarChart2 } from 'lucide-angular';
import { AuthService } from '../services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
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
      <div class="flex items-center gap-6">
        <a routerLink="/" routerLinkActive="text-white" [routerLinkActiveOptions]="{exact: true}" class="hover:text-white transition-colors">Home</a>
        <a routerLink="/discover" routerLinkActive="text-white" class="hover:text-white transition-colors">Discover</a>
        <a routerLink="/dashboard/bookings" routerLinkActive="text-white" class="hover:text-white transition-colors">Bookings</a>
        <a routerLink="/trips" routerLinkActive="text-white" class="hover:text-white transition-colors">My Trips</a>
        <a routerLink="/plan-trip/create" routerLinkActive="text-white" class="hover:text-white transition-colors">Plan Trip</a>
        <a routerLink="/events" routerLinkActive="text-white" class="hover:text-white transition-colors">Events</a>
        <a routerLink="/safety/alerts" routerLinkActive="text-white" class="hover:text-white transition-colors">Safety</a>
        <a routerLink="/transportation" routerLinkActive="text-white" class="hover:text-white transition-colors">Transportation</a>
        <a routerLink="/gear" routerLinkActive="text-white" class="hover:text-white transition-colors">Gear</a>
        <a routerLink="/community" routerLinkActive="text-white" class="hover:text-white transition-colors">Community</a>
        <a routerLink="/academy" routerLinkActive="text-white" class="hover:text-white transition-colors">Academy</a>
        <div class="h-4 w-px bg-white/20 mx-2 hidden xl:block"></div>
        <a routerLink="/safety/analytics" routerLinkActive="text-white" class="hidden xl:flex items-center gap-1 hover:text-white transition-colors text-[var(--color-accent-300)]">
          <lucide-icon [img]="BarChartIcon" [size]="14"></lucide-icon>
          Analytics
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

        <!-- Emergency Contacts Button -->
        <a
          routerLink="/safety/emergency"
          class="hidden lg:flex items-center gap-2 px-4 py-2 border border-red-200 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium shadow-sm"
        >
          <lucide-icon [img]="PhoneIcon" [size]="18"></lucide-icon>
          <span>Emergency</span>
        </a>

        <!-- Report Incident Button -->
        <a
          routerLink="/safety/report"
          class="hidden lg:flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
        >
          <lucide-icon [img]="AlertTriangleIcon" [size]="18"></lucide-icon>
          <span>Report Incident</span>
        </a>

        <!-- New Topic Button (Forum only) -->
        <a
          *ngIf="isForumPage && (authService.isAuthenticated() | async)"
          routerLink="/community/forum/create"
          class="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary-600)] text-white rounded-lg hover:bg-[var(--color-primary-700)] transition-colors font-medium shadow-sm"
        >
          <lucide-icon [img]="PlusIcon" [size]="18"></lucide-icon>
          <span>New Topic</span>
        </a>


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
            <hr class="my-2 border-[var(--color-border-light)]">
            <a routerLink="/login" class="block px-4 py-2 text-[var(--color-text-primary)] hover:bg-[var(--color-neutral-100)] transition-colors">Sign In</a>
          </div>
        </button>
      </div>
    </nav>

    <!-- Mobile Bottom Navigation -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-border-light)] z-40">
      <div class="flex items-center justify-around py-2">
        <a routerLink="/" routerLinkActive="text-[var(--color-primary-600)]" [routerLinkActiveOptions]="{exact: true}" class="flex flex-col items-center gap-1 px-3 py-2 text-[var(--color-text-tertiary)]">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span class="text-xs">Home</span>
        </a>
        <a routerLink="/campsites" routerLinkActive="text-[var(--color-primary-600)]" class="flex flex-col items-center gap-1 px-3 py-2 text-[var(--color-text-tertiary)]">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span class="text-xs">Sites</span>
        </a>
        <a routerLink="/plan-trip" routerLinkActive="text-[var(--color-primary-600)]" class="flex flex-col items-center gap-1 px-3 py-2 text-[var(--color-text-tertiary)]">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
          </svg>
          <span class="text-xs">Plan</span>
        </a>
        <a routerLink="/trips" routerLinkActive="text-[var(--color-primary-600)]" class="flex flex-col items-center gap-1 px-3 py-2 text-[var(--color-text-tertiary)]">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
          <span class="text-xs">Trips</span>
        </a>
        <a routerLink="/dashboard" routerLinkActive="text-[var(--color-primary-600)]" class="flex flex-col items-center gap-1 px-3 py-2 text-[var(--color-text-tertiary)]">
          <lucide-icon [img]="UserIcon" [size]="24"></lucide-icon>
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
  PlusIcon = Plus;
  AlertTriangleIcon = AlertTriangle;
  PhoneIcon = Phone;
  BarChartIcon = BarChart2;

  isUserMenuOpen = false;
  isDarkMode = false;
  isForumPage = false;

  constructor(
    public router: Router,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';
    this.applyTheme();

    // Check if we are on a forum page
    this.checkForumPage(this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.checkForumPage(event.url);
    });
  }

  private checkForumPage(url: string): void {
    this.isForumPage = url.includes('/community/forum');
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
