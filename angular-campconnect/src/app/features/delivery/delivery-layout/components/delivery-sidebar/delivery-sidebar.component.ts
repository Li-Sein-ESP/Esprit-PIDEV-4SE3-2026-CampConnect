import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DeliveryLayoutService } from '../../delivery-layout.service';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
    selector: 'app-delivery-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './delivery-sidebar.component.html',
    styleUrls: ['./delivery-sidebar.component.scss']
})
export class DeliverySidebarComponent implements OnInit {
    isSidebarOpen$ = this.layoutService.sidebarOpen$;
    providerName = 'Alex Morgan';

    constructor(private layoutService: DeliveryLayoutService, private authService: AuthService) { }

    ngOnInit() {
        this.authService.getCurrentUser().subscribe(user => {
            if (user?.username) {
                this.providerName = user.username;
            }
        });
    }

    toggleSidebar() {
        this.layoutService.toggleSidebar();
    }
}
