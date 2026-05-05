import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { LucideAngularModule, Menu, X, User, Sun, Moon, ChevronDown, Truck, Bell } from 'lucide-angular';
import { AuthService } from '../services/auth.service';
import { filter } from 'rxjs/operators';
import { AcademyService } from '../../features/academy/services/academy.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './navigation.component.html',
  styles: []
})
export class NavigationComponent implements OnInit {
  // Icons
  readonly UserIcon = User;
  readonly MoonIcon = Moon;
  readonly SunIcon = Sun;
  readonly MenuIcon = Menu;
  readonly XIcon = X;
  readonly ChevronDown = ChevronDown;
  readonly TruckIcon = Truck;
  readonly BellIcon = Bell;

  // State
  hasExpiredCerts = false;
  isScrolled = false;
  isLandingPage = false;
  isUserMenuOpen = false;
  isNotificationsOpen = false;
  isMobileMenuOpen = false;
  isDarkMode = false;
  currentUser$ = this.authService.getCurrentUser();
  isLoggedIn = false;
  userRoles: string[] = [];
  dashboardLink = '/dashboard';

  // Menu Structure
  menuItems: any[] = [];
  activeDropdown: string | null = null;

  constructor(
    private router: Router, 
    private authService: AuthService,
    private academyService: AcademyService
  ) {
    // Listen to route changes to determine if we are on a landing page
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkLandingPage(event.url);
      this.isMobileMenuOpen = false; // Close mobile menu on nav
    });
  }

  ngOnInit(): void {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';
    this.applyTheme();

    this.authService.isAuthenticated().subscribe(
      isAuthenticated => this.isLoggedIn = isAuthenticated
    );

    this.currentUser$.subscribe(user => {
      if (user) {
        this.userRoles = user.roles || [];
        this.checkExpiredCertifications(user.id);
      } else {
        this.userRoles = [];
        this.hasExpiredCerts = false;
      }
      this.updateNavigationForRole();
    });

    // Initial check
    this.checkLandingPage(this.router.url);
  }

  private checkExpiredCertifications(userId: string): void {
    this.academyService.getUserCertificationsByStatus(userId, 'EXPIRED').subscribe({
      next: (certs) => {
        if (certs && certs.length > 0) {
          this.hasExpiredCerts = true;
          this.playNotificationSound();
        } else {
          this.hasExpiredCerts = false;
        }
      },
      error: () => {
        this.hasExpiredCerts = false;
      }
    });
  }

  private playNotificationSound() {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(e => console.log('Audio play failed:', e));
  }

  toggleNotifications() {
    this.isNotificationsOpen = !this.isNotificationsOpen;
    if (this.isNotificationsOpen) {
      this.isUserMenuOpen = false;
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  checkLandingPage(url: string) {
    // Logic: If url is '/' or starts with '/marketplace' (and not category detail maybe? actually marketplace landing is consistent), 
    // we assume it is a "landing" style page requiring transparency.
    // However, the user request says "use the one in the marketplace... for the whole project leading to main interfaces".
    // We will apply transparency logic to Home ('/') and Marketplace ('/marketplace').
    // Other functional pages might need a solid header properly positioned.

    const path = url.split('?')[0];
    this.isLandingPage = path === '/' || path === '/marketplace' || path === '/marketplace/';
  }

  hasRole(role: string): boolean {
    return this.authService.hasRole(role);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  setActiveDropdown(label: string | null) {
    this.activeDropdown = label;
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  private updateNavigationForRole(): void {
    const defaultCamperNav = [
      {
        label: 'Explore',
        children: [
          { label: 'Campsites', link: '/campsites' },
          { label: 'Academy', link: '/academy' },
          { label: 'Events', link: '/events' },
          { label: 'Safety Alerts', link: '/safety' },
          { label: 'Safety Map', link: '/safety/map' },
          { label: 'Report Incident', link: '/safety/report-incident' }
        ]
      },
      {
        label: 'Plan',
        children: [
          { label: 'Trip Planner', link: '/plan-trip' },
          { label: 'Transportation', link: '/transportation' },
          { label: 'Gear', link: '/gear' },
          { label: 'Companions', link: '/companions' }
        ]
      },
      {
        label: 'Marketplace',
        children: [
          { label: 'Browse', link: '/marketplace' },
          { label: 'Cart', link: '/cart' },
          { label: 'Track Delivery', link: '/profile/orders' }
        ]
      },
      {
        label: 'Community',
        children: [
          { label: 'Feed', link: '/community/feed' },
          { label: 'Forums', link: '/community/forums' },
          { label: 'My Groups', link: '/companions/groups' },
          { label: 'Create Group', link: '/companions/create-group' },
          { label: 'Group Invitations', link: '/invites' },
          { label: 'Trip Stories', link: '/community/stories' },
          { label: 'Leaderboard', link: '/community/leaderboard' },
          { label: 'Events', link: '/community/events' },
          { label: 'Messaging', link: '/community/messaging' }
        ]
      }
    ];

    if (this.hasRole('ROLE_ADMIN')) {
      this.dashboardLink = '/admin';
      this.menuItems = []; // Admins usually just use the dashboard
    } else if (this.hasRole('ROLE_SITE_OWNER')) {
      this.dashboardLink = '/site-dashboard';
      this.menuItems = [];
    } else if (this.hasRole('ROLE_EQUIPMENT_PROVIDER')) {
      this.dashboardLink = '/provider/dashboard';
      this.menuItems = []; // Providers have their own sidebar dashboard
    } else if (this.hasRole('ROLE_ORGANIZER')) {
      this.dashboardLink = '/organizer-dashboard';
      this.menuItems = [];
    } else if (this.hasRole('ROLE_DELIVERY_PROVIDER')) {
      this.dashboardLink = '/delivery/dashboard';
      this.menuItems = [];
    } else {
      // Default to regular camper navigation map
      this.dashboardLink = '/profile';
      this.menuItems = defaultCamperNav;
    }
  }

  private applyTheme(): void {
    if (this.isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }
}
