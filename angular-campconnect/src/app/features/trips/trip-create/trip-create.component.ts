import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LucideAngularModule, Car, Bus, Train, Plane, Info } from 'lucide-angular';
import { TripService } from '../services/trip.service';
import { TransportationService } from '../../transportation/services/transportation.service';

interface Step {
  id: number;
  title: string;
  subtitle: string;
}

interface Option {
  id: string;
  title: string;
  subtitle?: string;
}

@Component({
  selector: 'app-trip-create',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './trip-create.component.html'
})
export class TripCreateComponent implements OnInit {
  CarIcon = Car;
  BusIcon = Bus;
  TrainIcon = Train;
  PlaneIcon = Plane;
  InfoIcon = Info;

  steps: Step[] = [
    { id: 1, title: "Basic Info", subtitle: "Trip essentials" },
    { id: 2, title: "Preferences", subtitle: "Customize your experience" },
    { id: 3, title: "Transportation", subtitle: "Select how to get there" },
    { id: 4, title: "Review & Generate", subtitle: "Finalize your plan" },
  ];

  adventureOptions: Option[] = [
    { id: "easy", title: "Easy", subtitle: "Light hiking, accessible trails" },
    { id: "moderate", title: "Moderate", subtitle: "Some challenging terrain" },
    { id: "challenging", title: "Challenging", subtitle: "Strenuous activities, backcountry" },
  ];

  comfortOptions: Option[] = [
    { id: "minimal", title: "Minimal", subtitle: "Backpacking essentials only" },
    { id: "basic", title: "Basic", subtitle: "Tent camping with basics" },
    { id: "comfortable", title: "Comfortable", subtitle: "Full gear, cooking setup" },
    { id: "luxury", title: "Luxury", subtitle: "Glamping with amenities" },
  ];

  activityOptions: Option[] = [
    { id: "hiking", title: "Hiking" },
    { id: "camping", title: "Camping" },
    { id: "photography", title: "Photography" },
    { id: "cooking", title: "Outdoor Cooking" },
    { id: "campfire", title: "Campfire" },
    { id: "wildlife", title: "Wildlife Watching" },
    { id: "fishing", title: "Fishing" },
    { id: "climbing", title: "Rock Climbing" },
    { id: "nature", title: "Nature Walks" },
  ];

  currentStep = 1;

  tripData = {
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    participants: 1,
    description: '',
    adventureLevel: null as string | null,
    comfortLevel: null as string | null,
    transportId: null as string | null,
    activities: [] as string[],
  };

  transportOptions: any[] = [];
  isLoadingTransports = false;

  constructor(
    private tripService: TripService,
    private transportService: TransportationService,
    public router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const templateId = params['templateId'];
      if (templateId) {
        this.tripService.getTripById(templateId).subscribe({
          next: (template) => {
            this.tripData = {
              ...this.tripData,
              name: template.name + ' (Planned)',
              destination: template.destination,
              description: template.description || '',
              adventureLevel: template.adventureLevel || null,
              comfortLevel: template.comfortLevel || null,
              activities: template.activities || []
            };
          },
          error: (err) => console.error('Failed to load template', err)
        });
      }
    });

    this.loadTransportOptions();
  }

  loadTransportOptions() {
    this.isLoadingTransports = true;
    this.transportService.getAllTransports().subscribe({
      next: (transports) => {
        this.transportOptions = transports;
        this.isLoadingTransports = false;
      },
      error: (err) => {
        console.error('Failed to load transports', err);
        this.isLoadingTransports = false;
      }
    });
  }

  nextStep() {
    if (this.currentStep === 1) {
      if (!this.tripData.name || !this.tripData.destination) {
        alert('Please enter a trip name and destination before continuing.');
        return;
      }
      this.currentStep++;
    } else if (this.currentStep === 2) {
      if (!this.tripData.adventureLevel) {
        alert('Please select an Adventure Level before continuing.');
        return;
      }
      if (!this.tripData.comfortLevel) {
        alert('Please select a Comfort Level before continuing.');
        return;
      }
      this.currentStep++;
    } else if (this.currentStep === 3) {
      if (!this.tripData.transportId) {
        alert('Please select a transportation mode before continuing.');
        return;
      }
      this.currentStep++;
    } else {
      this.createTrip();
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    } else {
      this.router.navigate(['/plan-trip']);
    }
  }

  onParticipantsChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value, 10);
    if (!value || value < 1) {
      this.tripData.participants = 1;
      input.value = '1';
    } else if (value > 999) {
      this.tripData.participants = 999;
      input.value = '999';
    } else {
      this.tripData.participants = value;
    }
  }

  setAdventureLevel(id: string) {
    this.tripData.adventureLevel = id;
  }

  setComfortLevel(id: string) {
    this.tripData.comfortLevel = id;
  }

  setTransport(id: string) {
    this.tripData.transportId = id;
  }

  toggleActivity(id: string) {
    const activities = this.tripData.activities;
    if (activities.includes(id)) {
      this.tripData.activities = activities.filter((a) => a !== id);
    } else {
      this.tripData.activities = [...activities, id];
    }
  }

  createTrip() {
    if (!this.tripData.name || !this.tripData.destination) {
      alert('Please provide at least a name and destination for your trip.');
      this.currentStep = 1;
      return;
    }
    const duration = this.calculateDuration();
    const payload = {
      ...this.tripData,
      duration,
      transportIds: this.tripData.transportId ? [this.tripData.transportId] : []
    };

    this.tripService.createTrip(payload).subscribe({
      next: (trip) => {
        this.router.navigate(['/trips', trip.id]);
      },
      error: (err) => {
        // Error handling is now also in the service alert
      }
    });
  }

  calculateDuration(): number {
    if (!this.tripData.startDate || !this.tripData.endDate) return 1;
    const start = new Date(this.tripData.startDate);
    const end = new Date(this.tripData.endDate);
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  }

  getDurationLabel(): string {
    const days = this.calculateDuration();
    return `${days} ${days === 1 ? 'day' : 'days'}`;
  }

  getAdventureLabel(): string {
    const opt = this.adventureOptions.find(o => o.id === this.tripData.adventureLevel);
    return opt ? opt.title : 'Not set';
  }

  getComfortLabel(): string {
    const opt = this.comfortOptions.find(o => o.id === this.tripData.comfortLevel);
    return opt ? opt.title : 'Not set';
  }

  getSelectedActivities(): string[] {
    return this.tripData.activities.map(id => {
      const opt = this.activityOptions.find(o => o.id === id);
      return opt ? opt.title : id;
    });
  }

  getSelectedTransport(): any {
    return this.transportOptions.find(t => t.id === this.tripData.transportId);
  }
}


