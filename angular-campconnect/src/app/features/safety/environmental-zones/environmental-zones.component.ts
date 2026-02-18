import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  ChevronLeft,
  TreePine,
  Mountain,
  Shield,
  Ban,
  Flower2,
  Bird,
  Fish,
  Calendar,
  AlertTriangle,
  Lock,
  Info,
  CheckCircle,
  XCircle,
  MapPin
} from 'lucide-angular';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent, CardDescriptionComponent } from '../../../shared/components/card.component';
import { BadgeComponent } from '../../../shared/components/badge.component';

interface ProtectedSpecies {
  name: string;
  type: 'plant' | 'animal' | 'fish';
  status: 'endangered' | 'threatened' | 'protected';
}

interface SeasonalRestriction {
  period: string;
  reason: string;
  restrictions: string[];
}

interface PermitRequirements {
  required: boolean;
  type?: string;
  cost?: string;
  limitations?: string[];
}

interface EnvironmentalZone {
  id: string;
  name: string;
  type: 'wilderness' | 'protected' | 'restricted' | 'managed';
  location: string;
  protectionLevel: 'high' | 'medium' | 'low';
  protectedSpecies: ProtectedSpecies[];
  seasonalRestrictions: SeasonalRestriction[];
  permitRequirements: PermitRequirements;
  allowedActivities: string[];
  restrictedActivities: string[];
  prohibitedActivities: string[];
}

@Component({
  selector: 'app-environmental-zones',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardContentComponent,
    CardDescriptionComponent,
    BadgeComponent
  ],
  templateUrl: './environmental-zones.component.html',
  styles: []
})
export class EnvironmentalZonesComponent {
  // Icons
  readonly ChevronLeftIcon = ChevronLeft;
  readonly TreePineIcon = TreePine;
  readonly MapPinIcon = MapPin;
  readonly MountainIcon = Mountain;
  readonly ShieldIcon = Shield;
  readonly BanIcon = Ban;
  readonly Flower2Icon = Flower2;
  readonly BirdIcon = Bird;
  readonly FishIcon = Fish;
  readonly CalendarIcon = Calendar;
  readonly AlertTriangleIcon = AlertTriangle;
  readonly LockIcon = Lock;
  readonly InfoIcon = Info;
  readonly CheckCircleIcon = CheckCircle;
  readonly XCircleIcon = XCircle;

  selectedZone: EnvironmentalZone | null = null;

