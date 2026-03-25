import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule, ChevronLeft, Play, Clock, BookOpen, Star, CheckCircle, Download, Share2, Award, GraduationCap, ArrowRight, ShieldCheck, Eye, TrendingUp } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    ButtonComponent
  ],
  templateUrl: './course-detail.component.html',
  styles: [`
    :host {
      display: block;
      background-color: #F1EDE1;
    }
    .hero-outline-text {
      -webkit-text-stroke: 1px rgba(10, 31, 28, 0.08);
      color: transparent;
      line-height: 0.8;
      select: none;
      pointer-events: none;
    }
    .card-asymmetric {
      border-radius: 28px 32px 24px 30px;
    }
    .medallion-shape {
      border-radius: 24px 24px 8px 8px;
    }
  `]
})
export class CourseDetailComponent implements OnInit {
  courseId: string | null = null;

  // Icons
  readonly ChevronLeft = ChevronLeft;
  readonly Play = Play;
  readonly Clock = Clock;
  readonly BookOpen = BookOpen;
  readonly Star = Star;
  readonly CheckCircle = CheckCircle;
  readonly Share2 = Share2;
  readonly Download = Download;
  readonly Award = Award;
  readonly GraduationCap = GraduationCap;
  readonly ArrowRight = ArrowRight;
  readonly ShieldCheck = ShieldCheck;
  readonly Eye = Eye;
  readonly TrendingUp = TrendingUp;

  isEnrolled: boolean = false;

  course: any = {
    id: 'course-1',
    title: 'Essential Skills for Beginners',
    category: 'Camping 101',
    description: 'Learn the fundamentals of camping, from setting up your tent to building a campfire safely. This course covers everything from gear selection to advanced fire management techniques in the wild.',
    instructor: 'Dr. Sarah Mitchell',
    instructorTitle: 'Wilderness Education Specialist',
    instructorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    level: 'Beginner',
    duration: '12 Hours',
    lessonsCount: 12,
    rating: 4.8,
    reviewCount: 342,
    price: 'Free',
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200',
    color: '#e85d04'
  };

  lessons = [
    { id: 'v1', title: 'Introduction to Camping', duration: '5:30', completed: true, description: 'Overview of the course and basic camping philosophies.' },
    { id: 'v2', title: 'Choosing the Right Gear', duration: '12:45', completed: false, description: 'Essential equipment guide for modern explorers.' },
    { id: 'v3', title: 'Setting Up Your Tent', duration: '8:20', completed: false, description: 'Step-by-step assembly and site selection guide.' },
    { id: 'v4', title: 'Building a Safe Campfire', duration: '10:15', completed: false, description: 'Techniques for sustainable and safe fire building.' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.courseId = params.get('id');
    });
  }

  navigateBack() {
    this.router.navigate(['/academy']);
  }

  enrollInCourse() {
    this.isEnrolled = true;
  }

  playLesson(lessonId: string) {
    this.router.navigate(['/academy/video', lessonId]);
  }

  shareCourse() {
    if (navigator.share) {
      navigator.share({
        title: this.course.title,
        text: `Check out this course on Wilderness Academy: ${this.course.title}`,
        url: window.location.href
      }).catch(() => {
        navigator.clipboard.writeText(window.location.href);
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  }

  getIcon(iconName: string) {
    const icons: Record<string, any> = {
      'book-open': BookOpen,
      'trending-up': TrendingUp,
      'clock': Clock,
      'star': Star,
      'shield-check': ShieldCheck,
      'award': Award
    };
    return icons[iconName] || Award;
  }
}
