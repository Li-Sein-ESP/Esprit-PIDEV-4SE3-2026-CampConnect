import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  HelpCircle,
  Search,
  Plus,
  MessageCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Award,
  User,
  ThumbsUp,
  Filter,
  AlertCircle,
  BookOpen,
  Shield,
  Star
} from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';
import { BadgeComponent } from '../../../shared/components/badge.component';

interface Author {
  name: string;
  avatar: string;
  reputation: number;
}

interface Question {
  id: number;
  title: string;
  author: Author;
  content: string;
  tags: string[];
  answers: number;
  views: number;
  upvotes: number;
  status: 'answered' | 'open';
  hasAcceptedAnswer: boolean;
  askedAt: string;
  category: string;
}

@Component({
  selector: 'app-ask-for-help',
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
  templateUrl: './ask-for-help.component.html',
  styles: []
})
export class AskForHelpComponent {
  // Icons
  readonly HelpCircleIcon = HelpCircle;
  readonly SearchIcon = Search;
  readonly PlusIcon = Plus;
  readonly MessageCircleIcon = MessageCircle;
  readonly CheckCircle2Icon = CheckCircle2;
  readonly ClockIcon = Clock;
  readonly ThumbsUpIcon = ThumbsUp;
  readonly BookOpenIcon = BookOpen;
  readonly StarIcon = Star;

  // State
  searchQuery = '';
  selectedCategory = 'all';
  selectedFilter = 'Latest';
  filterOptions = ['Latest', 'Unanswered', 'Most Upvoted', 'Most Viewed'];

  // Mock Data
  questions: Question[] = [
    {
      id: 1,
      title: 'What\'s the best beginner-friendly campsite near San Francisco?',
      author: {
        name: 'Alex Johnson',
        avatar: 'AJ',
        reputation: 45,
      },
      content: 'I\'m planning my first camping trip with my family. We\'re looking for something within 2-3 hours of San Francisco that has good facilities and isn\'t too remote. Any recommendations?',
      tags: ['Beginner', 'San Francisco', 'Family', 'Recommendations'],
      answers: 12,
      views: 342,
      upvotes: 28,
      status: 'answered',
      hasAcceptedAnswer: true,
      askedAt: '2 hours ago',
      category: 'Destinations',
    },
    {
      id: 2,
      title: 'How do I protect food from bears while backpacking?',
      author: {
        name: 'Sarah Chen',
        avatar: 'SC',
        reputation: 189,
      },
      content: 'I\'m planning a 5-day backpacking trip in Yosemite and I\'m concerned about bear safety. What\'s the best method for storing food? Bear canisters vs hanging? Any specific product recommendations?',
      tags: ['Safety', 'Backpacking', 'Wildlife', 'Yosemite'],
      answers: 8,
      views: 567,
      upvotes: 45,
      status: 'answered',
      hasAcceptedAnswer: true,
      askedAt: '5 hours ago',
      category: 'Safety & Wildlife',
    },
    {
      id: 3,
      title: 'Winter camping gear checklist - What am I missing?',
      author: {
        name: 'Michael Rodriguez',
        avatar: 'MR',
        reputation: 72,
      },
      content: 'Planning my first winter camping trip to Lake Tahoe. I have a 4-season tent, -20°F sleeping bag, and insulated pad. What other essential gear should I bring? Worried about staying warm!',
      tags: ['Winter Camping', 'Gear', 'Cold Weather'],
      answers: 15,
      views: 789,
      upvotes: 52,
      status: 'answered',
      hasAcceptedAnswer: false,
      askedAt: '1 day ago',
      category: 'Gear & Equipment',
    },
    {
      id: 4,
      title: 'Permits for overnight backpacking in the Grand Canyon?',
      author: {
        name: 'Emily Watson',
        avatar: 'EW',
        reputation: 134,
      },
      content: 'How far in advance do I need to apply for backcountry permits for the Grand Canyon? What\'s the process like and are there any tips for getting permits during peak season?',
      tags: ['Permits', 'Grand Canyon', 'Planning', 'Backpacking'],
      answers: 6,
      views: 423,
      upvotes: 31,
      status: 'answered',
      hasAcceptedAnswer: true,
      askedAt: '1 day ago',
      category: 'Planning & Logistics',
    },
    {
      id: 5,
      title: 'Best water purification method for multi-day trips?',
      author: {
        name: 'David Kim',
        avatar: 'DK',
        reputation: 98,
      },
      content: 'I\'ve been using tablets but they\'re slow and the water tastes weird. Looking into filters vs UV purifiers. What do experienced backpackers recommend for 7-10 day trips?',
      tags: ['Water', 'Backpacking', 'Gear', 'Health'],
      answers: 11,
      views: 634,
      upvotes: 39,
      status: 'answered',
      hasAcceptedAnswer: false,
      askedAt: '2 days ago',
      category: 'Gear & Equipment',
    },
    {
      id: 6,
      title: 'Dealing with altitude sickness while camping at high elevation?',
      author: {
        name: 'Jessica Martinez',
        avatar: 'JM',
        reputation: 156,
      },
      content: 'Planning to camp at 10,000+ feet elevation. I\'ve never camped this high before. What should I know about altitude sickness prevention and symptoms? Any acclimatization tips?',
      tags: ['Health', 'Altitude', 'Safety', 'Mountains'],
      answers: 9,
      views: 512,
      upvotes: 43,
      status: 'answered',
      hasAcceptedAnswer: true,
      askedAt: '2 days ago',
      category: 'Health & Safety',
    },
    {
      id: 7,
      title: 'First aid kit essentials for remote wilderness camping?',
      author: {
        name: 'Thomas Anderson',
        avatar: 'TA',
        reputation: 67,
      },
      content: 'Going on a remote 2-week trip where we\'ll be 3+ days from the nearest road. What should I include in my first aid kit beyond the basics? Any wilderness medicine training recommendations?',
      tags: ['First Aid', 'Safety', 'Remote', 'Wilderness'],
      answers: 7,
      views: 398,
      upvotes: 36,
      status: 'open',
      hasAcceptedAnswer: false,
      askedAt: '3 days ago',
      category: 'Health & Safety',
    },
    {
      id: 8,
      title: 'How to properly hang a bear bag without trees?',
      author: {
        name: 'Rachel Green',
        avatar: 'RG',
        reputation: 81,
      },
      content: 'Camping in an area above treeline where bear canisters aren\'t required. What\'s the best way to protect food when there are no suitable trees for hanging? Rock pile storage?',
      tags: ['Food Storage', 'Bears', 'Alpine', 'Safety'],
      answers: 5,
      views: 287,
      upvotes: 24,
      status: 'open',
      hasAcceptedAnswer: false,
      askedAt: '4 days ago',
      category: 'Safety & Wildlife',
    },
  ];

