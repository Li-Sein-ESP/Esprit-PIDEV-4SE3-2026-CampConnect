import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  ChevronLeft,
  Sparkles,
  SlidersHorizontal,
  Users,
  CheckCircle,
  TrendingUp,
  MapPin,
  Award,
  Calendar,
  Eye,
  X
} from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';
import { BadgeComponent } from '../../../shared/components/badge.component';

interface Match {
  id: string;
  name: string;
  location: string;
  avatar: string;
  compatibility: number;
  experienceLevel: string;
  sharedActivities: string[];
  tripStyle: string;
  availability: string;
  completedTrips: number;
  certifications: number;
  verifiedUser: boolean;
}

@Component({
  selector: 'app-match-suggestions',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    ButtonComponent,
    CardComponent,
    CardContentComponent,
    BadgeComponent
  ],
  templateUrl: './match-suggestions.component.html',
  styles: []
})
export class MatchSuggestionsComponent {
  // Icons
  readonly ChevronLeftIcon = ChevronLeft;
  readonly SparklesIcon = Sparkles;
  readonly SlidersHorizontalIcon = SlidersHorizontal;
  readonly UsersIcon = Users;
  readonly CheckCircleIcon = CheckCircle;
  readonly TrendingUpIcon = TrendingUp;
  readonly MapPinIcon = MapPin;
  readonly AwardIcon = Award;
  readonly CalendarIcon = Calendar;
  readonly EyeIcon = Eye;
  readonly XIcon = X;

  matches: Match[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      location: 'Boulder, CO',
      avatar: 'SC',
      compatibility: 92,
      experienceLevel: 'Intermediate',
      sharedActivities: ['Backpacking', 'Wildlife Photography', 'Leave No Trace'],
      tripStyle: 'Balanced Adventure',
      availability: 'March - May 2026',
      completedTrips: 18,
      certifications: 3,
      verifiedUser: true,
    },
    {
      id: '2',
      name: 'Marcus Rodriguez',
      location: 'Denver, CO',
      avatar: 'MR',
      compatibility: 88,
      experienceLevel: 'Advanced',
      sharedActivities: ['Rock Climbing', 'Peak Bagging', 'Backpacking'],
      tripStyle: 'High Adventure',
      availability: 'April - June 2026',
      completedTrips: 24,
      certifications: 5,
      verifiedUser: true,
    },
    {
      id: '3',
      name: 'Emily Watkins',
      location: 'Fort Collins, CO',
      avatar: 'EW',
      compatibility: 85,
      experienceLevel: 'Intermediate',
      sharedActivities: ['Family Camping', 'Nature Education', 'Campfire Cooking'],
      tripStyle: 'Relaxed & Social',
      availability: 'March - August 2026',
      completedTrips: 12,
      certifications: 2,
      verifiedUser: true,
    },
    {
      id: '4',
      name: 'David Park',
      location: 'Colorado Springs, CO',
      avatar: 'DP',
      compatibility: 82,
      experienceLevel: 'Advanced',
      sharedActivities: ['Backpacking', 'Survival Skills', 'Winter Camping'],
      tripStyle: 'High Adventure',
      availability: 'Year-round',
      completedTrips: 31,
      certifications: 7,
      verifiedUser: true,
    },
    {
      id: '5',
      name: 'Jessica Lin',
      location: 'Boulder, CO',
      avatar: 'JL',
      compatibility: 79,
      experienceLevel: 'Intermediate',
      sharedActivities: ['Wildlife Photography', 'Stargazing', 'Nature Education'],
      tripStyle: 'Balanced Adventure',
      availability: 'May - September 2026',
      completedTrips: 15,
      certifications: 4,
      verifiedUser: true,
    },
    {
      id: '6',
      name: 'Alex Thompson',
      location: 'Estes Park, CO',
      avatar: 'AT',
      compatibility: 76,
      experienceLevel: 'Expert',
      sharedActivities: ['Backpacking', 'Mountain Biking', 'Rock Climbing'],
      tripStyle: 'High Adventure',
      availability: 'June - October 2026',
      completedTrips: 42,
      certifications: 9,
      verifiedUser: true,
    },
  ];

  acceptedMatches: string[] = [];
  declinedMatches: string[] = [];

  constructor(private router: Router) { }

  get visibleMatches(): Match[] {
    return this.matches.filter(
      (m) => !this.acceptedMatches.includes(m.id) && !this.declinedMatches.includes(m.id)
    );
  }

  handleAccept(matchId: string): void {
    this.acceptedMatches.push(matchId);
  }

  handleDecline(matchId: string): void {
    this.declinedMatches.push(matchId);
  }

  navigate(url: string): void {
    this.router.navigate([url]);
  }
}
