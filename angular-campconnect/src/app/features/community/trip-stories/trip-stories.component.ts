import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  FileText,
  Search,
  Filter,
  TrendingUp,
  Clock,
  Heart,
  MessageCircle,
  Eye,
  Award,
  MapPin,
  Calendar,
  User,
  Plus,
  Share2,
  Bookmark,
  ChevronRight,
  Camera,
  Mountain
} from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';
import { BadgeComponent } from '../../../shared/components/badge.component';

interface Author {
  name: string;
  avatar: string;
  verified: boolean;
  trips: number;
}

interface Story {
  id: number;
  title: string;
  author: Author;
  location: string;
  date: string;
  duration: string;
  coverImage: string;
  excerpt: string;
  content: string;
  views: number;
  likes: number;
  comments: number;
  bookmarks: number;
  tags: string[];
  featured: boolean;
  publishedAt: string;
}

@Component({
  selector: 'app-trip-stories',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LucideAngularModule,
    ButtonComponent,
    CardComponent,
    CardContentComponent,
    BadgeComponent
  ],
  templateUrl: './trip-stories.component.html',
  styles: []
})
export class TripStoriesComponent {
  // Icons
  readonly FileTextIcon = FileText;
  readonly SearchIcon = Search;
  readonly PlusIcon = Plus;
  readonly AwardIcon = Award;
  readonly BookmarkIcon = Bookmark;
  readonly MapPinIcon = MapPin;
  readonly CalendarIcon = Calendar;
  readonly EyeIcon = Eye;
  readonly HeartIcon = Heart;
  readonly MessageCircleIcon = MessageCircle;
  readonly CameraIcon = Camera;
  readonly ChevronRightIcon = ChevronRight;

  // State
  searchQuery = '';
  selectedFilter = 'Latest';
  savedStories: Set<number> = new Set();
  filterOptions = ['Latest', 'Popular', 'Featured', 'Most Viewed', 'Most Discussed'];