  categories = [
    { id: 'all', name: 'All Questions', count: this.questions.length },
    { id: 'gear', name: 'Gear & Equipment', count: 2 },
    { id: 'safety', name: 'Health & Safety', count: 3 },
    { id: 'planning', name: 'Planning & Logistics', count: 1 },
    { id: 'wildlife', name: 'Safety & Wildlife', count: 2 },
    { id: 'destinations', name: 'Destinations', count: 1 },
  ];

  constructor(private router: Router) { }

  get filteredQuestions(): Question[] {
    return this.questions.filter((q) => {
      const matchesSearch =
        this.searchQuery === '' ||
        q.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        q.content.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        q.tags.some(tag => tag.toLowerCase().includes(this.searchQuery.toLowerCase()));

      const matchesCategory =
        this.selectedCategory === 'all' ||
        q.category.toLowerCase().includes(this.selectedCategory);

      return matchesSearch && matchesCategory;
    });
  }

  get sortedQuestions(): Question[] {
    return [...this.filteredQuestions].sort((a, b) => {
      switch (this.selectedFilter) {
        case 'Unanswered':
          return (a.hasAcceptedAnswer ? 1 : 0) - (b.hasAcceptedAnswer ? 1 : 0);
        case 'Most Upvoted':
          return b.upvotes - a.upvotes;
        case 'Most Viewed':
          return b.views - a.views;
        default: // Latest
          return 0; // Already sorted by time in mock data
      }
    });
  }

  navigateToCreate(): void {
    this.router.navigate(['/community/create']);
  }

  navigateToThread(id: number): void {
    this.router.navigate(['/community/thread', id]);
  }

  getTotalAnswers(): number {
    return this.questions.reduce((sum, q) => sum + q.answers, 0);
  }

  getSolvedCount(): number {
    return this.questions.filter(q => q.hasAcceptedAnswer).length;
  }
}