  zones: EnvironmentalZone[] = [
    {
      id: 'zone-1',
      name: 'Rocky Mountain Wilderness Area - Zone 3',
      type: 'wilderness',
      location: 'Rocky Mountain National Park, CO',
      protectionLevel: 'high',
      protectedSpecies: [
        { name: 'Greenback Cutthroat Trout', type: 'fish', status: 'threatened' },
        { name: 'Boreal Toad', type: 'animal', status: 'endangered' },
        { name: 'Alpine Forget-Me-Not', type: 'plant', status: 'protected' },
        { name: 'Bighorn Sheep', type: 'animal', status: 'protected' },
      ],
      seasonalRestrictions: [
        {
          period: 'December 1 - April 30',
          reason: 'Winter wildlife habitat protection',
          restrictions: [
            'No camping above treeline (11,500 ft)',
            'Limited trail access in bighorn sheep habitat',
            'No off-trail travel in designated zones',
          ],
        },
        {
          period: 'May 1 - July 15',
          reason: 'Bird nesting season',
          restrictions: [
            'Cliff areas closed to climbing',
            'Quiet hours enforced near nesting sites',
            'Some trails closed or rerouted',
          ],
        },
      ],
      permitRequirements: {
        required: true,
        type: 'Wilderness Camping Permit',
        cost: '$30 per group',
        limitations: [
          'Maximum group size: 7 people',
          'Maximum 3 consecutive nights per campsite',
          'Advance reservation required (up to 6 months)',
        ],
      },
      allowedActivities: [
        'Hiking and backpacking',
        'Wildlife viewing (with distance requirements)',
        'Photography',
        'Dispersed camping in designated zones',
        'Day use recreation',
      ],
      restrictedActivities: [
        'Fishing (catch and release only, barbless hooks)',
        'Camp stoves only (no wood fires during restrictions)',
        'Dogs on leash in specific areas',
      ],
      prohibitedActivities: [
        'Motor vehicles',
        'Mountain bikes',
        'Drones',
        'Collection of plants, rocks, or artifacts',
        'Feeding wildlife',
      ],
    },
    {
      id: 'zone-2',
      name: 'Yosemite Valley Riparian Corridor',
      type: 'protected',
      location: 'Yosemite National Park, CA',
      protectionLevel: 'high',
      protectedSpecies: [
        { name: 'Sierra Nevada Red Fox', type: 'animal', status: 'endangered' },
        { name: 'California Spotted Owl', type: 'animal', status: 'threatened' },
        { name: 'Western Azalea', type: 'plant', status: 'protected' },
      ],
      seasonalRestrictions: [
        {
          period: 'March 15 - August 31',
          reason: 'Owl nesting and meadow restoration',
          restrictions: [
            'Stay on designated trails only',
            'No entry to meadow restoration zones',
            'Noise restrictions near nesting areas',
          ],
        },
      ],
      permitRequirements: {
        required: true,
        type: 'Backcountry Wilderness Permit',
        cost: '$15 per person',
        limitations: ['Daily quota limits apply', 'Trailhead-specific permits required'],
      },
      allowedActivities: [
        'Hiking on designated trails',
        'Wildlife photography from trails',
        'Rock climbing in permitted areas',
      ],
      restrictedActivities: [
        'Camping (designated sites only)',
        'Fishing (special regulations apply)',
        'Pets (service animals only in some areas)',
      ],
      prohibitedActivities: [
        'Off-trail travel in restoration zones',
        'Swimming in protected stream sections',
        'Noise-generating devices',
        'Collection of any natural materials',
      ],
    },
    {
      id: 'zone-3',
      name: 'Grand Teton Alpine Zone',
      type: 'restricted',
      location: 'Grand Teton National Park, WY',
      protectionLevel: 'medium',
      protectedSpecies: [
        { name: 'Grizzly Bear', type: 'animal', status: 'threatened' },
        { name: 'Whitebark Pine', type: 'plant', status: 'endangered' },
        { name: 'Wolverine', type: 'animal', status: 'threatened' },
      ],
      seasonalRestrictions: [
        {
          period: 'April 1 - June 30',
          reason: 'Grizzly bear denning and foraging',
          restrictions: [
            'Bear canisters mandatory',
            'Some trails closed',
            'No camping in specific drainages',
          ],
        },
      ],
      permitRequirements: {
        required: true,
        type: 'Backcountry Camping Permit',
        cost: '$35 per group',
        limitations: ['Zone-specific quotas', 'Camping zones assigned at permit'],
      },
      allowedActivities: [
        'Backpacking with permit',
        'Mountaineering',
        'Wildlife viewing (100+ yard distance)',
        'Fishing with Wyoming license',
      ],
      restrictedActivities: [
        'Campfires (designated sites only)',
        'Food storage (bear canisters required)',
        'Group size (maximum 6 people)',
      ],
      prohibitedActivities: [
        'Pets in backcountry',
        'Firearms discharge',
        'Drones',
        'Collecting firewood in alpine zones',
      ],
    },
  ];

  constructor(private router: Router) { }

  selectZone(zone: EnvironmentalZone): void {
    this.selectedZone = zone;
  }

  getProtectionLevelConfig(level: EnvironmentalZone['protectionLevel']): { color: string; label: string } {
    switch (level) {
      case 'high':
        return { color: 'bg-red-600', label: 'High Protection' };
      case 'medium':
        return { color: 'bg-yellow-600', label: 'Medium Protection' };
      case 'low':
        return { color: 'bg-green-600', label: 'Low Protection' };
    }
  }

  getZoneTypeIcon(type: EnvironmentalZone['type']): any {
    switch (type) {
      case 'wilderness':
        return this.MountainIcon;
      case 'protected':
        return this.ShieldIcon;
      case 'restricted':
        return this.BanIcon;
      case 'managed':
        return this.TreePineIcon;
      default:
        return this.TreePineIcon;
    }
  }

  getSpeciesIcon(type: ProtectedSpecies['type']): any {
    switch (type) {
      case 'plant':
        return this.Flower2Icon;
      case 'animal':
        return this.BirdIcon;
      case 'fish':
        return this.FishIcon;
    }
  }

  getStatusColor(status: ProtectedSpecies['status']): string {
    switch (status) {
      case 'endangered':
        return 'text-red-600';
      case 'threatened':
        return 'text-orange-600';
      case 'protected':
        return 'text-blue-600';
    }
  }

  getSpeciesStatusClass(status: ProtectedSpecies['status']): string {
    switch (status) {
      case 'endangered':
        return 'bg-red-100 text-red-700';
      case 'threatened':
        return 'bg-orange-100 text-orange-700';
      case 'protected':
        return 'bg-blue-100 text-blue-700';
    }
  }

  navigate(url: string): void {
    this.router.navigate([url]);
  }
}
