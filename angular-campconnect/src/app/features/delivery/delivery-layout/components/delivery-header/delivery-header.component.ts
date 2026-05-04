import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { DeliveryLayoutService } from '../../delivery-layout.service';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
    selector: 'app-delivery-header',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './delivery-header.component.html',
    styleUrls: ['./delivery-header.component.scss']
})
export class DeliveryHeaderComponent {
    pageTitle = 'Dashboard';
    pageSubtitle = 'Welcome back. Here\'s what\'s happening today.';

    constructor(private layoutService: DeliveryLayoutService, private router: Router, private authService: AuthService) {
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe((event: any) => {
            this.updateTitle(event.urlAfterRedirects);
        });
        this.updateTitle(this.router.url);
    }

    toggleSidebar() {
        this.layoutService.toggleSidebar();
    }

    updateTitle(url: string) {
        if (url.includes('/delivery/vehicles')) {
            this.pageTitle = 'Vehicles';
            this.pageSubtitle = 'Manage your fleet and assignments.';
        } else if (url.includes('/delivery/earnings')) {
            this.pageTitle = 'Earnings';
            this.pageSubtitle = 'Your performance and financial summary.';
        } else if (url.includes('/delivery/history')) {
            this.pageTitle = 'History';
            this.pageSubtitle = 'Past deliveries and completed tasks.';
        } else if (url.includes('/delivery/details') || url.match(/\/delivery\/\d+/)) {
            this.pageTitle = 'Delivery Details';
            this.pageSubtitle = 'View and manage active delivery information.';
        } else {
            this.pageTitle = 'Dashboard';
            this.pageSubtitle = 'Welcome back. Here\'s what\'s happening today.';
        }
    }

    logout() {
        this.authService.logout();
    }
}
