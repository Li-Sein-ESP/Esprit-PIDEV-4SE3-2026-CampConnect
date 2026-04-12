import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule, LayoutDashboard, Tent, Car, LogOut, Settings, Users, ShieldAlert, Map, ShoppingBag, Calendar, BarChart3, Bell, Search, User } from 'lucide-angular';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-admin-layout',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule],
    template: `
    <div class="min-h-screen bg-slate-50 flex">
      <!-- Sidebar -->
      <aside class="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-20">
        <!-- Logo Area -->
        <div class="h-16 flex items-center px-6 border-b border-slate-100">
          <div class="flex items-center gap-2 text-emerald-700">
            <lucide-icon [img]="ShieldAlertIcon" [size]="24"></lucide-icon>
            <span class="font-bold text-lg tracking-tight">Admin Panel</span>
          </div>
        </div>

        <!-- Navigation Menu -->
        <div class="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          <p class="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Platform Management</p>
          
          <a routerLink="/admin" routerLinkActive="bg-emerald-50 text-emerald-700" [routerLinkActiveOptions]="{exact: true}" 
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <lucide-icon [img]="LayoutDashboardIcon" [size]="18" [class.text-emerald-600]="router.url === '/admin'"></lucide-icon>
            Dashboard
          </a>

          <a routerLink="/admin/trips" routerLinkActive="bg-emerald-50 text-emerald-700"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <lucide-icon [img]="TentIcon" [size]="18" [class.text-emerald-600]="router.url.includes('/admin/trips')"></lucide-icon>
            Trips Management
          </a>

          <a routerLink="/admin/transports" routerLinkActive="bg-emerald-50 text-emerald-700"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <lucide-icon [img]="CarIcon" [size]="18" [class.text-emerald-600]="router.url.includes('/admin/transports')"></lucide-icon>
            Transports Management
          </a>

          <div class="my-4 border-t border-slate-100"></div>
          <p class="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Other Modules</p>

          <a routerLink="/admin/users" routerLinkActive="bg-emerald-50 text-emerald-700"
             class="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
             <div class="flex items-center gap-3">
                <lucide-icon [img]="UsersIcon" [size]="18"></lucide-icon>
                Users & Roles
             </div>
          </a>
          
          <!-- Mock items for visual completeness based on user image -->
          <a href="#" class="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 cursor-not-allowed">
             <div class="flex items-center gap-3"><lucide-icon [img]="ShieldAlertIcon" [size]="18"></lucide-icon>Content Moderation</div>
             <span class="bg-rose-100 text-rose-700 py-0.5 px-2 rounded-full text-[10px] font-bold">18</span>
          </a>
          <a href="#" class="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 cursor-not-allowed">
             <div class="flex items-center gap-3"><lucide-icon [img]="ShieldAlertIcon" [size]="18"></lucide-icon>Safety & Incidents</div>
             <span class="bg-rose-100 text-rose-700 py-0.5 px-2 rounded-full text-[10px] font-bold">12</span>
          </a>
           <a href="#" class="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 cursor-not-allowed">
             <div class="flex items-center gap-3"><lucide-icon [img]="MapIcon" [size]="18"></lucide-icon>Sites & Approvals</div>
             <span class="bg-amber-100 text-amber-700 py-0.5 px-2 rounded-full text-[10px] font-bold">3</span>
          </a>
        </div>

        <!-- Logout Area -->
        <div class="p-4 border-t border-slate-100">
          <button (click)="logout()" class="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors">
            <lucide-icon [img]="LogOutIcon" [size]="18"></lucide-icon>
            Logout
          </button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="flex-1 ml-64 flex flex-col min-h-screen">
        <!-- Top Toolbar -->
        <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div class="flex items-center gap-4 flex-1">
             <div class="relative w-96 hidden md:block">
                <lucide-icon [img]="SearchIcon" [size]="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></lucide-icon>
                <input type="text" placeholder="Search admin panel..." class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all">
             </div>
          </div>
          <div class="flex items-center gap-6">
            <button class="relative text-slate-400 hover:text-slate-600 transition-colors">
              <lucide-icon [img]="BellIcon" [size]="20"></lucide-icon>
              <span class="absolute -top-1 -right-1 w-2h-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div class="flex items-center gap-3 p-1 pr-3 bg-slate-50 rounded-full border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
               <div class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold uppercase overflow-hidden">
                 <lucide-icon [img]="UserIcon" [size]="16"></lucide-icon>
               </div>
               <div class="flex flex-col hidden sm:flex">
                 <span class="text-xs font-bold text-slate-700 leading-tight">Admin User</span>
                 <span class="text-[10px] text-slate-500">Super Admin</span>
               </div>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="flex-1 p-8">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
    styles: []
})
export class AdminLayoutComponent {
    LayoutDashboardIcon = LayoutDashboard;
    TentIcon = Tent;
    CarIcon = Car;
    LogOutIcon = LogOut;
    SettingsIcon = Settings;
    UsersIcon = Users;
    ShieldAlertIcon = ShieldAlert;
    MapIcon = Map;
    ShoppingBagIcon = ShoppingBag;
    CalendarIcon = Calendar;
    BarChart3Icon = BarChart3;
    BellIcon = Bell;
    SearchIcon = Search;
    UserIcon = User;

    constructor(
        public router: Router,
        private authService: AuthService
    ) { }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
