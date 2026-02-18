import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  Leaf,
  MapPin,
  Flame,
  Binoculars,
  FileText,
  Info,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Calendar,
  Ban,
  Mountain,
  Fish,
  TreePine,
  ChevronRight
} from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent, CardDescriptionComponent } from '../../../shared/components/card.component';
import { BadgeComponent } from '../../../shared/components/badge.component';

interface EnvironmentalZone {
  id: string;
  name: string;
  type: 'wilderness' | 'wildlife-protection' | 'restricted' | 'seasonal-closure';
  restrictions: string[];
  permitRequired: boolean;
  status: 'open' | 'restricted' | 'closed';
}

interface TripCompliance {
  tripId: string;
  tripName: string;
  destination: string;
  dates: string;
  overallStatus: 'compliant' | 'needs-review' | 'restricted';
  issues: string[];
  lastChecked: string;
}

interface FireBan {
  id: string;
  location: string;
  level: string;
  restrictions: string[];
  expires: string;
  severity: 'high' | 'medium';
}

interface HuntingSeason {
  species: string;
  season: string;
  permitRequired: boolean;
  status: 'active' | 'upcoming';
}

@Component({
  selector: 'app-environmental-compliance',
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
  templateUrl: './environmental-compliance.component.html',
  styles: []
})
export class EnvironmentalComplianceComponent {
  // Icons
  readonly LeafIcon = Leaf;
  readonly MapPinIcon = MapPin;
  readonly FlameIcon = Flame;
  readonly BinocularsIcon = Binoculars;
  readonly FileTextIcon = FileText;
  readonly InfoIcon = Info;
  readonly ArrowRightIcon = ArrowRight;
  readonly CheckCircleIcon = CheckCircle;
  readonly AlertTriangleIcon = AlertTriangle;
  readonly XCircleIcon = XCircle;
  readonly CalendarIcon = Calendar;
  readonly BanIcon = Ban;
  readonly MountainIcon = Mountain;
  readonly FishIcon = Fish;
  readonly TreePineIcon = TreePine;
  readonly ChevronRightIcon = ChevronRight;

  // Mock Data
  environmentalZones: EnvironmentalZone[] = [
    {
      id: 'zone-1',
      name: 'Rocky Mountain Wilderness Area',
      type: 'wilderness',
      restrictions: [
        'Group size limit: 12 people maximum',
        'No motorized vehicles or equipment',
        'Camping 200 feet from water sources',
        'Pack out all waste (Leave No Trace)',
      ],
      permitRequired: true,
      status: 'open',
    },
    {
      id: 'zone-2',
      name: 'Yosemite Valley - Bear Protection Zone',
      type: 'wildlife-protection',
      restrictions: [
        'Bear canisters mandatory for all food storage',
        'No food storage in vehicles',
        'Report all bear sightings to rangers',
        'Minimum 100-yard distance from bears',
      ],
      permitRequired: false,
      status: 'open',
    },
    {
      id: 'zone-3',
      name: 'Grand Teton High Country',
      type: 'seasonal-closure',
      restrictions: [
        'Closed for winter wildlife migration (Dec 1 - April 15)',
        'No camping above treeline during closure',
        'Permit required during open season',
      ],
      permitRequired: true,
      status: 'closed',
    },
  ];

  fireBans: FireBan[] = [
    {
      id: 'ban-1',
      location: 'Rocky Mountain NP - East Side',
      level: 'Stage 2',
      restrictions: [
        'All open fires prohibited',
        'Camp stoves with shut-off valve permitted',
        'Smoking only in enclosed vehicles',
      ],
      expires: 'March 15, 2026',
      severity: 'high',
    },
    {
      id: 'ban-2',
      location: 'Colorado Front Range - Multiple Counties',
      level: 'Stage 1',
      restrictions: [
        'Campfires in designated rings only',
        'No fires on high wind days',
        'Fire must be attended at all times',
      ],
      expires: 'April 1, 2026',
      severity: 'medium',
    },
  ];

  huntingSeasons: HuntingSeason[] = [
    {
      species: 'Elk',
      season: 'August 15 - November 30',
      permitRequired: true,
      status: 'active',
    },
    {
      species: 'Deer (Mule)',
      season: 'October 1 - November 15',
      permitRequired: true,
      status: 'upcoming',
    },
    {
      species: 'Turkey',
      season: 'April 15 - May 31',
      permitRequired: true,
      status: 'upcoming',
    },
  ];

  tripCompliance: TripCompliance[] = [
    {
      tripId: 'trip-1',
      tripName: 'Rocky Mountain Spring Adventure',
      destination: 'Rocky Mountain National Park, CO',
      dates: 'March 10-14, 2026',
      overallStatus: 'needs-review',
      issues: [
        'Stage 2 fire ban in effect - review restrictions',
        'Wilderness permit required - not yet obtained',
      ],
      lastChecked: '2 hours ago',
    },
    {
      tripId: 'trip-2',
      tripName: 'Yosemite Family Camping',
      destination: 'Yosemite National Park, CA',
      dates: 'April 5-10, 2026',
      overallStatus: 'compliant',
      issues: [],
      lastChecked: '1 day ago',
    },
  ];

  constructor(private router: Router) { }

  getZoneIcon(type: EnvironmentalZone['type']): any {
    switch (type) {
      case 'wilderness':
        return this.MountainIcon;
      case 'wildlife-protection':
        return this.BinocularsIcon;
      case 'restricted':
        return this.BanIcon;
      case 'seasonal-closure':
        return this.CalendarIcon;
      default:
        return this.MapPinIcon;
    }
  }

  getZoneStatusConfig(status: EnvironmentalZone['status']): { label: string; color: string; icon: any } {
    switch (status) {
      case 'open':
        return {
          label: 'Open',
          color: 'bg-green-50 text-green-700 border-green-200',
          icon: this.CheckCircleIcon,
        };
      case 'restricted':
        return {
          label: 'Restricted',
          color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
          icon: this.AlertTriangleIcon,
        };
      case 'closed':
        return {
          label: 'Closed',
          color: 'bg-red-50 text-red-700 border-red-200',
          icon: this.XCircleIcon,
        };
      default:
        return {
          label: 'Unknown',
          color: 'bg-gray-50 text-gray-700 border-gray-200',
          icon: this.InfoIcon,
        };
    }
  }

  getComplianceConfig(status: TripCompliance['overallStatus']): { label: string; color: string; icon: any } {
    switch (status) {
      case 'compliant':
        return {
          icon: this.CheckCircleIcon,
          color: 'bg-green-50 text-green-700 border-green-200',
          label: 'Compliant',
        };
      case 'needs-review':
        return {
          icon: this.AlertTriangleIcon,
          color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
          label: 'Needs Review',
        };
      case 'restricted':
        return {
          icon: this.XCircleIcon,
          color: 'bg-red-50 text-red-700 border-red-200',
          label: 'Restricted',
        };
      default:
        return {
          label: 'Unknown',
          color: 'bg-gray-50 text-gray-700 border-gray-200',
          icon: this.InfoIcon,
        };
    }
  }

  hasHighSeverityBan(): boolean {
    return this.fireBans.some(b => b.severity === 'high');
  }

  navigate(url: string): void {
    this.router.navigate([url]);
  }
}
