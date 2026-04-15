import { Component, OnInit } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/auth.models';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, RouterModule, KeyValuePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  user: any = null;
  profileDetails: any = null;
  roles: string[] = [];

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.user = user;
        this.roles = user.roles || [];
        this.profileDetails = (user as any).profileDetails || {};
      }
    });
  }

  isObject(val: any): boolean {
    return val !== null && typeof val === 'object' && !Array.isArray(val);
  }

  formatKey(key: string): string {
    const result = key.replace(/([A-Z])/g, " $1");
    return result.charAt(0).toUpperCase() + result.slice(1).replace(/_/g, ' ');
  }
}
