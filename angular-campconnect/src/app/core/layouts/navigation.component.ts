import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { LucideAngularModule, Menu, X, User, Sun, Moon, ChevronDown, Truck, LayoutDashboard, Users, Bell } from 'lucide-angular';
import { AuthService } from '../services/auth.service';
import { filter } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';
import { AppNotification } from '../models/notification.model';

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
  readonly LayoutDashboard = LayoutDashboard;
  readonly Users = Users;
  readonly BellIcon = Bell;

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
  
  // Notifications
  isNotificationMenuOpen = false;
  unreadCount$ = this.notificationService.unreadCount$;
  notifications$ = this.notificationService.notifications$;

  constructor(private router: Router, private authService: AuthService, private notificationService: NotificationService) {
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
        this.notificationService.init(user.id);
      } else {
        this.userRoles = [];
        this.notificationService.disconnect();
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
    if (this.isUserMenuOpen) this.isNotificationMenuOpen = false;
  }

  toggleNotificationMenu(): void {
    this.isNotificationMenuOpen = !this.isNotificationMenuOpen;
    if (this.isNotificationMenuOpen) this.isUserMenuOpen = false;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  setActiveDropdown(label: string | null) {
    this.activeDropdown = label;
  }

  toggleDropdown(label: string, event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (this.activeDropdown === label) {
      this.activeDropdown = null;
    } else {
      this.activeDropdown = label;
    }
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  handleNotificationClick(notification: AppNotification) {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id);
    }
    this.isNotificationMenuOpen = false;

    switch (notification.type) {
      case 'INVITE_RECEIVED':
        this.router.navigate(['/invites']);
        break;
      case 'INVITE_ACCEPTED':
        if (notification.relatedEntityId) {
          this.router.navigate(['/groups', notification.relatedEntityId]);
        } else {
          this.router.navigate(['/companions/groups']);
        }
        break;
      case 'RESERVATION_CONFIRMED':
        this.router.navigate(['/dashboard/bookings']);
        break;
      case 'TRIP_RECOMMENDATION':
        if (notification.relatedEntityId) {
          this.router.navigate(['/trip-intents', notification.relatedEntityId]);
        } else {
          this.router.navigate(['/trip-intents']);
        }
        break;
      case 'TASK_UPDATE':
        this.router.navigate(['/groups', notification.relatedEntityId], { queryParams: { tab: 'planning' } });
        break;
      default:
        break;
    }
  }

  markAllNotificationsAsRead() {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.notificationService.markAllAsRead(user.id);
      }
    });
  }

  private updateNavigationForRole(): void {
    // Standardize all dashboard links to point to the central redirect component
    this.dashboardLink = '/dashboard';

    const defaultCamperNav = [
      {
        label: 'Expeditions',
        children: [
          { label: 'Adventure Feed', link: '/trip-intents' },
          { label: 'My Groups', link: '/companions/groups' },
          { label: 'My Bookings', link: '/dashboard/bookings' },
          { label: 'Received Invites', link: '/invites' },
          { label: 'Launch a Project', link: '/trip-intents/create' }
        ]
      },
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
          { label: 'Trip Stories', link: '/community/stories' },
          { label: 'Leaderboard', link: '/community/leaderboard' },
          { label: 'Events', link: '/community/events' },
          { label: 'Messaging', link: '/community/messaging' }
        ]
      }
    ];

    if (this.hasRole('ROLE_ADMIN')) {
      this.dashboardLink = '/admin';
      this.menuItems = defaultCamperNav;
    } else if (this.hasRole('ROLE_SITE_OWNER')) {
      this.dashboardLink = '/site-dashboard';
      this.menuItems = defaultCamperNav;
    } else if (this.hasRole('ROLE_EQUIPMENT_PROVIDER')) {
      this.dashboardLink = '/provider/dashboard';
      this.menuItems = defaultCamperNav;
    } else if (this.hasRole('ROLE_ORGANIZER')) {
      this.dashboardLink = '/organizer-dashboard';
      this.menuItems = defaultCamperNav;
    } else if (this.hasRole('ROLE_DELIVERY_PROVIDER')) {
      this.dashboardLink = '/delivery/dashboard';
      this.menuItems = defaultCamperNav;
    } else {
      // Default: ROLE_USER, ROLE_CAMPER, or any other role gets the full camper menu
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
