import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  ChevronLeft,
  Settings,
  Mountain,
  CheckCircle,
  Calendar,
  Sparkles
} from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardContentComponent, CardHeaderComponent, CardTitleComponent, CardDescriptionComponent } from '../../../shared/components/card.component';

@Component({
  selector: 'app-matching-preferences',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LucideAngularModule,
    ButtonComponent,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent
  ],
  templateUrl: './matching-preferences.component.html',
  styles: []
})
export class MatchingPreferencesComponent {
  // Icons
  readonly ChevronLeftIcon = ChevronLeft;
  readonly SettingsIcon = Settings;
  readonly MountainIcon = Mountain;
  readonly CheckCircleIcon = CheckCircle;
  readonly CalendarIcon = Calendar;
  readonly SparklesIcon = Sparkles;

  // State
  experienceLevel = 'intermediate';
  selectedActivities: string[] = ['Backpacking', 'Wildlife Photography'];
  tripStyle = 'balanced';
  groupSize = 'small';
  availabilityStart = '2026-03-01';
  availabilityEnd = '2026-05-31';

  // Options
  experienceLevels = [
    { value: 'beginner', label: 'Beginner', description: 'New to camping' },
    { value: 'intermediate', label: 'Intermediate', description: 'Some experience' },
    { value: 'advanced', label: 'Advanced', description: 'Seasoned camper' },
    { value: 'expert', label: 'Expert', description: 'Wilderness veteran' },
  ];

  activities = [
    'Backpacking', 'Car Camping', 'Rock Climbing', 'Peak Bagging',
    'Wildlife Photography', 'Fishing', 'Kayaking', 'Mountain Biking',
    'Trail Running', 'Nature Education', 'Campfire Cooking', 'Stargazing',
    'Winter Camping', 'Survival Skills'
  ];

  tripStyles = [
    {
      value: 'relaxed',
      label: 'Relaxed & Social',
      description: 'Leisurely pace, bonfire chats, base camp setup',
      icon: '🔥',
    },
    {
      value: 'balanced',
      label: 'Balanced Adventure',
      description: 'Mix of activity and relaxation, flexible plans',
      icon: '⚖️',
    },
    {
      value: 'adventure',
      label: 'High Adventure',
      description: 'Challenging terrain, long distances, early starts',
      icon: '⛰️',
    },
  ];

  groupSizes = [
    { value: 'solo', label: 'Solo + 1', description: '2 people', icon: '👤' },
    { value: 'small', label: 'Small Group', description: '3-4 people', icon: '👥' },
    { value: 'medium', label: 'Medium Group', description: '5-8 people', icon: '👨‍👩‍👧‍👦' },
    { value: 'large', label: 'Large Group', description: '9+ people', icon: '🏕️' },
  ];

  constructor(private router: Router) { }

  setExperienceLevel(level: string): void {
    this.experienceLevel = level;
  }

  toggleActivity(activity: string): void {
    if (this.selectedActivities.includes(activity)) {
      this.selectedActivities = this.selectedActivities.filter(a => a !== activity);
    } else {
      this.selectedActivities.push(activity);
    }
  }

  setTripStyle(style: string): void {
    this.tripStyle = style;
  }

  setGroupSize(size: string): void {
    this.groupSize = size;
  }

  handleSave(): void {
    // Logic to save preferences would go here
    this.navigate('/companions/matches');
  }

  navigate(url: string): void {
    this.router.navigate([url]);
  }
}
