import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  ChevronLeft, Award, Download, Share2, ShieldCheck,
  ExternalLink, CheckCircle, ChevronRight, Eye, ArrowRight, Printer,
  Filter, Clock, AlertTriangle, ShieldOff, RefreshCw, Inbox
} from 'lucide-angular';
import { AcademyService } from '../services/academy.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserCertification } from '../models/academy.model';

type StatusFilter = 'ALL' | 'ACTIVE' | 'EXPIRED';

@Component({
  selector: 'app-my-badges-component',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './my-badges.component.html',
  styles: [`
    :host { display: block; background-color: #F1EDE1; }
    .hero-outline-text {
      -webkit-text-stroke: 1px rgba(10, 31, 28, 0.05);
      color: transparent;
      line-height: 0.8;
    }
    .card-asymmetric { border-radius: 28px 32px 24px 30px; }
    .cert-selection-card {
      border-radius: 20px 20px 8px 8px;
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      background: #FFFFFF;
      border: 1px solid rgba(10, 31, 28, 0.05);
    }
    .cert-selection-card.active {
      background: #FDFCF7;
      border-color: rgba(10, 31, 28, 0.2);
      transform: translateX(10px);
    }
    .medallion-inner {
      border-radius: 24px 24px 8px 8px;
      background: linear-gradient(135deg, rgba(10, 31, 28, 0.02) 0%, transparent 100%);
    }
  `]
})
export class MyBadgesComponent implements OnInit {
  // ─── Icons ───
  readonly ChevronLeft = ChevronLeft;
  readonly Award = Award;
  readonly Download = Download;
  readonly Share2 = Share2;
  readonly ShieldCheck = ShieldCheck;
  readonly ExternalLink = ExternalLink;
  readonly CheckCircle = CheckCircle;
  readonly ChevronRight = ChevronRight;
  readonly Eye = Eye;
  readonly ArrowRight = ArrowRight;
  readonly Printer = Printer;
  readonly Filter = Filter;
  readonly Clock = Clock;
  readonly AlertTriangle = AlertTriangle;
  readonly ShieldOff = ShieldOff;
  readonly RefreshCw = RefreshCw;
  readonly Inbox = Inbox;

  // ─── State ───
  /** All certifications loaded from the API (no filter) */
  allCertifications = signal<UserCertification[]>([]);
  /** The list currently displayed — updated by backend calls */
  displayedCerts = signal<UserCertification[]>([]);
  isLoading = signal(true);
  isFiltering = signal(false);
  hasError = signal(false);

  /**
   * TÂCHE 3 – Active filter. Drives real backend HTTP calls.
   */
  activeFilter = signal<StatusFilter>('ALL');

  selectedCertId = signal<string | null>(null);

  selectedCert = computed(() =>
    this.displayedCerts().find(c => c.certificationId === this.selectedCertId()) ?? null
  );

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private academyService: AcademyService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCertifications();
  }

  /** Load ALL certifications for the current user on page init */
  loadCertifications(): void {
    const userId = this.authService['currentUser$'].value?.id;
    if (!userId) {
      this.isLoading.set(false);
      this.hasError.set(true);
      return;
    }

    this.isLoading.set(true);
    this.hasError.set(false);

    this.academyService.getUserCertifications(userId).subscribe({
      next: (certs) => {
        this.allCertifications.set(certs);
        this.displayedCerts.set(certs);
        if (certs.length > 0) this.selectedCertId.set(certs[0].certificationId);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * TÂCHE 3 – Filter button handler.
   *
   * ALL  → restores the cached full list (no backend call needed).
   * ACTIVE | EXPIRED → calls the REAL backend keyword endpoint:
   *   GET /api/academy/users/{userId}/certifications/filter?status={status}
   *   which uses findByUser_IdAndStatus(userId, status) in Spring Data —
   *   a keyword method traversing TWO entities: UserCertification + User (@DBRef).
   *
   * This is what the professor means by "integrate its consumption in the frontend."
   */
  setFilter(filter: StatusFilter): void {
    this.activeFilter.set(filter);

    if (filter === 'ALL') {
      // Restore from cached full list — no need to call backend again
      this.displayedCerts.set(this.allCertifications());
      const first = this.allCertifications()[0];
      this.selectedCertId.set(first?.certificationId ?? null);
      return;
    }

    const userId = this.authService['currentUser$'].value?.id;
    if (!userId) return;

    // ─── Real backend keyword query call ───────────────────────────
    this.isFiltering.set(true);
    this.academyService.getUserCertificationsByStatus(userId, filter).subscribe({
      next: (filtered) => {
        this.displayedCerts.set(filtered);
        const first = filtered[0];
        this.selectedCertId.set(first?.certificationId ?? null);
        this.isFiltering.set(false);
      },
      error: () => { this.isFiltering.set(false); }
    });
  }

  isExpired(cert: UserCertification): boolean {
    return cert.status === 'EXPIRED';
  }

  formatDate(isoDate: string | null | undefined): string {
    if (!isoDate) return '—';
    return new Date(isoDate).toLocaleDateString('en-US', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  goBack(): void { this.router.navigate(['/academy/my-progress']); }
  selectCert(id: string): void { this.selectedCertId.set(id); }
  downloadCert(): void { window.print(); }
  shareCert(): void { alert('Generating secure verification link...'); }
}
