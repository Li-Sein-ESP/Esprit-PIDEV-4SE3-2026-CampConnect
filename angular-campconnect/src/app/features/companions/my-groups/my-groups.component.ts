import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Users, MapPin, Calendar } from 'lucide-angular';
import { GroupService } from '../../groups/services/group';
import { AuthService } from '../../../core/services/auth.service';
import { Group } from '../../groups/models/group.model';

@Component({
  selector: 'app-my-groups-component',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule
  ],
  templateUrl: './my-groups.component.html',
  styleUrl: './my-groups.component.css'
})
export class MyGroupsComponent implements OnInit {
  // Icons
  readonly Users = Users;
  readonly MapPin = MapPin;
  readonly Calendar = Calendar;

  groups: Group[] = [];
  loading = true;
  error: string | null = null;
  currentUserId: string | null = null;

  constructor(
    private groupService: GroupService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.currentUserId = user.id;
        this.loadGroups();
      } else {
        this.loading = false;
        this.error = "Vous devez être connecté pour voir vos groupes.";
      }
    });
  }

  loadGroups(): void {
    if (!this.currentUserId) return;

    this.groupService.getMyGroups(this.currentUserId).subscribe({
      next: (groups) => {
        this.groups = groups || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load groups', err);
        this.error = "Erreur lors du chargement de vos groupes.";
        this.loading = false;
      }
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}

