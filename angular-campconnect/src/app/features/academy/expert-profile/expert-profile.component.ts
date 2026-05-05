import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  ChevronLeft, CheckCircle, MapPin, Mail,
  Share2, Play, Users, Clock, Star, Award, Eye, TrendingUp, ShieldCheck, GraduationCap, ArrowRight
} from 'lucide-angular';

interface Expert {
  id: string;
  name: string;
  title: string;
  location: string;
  avatar: string;
  coverImage: string;
  verified: boolean;
  about: string;
  credentials: string[];
  expertise: string[];
  professionalCertifications: string[];
  stats: {
    videos: number;
    totalViews: string;
    students: string;
    avgRating: string;
  };
  videos: {
    id: string;
    title: string;
    category: string;
    views: string;
    date: string;
    duration: string;
    thumbnail: string;
    color: string;
  }[];
}

@Component({
  selector: 'app-expert-profile-component',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
  ],
  templateUrl: './expert-profile.component.html',
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
    .expert-medallion {
      border-radius: 24px 24px 8px 8px;
    }
  `]
})
export class ExpertProfileComponent implements OnInit {
  readonly ChevronLeft = ChevronLeft;
  readonly CheckCircle = CheckCircle;
  readonly MapPin = MapPin;
  readonly Mail = Mail;
  readonly Share2 = Share2;
  readonly Play = Play;
  readonly Users = Users;
  readonly Clock = Clock;
  readonly Star = Star;
  readonly Award = Award;
  readonly Eye = Eye;
  readonly TrendingUp = TrendingUp;
  readonly ShieldCheck = ShieldCheck;
  readonly GraduationCap = GraduationCap;
  readonly ArrowRight = ArrowRight;

  expertId: string = '';
  expert: Expert | null = null;
  expandedVideos: boolean = false;

  private expertsDb: Expert[] = [
    {
      id: 'e1',
      name: 'Dr. Sarah Mitchell',
      title: 'Wilderness Education Specialist',
      location: 'Boulder, Colorado',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80',
      coverImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=80',
      verified: true,
      about: 'Dr. Sarah Mitchell is a passionate educator and wilderness expert with over 15 years of experience in outdoor education and environmental science. She has trained thousands of campers in safe and sustainable outdoor practices, and currently serves as the Lead Instructor at the National Outdoor Leadership School.',
      credentials: [
        'PhD in Environmental Science',
        '15+ years field experience'
      ],
      expertise: [
        'Camping & Backpacking',
        'Leave No Trace Principles',
        'Wilderness First Aid',
        'Environmental Conservation',
        'Youth Outdoor Education'
      ],
      professionalCertifications: [
        'Wilderness First Responder (WFR)',
        'Leave No Trace Master Educator',
        'NOLS Instructor Certification',
        'PhD Environmental Science, UC Berkeley'
      ],
      stats: {
        videos: 24,
        totalViews: '246K',
        students: '18.5K',
        avgRating: '4.9'
      },
      videos: [
        {
          id: 'v1',
          title: 'Setting Up Your First Campsite: A Complete Guide',
          category: 'Camping Basics',
          views: '12K',
          date: '15 Jan 2026',
          duration: '12:45',
          thumbnail: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400',
          color: '#3b82f6'
        },
        {
          id: 'v2',
          title: 'Advanced Fire Safety & Management',
          category: 'Survival',
          views: '18K',
          date: '10 Jan 2026',
          duration: '15:20',
          thumbnail: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=400',
          color: '#e85d04'
        }
      ]
    }
  ];

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.expertId = params['expertId'];
      this.expert = this.expertsDb.find(e => e.id === this.expertId) || this.expertsDb[0];
    });
  }

  goBack() {
    this.router.navigate(['/academy']);
  }

  navigateToVideo(videoId: string) {
    this.router.navigate(['/academy/video', videoId]);
  }

  shareExpert() {
    if (this.expert) {
      if (navigator.share) {
        navigator.share({
          title: this.expert.name,
          text: `Check out ${this.expert.name}'s profile on Wilderness Academy!`,
          url: window.location.href
        }).catch(() => {
          navigator.clipboard.writeText(window.location.href);
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
      }
    }
  }

  emailExpert() {
    if (this.expert) {
      const subject = encodeURIComponent(`Question for ${this.expert.name} via Wilderness Academy`);
      const body = encodeURIComponent(`Hi ${this.expert.name},\n\nI was viewing your profile on Wilderness Academy and had a question about...`);
      window.location.href = `mailto:contact@wildernessacademy.com?subject=${subject}&body=${body}`;
    }
  }

  viewAllVideos() {
    this.expandedVideos = !this.expandedVideos;
  }
}
