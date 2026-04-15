import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-footer',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
    isAuthenticated = false;
    dashboardRoute = '/dashboard';

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit() {
        this.authService.isAuthenticated().subscribe((isAuth: boolean) => {
            this.isAuthenticated = isAuth;
            if (isAuth) {
                const roles = this.authService.getRoles();
                if (roles.includes('ROLE_ADMIN')) this.dashboardRoute = '/admin';
                else if (roles.includes('ROLE_SITE_OWNER')) this.dashboardRoute = '/site-dashboard';
                else if (roles.includes('ROLE_EQUIPMENT_PROVIDER')) this.dashboardRoute = '/provider/dashboard';
                else if (roles.includes('ROLE_ORGANIZER')) this.dashboardRoute = '/organizer-dashboard';
                else if (roles.includes('ROLE_DELIVERY_PROVIDER')) this.dashboardRoute = '/delivery/dashboard';
                else this.dashboardRoute = '/dashboard';
            }
        });
    }

    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    isLandingPage(): boolean {
        return this.router.url === '/' || this.router.url.split('#')[0] === '/';
    }
}
