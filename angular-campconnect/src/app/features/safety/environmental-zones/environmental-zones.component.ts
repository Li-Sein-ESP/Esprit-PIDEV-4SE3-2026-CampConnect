import { Component, OnInit } from '@angular/core';
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
  AlertCircle,
  Lock,
  Info,
  CheckCircle,
  CheckCircle2,
  XCircle,
  MapPin,
  Bell,
  PawPrint,
  Flower,
  FileText,
  Binoculars,
  Check,
  CheckCheck,
  ChevronRight
} from 'lucide-angular';

interface ProtectedSpecies {
  name: string;
  type: string;
  status: string;
  statusColor: string;
  icon: any;
  iconColor: string;
}

interface SeasonalRestriction {
  date: string;
  title: string;
  restrictions: string[];
}

interface EnvironmentalZone {
  id: string;
  name: string;
  location: string;
  protectionLevel: 'High' | 'Medium' | 'Low';
  icon: 'mountain' | 'shield' | 'prohibited';
  iconColor: string;
  protectedSpecies: ProtectedSpecies[];
  seasonalRestrictions: SeasonalRestriction[];
  permitRequirements: {
    type: string;
    cost: string;
    limitations: string[];
  };
  activityRegulations: {
    allowed: string[];
    restricted: string[];
    prohibited: string[];
  };
}

@Component({
  selector: 'app-environmental-zones',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    LucideAngularModule
  ],
  templateUrl: './environmental-zones.component.html',
  styles: []
})
export class EnvironmentalZonesComponent implements OnInit {
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
  readonly AlertCircleIcon = AlertCircle;
  readonly LockIcon = Lock;
  readonly InfoIcon = Info;
  readonly CheckCircleIcon = CheckCircle2;
  readonly XCircleIcon = XCircle;
  readonly BellIcon = Bell;
  readonly PawPrintIcon = PawPrint;
  readonly FlowerIcon = Flower;
  readonly FileTextIcon = FileText;
  readonly BinocularsIcon = Binoculars;
  readonly CheckIcon = Check;
  readonly CheckCheckIcon = CheckCheck;
  readonly ChevronRightIcon = ChevronRight;

  selectedZone: EnvironmentalZone | null = null;
  viewMode: 'summary' | 'detailed' = 'summary';

