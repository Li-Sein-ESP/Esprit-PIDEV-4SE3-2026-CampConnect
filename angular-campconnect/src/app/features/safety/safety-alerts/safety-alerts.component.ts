import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, AlertTriangle, ShieldCheck, Search, Filter, Info, CloudRain, Flame, AlertCircle, MapPin, Calendar, Clock, ChevronRight, Map } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';
import { BadgeComponent } from '../../../shared/components/badge.component';
import { SafetyAlert } from '../models/safety.model';

@Component({
  selector: 'app-safety-alerts',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LucideAngularModule,
    ButtonComponent,
    CardComponent,
    CardContentComponent,
    BadgeComponent
  ],
  templateUrl: './safety-alerts.component.html',
  styles: []
})
export class SafetyAlertsComponent implements OnInit {
  // Icons
  readonly AlertTriangle = AlertTriangle;
  readonly ShieldCheck = ShieldCheck;
  readonly SearchIcon = Search;
  readonly FilterIcon = Filter;
  readonly InfoIcon = Info;
  readonly CloudRain = CloudRain;
  readonly Flame = Flame;
  readonly AlertCircle = AlertCircle;
  readonly MapPin = MapPin;
  readonly Calendar = Calendar;
  readonly Clock = Clock;
  readonly ChevronRight = ChevronRight;
  readonly MapIcon = Map;

  // Search and Filters
  searchQuery = '';
  selectedType = 'all';
  selectedSeverity = 'all';

