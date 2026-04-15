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
    <div class="min-h-screen bg-gray-100 py-20 px-6 no-print">
        <div class="max-w-4xl mx-auto flex justify-between items-center mb-10">
            <button (click)="goBack()" class="flex items-center gap-2 text-gray-500 hover:text-black transition-colors font-bold uppercase tracking-widest text-xs">
                <lucide-icon [img]="ArrowLeft" class="w-4 h-4"></lucide-icon> Retour à l'Academy
            </button>
            <div class="flex gap-4">
                <button (click)="print()" class="px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-gray-50 transition-all">
                    <lucide-icon [img]="Printer" class="w-4 h-4"></lucide-icon> Imprimer
                </button>
            </div>
        </div>

        <!-- The Certificate Design -->
        <div id="certificate-content" class="certificate-paper max-w-4xl mx-auto bg-white shadow-2xl relative p-16 md:p-24 overflow-hidden border-[16px] border-[#0A1F1C]">
            
            <!-- Tactical Patterns -->
            <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: radial-gradient(#0A1F1C 1px, transparent 1px); background-size: 20px 20px;"></div>
            <div class="absolute top-0 left-0 w-40 h-40 border-l-8 border-t-8 border-[#2d6a4f]/20"></div>
            <div class="absolute bottom-0 right-0 w-40 h-40 border-r-8 border-b-8 border-[#2d6a4f]/20"></div>

            <!-- Content -->
            <div class="relative z-10 text-center space-y-12">
                <div class="flex justify-center">
                    <div class="w-32 h-32 rounded-3xl bg-[#0A1F1C] flex items-center justify-center text-white shadow-2xl rotate-3">
                        <lucide-icon [img]="Award" class="w-16 h-16"></lucide-icon>
                    </div>
                </div>

                <div class="space-y-4">
                    <h4 class="text-[#2d6a4f] font-black uppercase tracking-[0.3em] text-sm">Wilderness Academy • Elite Certification</h4>
                    <h1 class="font-serif text-5xl md:text-7xl font-medium text-[#0A1F1C] leading-tight">CERTIFICAT D'ACCOMPLISSEMENT</h1>
                </div>

                <div class="h-px bg-[#0A1F1C]/10 w-48 mx-auto"></div>

                <div class="space-y-4">
                    <p class="text-gray-400 font-medium italic text-lg uppercase tracking-widest">Décerné à</p>
                    <h2 class="font-serif text-4xl md:text-5xl font-bold text-[#0A1F1C] underline decoration-[#2d6a4f] decoration-4 underline-offset-8">
                        {{ cert?.username }}
                    </h2>
                </div>

                <p class="max-w-xl mx-auto text-lg text-[#0A1F1C]/60 leading-relaxed font-medium">
                    Pour avoir démontré une maîtrise exceptionnelle et complété avec succès le programme tactique de formation :
                    <br>
                    <span class="text-[#0A1F1C] font-black uppercase text-xl mt-4 block">"{{ cert?.certificationName }}"</span>
                </p>

                <div class="pt-12 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-[#0A1F1C]/5">
                    <div class="space-y-1">
                        <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">ID Unique</p>
                        <p class="text-sm font-bold text-[#0A1F1C] uppercase font-mono">{{ cert?.certificationId?.substring(0, 8) }}</p>
                    </div>
                    <div class="space-y-1">
                        <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Date d'Émission</p>
                        <p class="text-sm font-bold text-[#0A1F1C] uppercase">{{ cert?.earnedDate | date:'longDate' }}</p>
                    </div>
                    <div class="space-y-1 text-center">
                        <div class="w-20 h-20 mx-auto rounded-full border-2 border-[#2d6a4f]/30 flex items-center justify-center mb-2">
                             <lucide-icon [img]="ShieldCheck" class="w-10 h-10 text-[#2d6a4f]/40"></lucide-icon>
                        </div>
                        <p class="text-[8px] font-bold uppercase tracking-widest text-gray-400">Verified by WA Network</p>
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
            .certificate-paper { 
                box-shadow: none !important; 
                border-width: 24px !important;
                margin: 0 !important;
                width: 100% !important;
                max-width: none !important;
                height: 100vh !important;
            }
        }
        .certificate-paper {
            background: linear-gradient(135deg, #ffffff 0%, #fdfcf8 100%);
        }
    </style>
  `,
})
export class CertificateViewComponent implements OnInit {
  cert: UserCertification | null = null;
  readonly Award = Award;
  readonly ShieldCheck = ShieldCheck;
  readonly Printer = Printer;
  readonly ArrowLeft = ArrowLeft;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private academyService: AcademyService
  ) {}

  ngOnInit(): void {
    const certId = this.route.snapshot.paramMap.get('id');
    const userId = localStorage.getItem('userId');
    if (certId && userId) {
      this.academyService.getUserCertifications(userId).subscribe(certs => {
        const found = certs.find(c => c.certificationId === certId);
        if (found) {
            this.cert = found;
        } else {
            this.router.navigate(['/academy']);
        }
      });
    }
  }

  print() {
    window.print();
  }

  goBack() {
    window.history.back();
  }
}
