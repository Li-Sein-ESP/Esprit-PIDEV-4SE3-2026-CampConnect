import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, Award, ShieldCheck, Download, Printer, ArrowLeft } from 'lucide-angular';
import { AcademyService } from '../services/academy.service';
import { UserCertification } from '../models/academy.model';

@Component({
  selector: 'app-certificate-view',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <!-- Loading State -->
    <div *ngIf="isLoading()" class="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <div class="w-16 h-16 border-4 border-[#2d6a4f]/20 border-t-[#2d6a4f] rounded-full animate-spin mb-4"></div>
        <p class="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/40">Authenticating Credentials...</p>
    </div>

    <div *ngIf="!isLoading() && isNotFound()" class="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 text-center">
        <div class="w-20 h-20 bg-rose-100 text-rose-500 rounded-3xl flex items-center justify-center mb-6">
            <lucide-icon [img]="ShieldCheck" class="w-10 h-10"></lucide-icon>
        </div>
        <h2 class="font-serif text-3xl font-medium text-[#0A1F1C] mb-2">Certificate Not Found</h2>
        <p class="text-gray-500 max-w-sm mb-8">We couldn't verify this certification. It might still be processing or the ID is invalid.</p>
        <button (click)="goBack()" class="px-8 py-4 bg-[#0A1F1C] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-black transition-all">
            Return to Academy
        </button>
    </div>

    <div *ngIf="!isLoading() && !isNotFound()" class="min-h-screen bg-[#FDFCF8] py-20 px-6 no-print overflow-y-auto">
        <div class="max-w-5xl mx-auto flex justify-between items-center mb-10">
            <button (click)="goBack()" class="flex items-center gap-2 text-gray-500 hover:text-black transition-colors font-bold uppercase tracking-widest text-[10px]">
                <lucide-icon [img]="ArrowLeft" class="w-4 h-4"></lucide-icon> Back to Academy
            </button>
            <div class="flex gap-4">
                <button (click)="print()" class="px-8 py-4 bg-white border border-[#0A1F1C]/10 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-gray-50 transition-all shadow-sm">
                    <lucide-icon [img]="Printer" class="w-4 h-4"></lucide-icon> Print Official Copy
                </button>
                <button (click)="print()" class="px-8 py-4 bg-[#2d6a4f] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-xl hover:bg-[#1b4332] transition-all">
                    <lucide-icon [img]="Download" class="w-4 h-4"></lucide-icon> Download PDF
                </button>
            </div>
        </div>

        <!-- The Certificate Design -->
        <div class="certificate-paper w-full max-w-5xl mx-auto bg-white shadow-2xl relative p-10 md:p-14 overflow-hidden border-[20px] border-[#0A1F1C] animate-in zoom-in-95 duration-700">
            <!-- Background Watermark -->
            <div class="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
                <lucide-icon [img]="Award" class="w-[400px] h-[400px]"></lucide-icon>
            </div>

            <!-- Tactical Corner Accents -->
            <div class="absolute top-0 left-0 w-24 h-24 border-l-[10px] border-t-[10px] border-[#2d6a4f]/30"></div>
            <div class="absolute bottom-0 right-0 w-24 h-24 border-r-[10px] border-b-[10px] border-[#2d6a4f]/30"></div>

            <!-- EXPIRED Watermark -->
            <div *ngIf="cert?.status === 'EXPIRED'" class="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <div class="text-[150px] font-black text-rose-500/10 rotate-[-30deg] uppercase tracking-tighter border-[10px] border-rose-500/10 px-10 py-4 rounded-[4rem]">
                    EXPIRED
                </div>
            </div>

            <!-- Status Badge -->
            <div class="absolute top-10 right-10 z-30">
                <div *ngIf="cert?.status === 'ACTIVE'" class="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center gap-2 shadow-sm">
                    <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span class="text-[10px] font-black uppercase tracking-widest">STATUS: ACTIVE</span>
                </div>
                <div *ngIf="cert?.status === 'EXPIRED'" class="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-full flex items-center gap-2 shadow-sm">
                    <div class="w-2 h-2 rounded-full bg-rose-500"></div>
                    <span class="text-[10px] font-black uppercase tracking-widest">STATUS: EXPIRED</span>
                </div>
            </div>

            <!-- Header Section -->
            <div class="relative z-10 text-center space-y-6">
                <div class="flex justify-center mb-2">
                    <div class="w-20 h-20 rounded-2xl bg-[#0A1F1C] flex items-center justify-center text-white shadow-2xl -rotate-3 border-4 border-[#2d6a4f]/20">
                        <lucide-icon [img]="Award" class="w-10 h-10 text-[#2d6a4f]"></lucide-icon>
                    </div>
                </div>

                <div class="space-y-2">
                    <h4 class="text-[#2d6a4f] font-black uppercase tracking-[0.5em] text-[8px] opacity-70">CampConnect Global Academy • Accredited Certification</h4>
                    <h1 class="font-serif text-5xl md:text-7xl font-medium text-[#0A1F1C] leading-none tracking-tight">DIPLOMA OF EXCELLENCE</h1>
                </div>

                <div class="flex items-center justify-center gap-4">
                    <div class="h-[1px] bg-[#0A1F1C]/10 flex-1 max-w-[80px]"></div>
                    <p class="text-[9px] font-bold text-[#0A1F1C]/40 uppercase tracking-widest">In recognition of tactical mastery</p>
                    <div class="h-[1px] bg-[#0A1F1C]/10 flex-1 max-w-[80px]"></div>
                </div>

                <!-- Recipient Section -->
                <div class="space-y-4 py-2">
                    <p class="text-gray-400 font-medium italic text-lg uppercase tracking-[0.2em]">This is to certify that</p>
                    <h2 class="font-serif text-4xl md:text-6xl font-bold text-[#0A1F1C] drop-shadow-sm decoration-[#2d6a4f] decoration-[6px] underline underline-offset-[12px]">
                        {{ cert?.username }}
                    </h2>
                </div>

                <!-- Course/Achievement Section -->
                <p class="max-w-2xl mx-auto text-lg text-[#0A1F1C]/70 leading-relaxed font-medium">
                    has successfully achieved the required competencies and demonstrated superior proficiency in the specialized field of:
                    <br>
                    <span class="text-[#0A1F1C] font-black uppercase text-2xl mt-4 block tracking-tight">"{{ cert?.certificationName }}"</span>
                </p>

                <!-- Footer Section: Signatures & Seal -->
                <div class="pt-12 grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                    <!-- Director Signature -->
                    <div class="space-y-2 text-center md:text-left">
                        <div class="h-10 flex items-center justify-center md:justify-start">
                             <span class="font-serif italic text-2xl text-[#0A1F1C]/80 opacity-60">Director Academy</span>
                        </div>
                        <div class="h-px bg-[#0A1F1C] w-full max-w-[150px] mx-auto md:mx-0"></div>
                        <p class="text-[8px] font-black uppercase tracking-widest text-gray-400">Chief Executive of Academy</p>
                    </div>

                    <!-- Gold Official Seal -->
                    <div class="flex justify-center relative scale-110">
                        <div class="w-24 h-24 bg-[#D4AF37] rounded-full border-4 border-[#B8860B] shadow-2xl flex items-center justify-center rotate-12 relative">
                            <div class="absolute inset-0 rounded-full border-[5px] border-dashed border-white/20"></div>
                            <lucide-icon [img]="ShieldCheck" class="w-12 h-12 text-white drop-shadow-md"></lucide-icon>
                        </div>
                    </div>

                    <!-- Lead Instructor Signature -->
                    <div class="space-y-2 text-center md:text-right">
                        <div class="h-10 flex items-center justify-center md:justify-end">
                             <span class="font-serif italic text-2xl text-[#0A1F1C]/80 opacity-60">Master Scout</span>
                        </div>
                        <div class="h-px bg-[#0A1F1C] w-full max-w-[150px] mx-auto md:ml-auto md:mr-0"></div>
                        <p class="text-[8px] font-black uppercase tracking-widest text-gray-400">Lead Tactical Instructor</p>
                    </div>
                </div>

                <!-- Final Meta Data -->
                <div class="pt-8 border-t border-[#0A1F1C]/5 flex flex-wrap justify-center gap-x-12 gap-y-4">
                    <div class="flex items-center gap-2">
                        <div class="w-1.5 h-1.5 rounded-full bg-[#2d6a4f]"></div>
                        <p class="text-[8px] font-bold text-[#0A1F1C] uppercase tracking-widest">ID: {{ cert?.certificationId?.substring(0, 8) }}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-1.5 h-1.5 rounded-full bg-[#2d6a4f]"></div>
                        <p class="text-[8px] font-bold text-[#0A1F1C] uppercase tracking-widest tracking-tighter">DATE: {{ cert?.earnedDate | date:'longDate' }}</p>
                    </div>
                    <div class="flex items-center gap-2" [class.opacity-50]="cert?.status === 'EXPIRED'">
                        <div class="w-1.5 h-1.5 rounded-full" [ngClass]="cert?.status === 'EXPIRED' ? 'bg-rose-500' : 'bg-[#2d6a4f]'"></div>
                        <p class="text-[8px] font-bold uppercase tracking-widest tracking-tighter" [ngClass]="cert?.status === 'EXPIRED' ? 'text-rose-500' : 'text-[#0A1F1C]'">VALID UNTIL: {{ cert?.expiryDate | date:'longDate' }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Print styling -->
    <style>
        @media print {
            .no-print { display: none !important; }
            body { background: white !important; margin: 0; padding: 0; }
            body > * { display: none !important; }
            #certificate-content, .certificate-paper { 
                display: block !important;
                visibility: visible !important;
                box-shadow: none !important; 
                border-width: 24px !important;
                margin: 0 auto !important;
                width: 100% !important;
                max-width: 100% !important;
                height: 100vh !important;
                page-break-inside: avoid !important;
            }
        }
    </style>
  `,
})
export class CertificateViewComponent implements OnInit {
  cert: UserCertification | null = null;
  isLoading = signal<boolean>(true);
  isNotFound = signal<boolean>(false);
  readonly Award = Award;
  readonly ShieldCheck = ShieldCheck;
  readonly Printer = Printer;
  readonly Download = Download;
  readonly ArrowLeft = ArrowLeft;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private academyService: AcademyService
  ) {}

  ngOnInit(): void {
    const certId = this.route.snapshot.paramMap.get('id');
    
    // Attempt to get the authenticated user ID from cc_user
    let ccUserId = null;
    try {
      const ccUser = JSON.parse(localStorage.getItem('cc_user') || 'null');
      if (ccUser && ccUser.id) {
        ccUserId = ccUser.id;
      }
    } catch (e) { }

    const userId = ccUserId || localStorage.getItem('userId') || localStorage.getItem('demoUserId') || 'demo-user';
    
    if (certId) {
      this.isLoading.set(true);

      // First try to find the cert in localStorage (most reliable source for display name)
      let localDisplayName: string | null = null;
      try {
        const localCerts: any[] = JSON.parse(localStorage.getItem('academy_earned_certs') || '[]');
        const localMatch = localCerts.find(c =>
          c.id === certId || c.certificationId === certId ||
          c.certificationId?.replace(/^CERT-/i, '') === certId?.replace(/^CERT-/i, '')
        );
        if (localMatch?.username && !localMatch.username.includes('@')) {
          localDisplayName = localMatch.username;
        }
      } catch (e) {}

      this.academyService.getUserCertifications(userId).subscribe({
        next: (certs) => {
          const found = certs.find(c => c.id === certId) || (userId.startsWith('demo-user') ? certs[0] : null);
          if (found) {
              const earnedDate = new Date(found.earnedDate || new Date());
              const expiryDate = new Date(earnedDate.getTime() + 365 * 24 * 60 * 60 * 1000);
              found.expiryDate = expiryDate.toISOString();
              found.status = new Date() > expiryDate ? 'EXPIRED' : 'ACTIVE';
              // Use localStorage display name if backend returned an email
              if (localDisplayName) {
                found.username = localDisplayName;
              } else if (found.username?.includes('@')) {
                const storedUsername = localStorage.getItem('username') || '';
                if (storedUsername && !storedUsername.includes('@')) {
                  found.username = storedUsername;
                } else {
                  found.username = found.username.split('@')[0];
                }
              }
              this.cert = found;
              this.isNotFound.set(false);
          } else {
              // Try localStorage as full fallback
              try {
                const localCerts: any[] = JSON.parse(localStorage.getItem('academy_earned_certs') || '[]');
                const localMatch = localCerts.find(c =>
                  c.id === certId || c.certificationId === certId ||
                  c.certificationId?.replace(/^CERT-/i, '') === certId?.replace(/^CERT-/i, '')
                ) || localCerts[localCerts.length - 1];
                if (localMatch) {
                  const earned = new Date(localMatch.earnedDate || new Date());
                  const expiry = new Date(earned.getTime() + 365 * 24 * 60 * 60 * 1000);
                  let fallbackName = localDisplayName || localStorage.getItem('username') || localMatch.username || 'Camper';
                  if (fallbackName.includes('@')) fallbackName = fallbackName.split('@')[0];
                  this.cert = {
                    ...localMatch,
                    expiryDate: expiry.toISOString(),
                    status: new Date() > expiry ? 'EXPIRED' : 'ACTIVE',
                    username: fallbackName
                  };
                  this.isNotFound.set(false);
                } else {
                  this.isNotFound.set(true);
                }
              } catch (e) {
                this.isNotFound.set(true);
              }
          }
          this.isLoading.set(false);
        },
        error: () => {
          // Full localStorage fallback on error
          try {
            const localCerts: any[] = JSON.parse(localStorage.getItem('academy_earned_certs') || '[]');
            const localMatch = localCerts[localCerts.length - 1];
            if (localMatch) {
              const earned = new Date(localMatch.earnedDate || new Date());
              const expiry = new Date(earned.getTime() + 365 * 24 * 60 * 60 * 1000);
              let fallbackName = localDisplayName || localStorage.getItem('username') || localMatch.username || 'Camper';
              if (fallbackName.includes('@')) fallbackName = fallbackName.split('@')[0];
              this.cert = {
                ...localMatch,
                expiryDate: expiry.toISOString(),
                status: new Date() > expiry ? 'EXPIRED' : 'ACTIVE',
                username: fallbackName
              };
              this.isNotFound.set(false);
            } else {
              this.isNotFound.set(true);
            }
          } catch (e) {
            this.isNotFound.set(true);
          }
          this.isLoading.set(false);
        }
      });
    } else {
      this.isNotFound.set(true);
      this.isLoading.set(false);
    }
  }

  print() {
    window.print();
  }

  goBack() {
    window.history.back();
  }
}
