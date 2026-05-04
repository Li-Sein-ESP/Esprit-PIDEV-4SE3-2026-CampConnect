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
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  XCircle,
  Calendar,
  Ban,
  Mountain,
  Fish,
  TreePine,
  ChevronRight,
  Trees
} from 'lucide-angular';

interface EnvironmentalZone {
  id: string;
  name: string;
  status: 'Open' | 'Closed';
  permitRequired: boolean;
  restrictions: string[];
}

interface FireBan {
  id: string;
  location: string;
  stage: string;
  validUntil: string;
  restrictions: string[];
}

interface TripCompliance {
  id: string;
  name: string;
  location: string;
  dates: string;
  status: 'Needs Review' | 'Compliant';
  issues: string[];
  lastChecked: string;
}

interface HuntingSeason {
  id: string;
  animal: string;
  dates: string;
  permitRequired: boolean;
  status: 'Active' | 'Upcoming';
}

@Component({
  selector: 'app-environmental-compliance',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    LucideAngularModule
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
  readonly CheckCircleIcon = CheckCircle2;
  readonly AlertTriangleIcon = AlertTriangle;
  readonly AlertCircleIcon = AlertCircle;
  readonly XCircleIcon = XCircle;
  readonly CalendarIcon = Calendar;
  readonly BanIcon = Ban;
  readonly MountainIcon = Mountain;
  readonly FishIcon = Fish;
  readonly TreePineIcon = TreePine;
  readonly ChevronRightIcon = ChevronRight;
  readonly TreesIcon = Trees;

  // Mock Data
  environmentalZones: EnvironmentalZone[] = [
    {
      id: '1',
      name: 'Rocky Mountain Wilderness Area',
      status: 'Open',
      permitRequired: true,
      restrictions: [
        'Group size limit: 12 people maximum',
        'No motorized vehicles or equipment',
        'Camping 200 feet from water sources',
        'Pack out all waste (Leave No Trace)'
      ]
    },
    {
      id: '2',
      name: 'Yosemite Valley - Bear Protection Zone',
      status: 'Open',
      permitRequired: false,
      restrictions: [
        'Bear canisters mandatory for all food storage',
        'No food storage in vehicles',
        'Report all bear sightings to rangers',
        'Minimum 100-yard distance from bears'
      ]
    },
    {
      id: '3',
      name: 'Grand Teton High Country',
      status: 'Closed',
      permitRequired: true,
      restrictions: [
        'Closed for winter wildlife migration (Dec 1 - April 15)',
        'No camping above treeline during closure',
        'Permit required during open season'
      ]
    }
  ];

  fireBans: FireBan[] = [
    {
      id: '1',
      location: 'Rocky Mountain NP - East Side',
      stage: 'Stage 2 Fire Ban',
      validUntil: 'March 15, 2026',
      restrictions: [
        'All open fires prohibited',
        'Camp stoves with shut-off valve permitted',
        'Smoking only in enclosed vehicles'
      ]
    },
    {
      id: '2',
      location: 'Colorado Front Range - Multiple Counties',
      stage: 'Stage 1 Fire Ban',
      validUntil: 'April 1, 2026',
      restrictions: [
        'Campfires in designated rings only',
        'No fires on high wind days',
        'Fire must be attended at all times'
      ]
    }
  ];

  tripCompliance: TripCompliance[] = [
    {
      id: '1',
      name: 'Rocky Mountain Spring Adventure',
      location: 'Rocky Mountain National Park, CO',
      dates: 'March 10-14, 2026',
      status: 'Needs Review',
      issues: [
        'Stage 2 fire ban in effect - review restrictions',
        'Wilderness permit required - not yet obtained'
      ],
      lastChecked: '2 hours ago'
    },
    {
      id: '2',
      name: 'Yosemite Family Camping',
      location: 'Yosemite National Park, CA',
      dates: 'April 5-10, 2026',
      status: 'Compliant',
      issues: [],
      lastChecked: '1 day ago'
    }
  ];

  huntingSeasons: HuntingSeason[] = [
    {
      id: '1',
      animal: 'Elk',
      dates: 'August 15 - November 30',
      permitRequired: true,
      status: 'Active'
    },
    {
      id: '2',
      animal: 'Deer (Mule)',
      dates: 'October 1 - November 15',
      permitRequired: true,
      status: 'Active'
    },
    {
      id: '3',
      animal: 'Turkey',
      dates: 'April 15 - May 31',
      permitRequired: true,
      status: 'Upcoming'
    }
  ];

  safetyAlert = {
    message: "Looking for safety alerts? Real-time weather warnings, wildlife dangers, and emergency check-in are on the",
    linkText: "Safety page",
    linkUrl: "/safety"
  };

  constructor(private router: Router) { }

  getZoneIcon(name: string): any {
    if (name.includes('Wilderness')) return this.MountainIcon;
    if (name.includes('Bear')) return this.BinocularsIcon;
    return this.MapPinIcon;
  }

  getZoneStatusConfig(status: EnvironmentalZone['status']): { label: string; color: string; icon: any } {
    switch (status) {
      case 'Open':
        return {
          label: 'Open',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
          icon: this.CheckCircleIcon,
        };
      case 'Closed':
        return {
          label: 'Closed',
          color: 'bg-red-50 text-red-700 border-red-100',
          icon: this.XCircleIcon,
        };
      default:
        return {
          label: 'Unknown',
          color: 'bg-stone-50 text-stone-700 border-stone-200',
          icon: this.InfoIcon,
        };
    }
  }

  getComplianceConfig(status: TripCompliance['status']): { label: string; color: string; icon: any } {
    switch (status) {
      case 'Compliant':
        return {
          icon: this.CheckCircleIcon,
          color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
          label: 'Compliant',
        };
      case 'Needs Review':
        return {
          icon: this.AlertTriangleIcon,
          color: 'bg-yellow-50 text-yellow-700 border-yellow-100',
          label: 'Needs Review',
        };
      default:
        return {
          label: 'Unknown',
          color: 'bg-stone-50 text-stone-700 border-stone-200',
          icon: this.InfoIcon,
        };
    }
  }

  hasHighSeverityBan(): boolean {
    return this.fireBans.some(b => b.stage.includes('Stage 2'));
  }

  navigate(url: string): void {
    this.router.navigate([url]);
  }
}
