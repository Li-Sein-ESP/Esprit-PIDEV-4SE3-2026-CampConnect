import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../shared/components/card.component';
import { BadgeComponent } from '../../shared/components/badge.component';
import { LucideAngularModule, MessageSquare, Heart, Share2, User, TrendingUp } from 'lucide-angular';

interface Post {
    id: string;
    author: string;
    title: string;
    excerpt: string;
    category: string;
    likes: number;
    comments: number;
    date: string;
    trending: boolean;
}

@Component({
    selector: 'app-community',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardContentComponent,
        BadgeComponent,
        LucideAngularModule
    ],
    template: `
    <div class="container py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-[var(--color-text-heading)] mb-2">
          Community Forum
        </h1>
        <p class="text-[var(--color-text-secondary)]">
          Connect with fellow outdoor enthusiasts, share stories, and get advice
        </p>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 mb-6 border-b border-[var(--color-border-light)]">
        <button
          *ngFor="let tab of tabs"
          (click)="activeTab = tab.value"
          [class]="getTabClasses(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Posts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-4">
          <app-card
            *ngFor="let post of getFilteredPosts()"
            variant="default"
            padding="md"
            customClass="hover:shadow-md transition-shadow cursor-pointer"
          >
            <div class="flex gap-4">
              <!-- Avatar -->
              <div class="w-12 h-12 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center flex-shrink-0">
                <lucide-icon [img]="UserIcon" [size]="24" class="text-[var(--color-primary-600)]"></lucide-icon>
              </div>

              <!-- Content -->
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span class="font-semibold text-[var(--color-text-heading)]">{{ post.author }}</span>
                  <span class="text-sm text-[var(--color-text-tertiary)]">{{ formatDate(post.date) }}</span>
                  <app-badge *ngIf="post.trending" variant="warning" size="sm">
                    <lucide-icon [img]="TrendingUpIcon" [size]="12"></lucide-icon>
                    Trending
                  </app-badge>
                </div>

                <h3 class="text-lg font-semibold text-[var(--color-text-heading)] mb-2">
                  {{ post.title }}
                </h3>
                <p class="text-[var(--color-text-secondary)] mb-3">
                  {{ post.excerpt }}
                </p>

                <div class="flex items-center gap-4">
                  <app-badge variant="outline" size="sm">{{ post.category }}</app-badge>
                  
                  <button class="flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary-600)] transition-colors">
                    <lucide-icon [img]="HeartIcon" [size]="16"></lucide-icon>
                    {{ post.likes }}
                  </button>
                  
                  <button class="flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary-600)] transition-colors">
                    <lucide-icon [img]="MessageSquareIcon" [size]="16"></lucide-icon>
                    {{ post.comments }}
                  </button>
                  
                  <button class="flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary-600)] transition-colors">
                    <lucide-icon [img]="Share2Icon" [size]="16"></lucide-icon>
                    Share
                  </button>
                </div>
              </div>
            </div>
          </app-card>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <!-- Popular Topics -->
          <app-card variant="default" padding="md" customClass="mb-6">
            <app-card-header>
              <app-card-title>Popular Topics</app-card-title>
            </app-card-header>
            <app-card-content>
              <div class="space-y-2">
                <button
                  *ngFor="let topic of popularTopics"
                  class="w-full text-left px-3 py-2 rounded-lg hover:bg-[var(--color-neutral-50)] transition-colors flex items-center justify-between"
                >
                  <span class="text-sm text-[var(--color-text-primary)]">{{ topic.name }}</span>
                  <app-badge variant="default" size="sm">{{ topic.count }}</app-badge>
                </button>
              </div>
            </app-card-content>
          </app-card>

          <!-- Community Stats -->
          <app-card variant="default" padding="md">
            <app-card-header>
              <app-card-title>Community Stats</app-card-title>
            </app-card-header>
            <app-card-content>
              <div class="space-y-4">
                <div>
                  <div class="text-2xl font-bold text-[var(--color-text-heading)]">12,458</div>
                  <div class="text-sm text-[var(--color-text-secondary)]">Active Members</div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-[var(--color-text-heading)]">3,892</div>
                  <div class="text-sm text-[var(--color-text-secondary)]">Discussions</div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-[var(--color-text-heading)]">24,567</div>
                  <div class="text-sm text-[var(--color-text-secondary)]">Posts</div>
                </div>
              </div>
            </app-card-content>
          </app-card>
        </div>
      </div>
    </div>
  `,
    styles: []
})
export class CommunityComponent {
    MessageSquareIcon = MessageSquare;
    HeartIcon = Heart;
    Share2Icon = Share2;
    UserIcon = User;
    TrendingUpIcon = TrendingUp;

    activeTab = 'all';

    tabs = [
        { label: 'All Posts', value: 'all' },
        { label: 'Trip Stories', value: 'stories' },
        { label: 'Q&A', value: 'qa' },
        { label: 'Gear Reviews', value: 'reviews' },
    ];

    popularTopics = [
        { name: 'Beginner Tips', count: 234 },
        { name: 'Gear Recommendations', count: 189 },
        { name: 'Trail Conditions', count: 156 },
        { name: 'Safety & Wildlife', count: 142 },
        { name: 'Photography', count: 98 },
    ];

    posts: Post[] = [
        {
            id: '1',
            author: 'Sarah Johnson',
            title: 'My First Solo Backpacking Trip in Yosemite',
            excerpt: 'Just completed my first solo backpacking adventure in Yosemite Valley. Here are my top 5 lessons learned...',
            category: 'Trip Stories',
            likes: 156,
            comments: 23,
            date: '2026-02-15',
            trending: true
        },
        {
            id: '2',
            author: 'Mike Chen',
            title: 'Best Budget Camping Gear for Beginners',
            excerpt: 'After years of camping, here\'s my guide to getting started without breaking the bank...',
            category: 'Gear Reviews',
            likes: 234,
            comments: 45,
            date: '2026-02-14',
            trending: true
        },
        {
            id: '3',
            author: 'Emily Rodriguez',
            title: 'How to Handle Wildlife Encounters Safely',
            excerpt: 'Important tips for staying safe when encountering bears, mountain lions, and other wildlife...',
            category: 'Q&A',
            likes: 189,
            comments: 34,
            date: '2026-02-13',
            trending: false
        },
        {
            id: '4',
            author: 'David Park',
            title: 'Grand Canyon Rim-to-Rim Hike Report',
            excerpt: 'Completed the rim-to-rim hike last week. Trail conditions, water sources, and what I wish I knew...',
            category: 'Trip Stories',
            likes: 145,
            comments: 28,
            date: '2026-02-12',
            trending: false
        },
    ];

    getTabClasses(tabValue: string): string {
        const baseClasses = 'px-4 py-2 font-medium transition-colors';
        const activeClasses = 'text-[var(--color-primary-600)] border-b-2 border-[var(--color-primary-600)]';
        const inactiveClasses = 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]';

        return `${baseClasses} ${this.activeTab === tabValue ? activeClasses : inactiveClasses}`;
    }

    getFilteredPosts(): Post[] {
        if (this.activeTab === 'all') return this.posts;
        return this.posts.filter(p => p.category.toLowerCase().includes(this.activeTab));
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
}
