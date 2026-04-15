import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  ChevronLeft,
  Bold,
  Italic,
  List,
  Link,
  Image,
  CheckCircle,
  AlertCircle,
  MapPin,
  HelpCircle,
  Package,
  Star
} from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardDescriptionComponent, CardContentComponent } from '../../../shared/components/card.component';
import { BadgeComponent } from '../../../shared/components/badge.component';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LucideAngularModule,
    ButtonComponent,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    BadgeComponent
  ],
  templateUrl: './create-post.component.html',
  styles: []
})
export class CreatePostComponent {
  // Icons
  readonly ChevronLeftIcon = ChevronLeft;
  readonly BoldIcon = Bold;
  readonly ItalicIcon = Italic;
  readonly ListIcon = List;
  readonly LinkIcon = Link;
  readonly ImageIcon = Image;
  readonly CheckCircleIcon = CheckCircle;
  readonly AlertCircleIcon = AlertCircle;

  // Form State
  selectedCategory = '';
  title = '';
  content = '';
  tags: string[] = [];
  customTag = '';
  isPosting = false;
  showSuccess = false;

  categories = [
    {
      id: 'trip-stories',
      name: 'Trip Stories & Adventures',
      icon: MapPin,
      description: 'Share your camping experiences and memorable moments',
    },
    {
      id: 'questions-help',
      name: 'Questions & Help',
      icon: HelpCircle,
      description: 'Get answers from experienced campers',
    },
    {
      id: 'gear-advice',
      name: 'Gear Recommendations',
      icon: Package,
      description: 'Discuss equipment and get buying advice',
    },
    {
      id: 'campsite-reviews',
      name: 'Campsite Reviews',
      icon: Star,
      description: 'Share insights about campsites and locations',
    },
  ];

  suggestedTags = [
    'solo camping',
    'family camping',
    'backpacking',
    'car camping',
    'winter camping',
    'beginner tips',
    'gear review',
    'trail conditions',
    'safety',
    'wildlife',
  ];

  constructor(private router: Router) { }

  get canPost(): boolean {
    return (
      !!this.selectedCategory &&
      this.title.trim().length >= 10 &&
      this.content.trim().length >= 50
    );
  }

  handleAddTag(tag: string): void {
    if (this.tags.length < 5 && !this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }

  handleRemoveTag(tag: string): void {
    this.tags = this.tags.filter((t) => t !== tag);
  }

  handleAddCustomTag(): void {
    const tag = this.customTag.trim();
    if (tag && this.tags.length < 5 && !this.tags.includes(tag)) {
      this.tags.push(tag);
      this.customTag = '';
    }
  }

  handlePost(): void {
    if (!this.canPost) return;

    this.isPosting = true;

    // Simulate API call
    setTimeout(() => {
      this.isPosting = false;
      this.showSuccess = true;
      setTimeout(() => {
        this.router.navigate(['/community']);
      }, 2000);
    }, 1500);
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }
}
