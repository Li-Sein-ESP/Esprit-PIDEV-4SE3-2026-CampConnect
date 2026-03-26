import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, Menu, X, User, Sun, Moon, LogOut } from 'lucide-angular';
import { AuthService } from '../services/auth.service';

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
        <a routerLink="/" routerLinkActive="text-white" [routerLinkActiveOptions]="{exact: true}" class="hover:text-white transition-colors text-sm font-medium">Home</a>
        <a routerLink="/discover" routerLinkActive="text-white" class="hover:text-white transition-colors text-sm font-medium">Discover</a>
        <a routerLink="/trips" routerLinkActive="text-white" class="hover:text-white transition-colors text-sm font-medium">My Trips</a>
        <a routerLink="/plan-trip" routerLinkActive="text-white" class="hover:text-white transition-colors text-sm font-medium">Trip Planner</a>
        <a routerLink="/transportation" routerLinkActive="text-white" class="hover:text-white transition-colors text-sm font-medium">Transportation</a>
        <a routerLink="/community" routerLinkActive="text-white" class="hover:text-white transition-colors text-sm font-medium">Community</a>
        <a routerLink="/academy" routerLinkActive="text-white" class="hover:text-white transition-colors text-sm font-medium">Academy</a>
      </div>

      <!-- Right Side: Theme Toggle + User Menu -->
      <div class="flex items-center gap-4">
        <!-- Theme Toggle -->
        <button
          (click)="toggleTheme()"
          class="p-2 rounded-lg hover:bg-[var(--color-nav-hover)] transition-all active:scale-95"
          [attr.aria-label]="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <lucide-icon *ngIf="!isDarkMode" [img]="MoonIcon" [size]="20"></lucide-icon>
          <lucide-icon *ngIf="isDarkMode" [img]="SunIcon" [size]="20"></lucide-icon>
        </button>

        <!-- User Menu Button -->
        <div class="relative">
          <button
            (click)="toggleUserMenu($event)"
            class="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95"
          >
            <div class="w-8 h-8 rounded-full bg-[var(--color-accent-500)] flex items-center justify-center overflow-hidden">
               <lucide-icon [img]="UserIcon" [size]="18" class="text-white"></lucide-icon>
            </div>
            <div class="flex flex-col items-start">
              <span class="text-xs font-bold text-white leading-none">{{ isLoggedIn() ? (currentUser()?.username || 'Account') : 'Guest' }}</span>
              <span class="text-[10px] text-white/50 leading-none mt-1">{{ isLoggedIn() ? 'Explorer' : 'Join us' }}</span>
            </div>
          </button>
          
          <!-- User Dropdown -->
          <div
            *ngIf="isUserMenuOpen"
            class="absolute top-full right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div class="px-4 py-3 border-b border-slate-50 mb-1">
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Account</p>
              <p class="text-sm font-bold text-slate-900 truncate">{{ currentUser()?.email || 'Not signed in' }}</p>
            </div>

            <a *ngIf="isAdmin()" routerLink="/admin" (click)="isUserMenuOpen = false" class="flex items-center gap-3 px-4 py-3 text-sm font-bold text-emerald-600 hover:bg-emerald-50 transition-colors">
              <lucide-icon [img]="MenuIcon" [size]="16"></lucide-icon>
              Admin Panel
            </a>
            
            <a routerLink="/dashboard" (click)="isUserMenuOpen = false" class="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
              <lucide-icon [img]="MenuIcon" [size]="16" class="text-slate-400"></lucide-icon>
              Dashboard
            </a>
            <a routerLink="/profile" (click)="isUserMenuOpen = false" class="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
              <lucide-icon [img]="UserIcon" [size]="16" class="text-slate-400"></lucide-icon>
              Profile
            </a>
            <a routerLink="/trips" (click)="isUserMenuOpen = false" class="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
              <lucide-icon [img]="UserIcon" [size]="16" class="text-slate-400"></lucide-icon>
              My Trips
            </a>
            
            <div class="mx-2 my-1 border-t border-slate-50"></div>
            
            <a *ngIf="!isLoggedIn()" routerLink="/login" (click)="isUserMenuOpen = false" 
               class="flex items-center gap-3 px-4 py-3 text-sm font-bold text-emerald-600 hover:bg-emerald-50 transition-colors">
              <lucide-icon [img]="UserIcon" [size]="16"></lucide-icon>
              Sign In
            </a>
            
            <button *ngIf="isLoggedIn()" (click)="logout()" 
                    class="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors">
              <lucide-icon [img]="LogOutIcon" [size]="16"></lucide-icon>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Mobile Bottom Navigation -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-40 pb-safe">
      <div class="flex items-center justify-around py-2 px-2">
        <a routerLink="/" routerLinkActive="text-emerald-600" [routerLinkActiveOptions]="{exact: true}" class="flex flex-col items-center gap-1 p-2 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span class="text-[10px] font-bold">Home</span>
        </a>
        <a routerLink="/discover" routerLinkActive="text-emerald-600" class="flex flex-col items-center gap-1 p-2 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span class="text-[10px] font-bold">Discover</span>
        </a>
        <a routerLink="/plan-trip" routerLinkActive="text-emerald-600" class="flex flex-col items-center gap-1 p-2 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
          </svg>
          <span class="text-[10px] font-bold">Plan</span>
        </a>
        <a routerLink="/trips" routerLinkActive="text-emerald-600" class="flex flex-col items-center gap-1 p-2 text-slate-400">
          <lucide-icon [img]="MenuIcon" [size]="24"></lucide-icon>
          <span class="text-[10px] font-bold">Trips</span>
        </a>
        <a routerLink="/dashboard" routerLinkActive="text-emerald-600" class="flex flex-col items-center gap-1 p-2 text-slate-400">
          <lucide-icon [img]="UserIcon" [size]="24"></lucide-icon>
          <span class="text-[10px] font-bold">Account</span>
        </a>
      </div>
    </nav>
  `,
  styles: [`
    :host { display: block; }
    .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
  `]
})
export class NavigationComponent implements OnInit {
  UserIcon = User;
  MoonIcon = Moon;
  SunIcon = Sun;
  MenuIcon = Menu;
  XIcon = X;
  LogOutIcon = LogOut;

  isUserMenuOpen = false;
  isDarkMode = false;

  // Signalling state
  isLoggedIn = signal<boolean>(false);
  isAdmin = signal<boolean>(false);
  currentUser = signal<any>(null);

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';
    this.applyTheme();

    // Track Auth State
    this.authService.isAuthenticated().subscribe(status => {
      this.isLoggedIn.set(status);
    });

    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser.set(user);
      this.isAdmin.set(this.authService.isAdmin());
    });

    // Close menu when clicking outside
    document.addEventListener('click', () => {
      this.isUserMenuOpen = false;
    });
  }

  toggleUserMenu(event: Event): void {
    event.stopPropagation();
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  logout(): void {
    this.authService.logout();
    this.isUserMenuOpen = false;
    this.router.navigate(['/login']);
  }

  private applyTheme(): void {
    if (this.isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }
}
