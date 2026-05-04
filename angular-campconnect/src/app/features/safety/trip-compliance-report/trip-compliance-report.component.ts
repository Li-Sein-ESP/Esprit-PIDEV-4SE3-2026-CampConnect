import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import {
  LucideAngularModule,
  ChevronLeft,
  Shield,
  MapPin,
  Calendar,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Check,
  Ban,
  Info,
  FileText,
  Flame,
  UtensilsCrossed,
  Mountain,
  Binoculars,
  TreePine
} from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';
import { BadgeComponent } from '../../../shared/components/badge.component';

interface ComplianceItem {
  id: string;
  category: 'fire' | 'cooking' | 'access' | 'wildlife' | 'environmental';
  title: string;
  status: 'allowed' | 'restricted' | 'prohibited';
  description: string;
  requirements?: string[];
  restrictions?: string[];
}

@Component({
  selector: 'app-trip-compliance-report',
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
  templateUrl: './trip-compliance-report.component.html',
  styles: []
})
export class TripComplianceReportComponent {
  // Icons
  readonly ChevronLeftIcon = ChevronLeft;
  readonly ShieldIcon = Shield;
  readonly MapPinIcon = MapPin;
  readonly CalendarIcon = Calendar;
  readonly CheckCircleIcon = CheckCircle;
  readonly AlertTriangleIcon = AlertTriangle;
  readonly XCircleIcon = XCircle;
  readonly CheckIcon = Check;
  readonly BanIcon = Ban;
  readonly InfoIcon = Info;
  readonly FileTextIcon = FileText;

  // Category Icons
  readonly FlameIcon = Flame;
  readonly UtensilsCrossedIcon = UtensilsCrossed;
  readonly MountainIcon = Mountain;
  readonly BinocularsIcon = Binoculars;
  readonly TreePineIcon = TreePine;

  mockTrip = {
    id: 'trip-1',
    name: 'Rocky Mountain Spring Adventure',
    destination: 'Rocky Mountain National Park, CO',
    dates: 'March 10-14, 2026',
    participants: 4,
    zone: 'Wilderness Zone 3',
  };

  complianceItems: ComplianceItem[] = [
    {
      id: 'fire-1',
      category: 'fire',
      title: 'Open Campfires',
      status: 'prohibited',
      description:
        'Stage 2 fire restrictions currently in effect due to elevated fire danger. All open fires including campfires are prohibited.',
      restrictions: [
        'No wood-burning fires of any kind',
        'Fire rings and fire pits may not be used',
        'Charcoal grills prohibited',
        'Violators subject to citation and fines up to $5,000',
      ],
    },
    {
      id: 'fire-2',
      category: 'cooking',
      title: 'Camp Stoves',
      status: 'allowed',
      description: 'Portable camp stoves with shut-off valves are permitted during fire restrictions.',
      requirements: [
        'Must have functional shut-off valve',
        'Use only in cleared areas (10ft diameter)',
        'Keep away from flammable vegetation',
        'Never leave unattended while in use',
        'Have fire extinguisher or water nearby',
      ],
    },
    {
      id: 'access-1',
      category: 'access',
      title: 'Trail Access',
      status: 'restricted',
      description:
        'Some trails have seasonal closures or permit requirements during this time period.',
      requirements: [
        'Wilderness permit required for overnight stays',
        'Maximum group size: 7 people',
        'Stock animals prohibited on certain trails',
      ],
      restrictions: [
        'Longs Peak Trail closed until April 1',
        'Thunder Lake Trail requires advance reservation',
        'No off-trail travel in sensitive meadow areas',
      ],
    },
    {
      id: 'wildlife-1',
      category: 'wildlife',
      title: 'Bear Precautions',
      status: 'restricted',
      description:
        'Bear activity is moderate. Food storage requirements are mandatory in all backcountry areas.',
      requirements: [
        'Bear canisters required for all food and scented items',
        'Approved canister models: BearVault BV500, Garcia Backpackers Cache',
        'Store canisters 100+ feet from sleeping area',
        'No food storage in vehicles overnight',
        'Report all bear encounters to rangers',
      ],
    },
    {
      id: 'wildlife-2',
      category: 'wildlife',
      title: 'Wildlife Viewing',
      status: 'allowed',
      description: 'Wildlife viewing is permitted with proper distance and behavior guidelines.',
      requirements: [
        'Maintain 25 yards from most wildlife',
        'Maintain 100 yards from bears and moose',
        'Never feed or approach animals',
        'Use binoculars or telephoto lenses for viewing',
        'Yield right-of-way to all wildlife',
      ],
    },
    {
      id: 'env-1',
      category: 'environmental',
      title: 'Waste Disposal',
      status: 'restricted',
      description: 'Pack in, pack out policy strictly enforced. Leave No Trace principles apply.',
      requirements: [
        'Pack out all trash and food waste',
        'Use designated toilet facilities when available',
        'Bury human waste 6-8 inches deep, 200ft from water',
        'Pack out toilet paper and hygiene products',
        'Use biodegradable soap only, 200ft from water sources',
      ],
    },
    {
      id: 'env-2',
      category: 'environmental',
      title: 'Camping Zones',
      status: 'restricted',
      description: 'Camping is only permitted in designated zones with valid permits.',
      requirements: [
        'Camp only in designated wilderness zones',
        'Set up camp 200ft from lakes and streams',
        'Use existing campsites when available',
        'Maximum 3-night stay per campsite',
      ],
      restrictions: [
        'No camping above treeline (11,500 ft)',
        'Sensitive habitat zones closed to camping',
        'Minimum 0.5 mile between group campsites',
      ],
    },
  ];

  tripId: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.route.paramMap.subscribe(params => {
      this.tripId = params.get('tripId');
    });
  }

  get categoryCounts() {
    return {
      allowed: this.complianceItems.filter((item) => item.status === 'allowed').length,
      restricted: this.complianceItems.filter((item) => item.status === 'restricted').length,
      prohibited: this.complianceItems.filter((item) => item.status === 'prohibited').length,
    };
  }

  getStatusConfig(status: string) {
    switch (status) {
      case 'allowed':
        return {
          icon: this.CheckCircleIcon,
          color: 'bg-green-50 text-green-700 border-green-200',
          label: 'Allowed',
          badgeColor: 'bg-green-600 text-white',
        };
      case 'restricted':
        return {
          icon: this.AlertTriangleIcon,
          color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
          label: 'Restricted',
          badgeColor: 'bg-yellow-600 text-white',
        };
      case 'prohibited':
        return {
          icon: this.XCircleIcon,
          color: 'bg-red-50 text-red-700 border-red-200',
          label: 'Prohibited',
          badgeColor: 'bg-red-600 text-white',
        };
      default:
        return {
          icon: this.InfoIcon,
          color: 'bg-gray-50 text-gray-700 border-gray-200',
          label: 'Unknown',
          badgeColor: 'bg-gray-600 text-white',
        };
    }
  }

  getCategoryIcon(category: string) {
    switch (category) {
      case 'fire': return this.FlameIcon;
      case 'cooking': return this.UtensilsCrossedIcon;
      case 'access': return this.MountainIcon;
      case 'wildlife': return this.BinocularsIcon;
      case 'environmental': return this.TreePineIcon;
      default: return this.InfoIcon;
    }
  }

  printReport(): void {
    window.print();
  }

  navigate(url: string): void {
    this.router.navigate([url]);
  }
}
