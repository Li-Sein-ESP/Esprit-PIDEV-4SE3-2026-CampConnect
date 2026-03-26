import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { TripService } from '../../trips/services/trip.service';
import {
  LucideAngularModule,
  CheckCircle,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Map,
  Package,
  FileText,
  DollarSign,
  Globe,
  Info,
  ChevronRight,
  TrendingDown
} from 'lucide-angular';

@Component({
  selector: 'app-transport-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './transport-confirmation.component.html'
})
export class TransportConfirmationComponent implements OnInit {
  readonly CheckCircle = CheckCircle;
  readonly Calendar = Calendar;
  readonly MapPin = MapPin;
  readonly Clock = Clock;
  readonly ArrowRight = ArrowRight;
  readonly ShieldCheck = ShieldCheck;
  readonly AlertTriangle = AlertTriangle;
  readonly Map = Map;
  readonly Package = Package;
  readonly FileText = FileText;
  readonly DollarSign = DollarSign;
  readonly Globe = Globe;
  readonly Info = Info;
  readonly ChevronRight = ChevronRight;
  readonly TrendingDown = TrendingDown;

  selectedTransport = {
    title: 'Loading...',
    time: '-',
    cost: '-',
    distance: '-',
    impact: '-',
    imageUrl: ''
  };

  ngOnInit() {
    const params = this.injectRoute.snapshot.queryParamMap;
    this.selectedTransport = {
      title: params.get('title') || 'Personal Vehicle',
      time: params.get('time') || '1 hour 45 minutes + 10 minutes walking',
      cost: params.get('cost') || '$28',
      distance: 'Distance calculated via route',
      impact: params.get('impact') || 'High',
      imageUrl: params.get('imageUrl') || ''
    };
  }

  tripEffects = [
    {
      title: 'Trip Itinerary',
      description: 'Departure time adjusted to arrive by check-in at 2:00 PM',
      detail: 'Updated departure: 12:00 PM on March 10',
      icon: Map
    },
    {
      title: 'Timing',
      description: 'Total travel time added to trip schedule',
      detail: '1 hour 55 minutes allocated for transportation',
      icon: Clock
    },
    {
      title: 'Accessibility',
      description: 'Last 0.3 miles requires walking on dirt trail',
      detail: 'Wheelchair accessible with assistance',
      icon: CheckCircle
    }
  ];

  nextSteps = [
    { title: 'Trip Planner', description: 'Timeline updated with departure time and travel duration', icon: Map },
    { title: 'Booking', description: 'Parking reservation or permit requirements flagged', icon: Calendar },
    { title: 'Gear Planning', description: 'Packing list adjusted based on vehicle space', icon: Package },
    { title: 'Environmental Compliance', description: 'Access rules and vehicle restrictions verified', icon: ShieldCheck }
  ];

  followUpLinks = [
    { label: 'View Trip Itinerary', url: '#' },
    { label: 'Update Packing List', url: '#' },
    { label: 'Check Compliance', url: '/environmental' }
  ];

  private tripService = inject(TripService);
  private router = inject(Router);

  saveToTrip() {
    const tripId = this.injectRoute.snapshot.queryParamMap.get('tripId');
    const optionId = this.injectRoute.snapshot.queryParamMap.get('optionId');

    if (tripId && optionId) {
      this.tripService.updateTripTransportation(tripId, {
        id: optionId,
        title: this.selectedTransport.title,
        time: this.selectedTransport.time,
        cost: this.selectedTransport.cost,
        impact: this.selectedTransport.impact,
        imageUrl: this.selectedTransport.imageUrl
      });
      // Navigate to the plan-trip page
      this.router.navigate(['/trips', tripId]);
    } else {
      alert('Missing trip or transport selection.');
    }
  }

  private injectRoute = inject(ActivatedRoute);
}
