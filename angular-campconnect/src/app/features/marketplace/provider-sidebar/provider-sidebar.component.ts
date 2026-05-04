import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Tent, LayoutDashboard, Package, PlusCircle, Calendar, Truck, BarChart3, User, ChevronDown, Warehouse } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-provider-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule],
    templateUrl: './provider-sidebar.component.html',
    styleUrls: ['./provider-sidebar.component.scss']
})
export class ProviderSidebarComponent implements OnInit {
    icons = {
        Tent, LayoutDashboard, Package, PlusCircle, Calendar, Truck, BarChart3, User, ChevronDown, Warehouse
    };

    providerName = 'Provider';

    constructor(private authService: AuthService, private cdr: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.authService.getCurrentUser().subscribe(user => {
            if (user?.username) {
                this.providerName = user.username;
                this.cdr.detectChanges();
            }
        });
    }
}
