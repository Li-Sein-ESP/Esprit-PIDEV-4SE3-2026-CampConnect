import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-redirect',
  standalone: true,
  template: '<div class="flex items-center justify-center min-h-screen"><p>Redirecting to your dashboard...</p></div>'
})
export class DashboardRedirectComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const roles = this.authService.getRoles();
    console.log('DashboardRedirect: Roles detected:', roles);
    
    if (roles.includes('ROLE_ADMIN')) {
      console.log('DashboardRedirect: Redirecting to Admin');
      this.router.navigate(['/admin/dashboard']);
    } else if (roles.includes('ROLE_SITE_OWNER')) {
      console.log('DashboardRedirect: Redirecting to Site Owner');
      this.router.navigate(['/site-dashboard']);
    } else if (roles.includes('ROLE_EQUIPMENT_PROVIDER')) {
      console.log('DashboardRedirect: Redirecting to Provider');
      this.router.navigate(['/provider/dashboard']);
    } else if (roles.includes('ROLE_ORGANIZER')) {
      console.log('DashboardRedirect: Redirecting to Organizer');
      this.router.navigate(['/organizer-dashboard']);
    } else if (roles.includes('ROLE_DELIVERY_PROVIDER')) {
      console.log('DashboardRedirect: Redirecting to Delivery');
      this.router.navigate(['/delivery/dashboard']);
    } else {
      // Default for ROLE_USER, ROLE_CAMPER or others
      console.log('DashboardRedirect: Redirecting to Profile as fallback');
      this.router.navigate(['/profile']);
    }
  }
}