  zones: EnvironmentalZone[] = [
    {
      id: '1',
      name: 'Rocky Mountain Wilderness Area - Zone 3',
      location: 'Rocky Mountain National Park, CO',
      protectionLevel: 'High',
      icon: 'mountain',
      iconColor: 'bg-red-500',
      protectedSpecies: [
        {
          name: 'Greenback Cutthroat Trout',
          type: 'Fish',
          status: 'threatened',
          statusColor: 'bg-orange-100 text-orange-800',
          icon: this.FishIcon,
          iconColor: 'text-orange-500',
        },
        {
          name: 'Boreal Toad',
          type: 'Animal',
          status: 'endangered',
          statusColor: 'bg-red-100 text-red-800',
          icon: this.PawPrintIcon,
          iconColor: 'text-red-500',
        },
        {
          name: 'Alpine Forget-Me-Not',
          type: 'Plant',
          status: 'protected',
          statusColor: 'bg-blue-100 text-blue-800',
          icon: this.FlowerIcon,
          iconColor: 'text-blue-500',
        },
        {
          name: 'Bighorn Sheep',
          type: 'Animal',
          status: 'protected',
          statusColor: 'bg-blue-100 text-blue-800',
          icon: this.PawPrintIcon,
          iconColor: 'text-blue-500',
        }
      ],
      seasonalRestrictions: [
        {
          date: 'December 1 - April 30',
          title: 'Winter wildlife habitat protection',
          restrictions: [
            'No camping above treeline (11,500 ft)',
            'Limited trail access in bighorn sheep habitat',
            'No off-trail travel in designated zones',
          ],
        },
        {
          date: 'May 1 - July 15',
          title: 'Bird nesting season',
          restrictions: [
            'Cliff areas closed to climbing',
            'Quiet hours enforced near nesting sites',
            'Some trails closed or rerouted',
          ],
        }
      ],
      permitRequirements: {
        type: 'Wilderness Camping Permit',
        cost: '$30 per group',
        limitations: [
          'Maximum group size: 7 people',
          'Maximum 3 consecutive nights per campsite',
          'Advance reservation required (up to 6 months)',
        ]
      },
      activityRegulations: {
        allowed: [
          'Hiking and backpacking',
          'Wildlife viewing (with distance requirements)',
          'Photography',
          'Dispersed camping in designated zones',
          'Day use recreation',
        ],
        restricted: [
          'Fishing (catch and release only, barbless hooks)',
          'Camp stoves only (no wood fires during restrictions)',
          'Dogs on leash in specific areas',
        ],
        prohibited: [
          'Motor vehicles',
          'Mountain bikes',
          'Drones',
          'Collection of plants, rocks, or artifacts',
          'Feeding wildlife',
        ]
      }
    },
    {
      id: '2',
      name: 'Yosemite Valley Riparian Corridor',
      location: 'Yosemite National Park, CA',
      protectionLevel: 'High',
      icon: 'shield',
      iconColor: 'bg-red-500',
      protectedSpecies: [
        {
          name: 'Sierra Nevada Red Fox',
          type: 'Animal',
          status: 'endangered',
          statusColor: 'bg-red-100 text-red-800',
          icon: this.PawPrintIcon,
          iconColor: 'text-red-500',
        },
        {
          name: 'California Spotted Owl',
          type: 'Animal',
          status: 'protected',
          statusColor: 'bg-blue-100 text-blue-800',
          icon: this.BinocularsIcon,
          iconColor: 'text-blue-500',
        }
      ],
      seasonalRestrictions: [
        {
          date: 'March 15 - August 31',
          title: 'Meadow restoration and owl nesting protection',
          restrictions: [
            'Specific trail closures near nesting sites',
            'Restricted access to river banks in restoration zones',
          ],
        }
      ],
      permitRequirements: {
        type: 'Backcountry Wilderness Permit',
        cost: 'Free (reservation fee applies)',
        limitations: [
          'Stay on designated trails only',
          'Strict noise restrictions',
          'Bear canisters mandatory',
        ]
      },
      activityRegulations: {
        allowed: ['Hiking', 'Bird watching', 'Restoration volunteering'],
        restricted: ['Camping (permit only)', 'Photography (off-trail requires permit)'],
        prohibited: ['Swimming in protected zones', 'Night hiking in owl habitat']
      }
    },
    {
      id: '3',
      name: 'Grand Teton Alpine Zone',
      location: 'Grand Teton National Park, WY',
      protectionLevel: 'Medium',
      icon: 'prohibited',
      iconColor: 'bg-amber-500',
      protectedSpecies: [
        {
          name: 'Pika',
          type: 'Animal',
          status: 'protected',
          statusColor: 'bg-blue-100 text-blue-800',
          icon: this.PawPrintIcon,
          iconColor: 'text-blue-500',
        },
        {
          name: 'Mountain Goat',
          type: 'Animal',
          status: 'protected',
          statusColor: 'bg-blue-100 text-blue-800',
          icon: this.PawPrintIcon,
          iconColor: 'text-blue-500',
        }
      ],
      seasonalRestrictions: [
        {
          date: 'Nov 1 - May 31',
          title: 'High altitude winter protection',
          restrictions: [
            'Avalanche safety gear mandatory',
            'Travel restricted to established winter routes',
          ],
        }
      ],
      permitRequirements: {
        type: 'Alpine Climbing Permit',
        cost: '$15',
        limitations: [
          'No camping on vegetation',
          'Human waste removal bags required',
        ]
      },
      activityRegulations: {
        allowed: ['Climbing', 'Hiking', 'Skiing'],
        restricted: ['Camping (glacier only)'],
        prohibited: ['Fires of any kind', 'Shortcutting switchbacks']
      }
    }
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Selection is handled by user interaction to match screenshot exactly
  }

  selectZone(zone: EnvironmentalZone): void {
    this.selectedZone = zone;
    this.viewMode = 'summary'; // Selection in sidebar resets to summary
  }

  toggleViewMode(mode: 'summary' | 'detailed'): void {
    this.viewMode = mode;
  }

  // Helper to get status color from source code logic
  getStatusColor(status: string): string {
    const statusColors: any = {
      threatened: "bg-orange-100 text-orange-800",
      endangered: "bg-red-100 text-red-800",
      protected: "bg-blue-100 text-blue-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  }

  getZoneIcon(iconType: EnvironmentalZone['icon']): any {
    switch (iconType) {
      case 'mountain':
        return this.MountainIcon;
      case 'shield':
        return this.ShieldIcon;
      case 'prohibited':
        return this.BanIcon;
      default:
        return this.InfoIcon;
    }
  }

  getProtectionLevelConfig(level: EnvironmentalZone['protectionLevel']): { color: string; label: string } {
    switch (level) {
      case 'High':
        return { color: 'bg-red-500', label: 'High Protection' };
      case 'Medium':
        return { color: 'bg-amber-500', label: 'Medium Protection' };
      case 'Low':
        return { color: 'bg-green-500', label: 'Low Protection' };
    }
  }

  navigate(url: string): void {
    this.router.navigate([url]);
  }
}
