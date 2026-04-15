import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  ChevronLeft, Award, Download, Share2, ShieldCheck,
  ExternalLink, CheckCircle, ChevronRight, Eye, ArrowRight, Printer
} from 'lucide-angular';

interface Certificate {
  id: string;
  title: string;
  emoji: string;
  status: 'verified';
  earnedDate: string;
  verificationCode: string;
  skills: string[];
  description: string;
  color: string;
}

@Component({
  selector: 'app-my-badges-component',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './my-badges.component.html',
  styles: [`
    :host {
      display: block;
      background-color: #F1EDE1;
    }
    .hero-outline-text {
      -webkit-text-stroke: 1px rgba(10, 31, 28, 0.05);
      color: transparent;
      line-height: 0.8;
    }
    .card-asymmetric {
      border-radius: 28px 32px 24px 30px;
    }
    .glass-card {
      background: rgba(10, 31, 28, 0.03);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(10, 31, 28, 0.08);
    }
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

  selectedCertId: string | null = 'cert-fs';

  certificates: Certificate[] = [
    {
      id: 'cert-fs',
      title: 'Fire Safety Specialist',
      emoji: '🔥',
      status: 'verified',
      earnedDate: '28 Dec 2025',
      verificationCode: 'CC-FS-2025-4X7K9',
      color: '#e85d04',
      skills: ['Fire Building', 'Fire Safety', 'Regulations', 'Enviro-Impact'],
      description: 'Awarded for demonstrating elite proficiency in fire building, tactical management, and wilderness safety protocols. This certification verifies your command over environmental regulations and zero-impact survival techniques.'
    }
  ];

  get selectedCert(): Certificate | null {
    return this.certificates.find(c => c.id === this.selectedCertId) ?? null;
  }

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['cert']) {
        const match = this.certificates.find(c => c.id === params['cert']);
        if (match) this.selectedCertId = match.id;
      }
    });
  }

  goBack() { this.router.navigate(['/academy/my-progress']); }
  selectCert(id: string) { this.selectedCertId = id; }
  downloadCert() { alert('Generating high-resolution security-signed PDF...'); }
  shareCert() { alert('Generating secure verification link...'); }
}
