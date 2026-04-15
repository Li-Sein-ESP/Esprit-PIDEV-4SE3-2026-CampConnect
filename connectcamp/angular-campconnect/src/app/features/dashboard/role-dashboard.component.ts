import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-role-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="container py-8">
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h1 class="text-3xl font-bold mb-4">Welcome, {{ roleTitle }}!</h1>
        <p class="text-gray-600 mb-8">This is your dedicated dashboard for {{ roleTitle }} activities.</p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="p-6 bg-gray-50 rounded-xl border border-gray-200">
            <h3 class="text-xl font-semibold mb-2">Manage Your Activities</h3>
            <p class="text-gray-500 mb-4">Access tools and features specific to your role.</p>
            <button class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">Get Started</button>
          </div>
          
          <!-- Placeholder for more specific widgets -->
          <div class="p-6 bg-gray-50 rounded-xl border border-gray-200">
            <h3 class="text-xl font-semibold mb-2">Notifications</h3>
            <p class="text-gray-500">You have no new notifications.</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RoleDashboardComponent implements OnInit {
    roleTitle: string = 'User';

    constructor(private route: ActivatedRoute, private authService: AuthService) { }

    ngOnInit(): void {
        const roles = this.authService.getRoles();
        if (roles.includes('ROLE_SITE_OWNER')) this.roleTitle = 'Site Owner';
        else if (roles.includes('ROLE_EQUIPMENT_PROVIDER')) this.roleTitle = 'Equipment Provider';
        else if (roles.includes('ROLE_ORGANIZER')) this.roleTitle = 'Event Organizer';
        else if (roles.includes('ROLE_DELIVERY_PROVIDER')) this.roleTitle = 'Delivery Provider';
        else if (roles.includes('ROLE_ADMIN')) this.roleTitle = 'Administrator';
        else this.roleTitle = 'Camper';
    }
}
