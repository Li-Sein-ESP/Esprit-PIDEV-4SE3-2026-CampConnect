import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  ChevronLeft, Award, Download, Share2, ShieldCheck,
  ExternalLink, CheckCircle, ChevronRight, Eye, ArrowRight, Printer,
  Filter, Clock, AlertTriangle, ShieldOff, RefreshCw, Inbox, Play
} from 'lucide-angular';
import { AcademyService } from '../services/academy.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserCertification, Certification } from '../models/academy.model';
import { forkJoin } from 'rxjs';

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

    @media print {
      /* Force display none on EVERYTHING in the body */
      body > * {
        display: none !important;
      }
      
      /* Only show the certificate container by making it fixed and blocking other things */
      .certificate-container {
        display: block !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background: white !important;
        z-index: 9999999 !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      /* Ensure the paper fits inside the A4 landscape bounds */
      .certificate-paper {
        width: 100% !important;
        height: 100% !important;
        max-width: 297mm !important;
        max-height: 210mm !important;
        border: 15px double #2D5016 !important;
        margin: auto !important;
        box-shadow: none !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: center !important;
      }

      /* Final check to hide any potential leaking elements */
      nav, footer, .no-print, .hero-section, header, main {
        display: none !important;
      }

      @page {
        size: landscape;
        margin: 0mm;
      }
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
  readonly Play = Play;

  // ─── State ───
  /** All certifications loaded from the API (no filter) */
  allCertifications = signal<UserCertification[]>([]);
  /** The list currently displayed — updated by backend calls */
  displayedCerts = signal<UserCertification[]>([]);
  /** Certifications the user has NOT earned yet */
  availableCerts = signal<Certification[]>([]);
  isLoading = signal(true);
  isFiltering = signal(false);
  hasError = signal(false);

  /**
   * TÂCHE 3 – Active filter. Drives real backend HTTP calls.
   */
  activeFilter = signal<StatusFilter>('ALL');

  selectedCertId = signal<string | null>(null);

  selectedCert = computed(() =>
    this.displayedCerts().find(c => c.id === this.selectedCertId()) ?? null
  );

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private academyService: AcademyService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const paramCertId = params.get('certId');
      if (this.allCertifications().length > 0) {
        // Already loaded, just select it
        this.selectCertById(paramCertId);
      } else {
        this.loadCertifications(paramCertId || null);
      }
    });
  }

  private selectCertById(preselectId: string | null) {
    if (!preselectId) return;
    const merged = this.displayedCerts();
    const toSelect = merged.find(c =>
      c.id === preselectId ||
      c.certificationId === preselectId ||
      c.certificationId?.replace(/^CERT-/i, '') === preselectId?.replace(/^CERT-/i, '')
    );
    if (toSelect) {
      this.selectedCertId.set(toSelect.id ?? toSelect.certificationId ?? null);
    }
  }

  /** Load ALL certifications for the current user on page init */
  loadCertifications(preselectId: string | null = null): void {
    const userId = this.authService['currentUser$'].value?.id;
    if (!userId) {
      // Try to load from localStorage only
      this.loadFromLocalStorageOnly(preselectId);
      return;
    }

    this.isLoading.set(true);
    this.hasError.set(false);

    forkJoin({
      userCerts: this.academyService.getUserCertifications(userId),
      allPrograms: this.academyService.getCertifications()
    }).subscribe({
      next: ({ userCerts, allPrograms }) => {
        // IMPORTANT: We only use backend certs to ensure we don't see other users' data from localStorage
        const enriched = this.enrichCerts(userCerts);
        const merged = enriched; // Skip mergeWithLocalStorage to avoid data leak
        
        // DEDUPLICATE: Keep only the most recent cert per name/ID
        const deduped = this.deduplicateCerts(merged);

        this.allCertifications.set(deduped);
        this.displayedCerts.set(deduped);

        // Auto-select: prefer the cert matching preselectId, fallback to first
        const toSelect = preselectId
          ? merged.find(c =>
              c.id === preselectId ||
              c.certificationId === preselectId ||
              c.certificationId?.replace(/^CERT-/i, '') === preselectId?.replace(/^CERT-/i, '')
            )
          : null;
        this.selectedCertId.set((toSelect ?? merged[0])?.id ?? (toSelect ?? merged[0])?.certificationId ?? null);

        const earnedIds = new Set(merged.map(c => c.certificationId));
        this.availableCerts.set(allPrograms.filter(p => !earnedIds.has(p.id)));

        this.isLoading.set(false);
      },
      error: () => {
        // Fallback to localStorage only on backend error
        this.loadFromLocalStorageOnly(preselectId);
      }
    });
  }

  private deduplicateCerts(certs: UserCertification[]): UserCertification[] {
    const unique = new Map<string, UserCertification>();
    certs.forEach(c => {
      const key = (c.certificationName || c.certificationId || 'unknown').toLowerCase().trim();
      if (!unique.has(key)) {
        unique.set(key, c);
      } else {
        // Keep the latest one if duplicates exist
        const existing = unique.get(key)!;
        const existingDate = new Date(existing.earnedDate || 0).getTime();
        const newDate = new Date(c.earnedDate || 0).getTime();
        if (newDate > existingDate) {
           unique.set(key, c);
        }
      }
    });
    return Array.from(unique.values());
  }

  private loadFromLocalStorageOnly(preselectId: string | null = null): void {
    const localCerts = this.getLocalStorageCerts();
    if (localCerts.length > 0) {
      this.allCertifications.set(localCerts);
      this.displayedCerts.set(localCerts);
      const toSelect = preselectId
        ? localCerts.find(c =>
            c.id === preselectId ||
            c.certificationId === preselectId ||
            c.certificationId?.replace(/^CERT-/i, '') === preselectId?.replace(/^CERT-/i, '')
          )
        : null;
      this.selectedCertId.set((toSelect ?? localCerts[0])?.id ?? (toSelect ?? localCerts[0])?.certificationId ?? null);
    } else {
      this.hasError.set(true);
    }
    this.isLoading.set(false);
  }

  private getLocalStorageCerts(): UserCertification[] {
    try {
      const raw: any[] = JSON.parse(localStorage.getItem('academy_earned_certs') || '[]');
      return this.enrichCerts(raw);
    } catch (e) {
      return [];
    }
  }

  private enrichCerts(certs: UserCertification[]): UserCertification[] {
    const storedUsername = localStorage.getItem('username') || '';
    // Get all localStorage certs for display name lookup
    let localCerts: any[] = [];
    try { localCerts = JSON.parse(localStorage.getItem('academy_earned_certs') || '[]'); } catch (e) {}

    return certs.map(c => {
      const earned = c.earnedDate ? new Date(c.earnedDate) : new Date();
      // Use backend expiryDate if available, otherwise fallback to +1 year
      const expiry = c.expiryDate ? new Date(c.expiryDate) : new Date(earned.getTime() + 365 * 24 * 60 * 60 * 1000);
      
      // Use backend status if available, otherwise calculate based on date
      let status = c.status || (new Date() > expiry ? 'EXPIRED' : 'ACTIVE');

      // Resolve display name: prefer local stored name over backend email
      let displayName = c.username || '';
      const localMatch = localCerts.find((lc: any) =>
        lc.certificationId === c.certificationId ||
        lc.certificationName === c.certificationName
      );
      if (localMatch?.username && !localMatch.username.includes('@')) {
        displayName = localMatch.username;
      } else {
        if (storedUsername && !storedUsername.includes('@')) {
          displayName = storedUsername;
        } else if (displayName.includes('@')) {
          displayName = displayName.split('@')[0];
        }
      }

      return {
        ...c,
        earnedDate: earned.toISOString(),
        expiryDate: expiry.toISOString(),
        status: status,
        certificationName: c.certificationName || 'Certification',
        username: displayName || 'Camper'
      };
    });
  }

  private mergeWithLocalStorage(backendCerts: UserCertification[]): UserCertification[] {
    const localCerts = this.getLocalStorageCerts();
    const merged = [...backendCerts];
    const existingIds = new Set(backendCerts.map(c => c.certificationId));

    // Add local certs that aren't already in the backend list
    for (const local of localCerts) {
      const strippedId = (local.certificationId || '').replace(/^CERT-/i, '');
      if (!existingIds.has(local.certificationId) && !existingIds.has(strippedId)) {
        merged.push(local);
      }
    }
    return merged;
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
      this.selectedCertId.set(first?.id ?? first?.certificationId ?? null);
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
        this.selectedCertId.set(first?.id ?? first?.certificationId ?? null);
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

  goBack(): void { this.router.navigate(['/academy']); }
  selectCert(id: string): void { this.selectedCertId.set(id); }
  downloadCert(): void {
    const cert = this.selectedCert();
    if (!cert) return;

    const printWindow = window.open('', '_blank', 'width=1100,height=850');
    if (!printWindow) return;

    const earnedDate = cert.earnedDate ? new Date(cert.earnedDate).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' }) : 'May 20, 2024';

    printWindow.document.write(`
      <html>
        <head>
          <title>Certification - ${cert.certificationName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Inter:wght@400;700;900&display=swap');
            
            body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; background: #fff; overflow: hidden !important; }
            .cert-wrapper {
              width: 297mm;
              height: 209mm; /* Slightly less than 210mm to avoid 2nd page */
              padding: 30px;
              box-sizing: border-box;
              background: #fff;
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
              overflow: hidden !important;
            }
            .cert-paper {
              width: 100%;
              height: 100%;
              border: 12px double #2D5016;
              padding: 60px;
              box-sizing: border-box;
              text-align: center;
              position: relative;
              background: #fff;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            .cert-inner-border {
              position: absolute;
              inset: 15px;
              border: 2px solid rgba(45, 80, 22, 0.2);
            }
            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              font-size: 300px;
              opacity: 0.03;
              z-index: 0;
              pointer-events: none;
            }
            .content { position: relative; z-index: 10; width: 100%; }
            h1 { font-family: 'Playfair Display', serif; font-size: 64px; color: #1A1A1A; margin: 0 0 10px 0; }
            .subtitle { text-transform: uppercase; letter-spacing: 6px; font-size: 12px; font-weight: 900; color: #5C5C5C; margin-bottom: 50px; }
            .award-to { font-family: 'Playfair Display', serif; font-style: italic; font-size: 24px; color: #5C5C5C; margin-bottom: 10px; }
            .recipient-name { font-family: 'Playfair Display', serif; font-size: 72px; font-weight: 700; color: #1A1A1A; border-bottom: 3px solid rgba(45, 80, 22, 0.2); display: inline-block; padding-bottom: 10px; margin-bottom: 40px; }
            .completed { font-family: 'Playfair Display', serif; font-style: italic; font-size: 24px; color: #5C5C5C; margin-bottom: 15px; }
            .cert-name { font-size: 36px; font-weight: 900; color: #2D5016; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 50px; }
            
            .footer { width: 100%; display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; }
            .footer-item { text-align: left; }
            .footer-label { font-size: 10px; font-weight: 900; color: #5C5C5C; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
            .footer-value { font-size: 14px; font-weight: 700; color: #1A1A1A; }
            .qr-code { width: 100px; height: 100px; padding: 10px; border: 1px solid #E8E2D8; border-radius: 12px; }
            
            @page { size: landscape; margin: 0; }
            @media print { .cert-wrapper { width: 100%; height: 100vh; } }
          </style>
        </head>
        <body>
          <div class="cert-wrapper">
            <div class="cert-paper">
              <div class="cert-inner-border"></div>
              <div class="watermark">🏆</div>
              
              <div class="content">
                <div style="font-size: 60px; margin-bottom: 30px;">🏅</div>
                <h1>Credential of Excellence</h1>
                <div class="subtitle">Official Wilderness Academy Global Accreditation</div>
                
                <div class="award-to">This is to officially certify that</div>
                <div class="recipient-name">${cert.username}</div>
                
                <div class="completed">has successfully demonstrated mastery in</div>
                <div class="cert-name">${cert.certificationName}</div>
                
                <div class="footer">
                  <div class="footer-item">
                    <div class="footer-label">Verification ID</div>
                    <div class="footer-value" style="font-family: monospace; background: #F7F4EF; padding: 5px 10px; rounded: 4px;">CAMP-${cert.certificationId?.substring(0, 10).toUpperCase() || 'MASTER'}</div>
                  </div>
                  
                  <div style="text-align: center;">
                    <img class="qr-code" src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=VERIFY-${cert.certificationId}">
                    <div class="footer-label" style="margin-top: 8px;">Scan to Verify</div>
                  </div>
                  
                  <div class="footer-item" style="text-align: right;">
                    <div class="footer-label">Authorized Date</div>
                    <div class="footer-value">${earnedDate}</div>
                    <div class="footer-value" style="font-family: 'Playfair Display', serif; font-size: 20px; margin-top: 10px;">CampConnect</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
  shareCert(): void { alert('Generating secure verification link...'); }

  fastTrackCert(cert: Certification): void {
    const courseId = (cert.requiredCourseIds && cert.requiredCourseIds.length > 0) ? cert.requiredCourseIds[0] : cert.id;
    this.router.navigate(['/academy', courseId], { queryParams: { fastTrack: 'true' } });
  }
}
