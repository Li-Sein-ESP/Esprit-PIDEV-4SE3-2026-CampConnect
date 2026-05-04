import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, map, Observable } from 'rxjs';
import { ToastContainerComponent } from './shared/components/toast/toast-container.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, CommonModule, ToastContainerComponent],
    template: `
    <!-- Top Progress Bar -->
    <div *ngIf="loading$ | async" class="loading-bar">
      <div class="progress"></div>
    </div>
    
    <router-outlet></router-outlet>
    <app-toast-container></app-toast-container>
  `,
    styles: [`
    .loading-bar {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background: rgba(10, 110, 79, 0.1);
      z-index: 9999;
      overflow: hidden;
    }
    
    .loading-bar .progress {
      width: 100%;
      height: 100%;
      background: #059669; /* Emerald green */
      box-shadow: 0 0 10px #10b981;
      transform-origin: 0% 50%;
      animation: progress-anim 1s infinite linear;
    }

    @keyframes progress-anim {
      0% { transform: scaleX(0); margin-left: 0; }
      50% { transform: scaleX(0.4); margin-left: 0; }
      100% { transform: scaleX(0.8); margin-left: 100%; }
    }
  `]
})
export class AppComponent {
    title = 'CampConnect';
    loading$: Observable<boolean>;

    constructor(private router: Router) {
        this.loading$ = this.router.events.pipe(
            filter(event => 
                event instanceof NavigationStart || 
                event instanceof NavigationEnd || 
                event instanceof NavigationCancel || 
                event instanceof NavigationError
            ),
            map(event => event instanceof NavigationStart)
        );
    }
}