  // Mock Data
  tripStories: Story[] = [
    {
      id: 1,
      title: 'Epic 7-Day Backpacking Journey Through Yosemite',
      author: {
        name: 'Sarah Chen',
        avatar: 'SC',
        verified: true,
        trips: 47,
      },
      location: 'Yosemite National Park, CA',
      date: '2026-02-15',
      duration: '7 days',
      coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      excerpt: 'Just returned from an incredible week exploring the backcountry of Yosemite. The trail to Half Dome was challenging but absolutely worth every step. Here\'s what I learned...',
      content: 'Full story content would go here...',
      views: 2847,
      likes: 342,
      comments: 68,
      bookmarks: 145,
      tags: ['Backpacking', 'Photography', 'Wildlife', 'Solo Travel'],
      featured: true,
      publishedAt: '2 days ago',
    },
    {
      id: 2,
      title: 'Family Camping Under the Stars: Our First Trip to Joshua Tree',
      author: {
        name: 'Michael Rodriguez',
        avatar: 'MR',
        verified: false,
        trips: 12,
      },
      location: 'Joshua Tree National Park, CA',
      date: '2026-02-10',
      duration: '3 days',
      coverImage: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=800',
      excerpt: 'We finally took our kids camping for the first time! Joshua Tree was the perfect introduction to the outdoors. Stargazing, rock scrambling, and quality family time...',
      content: 'Full story content would go here...',
      views: 1934,
      likes: 287,
      comments: 42,
      bookmarks: 98,
      tags: ['Family', 'Stargazing', 'Beginner-Friendly'],
      featured: true,
      publishedAt: '5 days ago',
    },
    {
      id: 3,
      title: 'Winter Wonderland: Camping in the Snow at Lake Tahoe',
      author: {
        name: 'Emily Watson',
        avatar: 'EW',
        verified: true,
        trips: 63,
      },
      location: 'Lake Tahoe, CA/NV',
      date: '2026-01-28',
      duration: '4 days',
      coverImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
      excerpt: 'Winter camping isn\'t for everyone, but if you\'re prepared, it\'s magical. Fresh powder, pristine landscapes, and total solitude. Here\'s my gear list and tips...',
      content: 'Full story content would go here...',
      views: 3156,
      likes: 421,
      comments: 89,
      bookmarks: 203,
      tags: ['Winter Camping', 'Snow', 'Advanced', 'Photography'],
      featured: false,
      publishedAt: '1 week ago',
    },
    {
      id: 4,
      title: 'Coastal Camping Adventure: Big Sur\'s Hidden Gems',
      author: {
        name: 'David Kim',
        avatar: 'DK',
        verified: true,
        trips: 38,
      },
      location: 'Big Sur, CA',
      date: '2026-02-01',
      duration: '5 days',
      coverImage: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800',
      excerpt: 'Exploring the rugged coastline of Big Sur was a dream come true. From clifftop campsites to secluded beaches, this trip had it all. Best sunset spots included...',
      content: 'Full story content would go here...',
      views: 2245,
      likes: 318,
      comments: 54,
      bookmarks: 167,
      tags: ['Coastal', 'Scenic', 'Road Trip', 'Photography'],
      featured: false,
      publishedAt: '1 week ago',
    },
    {
      id: 5,
      title: 'Solo Female Backpacker: My Journey Through the Pacific Crest Trail',
      author: {
        name: 'Jessica Martinez',
        avatar: 'JM',
        verified: true,
        trips: 91,
      },
      location: 'Pacific Crest Trail (Section)',
      date: '2026-01-15',
      duration: '14 days',
      coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      excerpt: 'Completed a 200-mile section of the PCT solo! It was empowering, challenging, and life-changing. Sharing my experience and safety tips for solo female hikers...',
      content: 'Full story content would go here...',
      views: 4523,
      likes: 678,
      comments: 143,
      bookmarks: 389,
      tags: ['Solo Travel', 'Thru-Hiking', 'Women', 'Inspiration'],
      featured: false,
      publishedAt: '2 weeks ago',
    },
    {
      id: 6,
      title: 'Car Camping Luxury: Glamping Setup and Tips',
      author: {
        name: 'Thomas Anderson',
        avatar: 'TA',
        verified: false,
        trips: 19,
      },
      location: 'Sequoia National Park, CA',
      date: '2026-02-05',
      duration: '3 days',
      coverImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
      excerpt: 'Who says camping can\'t be comfortable? Here\'s how I turned my car camping setup into a cozy glamping experience without breaking the bank...',
      content: 'Full story content would go here...',
      views: 1678,
      likes: 234,
      comments: 38,
      bookmarks: 112,
      tags: ['Car Camping', 'Glamping', 'Comfort', 'Budget'],
      featured: false,
      publishedAt: '1 week ago',
    },
    {
      id: 7,
      title: 'Desert Solitude: 10 Days in the Mojave Preserve',
      author: {
        name: 'Rachel Green',
        avatar: 'RG',
        verified: true,
        trips: 55,
      },
      location: 'Mojave National Preserve, CA',
      date: '2026-01-20',
      duration: '10 days',
      coverImage: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=800',
      excerpt: 'Disconnected from everything for 10 days in the vast Mojave Desert. The silence, the stars, and the unexpected beauty of this landscape changed my perspective...',
      content: 'Full story content would go here...',
      views: 2987,
      likes: 412,
      comments: 76,
      bookmarks: 198,
      tags: ['Desert', 'Solitude', 'Meditation', 'Advanced'],
      featured: false,
      publishedAt: '2 weeks ago',
    },
    {
      id: 8,
      title: 'Beginner\'s Guide: Our First Overnight Camping Trip',
      author: {
        name: 'Alex Johnson',
        avatar: 'AJ',
        verified: false,
        trips: 3,
      },
      location: 'Point Reyes National Seashore, CA',
      date: '2026-02-12',
      duration: '2 days',
      coverImage: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800',
      excerpt: 'Complete newbies to camping? So were we! Here\'s how we survived (and actually enjoyed!) our first overnight trip. Mistakes we made and what we\'d do differently...',
      content: 'Full story content would go here...',
      views: 1456,
      likes: 189,
      comments: 47,
      bookmarks: 134,
      tags: ['Beginner', 'First Time', 'Tips', 'Coastal'],
      featured: false,
      publishedAt: '4 days ago',
    },
  ];

  constructor(private router: Router) { }

  get filteredStories(): Story[] {
    return this.tripStories.filter((story) => {
      if (!this.searchQuery) return true;

      const query = this.searchQuery.toLowerCase();
      return (
        story.title.toLowerCase().includes(query) ||
        story.location.toLowerCase().includes(query) ||
        story.tags.some(tag => tag.toLowerCase().includes(query))
      );
    });
  }

  get sortedStories(): Story[] {
    return [...this.filteredStories].sort((a, b) => {
      switch (this.selectedFilter) {
        case 'Popular':
          return b.likes - a.likes;
        case 'Featured':
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        case 'Most Viewed':
          return b.views - a.views;
        case 'Most Discussed':
          return b.comments - a.comments;
        default: // Latest
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });
  }

  get featuredStories(): Story[] {
    return this.tripStories.filter(s => s.featured);
  }

  toggleSaved(id: number): void {
    const newSaved = new Set(this.savedStories);
    if (newSaved.has(id)) {
      newSaved.delete(id);
    } else {
      newSaved.add(id);
    }
    this.savedStories = newSaved;
  }

  isSaved(id: number): boolean {
    return this.savedStories.has(id);
  }

  navigateToCreate(): void {
    this.router.navigate(['/community/create']);
  }

  navigateToStory(id: number): void {
    this.router.navigate(['/community/stories', id]);
  }

  getTotalViews(): string {
    return this.tripStories.reduce((sum, s) => sum + s.views, 0).toLocaleString();
  }

  getTotalComments(): number {
    return this.tripStories.reduce((sum, s) => sum + s.comments, 0);
  }
}
