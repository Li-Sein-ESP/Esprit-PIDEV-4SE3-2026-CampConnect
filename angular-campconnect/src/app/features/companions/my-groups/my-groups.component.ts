import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule, Users, MapPin, Calendar, ArrowRight, Plus, Search } from 'lucide-angular';
import { GroupService } from '../../groups/services/group';
import { AuthService } from '../../../core/services/auth.service';
import { Group } from '../../groups/models/group.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-groups-component',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    FormsModule
  ],
  templateUrl: './my-groups.component.html',
  styleUrl: './my-groups.component.css'
})
export class MyGroupsComponent implements OnInit {
  // Icons
  readonly Users = Users;
  readonly MapPin = MapPin;
  readonly Calendar = Calendar;
  readonly ArrowRight = ArrowRight;
  readonly Plus = Plus;
  readonly Search = Search;

  groups: Group[] = [];
  loading = true;
  error: string | null = null;
  currentUserId: string | null = null;
  currentFilter: 'ALL' | 'ACTIVE' | 'INACTIVE' = 'ALL';
  searchQuery: string = '';

  get filteredGroups(): Group[] {
    return this.groups.filter(g => {
      const matchesStatus = this.currentFilter === 'ALL' || g.status === this.currentFilter;
      const matchesSearch = !this.searchQuery || 
        g.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (g.description && g.description.toLowerCase().includes(this.searchQuery.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }

  setFilter(filter: 'ALL' | 'ACTIVE' | 'INACTIVE'): void {
    this.currentFilter = filter;
    this.cdr.detectChanges();
  }

  constructor(
    private groupService: GroupService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.currentUserId = user.id;
        this.loadGroups();
      } else {
        this.loading = false;
        this.error = "Vous devez être connecté pour voir vos groupes.";
        this.cdr.detectChanges();
      }
      this.cdr.detectChanges();
    });
  }

  loadGroups(): void {
    if (!this.currentUserId) return;

    this.groupService.getMyGroups(this.currentUserId).subscribe({
      next: (groups) => {
        this.groups = groups || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load groups', err);
        this.error = "Erreur lors du chargement de vos groupes.";
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}
