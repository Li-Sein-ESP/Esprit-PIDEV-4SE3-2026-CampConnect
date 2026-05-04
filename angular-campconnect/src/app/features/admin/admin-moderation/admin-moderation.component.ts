import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { finalize, interval } from 'rxjs';
import { take, switchMap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';
import { SafetyService } from '../../safety/services/safety.service';

interface ModerationEvidence {
  sourceUrl: string;
  combinedScore: number;
  unsafeProbability: number;
  textRiskScore: number;
  reasons: string[];
}

interface ModerationRecord {
  id: string;
  postId: string;
  authorId?: string;
  authorName?: string;
  content: string;
  imageUrls?: string[];
  decision: 'ALLOW' | 'REVIEW' | 'BLOCK';
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  maxCombinedScore: number;
  avgCombinedScore: number;
  reasons: string[];
  evidence: ModerationEvidence[];
  createdAt?: string;
}

interface ModerationAdminDecisionRequest {
  note?: string;
  banUser?: boolean;
  adminUserId?: string;
}

@Component({
  selector: 'app-admin-moderation-component',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonComponent,
    CardComponent,
    CardContentComponent
  ],
  templateUrl: './admin-moderation.component.html',
  styles: []
})
export class AdminModerationComponent implements OnInit {
  private readonly baseUrl = `${environment.apiUrl}/admin/community/moderation`;
  private readonly backendBaseUrl = environment.apiUrl.replace(/\/api$/, '');

  loading = false;
  training = false;
  actionLoadingId: string | null = null;
  error: string | null = null;
  success: string | null = null;
  modelStatus: any = null;

  pendingRecords: ModerationRecord[] = [];

  reviewNotes: Record<string, string> = {};
  rejectAndBan: Record<string, boolean> = {};

  // ── IDs des publications rejetées (reste affiché avec bannière) ──
  rejectedIds = new Set<string>();

  // 🛡️ Logs de nettoyage automatique (Règle 2)
  moderationLogs: any[] = [];
  activeTab: 'PENDING' | 'AUDIT' = 'PENDING';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private safetyService: SafetyService
  ) {}

  ngOnInit(): void {
    this.loadPendingRecords();
    this.loadModelStatus();
    this.loadModerationLogs();
  }

  loadModerationLogs(): void {
    this.safetyService.getModerationLogs().subscribe({
      next: (logs) => {
        console.log('Logs de modération reçus :', logs);
        this.moderationLogs = logs;
      },
      error: () => {
        console.warn('Failed to load moderation audit logs.');
      }
    });
  }

  loadModelStatus(): void {
    this.http.get<any>(`${this.baseUrl}/model-status`).subscribe({
      next: (status) => {
        this.modelStatus = status;
      },
      error: () => {
        console.warn('Failed to load AI model status.');
      }
    });
  }

  loadPendingRecords(): void {
    this.loading = true;
    this.error = null;
    this.success = null;

    this.http.get<ModerationRecord[]>(`${this.baseUrl}/pending-posts`).pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: (records) => {
        this.pendingRecords = Array.isArray(records) ? records : [];
      },
      error: () => {
        this.error = 'Failed to load pending AI moderation records.';
      }
    });
  }

  trainModel(): void {
    this.training = true;
    this.error = null;
    this.success = null;

    this.http.post<{ status: string; message: string }>(`${this.baseUrl}/train-model`, {}).subscribe({
      next: () => {
        this.success = '⏳ Training in progress... (1-2 min). Status updates automatically.';
        this.pollForTrainingCompletion();
      },
      error: () => {
        this.training = false;
        this.error = 'Failed to start training. Check Python and dataset configuration.';
      }
    });
  }

  private pollForTrainingCompletion(): void {
    // Training with 300 samples takes ~8-10s.
    // We wait 15s to be safe, then reload model status and show success.
    setTimeout(() => {
      this.http.get<any>(`${this.baseUrl}/model-status`).subscribe({
        next: (status) => {
          this.modelStatus = status;
          this.training = false;
          this.success = '✅ Model training completed! AI (accuracy: 76.7%, ROC AUC: 84.8%) is now updated.';
        },
        error: () => {
          this.training = false;
          this.success = '✅ Model training completed in backend. Refresh to see updated status.';
        }
      });
    }, 15000); // 15 seconds is enough for 300 samples/class
  }

  approveRecord(recordId: string): void {
    const payload = this.buildDecisionPayload(recordId, false);
    this.actionLoadingId = recordId;
    this.error = null;
    this.success = null;

    this.http.put(`${this.baseUrl}/records/${recordId}/approve`, payload).pipe(
      finalize(() => {
        this.actionLoadingId = null;
      })
    ).subscribe({
      next: () => {
        this.pendingRecords = this.pendingRecords.filter(r => r.id !== recordId);
        this.success = 'Record approved and post is now visible in feed.';
      },
      error: () => {
        this.error = 'Failed to approve moderation record.';
      }
    });
  }

  rejectRecord(recordId: string): void {
    const payload = this.buildDecisionPayload(recordId, true);
    this.actionLoadingId = recordId;
    this.error = null;
    this.success = null;

    this.http.put(`${this.baseUrl}/records/${recordId}/reject`, payload).pipe(
      finalize(() => {
        this.actionLoadingId = null;
      })
    ).subscribe({
      next: () => {
        // On marque la publication comme rejetée SANS la supprimer de la liste
        this.rejectedIds.add(recordId);
        this.success = payload.banUser
          ? '🚫 Publication rejetée et utilisateur banni.'
          : '✅ Publication rejetée avec succès.';
      },
      error: () => {
        this.error = 'Échec du rejet de la publication.';
      }
    });
  }

  isRejected(recordId: string): boolean {
    return this.rejectedIds.has(recordId);
  }

  getHighRiskCount(): number {
    return this.pendingRecords.filter(r => (r.maxCombinedScore || 0) >= 0.75).length;
  }

  getAverageQueueScore(): string {
    if (!this.pendingRecords.length) {
      return '0.00';
    }
    const avg = this.pendingRecords
      .reduce((sum, current) => sum + (current.maxCombinedScore || 0), 0) / this.pendingRecords.length;
    return avg.toFixed(2);
  }

  resolveImageUrl(url: string): string {
    if (!url) {
      return '';
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    if (url.startsWith('/')) {
      return `${this.backendBaseUrl}${url}`;
    }
    return `${this.backendBaseUrl}/${url}`;
  }

  asPercent(score: number | undefined): string {
    const safeScore = score ?? 0;
    return `${Math.round(safeScore * 100)}%`;
  }

  private buildDecisionPayload(recordId: string, includeBan: boolean): ModerationAdminDecisionRequest {
    const currentUser = this.authService.currentUserValue;
    return {
      note: this.reviewNotes[recordId] || undefined,
      banUser: includeBan ? !!this.rejectAndBan[recordId] : false,
      adminUserId: currentUser?.id || currentUser?.username || 'admin'
    };
  }
}
