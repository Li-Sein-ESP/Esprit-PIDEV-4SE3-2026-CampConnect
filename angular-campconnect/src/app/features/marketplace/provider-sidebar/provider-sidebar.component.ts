import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Tent, LayoutDashboard, Package, PlusCircle, Calendar, Truck, BarChart3, User, ChevronDown } from 'lucide-angular';
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
        Tent, LayoutDashboard, Package, PlusCircle, Calendar, Truck, BarChart3, User, ChevronDown
    };

    providerName = 'Provider';

    constructor(private authService: AuthService) { }

    ngOnInit(): void {
        this.authService.getCurrentUser().subscribe(user => {
            if (user?.username) this.providerName = user.username;
        });
    }
}
