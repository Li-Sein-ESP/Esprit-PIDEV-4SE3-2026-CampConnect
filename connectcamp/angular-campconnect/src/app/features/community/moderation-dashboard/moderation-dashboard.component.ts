import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  Shield,
  AlertTriangle,
  Eye,
  EyeOff,
  Trash2,
  MessageCircle,
  User,
  Clock,
  CheckCircle,
  X,
  Flag,
  TrendingUp,
  Users,
  Ban
} from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent, CardDescriptionComponent } from '../../../shared/components/card.component';
import { BadgeComponent } from '../../../shared/components/badge.component';

interface Report {
  id: string;
  type: 'post' | 'comment';
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  reason: string;
  reportedBy: {
    name: string;
    avatar: string;
  };
  reportedAt: string;
  content: {
    id: string;
    author: string;
    text: string;
    threadTitle?: string;
  };
  reportCount: number;
}

@Component({
  selector: 'app-moderation-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    ButtonComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent,
    CardDescriptionComponent,
    BadgeComponent
  ],
  templateUrl: './moderation-dashboard.component.html',
  styles: []
})
export class ModerationDashboardComponent {
  // Icons
  readonly ShieldIcon = Shield;
  readonly AlertTriangleIcon = AlertTriangle;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;
  readonly Trash2Icon = Trash2;
  readonly MessageCircleIcon = MessageCircle;
  readonly UserIcon = User;
  readonly ClockIcon = Clock;
  readonly CheckCircleIcon = CheckCircle;
  readonly XIcon = X;
  readonly FlagIcon = Flag;
  readonly TrendingUpIcon = TrendingUp;
  readonly UsersIcon = Users;
  readonly BanIcon = Ban;

  // State
  filter: 'all' | 'pending' | 'reviewing' | 'resolved' = 'all';
  selectedReport: Report | null = null;

  // Mock Data
  private allReports: Report[] = [
    {
      id: 'report-1',
      type: 'post',
      status: 'pending',
      reason: 'Spam or commercial content',
      reportedBy: {
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
      },
      reportedAt: '5 minutes ago',
      content: {
        id: 'post-123',
        author: 'SpamBot2000',
        text: 'Click here for AMAZING deals on camping gear!!! Best prices guaranteed! Visit our website now!!!',
        threadTitle: 'BEST CAMPING GEAR DEALS - LIMITED TIME!!!',
      },
      reportCount: 3,
    },
    {
      id: 'report-2',
      type: 'comment',
      status: 'pending',
      reason: 'Harassment or bullying',
      reportedBy: {
        name: 'Mike Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
      },
      reportedAt: '15 minutes ago',
      content: {
        id: 'comment-456',
        author: 'AngryUser99',
        text: "You're completely wrong and obviously have no idea what you're talking about. Stop giving terrible advice to beginners.",
        threadTitle: 'First time winter camping tips?',
      },
      reportCount: 2,
    },
    {
      id: 'report-3',
      type: 'comment',
      status: 'reviewing',
      reason: 'Misinformation',
      reportedBy: {
        name: 'David Kim',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
      },
      reportedAt: '1 hour ago',
      content: {
        id: 'comment-789',
        author: 'OutdoorGuru',
        text: "Don't worry about bears, they never attack humans. Just leave your food out, it'll be fine.",
        threadTitle: 'Bear safety in Yellowstone',
      },
      reportCount: 5,
    },
    {
      id: 'report-4',
      type: 'post',
      status: 'resolved',
      reason: 'Inappropriate content',
      reportedBy: {
        name: 'Emma Davis',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
      },
      reportedAt: '2 hours ago',
      content: {
        id: 'post-321',
        author: 'RandomUser',
        text: 'Offensive content that violated community guidelines...',
        threadTitle: 'Inappropriate post title',
      },
      reportCount: 7,
    },
  ];

  get reports(): Report[] {
    return this.allReports;
  }

  constructor(private router: Router) { }

  get stats() {
    return {
      pending: this.allReports.filter((r) => r.status === 'pending').length,
      reviewing: this.allReports.filter((r) => r.status === 'reviewing').length,
      resolved: this.allReports.filter((r) => r.status === 'resolved').length,
      totalToday: 12,
    };
  }

  get filteredReports(): Report[] {
    return this.filter === 'all'
      ? this.allReports
      : this.allReports.filter((r) => r.status === this.filter);
  }

  handleAction(reportId: string, action: 'hide' | 'delete' | 'warn' | 'dismiss'): void {
    console.log(`Performing ${action} on report ${reportId}`);
    // Update report status
    this.allReports = this.allReports.map((r) =>
      r.id === reportId
        ? { ...r, status: action === 'dismiss' ? 'dismissed' : 'resolved' }
        : r
    );
    this.selectedReport = null;
  }

  handleStartReview(report: Report): void {
    this.allReports = this.allReports.map((r) =>
      (r.id === report.id ? { ...r, status: 'reviewing' as const } : r)
    );
    const updatedReport = this.allReports.find(r => r.id === report.id);
    if (updatedReport) {
      this.selectedReport = updatedReport;
    }
  }

  getStatusConfig(status: string): { label: string; color: string; icon: any } {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending Review',
          color: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: this.ClockIcon,
        };
      case 'reviewing':
        return {
          label: 'Under Review',
          color: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: this.EyeIcon,
        };
      case 'resolved':
        return {
          label: 'Resolved',
          color: 'bg-green-50 text-green-700 border-green-200',
          icon: this.CheckCircleIcon,
        };
      case 'dismissed':
        return {
          label: 'Dismissed',
          color: 'bg-gray-50 text-gray-700 border-gray-200',
          icon: this.XIcon,
        };
      default:
        return {
          label: 'Unknown',
          color: 'bg-gray-50 text-gray-700 border-gray-200',
          icon: this.AlertTriangleIcon,
        };
    }
  }

  navigate(url: string): void {
    this.router.navigate([url]);
  }
}
