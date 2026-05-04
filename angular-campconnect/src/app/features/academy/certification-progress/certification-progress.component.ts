import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  ChevronLeft, Award, TrendingUp, CheckCircle,
  BookOpen, Target, Clock, ChevronRight, Play, AlertCircle, FileText, GraduationCap, ShieldCheck, ArrowRight, Eye
} from 'lucide-angular';

interface NextLesson {
  title: string;
  category: string;
  duration: string;
  id?: string;
}

interface PendingAssessment {
  title: string;
  questions: number;
  timeLimit: string;
  passingScore: string;
  attempts: string;
  warning?: string;
}

interface CertProgress {
  id: string;
  title: string;
  emoji: string;
  status: 'in-progress' | 'completed' | 'locked';
  percent: number;
  color: string;
  lessons: { done: number; total: number };
  assessments: { done: number; total: number };
  passRate: string;
  started: string;
  completedOn?: string;
  nextLessons: NextLesson[];
  pendingAssessment?: PendingAssessment;
}

@Component({
  selector: 'app-certification-progress-component',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './certification-progress.component.html',
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
      backdrop-filter: blur(12px);
      border: 1px solid rgba(10, 31, 28, 0.08);
    }
    .progress-track {
      height: 6px;
      border-radius: 10px;
      background: rgba(10, 31, 28, 0.05);
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      border-radius: 10px;
      transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
    }
  `]
})
export class CertificationProgressComponent {
  readonly ChevronLeft = ChevronLeft;
  readonly Award = Award;
  readonly TrendingUp = TrendingUp;
  readonly CheckCircle = CheckCircle;
  readonly BookOpen = BookOpen;
  readonly Target = Target;
  readonly Clock = Clock;
  readonly ChevronRight = ChevronRight;
  readonly Play = Play;
  readonly AlertCircle = AlertCircle;
  readonly FileText = FileText;
  readonly GraduationCap = GraduationCap;
  readonly ShieldCheck = ShieldCheck;
  readonly ArrowRight = ArrowRight;
  readonly Eye = Eye;

  certifications: CertProgress[] = [
    {
      id: 'c1',
      title: 'Certified Camping Essentials',
      emoji: '⛺',
      status: 'in-progress',
      percent: 75,
      color: '#3b82f6',
      lessons: { done: 9, total: 12 },
      assessments: { done: 2, total: 3 },
      passRate: '100%',
      started: '15 Jan 2026',
      nextLessons: [
        { id: 'v10', title: 'Food Storage and Wildlife Safety', category: 'Camping Basics', duration: '14:20' },
        { id: 'v11', title: 'Weather Awareness and Prep', category: 'Camping Basics', duration: '12:45' }
      ],
      pendingAssessment: {
        title: 'Final Mastery Assessment',
        questions: 25,
        timeLimit: '45m',
        passingScore: '80%',
        attempts: '0 / 3',
        warning: 'Prerequisite: All lessons must be viewed'
      }
    },
    {
      id: 'c2',
      title: 'Wilderness Navigation Expert',
      emoji: '🧭',
      status: 'locked',
      percent: 0,
      color: '#e85d04',
      lessons: { done: 0, total: 18 },
      assessments: { done: 0, total: 4 },
      passRate: '0%',
      started: '—',
      nextLessons: []
    },
    {
      id: 'c3',
      title: 'Fire Safety Specialist',
      emoji: '🔥',
      status: 'completed',
      percent: 100,
      color: '#22c55e',
      lessons: { done: 8, total: 8 },
      assessments: { done: 2, total: 2 },
      passRate: '96%',
      started: '01 Dec 2025',
      completedOn: '28 Dec 2025',
      nextLessons: []
    }
  ];

  constructor(private router: Router) { }

  get stats() {
    return {
      inProgress: this.certifications.filter(c => c.status === 'in-progress').length,
      completed: this.certifications.filter(c => c.status === 'completed').length,
      lessonsCompleted: this.certifications.reduce((s, c) => s + c.lessons.done, 0),
      assessmentsPassed: this.certifications.reduce((s, c) => s + c.assessments.done, 0)
    };
  }

  get inProgressCerts() { return this.certifications.filter(c => c.status === 'in-progress'); }
  get lockedCerts() { return this.certifications.filter(c => c.status === 'locked'); }
  get completedCerts() { return this.certifications.filter(c => c.status === 'completed'); }

  goBack() { this.router.navigate(['/academy']); }
  continueLearning(id: string) { this.router.navigate(['/academy', id]); }
  startAssessment(id: string) { alert('Preparing elite assessment environment...'); }
  viewCertificate(certId: string) { this.router.navigate(['/academy/my-badges'], { queryParams: { cert: certId } }); }
}
