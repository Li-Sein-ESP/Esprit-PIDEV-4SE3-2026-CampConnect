import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule, ChevronLeft, Play, Clock, BookOpen, Star, CheckCircle, Download, Share2 } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { BadgeComponent } from '../../../shared/components/badge.component';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';

@Component({
    selector: 'app-course-detail',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        LucideAngularModule,
        ButtonComponent,
        BadgeComponent,
        CardComponent,
        CardContentComponent
    ],
    template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-12">
      <div class="border-b border-[var(--color-border-light)] bg-white">
        <div class="container py-4">
          <button (click)="navigate('/academy')" class="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary-600)] transition-colors">
            <lucide-icon [name]="ChevronLeft" class="w-5 h-5"></lucide-icon>
            Back to Academy
          </button>
        </div>
      </div>

      <div class="container py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2">
            <app-badge [variant]="'success'" customClass="mb-4">{{ course.level }}</app-badge>
            <h1 class="mb-4">{{ course.title }}</h1>
            <p class="text-lg text-[var(--color-text-secondary)] mb-6">{{ course.description }}</p>

            <div class="flex items-center gap-6 mb-8">
              <div class="flex items-center gap-2">
                <img [src]="course.instructorAvatar" [alt]="course.instructor" class="w-10 h-10 rounded-full" />
                <div>
                  <div class="text-sm font-medium">{{ course.instructor }}</div>
                  <div class="text-xs text-[var(--color-text-tertiary)]">Instructor</div>
                </div>
              </div>
              <div class="flex items-center gap-1">
                <lucide-icon [name]="Star" class="w-5 h-5 text-amber-500 fill-current"></lucide-icon>
                <span class="font-bold">{{ course.rating }}</span>
                <span class="text-sm text-[var(--color-text-tertiary)]">({{ course.reviewCount }})</span>
              </div>
            </div>

            <app-card variant="elevated" customClass="mb-6">
              <app-card-content customClass="p-6">
                <h4 class="mb-4">Course Content</h4>
                <div class="space-y-2">
                  <div *ngFor="let lesson of lessons" class="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--color-neutral-50)] transition-colors">
                    <div class="flex items-center gap-3">
                      <lucide-icon [name]="Play" class="w-5 h-5 text-[var(--color-primary-600)]"></lucide-icon>
                      <span>{{ lesson.title }}</span>
                    </div>
                    <span class="text-sm text-[var(--color-text-tertiary)]">{{ lesson.duration }}</span>
                  </div>
                </div>
              </app-card-content>
            </app-card>
          </div>

          <div class="lg:col-span-1">
            <div class="sticky top-24">
              <app-card variant="elevated">
                <app-card-content customClass="p-6">
                  <div class="text-3xl font-bold text-[var(--color-primary-600)] mb-6">{{ course.price }}</div>
                  <app-button size="lg" [fullWidth]="true" customClass="mb-3">Enroll Now</app-button>
                  <app-button variant="outline" size="lg" [fullWidth]="true">Preview Course</app-button>
                  
                  <div class="mt-6 pt-6 border-t border-[var(--color-border-light)] space-y-3">
                    <div class="flex items-center gap-2 text-sm">
                      <lucide-icon [name]="Clock" class="w-4 h-4"></lucide-icon>
                      <span>{{ course.duration }}</span>
                    </div>
                    <div class="flex items-center gap-2 text-sm">
                      <lucide-icon [name]="BookOpen" class="w-4 h-4"></lucide-icon>
                      <span>{{ course.lessons }} lessons</span>
                    </div>
                    <div class="flex items-center gap-2 text-sm">
                      <lucide-icon [name]="CheckCircle" class="w-4 h-4"></lucide-icon>
                      <span>Certificate of completion</span>
                    </div>
                  </div>
                </app-card-content>
              </app-card>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    :host {
      display: block;
    }
  `]
})
export class CourseDetailComponent implements OnInit {
    courseId: string | null = null;
    readonly ChevronLeft = ChevronLeft;
    readonly Play = Play;
    readonly Clock = Clock;
    readonly BookOpen = BookOpen;
    readonly Star = Star;
    readonly CheckCircle = CheckCircle;

    course: any = {
        id: 'course-1',
        title: 'Camping 101: Essential Skills for Beginners',
        description: 'Learn the fundamentals of camping, from setting up your tent to building a campfire safely.',
        instructor: 'Sarah Johnson',
        instructorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
        level: 'Beginner',
        duration: '2 hours',
        lessons: 12,
        rating: 4.8,
        reviewCount: 342,
        price: 'Free',
    };

    lessons = [
        { id: 1, title: 'Introduction to Camping', duration: '5:30' },
        { id: 2, title: 'Choosing the Right Gear', duration: '12:45' },
        { id: 3, title: 'Setting Up Your Tent', duration: '8:20' },
        { id: 4, title: 'Building a Safe Campfire', duration: '10:15' },
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

    navigate(path: string) {
        this.router.navigate([path]);
    }
}
