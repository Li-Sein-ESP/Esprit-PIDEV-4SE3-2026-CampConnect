import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, ChevronLeft, Binoculars, MapPin, Shield, Calendar, AlertTriangle, Info, FileText, CheckCircle, Ban, XCircle } from 'lucide-angular';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent, CardDescriptionComponent } from '../../../shared/components/card.component';
import { BadgeComponent } from '../../../shared/components/badge.component';

interface WildlifeSpecies {
  id: string;
  name: string;
  scientificName: string;
  category: 'big-game' | 'small-game' | 'waterfowl' | 'protected';
  conservationStatus: 'endangered' | 'threatened' | 'protected' | 'managed' | 'huntable';
  areas: string[];
  viewingGuidelines: {
    minDistance: string;
    bestTime: string;
    safety: string[];
  };
  huntingRegulations?: {
    allowed: boolean;
    seasons?: Array<{
      type: string;
      dates: string;
      restrictions: string[];
    }>;
    permits?: {
      required: boolean;
      type: string;
      cost: string;
      quota?: string;
    };
    methods?: string[];
    bagLimits?: string;
  };
}

@Component({
  selector: 'app-wildlife-regulations',
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
  templateUrl: './wildlife-regulations.component.html',
  styles: []
})
export class WildlifeRegulationsComponent {
  // Icons
  readonly ChevronLeftIcon = ChevronLeft;
  readonly BinocularsIcon = Binoculars;
  readonly MapPinIcon = MapPin;
  readonly ShieldIcon = Shield;
  readonly CalendarIcon = Calendar;
  readonly AlertTriangleIcon = AlertTriangle;
  readonly InfoIcon = Info;
  readonly FileTextIcon = FileText;
  readonly CheckCircleIcon = CheckCircle;
  readonly XCircleIcon = XCircle;
  readonly BanIcon = Ban;

