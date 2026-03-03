import { Component, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GroupService } from '../../../core/services/group.service';

@Component({
  selector: 'app-create-group-trip-component',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  styles: [`
    .page { min-height: 100vh; background: #f8faf7; display: flex; align-items: flex-start; justify-content: center; padding: 60px 20px; }
    .form-card { background: white; border-radius: 24px; padding: 40px; max-width: 560px; width: 100%; box-shadow: 0 8px 40px rgba(0,0,0,0.1); }
    .form-header { text-align: center; margin-bottom: 32px; }
    .form-icon { font-size: 56px; margin-bottom: 12px; }
    .form-header h1 { font-size: 26px; font-weight: 800; color: #1a2e1a; margin: 0 0 8px; }
    .form-header p { color: #6b7f6b; font-size: 14px; }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; font-size: 13px; font-weight: 600; color: #1a2e1a; margin-bottom: 6px; }
    .form-group input, .form-group textarea { width: 100%; padding: 12px 14px; border: 1.5px solid #e0e8e0; border-radius: 10px; font-size: 14px; color: #1a2e1a; background: #f8faf7; transition: border 0.2s; box-sizing: border-box; font-family: inherit; }
    .form-group input:focus, .form-group textarea:focus { outline: none; border-color: #40916c; background: white; }
    .form-group textarea { height: 100px; resize: vertical; }
    .form-group input.error, .form-group textarea.error { border-color: #e74c3c; }
    .error-msg { color: #e74c3c; font-size: 12px; margin-top: 4px; }
    .char-count { text-align: right; font-size: 11px; color: #aaa; margin-top: 4px; }
    .btn-submit { width: 100%; padding: 14px; background: linear-gradient(135deg, #2d6a4f, #40916c); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.2s; margin-top: 8px; }
    .btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(45,106,79,0.3); }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .btn-cancel { display: block; text-align: center; margin-top: 14px; color: #6b7f6b; text-decoration: none; font-size: 14px; }
    .btn-cancel:hover { color: #2d6a4f; }
    .success-banner { background: #d8f3dc; border: 1px solid #b7e4c7; border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 20px; color: #2d6a4f; font-weight: 600; font-size: 14px; }
    .error-banner { background: #fff0f0; border: 1px solid #f5c6cb; border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 20px; color: #c0392b; font-size: 14px; }
    .tips { background: #f0f7f0; border-radius: 12px; padding: 16px; margin-top: 24px; }
    .tips h4 { font-size: 13px; font-weight: 700; color: #2d6a4f; margin: 0 0 8px; }
    .tips ul { margin: 0; padding-left: 18px; }
    .tips li { font-size: 12px; color: #6b7f6b; margin-bottom: 4px; }
  `],
  template: `
    <div class="page">
      <div class="form-card">
        <div class="form-header">
          <div class="form-icon">🏕️</div>
          <h1>Créer un groupe</h1>
          <p>Organisez des aventures de camping avec vos amis</p>
        </div>

        <!-- Success -->
        <div class="success-banner" *ngIf="successMsg">
          ✅ {{ successMsg }}
        </div>

        <!-- Error -->
        <div class="error-banner" *ngIf="errorMsg">
          ❌ {{ errorMsg }}
        </div>

        <form (ngSubmit)="createGroup()" #groupForm="ngForm" *ngIf="!successMsg">
          <!-- Nom du groupe -->
          <div class="form-group">
            <label for="groupName">Nom du groupe *</label>
            <input
              id="groupName"
              type="text"
              [(ngModel)]="groupName"
              name="groupName"
              placeholder="ex: Les Aventuriers du Dimanche"
              [class.error]="nameError"
              (input)="nameError = ''"
              maxlength="60"
              required
            />
            <div class="char-count">{{ groupName.length }}/60</div>
            <div class="error-msg" *ngIf="nameError">{{ nameError }}</div>
          </div>

          <!-- Description -->
          <div class="form-group">
            <label for="groupDesc">Description</label>
            <textarea
              id="groupDesc"
              [(ngModel)]="groupDescription"
              name="groupDescription"
              placeholder="Décrivez votre groupe, vos activités préférées, vos destinations rêvées..."
              maxlength="300"
            ></textarea>
            <div class="char-count">{{ groupDescription.length }}/300</div>
          </div>

          <button type="submit" class="btn-submit" [disabled]="submitting">
            {{ submitting ? '⏳ Création en cours...' : '✅ Créer le groupe' }}
          </button>
        </form>

        <a routerLink="/companions/groups" class="btn-cancel">
          ← Retour à mes groupes
        </a>

        <!-- Tips -->
        <div class="tips" *ngIf="!successMsg">
          <h4>💡 Conseils</h4>
          <ul>
            <li>Choisissez un nom mémorable pour votre groupe</li>
            <li>Décrivez vos activités préférées (randonnée, kayak...)</li>
            <li>Après création, vous pourrez associer des trips au groupe</li>
          </ul>
        </div>
      </div>
    </div>
  `
})
export class CreateGroupTripComponent {
  groupName = '';
  groupDescription = '';
  submitting = false;
  successMsg = '';
  errorMsg = '';
  nameError = '';

  constructor(
    private groupService: GroupService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  createGroup(): void {
    this.nameError = '';
    this.errorMsg = '';

    if (!this.groupName.trim()) {
      this.nameError = 'Le nom du groupe est obligatoire';
      return;
    }
    if (this.groupName.trim().length < 3) {
      this.nameError = 'Le nom doit contenir au moins 3 caractères';
      return;
    }

    this.submitting = true;
    this.ngZone.run(() => {
      this.groupService.createGroup({
        name: this.groupName.trim(),
        description: this.groupDescription.trim()
      }).subscribe({
        next: (newGroup) => {
          this.successMsg = `Groupe "${newGroup.name}" créé avec succès !`;
          this.submitting = false;
          this.cdr.detectChanges();
          // Redirect after 2s
          setTimeout(() => this.router.navigate(['/companions/groups']), 2000);
        },
        error: () => {
          this.errorMsg = 'Erreur lors de la création. Vérifiez que le backend est démarré.';
          this.submitting = false;
          this.cdr.detectChanges();
        }
      });
    });
  }
}
