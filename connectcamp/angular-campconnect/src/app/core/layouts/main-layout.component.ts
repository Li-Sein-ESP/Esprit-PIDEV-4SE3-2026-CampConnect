import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { NavigationComponent } from './navigation.component';
import { FooterComponent } from './footer/footer.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, NavigationComponent, FooterComponent],
  template: `
    <div class="min-h-screen flex flex-col">
      <app-navigation></app-navigation>
      
      <!-- Main Content Container with dynamic padding -->
      <main class="flex-1" [class.pt-20]="!isLandingPage" [class.pt-0]="isLandingPage">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <app-footer></app-footer>
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
    this.isLandingPage = path === '/';
  }
}
