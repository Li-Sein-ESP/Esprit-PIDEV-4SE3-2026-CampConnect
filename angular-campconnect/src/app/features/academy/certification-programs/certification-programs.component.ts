import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, ChevronLeft, Clock, BookOpen, Star, CheckCircle, Award, Users, ShieldCheck, Medal, Play, ChevronRight, TrendingUp, Target, Briefcase, FileText, GraduationCap, ArrowRight, AlertTriangle, RefreshCw } from 'lucide-angular';
import { AcademyService } from '../services/academy.service';
import { Certification } from '../models/academy.model';

@Component({
  selector: 'app-certification-programs-component',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule
  ],
  templateUrl: './certification-programs.component.html',
  styles: [`
    :host { 
      display: block; 
      background-color: #F1EDE1;
    }
    .hero-outline-text {
      -webkit-text-stroke: 1px rgba(10, 31, 28, 0.05);
      color: transparent;
      line-Height: 0.8;
    }
    .card-asymmetric {
      border-radius: 28px 32px 24px 30px;
    }
    .medallion-card {
      border-radius: 24px 24px 8px 8px;
    }
    .glass-card {
      background: rgba(10, 31, 28, 0.03);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(10, 31, 28, 0.08);
    }
  `]
})
export class CertificationProgramsComponent implements OnInit {
  readonly Medal = Medal;
  readonly Clock = Clock;
  readonly ChevronRight = ChevronRight;
  readonly ChevronLeft = ChevronLeft;
  readonly CheckCircle = CheckCircle;
  readonly Users = Users;
  readonly Star = Star;
  readonly BookOpen = BookOpen;
  readonly Target = Target;
  readonly Briefcase = Briefcase;
  readonly TrendingUp = TrendingUp;
  readonly Award = Award;
  readonly ShieldCheck = ShieldCheck;
  readonly FileText = FileText;
  readonly GraduationCap = GraduationCap;
  readonly ArrowRight = ArrowRight;
  readonly Play = Play;
  readonly AlertTriangle = AlertTriangle;
  readonly RefreshCw = RefreshCw;

  selectedCategory = 'all';

  categories = [
    { id: 'all', label: 'All Programs' },
    { id: 'Beginner', label: 'Foundations' },
    { id: 'Intermediate', label: 'Specialist' },
    { id: 'Advanced', label: 'Professional' }
  ];

  certifications = signal<any[]>([]);
  loading = signal<boolean>(true);

  benefits = [
    { title: 'Verified Credentials', description: 'Earn recognized certifications with verifiable digital badges', icon: Medal },
    { title: 'Skill Validation', description: 'Demonstrate your expertise to employers and organizations', icon: Target },
    { title: 'Career Growth', description: 'Advance your career in outdoor education and leadership', icon: TrendingUp }
  ];

  constructor(
    private router: Router,
    private academyService: AcademyService
  ) { }

  earnedHistory = signal<any[]>([]);

  ngOnInit(): void {
    this.loadEarnedHistory();
    this.loadCertifications();
  }

  loadEarnedHistory() {
    try {
      const history = JSON.parse(localStorage.getItem('academy_earned_certs') || '[]');
      this.earnedHistory.set(history);
    } catch (e) {
      this.earnedHistory.set([]);
    }
  }

  loadCertifications(): void {
    this.loading.set(true);
    this.academyService.getCertifications().subscribe({
      next: (certs: Certification[]) => {
        const mappedCerts = certs.map(c => {
          const earned = this.earnedHistory().find(h => h.certificationId === c.id);
          return {
            id: c.id,
            title: c.name,
            level: this.deriveLevel(c),
            icon: this.deriveIcon(c),
            completed: !!earned && earned.status !== 'EXPIRED',
            isExpired: earned?.status === 'EXPIRED',
            color: this.deriveColor(c),
            description: c.description,
            metrics: {
              lessons: c.requiredCourseIds?.length ? c.requiredCourseIds.length * 4 : 12,
              assessments: c.requiredCourseIds?.length || 3,
              enrolled: '0.1K',
              rating: 5.0
            },
            estimated: `${c.validityPeriod} Months Valid`,
            skills: c.requirements || [],
            requirements: c.requirements || [],
            requiredCourseIds: c.requiredCourseIds
          };
        });
        this.certifications.set(mappedCerts);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load certifications:', err);
        this.loading.set(false);
      }
    });
  }

  fastTrackCert(cert: any): void {
    const courseId = (cert.requiredCourseIds && cert.requiredCourseIds.length > 0) ? cert.requiredCourseIds[0] : cert.id;
    this.router.navigate(['/academy', courseId], { queryParams: { fastTrack: 'true' } });
  }

  private deriveLevel(cert: Certification): string {
    // If name contains specific keywords, return level
    const name = cert.name.toLowerCase();
    if (name.includes('professional') || name.includes('advanced')) return 'Advanced';
    if (name.includes('specialist') || name.includes('intermediate')) return 'Intermediate';
    return 'Beginner';
  }

  private deriveIcon(cert: Certification): string {
    if (cert.imageUrl && cert.imageUrl.length < 5) return cert.imageUrl; // Emoji
    const name = cert.name.toLowerCase();
    if (name.includes('wildlife')) return '🦌';
    if (name.includes('first aid')) return '🏥';
    if (name.includes('camping')) return '⛺';
    if (name.includes('survival')) return '🔥';
    return '📜';
  }

  private deriveColor(cert: Certification): string {
    const level = this.deriveLevel(cert);
    if (level === 'Advanced') return '#ef4444';
    if (level === 'Intermediate') return '#22c55e';
    return '#3b82f6';
  }

  get filteredCertifications() {
    if (this.selectedCategory === 'all') return this.certifications();
    return this.certifications().filter(c => c.level === this.selectedCategory);
  }

  setCategory(categoryId: string) {
    this.selectedCategory = categoryId;
  }

  navigateBack() {
    this.router.navigate(['/academy']);
  }

  viewCertificate(certId: string) {
    this.router.navigate(['/academy/my-badges'], { queryParams: { cert: certId } });
  }
}
