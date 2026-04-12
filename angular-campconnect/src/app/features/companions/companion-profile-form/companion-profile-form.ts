import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Save, User, Camera, Tent, MapPin, Activity, Flame, Shield, ArrowRight, Target } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card.component';

@Component({
  selector: 'app-companion-profile-form',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ButtonComponent, CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent],
  templateUrl: './companion-profile-form.html',
  styleUrl: './companion-profile-form.css'
})
export class CompanionProfileForm {
  readonly Save = Save;
  readonly User = User;
  readonly Camera = Camera;
  readonly Tent = Tent;
  readonly MapPin = MapPin;
  readonly Activity = Activity;
  readonly Flame = Flame;
  readonly Shield = Shield;
  readonly ArrowRight = ArrowRight;
  readonly Target = Target;

  profile = {
    name: 'Alex Explorer',
    age: 28,
    location: 'Denver, CO',
    bio: 'Looking for weekend warriors to tackle 14ers. I usually bring my dog, Buster. I prefer dispersed camping over established sites.',
    campingStyle: 'Backpacking',
    experienceLevel: 'Advanced',
    stats: {
      pace: 8, // Relaxed (1) -> Fast (10)
      social: 4, // Quiet (1) -> Chatty (10)
      preparedness: 9, // Spontaneous (1) -> Planner (10)
      natureFocus: 7, // Chill (1) -> Activity (10)
      gearSharing: 5 // Self (1) -> Share (10)
    }
  };

  campingStyles = ['Car Camping', 'Backpacking', 'Glamping', 'Vanlife', 'Survivalist'];
  experienceLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  isSaving = signal(false);
  saveSuccess = signal(false);

  saveProfile() {
    this.isSaving.set(true);
    this.saveSuccess.set(false);

    // Simulate API call
    setTimeout(() => {
      this.isSaving.set(false);
      this.saveSuccess.set(true);

      // Hide success message after 3 seconds
      setTimeout(() => this.saveSuccess.set(false), 3000);
    }, 1200);
  }
}
