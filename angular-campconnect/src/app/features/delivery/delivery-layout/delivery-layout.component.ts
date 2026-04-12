import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DeliverySidebarComponent } from './components/delivery-sidebar/delivery-sidebar.component';
import { DeliveryHeaderComponent } from './components/delivery-header/delivery-header.component';
import { DeliveryLayoutService } from './delivery-layout.service';

@Component({
    selector: 'app-delivery-layout',
    standalone: true,
    imports: [CommonModule, RouterModule, DeliverySidebarComponent, DeliveryHeaderComponent],
    templateUrl: './delivery-layout.component.html',
    styleUrls: ['./delivery-layout.component.scss']
})
export class DeliveryLayoutComponent {
    isSidebarOpen$ = this.layoutService.sidebarOpen$;

    constructor(private layoutService: DeliveryLayoutService) { }

    closeSidebar() {
        this.layoutService.closeSidebar();
    }
}
