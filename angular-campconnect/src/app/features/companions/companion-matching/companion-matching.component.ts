import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  Users,
  UserPlus,
  Shield,
  CheckCircle,
  MapPin,
  ArrowRight,
  Sparkles,
  Settings,
  MessageCircle
} from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent, CardDescriptionComponent } from '../../../shared/components/card.component';
import { BadgeComponent } from '../../../shared/components/badge.component';

interface Stat {
  label: string;
  value: string;
  icon: any;
  color: string;
}

interface Match {
  id: string;
  name: string;
  location: string;
  compatibility: number;
  sharedInterests: string[];
  avatar: string;
  status: 'accepted' | 'pending';
}

@Component({
  selector: 'app-companion-matching',
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
  templateUrl: './companion-matching.component.html',
  styles: []
})
export class CompanionMatchingComponent {
  // Icons
  readonly UsersIcon = Users;
  readonly UserPlusIcon = UserPlus;
  readonly ShieldIcon = Shield;
  readonly CheckCircleIcon = CheckCircle;
  readonly MapPinIcon = MapPin;
  readonly ArrowRightIcon = ArrowRight;
  readonly SparklesIcon = Sparkles;
  readonly SettingsIcon = Settings;
  readonly MessageCircleIcon = MessageCircle;

  stats: Stat[] = [
    { label: 'Active Matches', value: '12', icon: this.UsersIcon, color: 'text-blue-600' },
    { label: 'Pending Requests', value: '3', icon: this.UserPlusIcon, color: 'text-orange-600' },
    { label: 'Group Trips', value: '2', icon: this.MapPinIcon, color: 'text-green-600' },
  ];

  recentMatches: Match[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      location: 'Boulder, CO',
      compatibility: 92,
      sharedInterests: ['Backpacking', 'Wildlife Photography', 'Leave No Trace'],
      avatar: 'SC',
      status: 'accepted',
    },
    {
      id: '2',
      name: 'Marcus Rodriguez',
      location: 'Denver, CO',
      compatibility: 88,
      sharedInterests: ['Rock Climbing', 'Alpine Camping', 'Peak Bagging'],
      avatar: 'MR',
      status: 'accepted',
    },
    {
      id: '3',
      name: 'Emily Watkins',
      location: 'Fort Collins, CO',
      compatibility: 85,
      sharedInterests: ['Family Camping', 'Nature Education', 'Campfire Cooking'],
      avatar: 'EW',
      status: 'pending',
    },
  ];

  constructor(private router: Router) { }

  navigate(url: string): void {
    this.router.navigate([url]);
  }
}