  // Mock Data
  alerts: SafetyAlert[] = [
    {
      id: 'SA-001',
      type: 'weather',
      severity: 'danger',
      title: 'Flash Flood Warning - Zion National Park',
      description: 'The National Weather Service has issued a Flash Flood Warning for Zion National Park and surrounding areas. Slot canyons are extremely dangerous. Avoid all narrow canyons until further notice.',
      location: { name: 'The Narrows & Subway', region: 'Southern Utah' },
      affectedAreas: ['North Fork Virgin River', 'Hidden Canyon', 'Echo Canyon'],
      startDate: '2026-03-01T08:00:00Z',
      source: 'National Weather Service (NWS)',
      updatedAt: '2026-03-01T10:15:00Z',
      active: true
    },
    {
      id: 'SA-002',
      type: 'wildlife',
      severity: 'warning',
      title: 'Active Grizzly Activity - Lamar Valley',
      description: 'Multiple sightings of a sow grizzly with cubs near the main trailhead. Visitors are advised to carry bear spray, make noise, and maintain a minimum distance of 100 yards.',
      location: { name: 'Lamar Valley', region: 'Yellowstone NP' },
      affectedAreas: ['Lamar River Trail', 'Specimen Ridge'],
      startDate: '2026-02-28T14:00:00Z',
      source: 'National Park Service (NPS)',
      updatedAt: '2026-03-01T07:30:00Z',
      active: true
    },
    {
      id: 'SA-003',
      type: 'fire',
      severity: 'critical',
      title: 'Wildfire Outbreak - Gila National Forest',
      description: 'A lightning-caused wildfire is rapidly spreading in the Mogollon Mountains. Immediate evacuation is required for all campers in the Whitewater Creek drainage area.',
      location: { name: 'Mogollon Mountains', region: 'Catron County, NM' },
      affectedAreas: ['Whitewater Creek', 'Catwalk Recreation Area'],
      startDate: '2026-03-01T11:45:00Z',
      source: 'US Forest Service (USFS)',
      updatedAt: '2026-03-01T12:00:00Z',
      active: true
    },
    {
      id: 'SA-004',
      type: 'advisory',
      severity: 'info',
      title: 'Planned Trail Maintenance - Grand Canyon',
      description: 'Minor delays expected on the Bright Angel Trail due to mule train logistics and water pipeline repairs. Trail remains open but please follow ranger instructions.',
      location: { name: 'Bright Angel Trail', region: 'Grand Canyon NP' },
      affectedAreas: ['Indian Garden', 'Three-Mile Resthouse'],
      startDate: '2026-03-05T07:00:00Z',
      endDate: '2026-03-10T17:00:00Z',
      source: 'Grand Canyon Conservancy',
      updatedAt: '2026-02-28T16:00:00Z',
      active: true
    },
    {
      id: 'SA-005',
      type: 'weather',
      severity: 'danger',
      title: 'Severe Thunderstorm & High Winds - Olympic Coast',
      description: 'Gale force winds up to 60mph and heavy rain expected along the coast. High risk of falling trees and hazardous beach conditions. Coastal camping not recommended.',
      location: { name: 'Rialto & Ruby Beach', region: 'Washington Coast' },
      affectedAreas: ['Second Beach', 'Kalaloch', 'Shi Shi Beach'],
      startDate: '2026-03-01T18:00:00Z',
      source: 'NOAA Weather Radio',
      updatedAt: '2026-03-01T09:00:00Z',
      active: true
    },
    {
      id: 'SA-006',
      type: 'closure',
      severity: 'warning',
      title: 'Bridge Closure - Great Smoky Mountains',
      description: 'The suspension bridge over Hazel Creek is undergoing emergency repairs following heavy rains. The Benton MacKaye Trail is diverted via high-water route.',
      location: { name: 'Hazel Creek', region: 'Great Smoky Mountains' },
      affectedAreas: ['Benton MacKaye Trail', 'Hazel Creek Trail'],
      startDate: '2026-02-25T08:00:00Z',
      endDate: '2026-03-15T18:00:00Z',
      source: 'NPS Maintenance Division',
      updatedAt: '2026-02-28T12:00:00Z',
      active: true
    },
    {
      id: 'SA-007',
      type: 'weather',
      severity: 'warning',
      title: 'Heat Advisory - Joshua Tree South',
      description: 'Temperatures expected to exceed 105°F. Visitors should finish hikes before 10 AM, carry at least 1 gallon of water per person, and know the signs of heat stroke.',
      location: { name: 'Cottonwood Spring', region: 'Joshua Tree NP' },
      affectedAreas: ['Lost Palms Oasis', 'Mastodon Peak'],
      startDate: '2026-03-01T06:00:00Z',
      source: 'National Weather Service',
      updatedAt: '2026-03-01T05:00:00Z',
      active: true
    },
    {
      id: 'SA-008',
      type: 'advisory',
      severity: 'info',
      title: 'Blue-Green Algae Detected - Shasta Lake',
      description: 'Presence of harmful algal blooms confirmed in several coves. Keep pets and children away from stagnant water. Do not drink lake water even if filtered.',
      location: { name: 'Lake Shasta', region: 'Shasta-Trinity NF' },
      affectedAreas: ['Antlers Boat Ramp', 'Sugarloaf Marina'],
      startDate: '2026-02-20T08:00:00Z',
      source: 'California Water Quality Control',
      updatedAt: '2026-03-01T08:30:00Z',
      active: true
    }
  ];

  filteredAlerts: SafetyAlert[] = [];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredAlerts = this.alerts.filter(alert => {
      const matchesSearch = this.searchQuery === '' ||
        alert.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        alert.location.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        alert.location.region.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesType = this.selectedType === 'all' || alert.type === this.selectedType;
      const matchesSeverity = this.selectedSeverity === 'all' || alert.severity === this.selectedSeverity;

      return matchesSearch && matchesType && matchesSeverity;
    });
  }

  get stats() {
    return {
      active: this.alerts.filter(a => a.active).length,
      critical: this.alerts.filter(a => a.severity === 'critical' || a.severity === 'danger').length,
      warning: this.alerts.filter(a => a.severity === 'warning').length,
      info: this.alerts.filter(a => a.severity === 'info').length
    };
  }

  getSeverityClasses(severity: string): string {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'danger': return 'bg-orange-600 text-white';
      case 'warning': return 'bg-amber-500 text-white';
      case 'info': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  }

  getTypeIcon(type: string): any {
    switch (type) {
      case 'weather': return this.CloudRain;
      case 'fire': return this.Flame;
      case 'wildlife': return this.AlertTriangle;
      case 'closure': return this.AlertCircle;
      default: return this.InfoIcon;
    }
  }

  viewDetails(id: string): void {
    this.router.navigate(['/safety/alerts', id]);
  }

  formatDate(isoDate: string): string {
    return new Date(isoDate).toLocaleDateString();
  }
}
