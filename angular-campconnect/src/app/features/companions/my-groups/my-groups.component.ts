import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GroupService, Group } from '../../../core/services/group.service';

@Component({
  selector: 'app-my-groups-component',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styles: [`
    .groups-page { min-height: 100vh; background: #f8faf7; padding: 40px 20px; }
    .groups-header { max-width: 900px; margin: 0 auto 32px; display: flex; justify-content: space-between; align-items: center; }
    .groups-header h1 { font-size: 28px; font-weight: 700; color: #1a2e1a; margin: 0; }
    .groups-header .subtitle { color: #6b7f6b; margin-top: 4px; font-size: 14px; }
    .btn-create { background: linear-gradient(135deg, #2d6a4f, #40916c); color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 600; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 8px; transition: all 0.2s; text-decoration: none; }
    .btn-create:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(45,106,79,0.3); }
    .groups-grid { max-width: 900px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    .group-card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.07); border: 1px solid #e8f0e8; transition: all 0.2s; cursor: pointer; }
    .group-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
    .group-icon { width: 56px; height: 56px; border-radius: 14px; background: linear-gradient(135deg, #d8f3dc, #b7e4c7); display: flex; align-items: center; justify-content: center; font-size: 26px; margin-bottom: 16px; }
    .group-name { font-size: 18px; font-weight: 700; color: #1a2e1a; margin-bottom: 8px; }
    .group-desc { font-size: 13px; color: #6b7f6b; line-height: 1.5; margin-bottom: 16px; min-height: 40px; }
    .group-meta { display: flex; align-items: center; justify-content: space-between; }
    .group-trips { font-size: 12px; color: #40916c; font-weight: 600; background: #d8f3dc; padding: 4px 10px; border-radius: 20px; }
    .group-date { font-size: 11px; color: #aab5aa; }
    .btn-manage { display: block; text-align: center; margin-top: 14px; padding: 8px; background: #f0f7f0; border-radius: 8px; color: #2d6a4f; font-weight: 600; font-size: 13px; text-decoration: none; transition: background 0.2s; }
    .btn-manage:hover { background: #d8f3dc; }
    .loading-state { max-width: 900px; margin: 60px auto; text-align: center; }
    .spinner { width: 40px; height: 40px; border: 3px solid #d8f3dc; border-top-color: #40916c; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-state { max-width: 900px; margin: 0 auto; text-align: center; padding: 80px 20px; }
    .empty-icon { font-size: 64px; margin-bottom: 16px; }
    .empty-state h3 { font-size: 22px; color: #1a2e1a; margin-bottom: 8px; }
    .empty-state p { color: #6b7f6b; margin-bottom: 24px; }
  `],
  template: `
    <div class="groups-page">
      <div class="groups-header">
        <div>
          <h1>👥 Mes Groupes de Camping</h1>
          <p class="subtitle">Gérez vos groupes et organisez des aventures collectives</p>
        </div>
        <a routerLink="/companions/create-group" class="btn-create">
          ➕ Créer un groupe
        </a>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Chargement des groupes...</p>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && groups.length === 0" class="empty-state">
        <div class="empty-icon">🏕️</div>
        <h3>Aucun groupe pour l'instant</h3>
        <p>Créez votre premier groupe pour organiser des aventures avec des amis !</p>
        <a routerLink="/companions/create-group" class="btn-create" style="display:inline-flex;">
          ➕ Créer mon premier groupe
        </a>
      </div>

      <!-- Groups Grid -->
      <div *ngIf="!loading && groups.length > 0" class="groups-grid">
        <div *ngFor="let group of groups" class="group-card">
          <div class="group-icon">🏕️</div>
          <div class="group-name">{{ group.name }}</div>
          <div class="group-desc">{{ group.description || 'Aucune description' }}</div>
          <div class="group-meta">
            <span class="group-trips">{{ group.trips?.length || 0 }} trip(s)</span>
            <span class="group-date">{{ formatDate(group.createdAt) }}</span>
          </div>
          <a [routerLink]="['/companions/group', group.id]" class="btn-manage">
            Gérer le groupe →
          </a>
        </div>
      </div>
    </div>
  `
})
export class MyGroupsComponent implements OnInit {
  groups: Group[] = [];
  loading = true;

  constructor(
    private groupService: GroupService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    this.ngZone.run(() => {
      this.groupService.getAllGroups().subscribe({
        next: (groups) => {
          this.groups = groups;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    });
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
