import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import {
  LucideAngularModule,
  ChevronLeft,
  MapPin,
  Calendar,
  CheckCircle,
  Award,
  Mountain,
  TrendingUp,
  Star,
  Shield,
  X
} from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent, CardDescriptionComponent } from '../../../shared/components/card.component';
import { BadgeComponent } from '../../../shared/components/badge.component';

@Component({
  selector: 'app-match-detail',
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
  templateUrl: './match-detail.component.html',
  styles: []
})
export class MatchDetailComponent {
  // Icons
  readonly ChevronLeftIcon = ChevronLeft;
  readonly MapPinIcon = MapPin;
  readonly CalendarIcon = Calendar;
  readonly CheckCircleIcon = CheckCircle;
  readonly AwardIcon = Award;
  readonly MountainIcon = Mountain;
  readonly TrendingUpIcon = TrendingUp;
  readonly StarIcon = Star;
  readonly ShieldIcon = Shield;
  readonly XIcon = X;

  // State
  showConfirm = false;
  action: 'accept' | 'decline' | null = null;
  matchId: string | null = null;

  // Mock data
  match = {
    id: '1',
    name: 'Sarah Chen',
    location: 'Boulder, CO',
    avatar: 'SC',
    compatibility: 92,
    experienceLevel: 'Intermediate',
    memberSince: 'June 2023',
    completedTrips: 18,
    certifications: ['Wilderness First Aid', 'Leave No Trace Trainer', 'Bear Safety'],
    verifiedUser: true,
    bio: "I'm passionate about exploring Colorado's backcountry while practicing responsible outdoor ethics. I love capturing wildlife photography and sharing knowledge about sustainable camping practices. Always looking for like-minded adventurers to explore new trails!",
    preferredActivities: [
      'Backpacking',
      'Wildlife Photography',
      'Leave No Trace',
      'Trail Running',
      'Stargazing',
      'Nature Education',
    ],
    tripStyle: 'Balanced Adventure',
    groupSizePreference: '3-4 people',
    availability: 'March - May 2026',
    recentTrips: [
      { name: 'Rocky Mountain National Park', date: 'January 2026', rating: 5 },
      { name: 'Maroon Bells Wilderness', date: 'December 2025', rating: 5 },
      { name: 'Indian Peaks Wilderness', date: 'November 2025', rating: 5 },
    ],
  };

  sharedAttributes = [
    {
      category: 'Experience Level',
      yours: 'Intermediate',
      theirs: 'Intermediate',
      match: true,
    },
    {
      category: 'Trip Style',
      yours: 'Balanced Adventure',
      theirs: 'Balanced Adventure',
      match: true,
    },
    {
      category: 'Group Size',
      yours: '3-4 people',
      theirs: '3-4 people',
      match: true,
    },
    {
      category: 'Availability',
      yours: 'March - May 2026',
      theirs: 'March - May 2026',
      match: true,
    },
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.route.paramMap.subscribe(params => {
      this.matchId = params.get('id');
      // In a real app, fetch match details by ID here
    });
  }

  handleAction(actionType: 'accept' | 'decline'): void {
    this.action = actionType;
    this.showConfirm = true;
  }

  confirmAction(): void {
    if (this.action === 'accept') {
      // Persist acceptance logic here
      this.navigate('/companions/matches');
    } else {
      // Persist decline logic here
      this.navigate('/companions/matches');
    }
    this.showConfirm = false;
  }

  setShowConfirm(show: boolean): void {
    this.showConfirm = show;
  }

  navigate(url: string): void {
    this.router.navigate([url]);
  }
}
