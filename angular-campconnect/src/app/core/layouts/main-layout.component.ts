import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { NavigationComponent } from './navigation.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, NavigationComponent],
  template: `
    <div class="min-h-screen flex flex-col">
      <app-navigation></app-navigation>
      
      <!-- Main Content Container with dynamic padding -->
      <main class="flex-1" [class.pt-20]="!isLandingPage" [class.pt-0]="isLandingPage">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="bg-[var(--color-primary-900)] text-white py-12 mt-auto">
        <div class="container">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <!-- Brand -->
            <div>
              <div class="flex items-center gap-2 mb-4">
                <div class="w-10 h-10 bg-[var(--color-accent-500)] rounded-lg flex items-center justify-center">
                  <span class="text-white font-bold text-xl">C</span>
                </div>
                <span class="text-xl font-bold">CampConnect</span>
              </div>
              <p class="text-sm text-gray-400">
                Your trusted platform for outdoor adventure planning and campsite discovery.
              </p>
            </div>

            <!-- Explore -->
            <div>
              <h4 class="font-semibold mb-4">Explore</h4>
              <ul class="space-y-2 text-sm text-gray-400">
                <li><a routerLink="/campsites" class="hover:text-white transition-colors">Campsites</a></li>
                <li><a routerLink="/academy" class="hover:text-white transition-colors">Academy</a></li>
                <li><a routerLink="/events" class="hover:text-white transition-colors">Events</a></li>
                <li><a routerLink="/safety/alerts" class="hover:text-white transition-colors">Safety</a></li>
              </ul>
            </div>

            <!-- Plan -->
            <div>
              <h4 class="font-semibold mb-4">Plan</h4>
              <ul class="space-y-2 text-sm text-gray-400">
<<<<<<< HEAD
=======
                <li><a routerLink="/trips" class="hover:text-white transition-colors">My Trips</a></li>
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
                <li><a routerLink="/plan-trip" class="hover:text-white transition-colors">Trip Planner</a></li>
                <li><a routerLink="/transportation" class="hover:text-white transition-colors">Transportation</a></li>
                <li><a routerLink="/gear" class="hover:text-white transition-colors">Gear</a></li>
                <li><a routerLink="/companions" class="hover:text-white transition-colors">Find Companions</a></li>
              </ul>
            </div>

            <!-- Community -->
            <div>
              <h4 class="font-semibold mb-4">Community</h4>
              <ul class="space-y-2 text-sm text-gray-400">
                <li><a routerLink="/community" class="hover:text-white transition-colors">Forums</a></li>
                <li><a routerLink="/community/stories" class="hover:text-white transition-colors">Trip Stories</a></li>
                <li><a routerLink="/community/ask-for-help" class="hover:text-white transition-colors">Help Center</a></li>
              </ul>
            </div>
          </div>

          <div class="border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
            <p>© 2026 CampConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: []
})
export class MainLayoutComponent implements OnInit {
  isLandingPage = false;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkLandingPage(event.url);
    });
  }

  ngOnInit() {
    this.checkLandingPage(this.router.url);
  }

  checkLandingPage(url: string) {
    const path = url.split('?')[0];
    // Same logic as navigation to ensure sync
    this.isLandingPage = path === '/' || path === '/marketplace' || path === '/marketplace/';
  }
}
