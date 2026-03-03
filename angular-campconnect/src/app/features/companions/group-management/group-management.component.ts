import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { GroupService, Group } from '../../../core/services/group.service';

@Component({
  selector: 'app-group-management-component',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styles: [`
    .page { min-height: 100vh; background: #f8faf7; padding: 40px 20px; }
    .container { max-width: 800px; margin: 0 auto; }
    .back-link { display: inline-flex; align-items: center; gap: 6px; color: #40916c; text-decoration: none; font-size: 14px; margin-bottom: 24px; font-weight: 500; }
    .back-link:hover { text-decoration: underline; }
    .group-header { background: linear-gradient(135deg, #2d6a4f, #40916c); border-radius: 20px; padding: 32px; color: white; margin-bottom: 24px; }
    .group-icon-big { font-size: 48px; margin-bottom: 12px; }
    .group-title { font-size: 28px; font-weight: 800; margin: 0 0 8px; }
    .group-subtitle { opacity: 0.85; font-size: 15px; }
    .group-date { font-size: 13px; opacity: 0.7; margin-top: 8px; }
    .section { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); margin-bottom: 20px; }
    .section h3 { font-size: 16px; font-weight: 700; color: #1a2e1a; margin: 0 0 16px; display: flex; align-items: center; gap: 8px; }
    .trips-empty { text-align: center; padding: 32px; color: #6b7f6b; font-size: 14px; }
    .trip-item { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 10px; background: #f8faf7; margin-bottom: 8px; }
    .trip-icon { font-size: 24px; }
    .trip-name { font-weight: 600; color: #1a2e1a; font-size: 14px; }
    .trip-dest { color: #6b7f6b; font-size: 12px; }
    .action-bar { display: flex; gap: 12px; justify-content: flex-end; }
    .btn-plan { background: linear-gradient(135deg, #2d6a4f, #40916c); color: white; border: none; padding: 12px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; font-size: 14px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; }
    .btn-plan:hover { opacity: 0.9; }
    .btn-delete { background: #fff0f0; color: #c0392b; border: 1px solid #f5c6cb; padding: 12px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; font-size: 14px; transition: all 0.2s; }
    .btn-delete:hover { background: #c0392b; color: white; }
    .confirm-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .confirm-box { background: white; border-radius: 16px; padding: 32px; max-width: 400px; width: 90%; text-align: center; }
    .confirm-box h3 { color: #c0392b; margin-bottom: 12px; }
    .confirm-box p { color: #6b7f6b; margin-bottom: 24px; font-size: 14px; }
    .confirm-btns { display: flex; gap: 12px; justify-content: center; }
    .btn-cancel { padding: 10px 24px; border: 1px solid #ddd; border-radius: 8px; background: white; cursor: pointer; font-weight: 500; }
    .btn-confirm-del { padding: 10px 24px; background: #c0392b; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .loading { text-align: center; padding: 60px; color: #6b7f6b; }
    .spinner { width: 36px; height: 36px; border: 3px solid #d8f3dc; border-top-color: #40916c; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 12px; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
  template: `
    <div class="page">
      <div class="container">
        <a routerLink="/companions/groups" class="back-link">← Retour à mes groupes</a>

        <!-- Loading -->
        <div *ngIf="loading" class="loading">
          <div class="spinner"></div>
          <p>Chargement du groupe...</p>
        </div>

        <!-- Group not found -->
        <div *ngIf="!loading && !group" style="text-align:center;padding:60px;">
          <p style="font-size:48px">🚫</p>
          <h3>Groupe introuvable</h3>
          <a routerLink="/companions/groups" class="back-link">← Retour à mes groupes</a>
        </div>

        <!-- Group Details -->
        <ng-container *ngIf="!loading && group">
          <div class="group-header">
            <div class="group-icon-big">🏕️</div>
            <h1 class="group-title">{{ group.name }}</h1>
            <p class="group-subtitle">{{ group.description || 'Aucune description' }}</p>
            <p class="group-date">Créé le {{ formatDate(group.createdAt) }}</p>
          </div>

          <!-- Trips associated -->
          <div class="section">
            <h3>🗺️ Trips associés ({{ group.trips?.length || 0 }})</h3>
            <div *ngIf="!group.trips || group.trips.length === 0" class="trips-empty">
              <p>Aucun trip associé à ce groupe pour l'instant.</p>
              <a routerLink="/plan-trip/create" class="btn-plan" style="margin-top:12px; display:inline-flex;">
                ➕ Planifier un trip
              </a>
            </div>
            <div *ngFor="let trip of group.trips" class="trip-item">
              <span class="trip-icon">⛺</span>
              <div>
                <div class="trip-name">{{ trip.destination || trip.name || 'Trip' }}</div>
                <div class="trip-dest">{{ trip.startDate }} → {{ trip.endDate }}</div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="action-bar">
            <button class="btn-delete" (click)="showConfirm = true">
              🗑️ Supprimer le groupe
            </button>
          </div>
        </ng-container>

        <!-- Delete confirmation modal -->
        <div class="confirm-modal" *ngIf="showConfirm">
          <div class="confirm-box">
            <h3>⚠️ Confirmer la suppression</h3>
            <p>Êtes-vous sûr de vouloir supprimer le groupe <strong>{{ group?.name }}</strong> ? Cette action est irréversible.</p>
            <div class="confirm-btns">
              <button class="btn-cancel" (click)="showConfirm = false">Annuler</button>
              <button class="btn-confirm-del" (click)="deleteGroup()">Supprimer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class GroupManagementComponent implements OnInit {
  group: Group | null = null;
  loading = true;
  showConfirm = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private groupService: GroupService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('groupId');
    if (id) {
      this.ngZone.run(() => {
        this.groupService.getGroupById(id).subscribe({
          next: (group) => {
            this.group = group;
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.group = null;
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
      });
    } else {
      this.loading = false;
    }
  }

  deleteGroup(): void {
    if (!this.group?.id) return;
    this.groupService.deleteGroup(this.group.id).subscribe({
      next: () => {
        this.router.navigate(['/companions/groups']);
      }
    });
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return 'Inconnue';
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  }
}
