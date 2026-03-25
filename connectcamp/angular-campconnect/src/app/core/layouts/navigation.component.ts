import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { LucideAngularModule, Menu, X, User, Sun, Moon, ChevronDown, Truck } from 'lucide-angular';
import { AuthService } from '../services/auth.service';
import { filter } from 'rxjs/operators';

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

  // State
  isScrolled = false;
  isLandingPage = false;
  isUserMenuOpen = false;
  isMobileMenuOpen = false;
  isDarkMode = false;
  currentUser$ = this.authService.getCurrentUser();
  isLoggedIn = false;
  userRoles: string[] = [];
  dashboardLink = '/dashboard';

  // Menu Structure
  menuItems: any[] = [];
  activeDropdown: string | null = null;

  constructor(private router: Router, private authService: AuthService) {
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
      } else {
        this.userRoles = [];
      }
      this.updateNavigationForRole();
    });

    // Initial check
    this.checkLandingPage(this.router.url);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  checkLandingPage(url: string) {
    const path = url.split('?')[0];
    this.isLandingPage = path === '/';
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
        label: 'Campsites',
        link: '/campsites',
        children: []
      },
      {
        label: 'Academy',
        link: '/academy',
        children: [
          { label: 'Browse Courses', link: '/academy' },
          { label: 'Video Library', link: '/academy/videos' },
          { label: 'Certifications', link: '/academy/certifications' }
        ]
      },
      {
        label: 'Events',
        link: '/events',
        children: [
          { label: 'Upcoming Events', link: '/events' },
          { label: 'My Registrations', link: '/events/my-registrations' }
        ]
      },
      {
        label: 'Community',
        link: '/community',
        children: [
          { label: 'Forums', link: '/community' },
          { label: 'Trip Stories', link: '/community/stories' },
          { label: 'Help Center', link: '/community/help' }
        ]
      }
    ];

    // Everyone gets the main navigation items
    this.menuItems = defaultCamperNav;

    if (this.hasRole('ROLE_ADMIN')) {
      this.dashboardLink = '/admin';
    } else if (this.hasRole('ROLE_SITE_OWNER')) {
      this.dashboardLink = '/site-dashboard';
    } else if (this.hasRole('ROLE_EQUIPMENT_PROVIDER')) {
      this.dashboardLink = '/provider/dashboard';
    } else if (this.hasRole('ROLE_ORGANIZER')) {
      this.dashboardLink = '/organizer-dashboard';
    } else if (this.hasRole('ROLE_DELIVERY_PROVIDER')) {
      this.dashboardLink = '/delivery/dashboard';
    } else {
      // Default for regular campers or guests
      this.dashboardLink = '/profile';
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
