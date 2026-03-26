import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { TransportationService } from '../services/transportation.service';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';
import { ButtonComponent } from '../../../shared/components/button.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  MapPin,
  Clock,
  Navigation,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  AlertTriangle,
  Info,
  Footprints,
  Mountain,
  CheckCircle,
  Shield,
  Car,
  Bus,
  Users,
  DollarSign,
  Leaf
} from 'lucide-angular';

interface RouteSegment {
  id: number;
  title: string;
  subtitle: string;
  distance: string;
  duration: string;
  conditions: string;
  badge: string;
  badgeColor: string;
  importantNotes?: string[];
  terrain?: string;
  accessibility?: string;
  isLastMile?: boolean;
}

interface RouteInfo {
  totalDistance: string;
  totalTime: string;
  totalSegments: number;
  roadTypes: string;
  difficulty: string;
  lastMile: string;
}

interface OptionData {
  routeInfo: RouteInfo;
  segments: RouteSegment[];
}

@Component({
  selector: 'app-route-breakdown',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    CardComponent,
    CardContentComponent,
    ButtonComponent
  ],
  templateUrl: './route-breakdown.component.html'
})
export class RouteBreakdownComponent implements OnInit {
  readonly MapPin = MapPin;
  readonly Clock = Clock;
  readonly Navigation = Navigation;
  readonly ArrowLeft = ArrowLeft;
  readonly ArrowRight = ArrowRight;
  readonly ChevronRight = ChevronRight;
  readonly AlertTriangle = AlertTriangle;
  readonly Info = Info;
  readonly Footprints = Footprints;
  readonly Mountain = Mountain;
  readonly CheckCircle = CheckCircle;
  readonly Shield = Shield;
  readonly Car = Car;
  readonly Bus = Bus;
  readonly Users = Users;
  readonly DollarSign = DollarSign;
  readonly Leaf = Leaf;

  optionId = signal<string>('');

  // We are using the mock data provided in the React component for demonstration
  private readonly defaultOptionData: OptionData = {
    routeInfo: {
      totalDistance: '78 miles + 0.3 miles walking',
      totalTime: '1 hour 45 minutes + 10 minutes walking',
      totalSegments: 3,
      roadTypes: 'Mixed',
      difficulty: 'Moderate',
      lastMile: 'Walking required',
    },
    segments: [
      {
        id: 1,
        title: 'I-25 North to US-34 West',
        subtitle: 'Denver, CO — Estes Park, CO',
        distance: '65 miles',
        duration: '1 hour 10 minutes',
        conditions: 'Paved highway, well-maintained',
        badge: 'Highway',
        badgeColor: 'bg-blue-50 text-blue-700 border border-blue-200',
      },
      {
        id: 2,
        title: 'US-34 into Rocky Mountain National Park',
        subtitle: 'Estes Park, CO — Park Entrance',
        distance: '10 miles',
        duration: '20 minutes',
        conditions: 'Mountain road with curves, possible wildlife',
        badge: 'Paved Road',
        badgeColor: 'bg-green-50 text-green-700 border border-green-200',
        importantNotes: [
          'Reduced speed limit (35 mph)',
          'Watch for elk and deer',
        ],
      },
      {
        id: 3,
        title: 'Old Fall River Road to Campground',
        subtitle: 'Park Entrance — Glacier Basin Campground',
        distance: '3 miles',
        duration: '15 minutes',
        conditions: 'Unpaved gravel road, narrow in sections',
        badge: 'Gravel Road',
        badgeColor: 'bg-amber-50 text-amber-700 border border-amber-200',
        importantNotes: [
          'Standard clearance vehicles only',
          'Road closed in winter',
          'Possible washouts after heavy rain',
        ],
      },
      {
        id: 4,
        title: 'Last Mile: Walk from parking area to campsite',
        subtitle: '',
        distance: '0.3 miles',
        duration: 'Walking Time: 10 minutes',
        conditions: '',
        badge: '',
        badgeColor: '',
        terrain: 'Flat trail, dirt path',
        accessibility: 'Wheelchair accessible with assistance',
        isLastMile: true,
      },
    ]
  };

  private readonly routeOptions: Record<string, OptionData> = {
    'personal-vehicle': this.defaultOptionData,
    'rideshare': this.defaultOptionData,
    'bus-shuttle': this.defaultOptionData,
    'hike-bike': this.defaultOptionData,
  };

  currentOption = computed(() => {
    return this.routeOptions[this.optionId()] || this.defaultOptionData;
  });

  beforeYouGoItems = [
    'Check weather conditions before departure',
    'Verify road closures and construction',
    'Ensure vehicle clearance for gravel roads',
    'Park pass or permit may be required',
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('optionId');
      if (id) {
        this.optionId.set(id);
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goBack() {
    this.location.back();
  }

  selectRoute() {
    // Navigate back to overview, or open a booking modal
    this.location.back();
  }
}
