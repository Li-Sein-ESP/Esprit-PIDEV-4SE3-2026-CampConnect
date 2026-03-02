import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Shield, User as UserIcon, Trash2, Plus } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-admin-user-management-component',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    ButtonComponent,
    CardComponent,
    CardContentComponent
  ],
  template: `
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">User Management</h1>
      <div class="text-sm text-gray-500">{{ users.length }} users found</div>
    </div>

    <div class="grid gap-4">
      <app-card *ngFor="let user of users">
        <app-card-content class="p-4 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <lucide-icon [img]="UserIcon" size="20" class="text-primary-600"></lucide-icon>
            </div>
            <div>
              <div class="font-semibold">{{ user.username }}</div>
              <div class="text-sm text-gray-500">{{ user.email }}</div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <div *ngFor="let role of user.roles" class="px-2 py-1 bg-gray-100 border rounded text-xs flex items-center gap-1">
              <lucide-icon [img]="ShieldIcon" size="12"></lucide-icon>
              {{ role.name }}
              <button (click)="removeRole(user.username, role.name)" class="hover:text-red-500">×</button>
            </div>
            
            <select #roleSelect class="text-xs border rounded p-1">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button (click)="assignRole(user.username, roleSelect.value)" class="p-1 hover:bg-gray-100 rounded">
              <lucide-icon [img]="PlusIcon" size="16"></lucide-icon>
            </button>
          </div>
        </app-card-content>
      </app-card>
    </div>
  </div>
  `,
  styles: []
})
export class AdminUserManagementComponent implements OnInit {
  UserIcon = UserIcon;
  ShieldIcon = Shield;
  PlusIcon = Plus;
  TrashIcon = Trash2;

  users: any[] = [];

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe(users => this.users = users);
  }

  assignRole(username: string, roleName: string): void {
    this.userService.assignRole(username, roleName).subscribe(() => this.loadUsers());
  }

  removeRole(username: string, roleName: string): void {
    // roleName might look like ROLE_USER, but we just need USER
    const shortRole = roleName.replace('ROLE_', '');
    this.userService.removeRole(username, shortRole).subscribe(() => this.loadUsers());
  }
}
