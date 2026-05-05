import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-admin-layout',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './admin-layout.component.html',
    styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent {
    userName: string = 'Admin User';
    userInitials: string = 'AU';
    isAdmin: boolean = false;
    isExpert: boolean = false;
    isOrganizer: boolean = false;
    portalName: string = 'Expert Portal';

    constructor(private router: Router, private authService: AuthService) {
        // Attempt to parse user info if available from standard mock auth flow
        this.authService.getCurrentUser().subscribe(currentUser => {
            if (currentUser) {
                this.isAdmin = this.authService.hasRole('ADMIN');
                this.isExpert = this.authService.hasRole('EXPERT');
                this.isOrganizer = this.authService.hasRole('ORGANIZER');
                const isExpertOrOrganizer = this.isExpert || this.isOrganizer;
                this.portalName = this.isAdmin ? 'Admin Portal' : (isExpertOrOrganizer ? 'Expert Portal' : 'User Portal');
                if (currentUser.username) {
                    this.userName = currentUser.username;
                    this.userInitials = currentUser.username.substring(0, 2).toUpperCase();
                } else if (currentUser.email) {
                    this.userName = currentUser.email.split('@')[0];
                    this.userInitials = this.userName.substring(0, 2).toUpperCase();
                }
            }
        });
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
