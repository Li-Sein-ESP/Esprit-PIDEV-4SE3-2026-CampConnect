import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, map, Observable } from 'rxjs';
import { AuthService } from './core/services/auth.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, CommonModule, RouterLink],
    template: `
    <!-- Top Progress Bar -->
    <div *ngIf="loading$ | async" class="loading-bar">
      <div class="progress"></div>
    </div>

    <!-- Bannière compte banni (publication bloquée) -->
    <div *ngIf="showBannedBanner" class="app-banned-banner" role="alert">
      <div class="app-banned-banner__inner">
        <span class="app-banned-banner__icon" aria-hidden="true">⛔</span>
        <div class="app-banned-banner__text">
          <strong>Compte suspendu.</strong>
          Vous ne pouvez pas créer de publication (photo ou texte à risque). Un e-mail vous a été envoyé à l’adresse du compte.
          Vous pouvez tenter une <a routerLink="/community/safety-quiz" class="app-banned-banner__link">réhabilitation via le quiz sécurité</a>.
        </div>
      </div>
    </div>

    <router-outlet></router-outlet>
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
      background: #059669;
      box-shadow: 0 0 10px #10b981;
      transform-origin: 0% 50%;
      animation: progress-anim 1s infinite linear;
    }

    @keyframes progress-anim {
      0% { transform: scaleX(0); margin-left: 0; }
      50% { transform: scaleX(0.4); margin-left: 0; }
      100% { transform: scaleX(0.8); margin-left: 100%; }
    }

    .app-banned-banner {
      position: sticky;
      top: 0;
      z-index: 9998;
      background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%);
      color: #fef2f2;
      padding: 12px 16px;
      font-size: 14px;
      line-height: 1.45;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .app-banned-banner__inner {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .app-banned-banner__icon { flex-shrink: 0; font-size: 20px; }
    .app-banned-banner__link {
      color: #fde68a;
      text-decoration: underline;
      font-weight: 600;
    }
    .app-banned-banner__link:hover { color: #fff; }
  `]
})
export class AppComponent implements OnInit {
    title = 'CampConnect';
    loading$: Observable<boolean>;
    showBannedBanner = false;

    constructor(
        private router: Router,
        private auth: AuthService
    ) {
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

    ngOnInit(): void {
        this.syncBannedBanner();
        if (this.auth.isLoggedIn()) {
            this.auth.refreshProfileFromServer().subscribe(() => this.syncBannedBanner());
        }
        this.auth.getCurrentUser().subscribe(() => this.syncBannedBanner());
    }

    private syncBannedBanner(): void {
        this.showBannedBanner = this.auth.isLoggedIn() && this.auth.isAccountBanned();
    }
}
