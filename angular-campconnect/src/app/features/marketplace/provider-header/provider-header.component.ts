import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-provider-header',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './provider-header.component.html',
    styleUrls: ['./provider-header.component.scss']
})
export class ProviderHeaderComponent {
    constructor(private authService: AuthService, private router: Router) { }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
