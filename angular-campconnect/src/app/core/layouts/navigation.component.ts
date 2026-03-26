import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, Menu, X, User, Sun, Moon, LogIn, LogOut, ChevronDown, Plus, Compass, Users, Calendar, Tent, Bell } from 'lucide-angular';
import { AuthService } from '../services/auth.service';
import { GroupInviteService } from '../../features/groups/services/group-invite.service';
import { BehaviorSubject, switchMap, of } from 'rxjs';

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

      <!-- Main Navigation Links (Restored original modules + Innovative Mega Menu for your modules) -->
      <div class="flex items-center justify-center gap-4 lg:gap-6 flex-1">
        <a routerLink="/" routerLinkActive="text-white" [routerLinkActiveOptions]="{exact: true}" class="hover:text-white transition-colors text-sm font-medium">Accueil</a>
        <a routerLink="/discover" routerLinkActive="text-white" class="hover:text-white transition-colors text-sm font-medium">Découvrir</a>
        <a routerLink="/events" routerLinkActive="text-white" class="hover:text-white transition-colors text-sm font-medium">Événements</a>
        <a routerLink="/gear" routerLinkActive="text-white" class="hover:text-white transition-colors text-sm font-medium">Matériel</a>
        <a routerLink="/community" routerLinkActive="text-white" class="hover:text-white transition-colors text-sm font-medium">Communauté</a>
        <a routerLink="/academy" routerLinkActive="text-white" class="hover:text-white transition-colors text-sm font-medium">Académie</a>

        <!-- ✨ ESPACE VOYAGE (Your Modules Innovative Mega Menu) -->
        <div *ngIf="isAuthenticated$ | async" class="relative group mega-menu-trigger py-2 cursor-pointer z-[100]">
            <div class="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors text-sm font-bold shadow-md shadow-emerald-500/20">
                <lucide-icon [img]="TentIcon" [size]="16"></lucide-icon>
                Mon Espace Voyage
                <span *ngIf="(pendingCount$ | async) || 0 > 0" class="ml-1 bg-red-500 text-white text-[10px] px-1 rounded-full">{{ pendingCount$ | async }}</span>
                <lucide-icon [img]="ChevronDownIcon" [size]="14"></lucide-icon>
            </div>
            
            <!-- Innovative mega-dropdown for your modules -->
            <div class="absolute left-1/2 -translate-x-1/2 top-full mt-[-4px] w-[500px] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-[var(--color-border-light)] mega-menu-content overflow-hidden p-5 flex gap-6">
                <!-- Group Trips Column -->
                <div class="flex-1 space-y-3">
                    <h3 class="text-[11px] font-black text-emerald-600 uppercase tracking-widest mb-3 border-b border-emerald-100 pb-1">Mes Groupes & Projets</h3>
                    
                    <a routerLink="/trip-intents/create" class="flex items-start gap-3 p-2.5 hover:bg-emerald-50 rounded-xl transition-all group/link cursor-pointer">
                       <div class="bg-emerald-100 p-2 rounded-lg text-emerald-600 group-hover/link:bg-emerald-600 group-hover/link:text-white transition-colors"><lucide-icon [img]="PlusIcon" [size]="18" strokeWidth="3"></lucide-icon></div>
                       <div><div class="text-sm font-bold text-gray-800">Planifier un Trip</div><div class="text-[11px] text-gray-500">Initier une nouvelle aventure</div></div>
                    </a>
                    
                    <a routerLink="/trip-intents" class="flex items-start gap-3 p-2.5 hover:bg-emerald-50 rounded-xl transition-all group/link cursor-pointer">
                       <div class="bg-emerald-100 p-2 rounded-lg text-emerald-600 group-hover/link:bg-emerald-600 group-hover/link:text-white transition-colors"><lucide-icon [img]="CompassIcon" [size]="18" strokeWidth="2.5"></lucide-icon></div>
                       <div><div class="text-sm font-bold text-gray-800">Projets de Groupe</div><div class="text-[11px] text-gray-500">Rejoindre des groupes publics</div></div>
                    </a>
                    
                    <a routerLink="/companions/groups" class="flex items-start gap-3 p-2.5 hover:bg-emerald-50 rounded-xl transition-all group/link cursor-pointer">
                       <div class="bg-emerald-100 p-2 rounded-lg text-emerald-600 group-hover/link:bg-emerald-600 group-hover/link:text-white transition-colors"><lucide-icon [img]="UsersIcon" [size]="18" strokeWidth="2.5"></lucide-icon></div>
                       <div><div class="text-sm font-bold text-gray-800">Mes Groupes (Privé)</div><div class="text-[11px] text-gray-500">Gérer mon équipe et invités</div></div>
                    </a>

                    <a routerLink="/invites" class="flex items-start gap-3 p-2.5 hover:bg-emerald-50 rounded-xl transition-all group/link cursor-pointer relative">
                       <div class="bg-emerald-100 p-2 rounded-lg text-emerald-600 group-hover/link:bg-emerald-600 group-hover/link:text-white transition-colors"><lucide-icon [img]="BellIcon" [size]="18" strokeWidth="2.5"></lucide-icon></div>
                       <div>
                         <div class="text-sm font-bold text-gray-800">Invitations</div>
                         <div class="text-[11px] text-gray-500">Gérer les demandes reçues</div>
                       </div>
                       <span *ngIf="(pendingCount$ | async) || 0 > 0" class="absolute top-2 right-2 flex h-4 w-4">
                         <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                         <span class="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-[9px] items-center justify-center font-bold">{{ pendingCount$ | async }}</span>
                       </span>
                    </a>
                </div>

                <!-- Reservations Column -->
                <div class="flex-1 space-y-3 border-l border-gray-100 pl-6">
                    <h3 class="text-[11px] font-black text-amber-600 uppercase tracking-widest mb-3 border-b border-amber-100 pb-1">Réservations</h3>
                    
                    <a routerLink="/dashboard/bookings" class="flex items-start gap-3 p-2.5 hover:bg-amber-50 rounded-xl transition-all group/link cursor-pointer">
                       <div class="bg-amber-100 p-2 rounded-lg text-amber-600 group-hover/link:bg-amber-600 group-hover/link:text-white transition-colors"><lucide-icon [img]="CalendarIcon" [size]="18" strokeWidth="2.5"></lucide-icon></div>
                       <div><div class="text-sm font-bold text-gray-800">Mes Réservations</div><div class="text-[11px] text-gray-500">Gérer mes campings et spots</div></div>
                    </a>
                    
                    <a routerLink="/trips" class="flex items-start gap-3 p-2.5 hover:bg-amber-50 rounded-xl transition-all group/link cursor-pointer">
                       <div class="bg-amber-100 p-2 rounded-lg text-amber-600 group-hover/link:bg-amber-600 group-hover/link:text-white transition-colors"><lucide-icon [img]="TentIcon" [size]="18" strokeWidth="2.5"></lucide-icon></div>
                       <div><div class="text-sm font-bold text-gray-800">Historique Voyages</div><div class="text-[11px] text-gray-500">Voir mon carnet précédent</div></div>
                    </a>
                </div>
            </div>
        </div>

        <!-- ✨ Companions — Special Glowing Entry -->
        <a
          routerLink="/companions"
          routerLinkActive="!bg-green-500 !text-white"
          class="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/20 text-green-300 hover:bg-green-500/40 hover:text-white border border-green-500/40 transition-all duration-200 text-sm font-semibold companions-badge ml-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          Compagnons

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

        <!-- Guest View: Sign In Button -->
        <ng-container *ngIf="!(isAuthenticated$ | async)">
          <a
            routerLink="/login"
            class="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white font-bold rounded-lg hover:bg-[var(--color-primary-dark)] transition-all shadow-md"
          >
            <lucide-icon [img]="LogInIcon" [size]="18"></lucide-icon>
            <span>Sign In</span>
          </a>
        </ng-container>

        <!-- Authenticated View: User Menu Dropdown -->
        <div *ngIf="isAuthenticated$ | async" class="relative">
          <button
            (click)="toggleUserMenu()"
            class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--color-nav-hover)] transition-colors"
          >
            <div class="w-8 h-8 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)] font-bold">
              {{ (currentUser$ | async)?.username?.charAt(0)?.toUpperCase() || 'U' }}
            </div>
            <span class="hidden lg:inline">{{ (currentUser$ | async)?.username }}</span>
          </button>
          
          <!-- User Dropdown -->
          <div
            *ngIf="isUserMenuOpen"
            class="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[var(--color-border-light)] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div class="px-4 py-3 border-b border-[var(--color-border-light)] mb-1">
              <p class="text-xs text-[var(--color-text-tertiary)] uppercase font-bold tracking-wider">Account</p>
              <p class="text-sm font-semibold truncate">{{ (currentUser$ | async)?.username }}</p>
            </div>
            <!-- All the user management dashboard views -->
            <a routerLink="/dashboard" (click)="closeUserMenu()" class="block px-4 py-2 text-[var(--color-text-primary)] hover:bg-[var(--color-neutral-100)] transition-colors">Tableau de bord</a>
            <a routerLink="/profile" (click)="closeUserMenu()" class="block px-4 py-2 text-[var(--color-text-primary)] hover:bg-[var(--color-neutral-100)] transition-colors">Profil</a>
            <a routerLink="/my-trip-intents" (click)="closeUserMenu()" class="block px-4 py-2 text-[var(--color-text-primary)] hover:bg-[var(--color-neutral-100)] transition-colors">Mes Projets Initiés</a>
            <a routerLink="/invites" (click)="closeUserMenu()" class="block px-4 py-2 text-[var(--color-text-primary)] hover:bg-[var(--color-neutral-100)] transition-colors flex justify-between items-center group/inv">
              Invitations 
              <span *ngIf="(pendingCount$ | async) || 0 > 0" class="bg-red-500 text-white rounded-full px-2 py-0.5 text-[10px] font-bold">{{ pendingCount$ | async }}</span>
              <span *ngIf="!((pendingCount$ | async) || 0 > 0)" class="text-[10px] text-gray-400 opacity-0 group-hover/inv:opacity-100 transition-opacity">Consulter</span>
            </a>
            <hr class="my-2 border-[var(--color-border-light)]">
            <button
              (click)="handleLogout()"
              class="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <lucide-icon [img]="LogOutIcon" [size]="16"></lucide-icon>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Mobile Bottom Navigation -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-border-light)] z-40 pb-safe">
      <div class="flex items-center justify-around py-2">
        <a routerLink="/" routerLinkActive="text-[var(--color-primary-600)]" [routerLinkActiveOptions]="{exact: true}" class="flex flex-col items-center gap-1 px-2 py-2 text-[var(--color-text-tertiary)]">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span class="text-[10px] font-semibold">Accueil</span>
        </a>
        
        <a routerLink="/campsites" routerLinkActive="text-[var(--color-primary-600)]" class="flex flex-col items-center gap-1 px-2 py-2 text-[var(--color-text-tertiary)]">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span class="text-[10px] font-semibold">Campsites</span>
        </a>

        <!-- ✨ ESPACE VOYAGE MOBILE (Your special button!) -->
        <a *ngIf="isAuthenticated$ | async" (click)="isMobileVoyageOpen = !isMobileVoyageOpen" class="relative flex flex-col items-center gap-1 px-2 py-2 text-white bg-emerald-500 rounded-lg transform -translate-y-3 shadow-lg hover:bg-emerald-600 cursor-pointer w-14">
          <lucide-icon [img]="TentIcon" [size]="24"></lucide-icon>
          <span class="text-[10px] font-bold">Voyage</span>
          
          <!-- Popover pour mobile -->
          <div *ngIf="isMobileVoyageOpen" class="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-56 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-gray-100 p-2 z-[60] flex flex-col animate-in slide-in-from-bottom-2 fade-in">
             <div class="px-2 py-1 mb-1 bg-emerald-50 text-emerald-800 text-xs font-bold uppercase rounded text-center">Groupes & Résas</div>
             <a routerLink="/trip-intents/create" (click)="isMobileVoyageOpen=false" class="p-2.5 text-sm text-gray-700 hover:bg-emerald-50 rounded-lg flex items-center gap-2"><lucide-icon [img]="PlusIcon" [size]="16" class="text-emerald-500"></lucide-icon> Planifier</a>
             <a routerLink="/trip-intents" (click)="isMobileVoyageOpen=false" class="p-2.5 text-sm text-gray-700 hover:bg-emerald-50 rounded-lg flex items-center gap-2"><lucide-icon [img]="CompassIcon" [size]="16" class="text-emerald-500"></lucide-icon> Projets de Groupe</a>
             <a routerLink="/companions/groups" (click)="isMobileVoyageOpen=false" class="p-2.5 text-sm text-gray-700 hover:bg-emerald-50 rounded-lg flex items-center gap-2"><lucide-icon [img]="UsersIcon" [size]="16" class="text-emerald-500"></lucide-icon> Mes Groupes</a>
             <a routerLink="/invites" (click)="isMobileVoyageOpen=false" class="p-2.5 text-sm text-gray-700 hover:bg-emerald-50 rounded-lg flex items-center justify-between border-t border-gray-100 mt-1 pt-3">
               <div class="flex items-center gap-2"><lucide-icon [img]="BellIcon" [size]="16" class="text-emerald-500"></lucide-icon> Invitations</div>
               <span *ngIf="(pendingCount$ | async) || 0 > 0" class="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{{ pendingCount$ | async }}</span>
             </a>
             <a routerLink="/dashboard/bookings" (click)="isMobileVoyageOpen=false" class="p-2.5 text-sm text-gray-700 hover:bg-emerald-50 rounded-lg flex items-center gap-2 mt-1"><lucide-icon [img]="CalendarIcon" [size]="16" class="text-emerald-500"></lucide-icon> Réservations</a>
          </div>
        </a>

        <!-- Authenticated: Account tab -->
        <a *ngIf="isAuthenticated$ | async" routerLink="/dashboard" routerLinkActive="text-[var(--color-primary-600)]" class="flex flex-col items-center gap-1 px-2 py-2 text-[var(--color-text-tertiary)]">
          <lucide-icon [img]="UserIcon" [size]="22"></lucide-icon>
          <span class="text-[10px] font-semibold">Account</span>
        </a>

        <!-- Guest: Login tab -->
        <a *ngIf="!(isAuthenticated$ | async)" routerLink="/login" routerLinkActive="text-[var(--color-primary-600)]" class="flex flex-col items-center gap-1 px-2 py-2 text-[var(--color-text-tertiary)]">
          <lucide-icon [img]="LogInIcon" [size]="22"></lucide-icon>
          <span class="text-[10px] font-semibold">Login</span>
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
  LogInIcon = LogIn;
  LogOutIcon = LogOut;
  ChevronDownIcon = ChevronDown;
  PlusIcon = Plus;
  CompassIcon = Compass;
  UsersIcon = Users;
  CalendarIcon = Calendar;
  TentIcon = Tent;

  isUserMenuOpen = false;
  isMobileVoyageOpen = false;
  isDarkMode = false;

  currentUser$ = this.authService.getCurrentUser();
  isAuthenticated$ = this.authService.isAuthenticated();
  pendingCount$ = this.currentUser$.pipe(
    switchMap(user => user ? this.inviteService.getPendingInvitesCount(user.id) : of(0))
  );

  BellIcon = Bell;

  constructor(
    private router: Router,
    private authService: AuthService,
    private inviteService: GroupInviteService
  ) { }

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';
    this.applyTheme();
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeUserMenu(): void {
    this.isUserMenuOpen = false;
  }

  handleLogout(): void {
    this.authService.logout();
    this.closeUserMenu();
    this.router.navigate(['/login']);
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