  species: WildlifeSpecies[] = [
    {
      id: 'species-1',
      name: 'Elk (Wapiti)',
      scientificName: 'Cervus canadensis',
      category: 'big-game',
      conservationStatus: 'huntable',
      areas: ['Rocky Mountain National Park', 'Grand Teton NP', 'Yellowstone NP'],
      viewingGuidelines: {
        minDistance: '25 yards (75 feet)',
        bestTime: 'Dawn and dusk, especially September-October (rutting season)',
        safety: [
          'Never approach or follow elk',
          'Bulls are aggressive during rut (September-October)',
          'Stay in vehicle when possible',
          'Make noise if surprised at close range',
        ],
      },
      huntingRegulations: {
        allowed: true,
        seasons: [
          {
            type: 'Archery Season',
            dates: 'September 2-30, 2026',
            restrictions: ['Archery equipment only', 'Bull elk only', 'Units 1-45'],
          },
          {
            type: 'Rifle Season',
            dates: 'October 10 - November 14, 2026',
            restrictions: ['Rifles only', 'Either sex with appropriate tag', 'Units 1-45, 201-371'],
          },
        ],
        permits: {
          required: true,
          type: 'Limited Draw License',
          cost: '$672 (non-resident), $56 (resident)',
          quota: 'Varies by unit - check CPW for availability',
        },
        methods: ['Archery', 'Rifle', 'Muzzleloader (special season)'],
        bagLimits: '1 elk per license year',
      },
    },
    {
      id: 'species-2',
      name: 'Grizzly Bear',
      scientificName: 'Ursus arctos horribilis',
      category: 'protected',
      conservationStatus: 'threatened',
      areas: ['Grand Teton NP', 'Yellowstone NP'],
      viewingGuidelines: {
        minDistance: '100 yards minimum (300 feet)',
        bestTime: 'May-September in alpine meadows, year-round near water sources',
        safety: [
          'Never approach - use binoculars or telephoto lens',
          'Carry bear spray and know how to use it',
          'Make noise while hiking in bear country',
          'Store all food in bear canisters',
          'Never run from a bear',
          'If charged, stand your ground and use bear spray',
        ],
      },
      huntingRegulations: {
        allowed: false,
      },
    },
    {
      id: 'species-3',
      name: 'Mule Deer',
      scientificName: 'Odocoileus hemionus',
      category: 'big-game',
      conservationStatus: 'huntable',
      areas: ['Rocky Mountain NP', 'Yosemite NP', 'Grand Teton NP'],
      viewingGuidelines: {
        minDistance: '25 yards',
        bestTime: 'Early morning and evening, year-round',
        safety: [
          'Keep distance during rutting season (November-December)',
          'Bucks can be aggressive',
          'Never feed or touch deer',
        ],
      },
      huntingRegulations: {
        allowed: true,
        seasons: [
          {
            type: 'Archery Season',
            dates: 'August 26 - September 24, 2026',
            restrictions: ['Archery only', 'Either sex in most units'],
          },
          {
            type: 'Rifle Season - 1st',
            dates: 'October 14-18, 2026',
            restrictions: ['Buck only', 'Units 1-85'],
          },
          {
            type: 'Rifle Season - 2nd',
            dates: 'October 21 - November 1, 2026',
            restrictions: ['Either sex with doe tag', 'All units'],
          },
        ],
        permits: {
          required: true,
          type: 'Over-the-Counter or Limited Draw',
          cost: '$431 (non-resident), $42 (resident)',
        },
        methods: ['Archery', 'Rifle', 'Muzzleloader'],
        bagLimits: '1 deer per license year (additional doe tags available)',
      },
    },
    {
      id: 'species-4',
      name: 'Bald Eagle',
      scientificName: 'Haliaeetus leucocephalus',
      category: 'protected',
      conservationStatus: 'protected',
      areas: ['Yellowstone NP', 'Grand Teton NP', 'Rocky Mountain NP'],
      viewingGuidelines: {
        minDistance: '100 yards (330 feet)',
        bestTime: 'Winter near open water, nesting March-August',
        safety: [
          'Never approach nests',
          'Use binoculars or spotting scope',
          'Keep noise levels low near nesting areas',
          'Report nest locations to park rangers',
        ],
      },
      huntingRegulations: {
        allowed: false,
      },
    },
    {
      id: 'species-5',
      name: 'Wild Turkey',
      scientificName: 'Meleagris gallopavo',
      category: 'small-game',
      conservationStatus: 'huntable',
      areas: ['Various National Forests', 'BLM Lands'],
      viewingGuidelines: {
        minDistance: '15 yards for viewing',
        bestTime: 'Spring (breeding season) and fall',
        safety: ['Generally not aggressive', 'Avoid nesting areas in spring'],
      },
      huntingRegulations: {
        allowed: true,
        seasons: [
          {
            type: 'Spring Turkey Season',
            dates: 'April 11 - May 31, 2026',
            restrictions: ['Bearded turkey only', 'Shotgun or archery', 'Units 1-175'],
          },
          {
            type: 'Fall Turkey Season',
            dates: 'September 1 - November 30, 2026',
            restrictions: ['Either sex', 'All legal methods', 'Limited units'],
          },
        ],
        permits: {
          required: true,
          type: 'Turkey License',
          cost: '$101 (non-resident), $26 (resident)',
        },
        methods: ['Shotgun', 'Archery'],
        bagLimits: 'Spring: 2 bearded turkeys, Fall: 2 turkeys (either sex)',
      },
    },
  ];

  selectedSpecies: WildlifeSpecies | null = null;
  filterCategory: string = 'all';

  statusColors: { [key: string]: string } = {
    endangered: 'bg-red-600 text-white',
    threatened: 'bg-orange-600 text-white',
    protected: 'bg-blue-600 text-white',
    managed: 'bg-green-600 text-white',
    huntable: 'bg-slate-600 text-white',
  };

  constructor(private router: Router) { }

  get filteredSpecies(): WildlifeSpecies[] {
    return this.filterCategory === 'all'
      ? this.species
      : this.species.filter((s) => s.category === this.filterCategory);
  }

  setFilterCategory(category: string): void {
    this.filterCategory = category;
    this.selectedSpecies = null; // Reset selection on filter change
  }

  selectSpecies(species: WildlifeSpecies): void {
    this.selectedSpecies = species;
  }

  navigate(url: string): void {
    this.router.navigate([url]);
  }
}
