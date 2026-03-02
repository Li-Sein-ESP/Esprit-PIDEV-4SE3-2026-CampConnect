import {
    Component,
    OnInit,
    OnDestroy,
    AfterViewInit,
    ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { MapService } from '../services/map.service';
import { SafetyAlert } from '../models/safety.model';

@Component({
    selector: 'app-safety-map',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './safety-map.component.html',
    styleUrls: ['./safety-map.component.scss']
})
export class SafetyMapComponent implements OnInit, AfterViewInit, OnDestroy {

    private map!: L.Map;
    private markers: L.Marker[] = [];

    selectedAlert: SafetyAlert | null = null;
    activeFilter = 'all';
    filteredAlerts: SafetyAlert[] = [];

    // Full mock alert dataset (includes coordinates for map markers)
    alerts: SafetyAlert[] = [
        {
            id: 'SA-001',
            type: 'weather',
            severity: 'danger',
            title: 'Flash Flood Warning - Zion National Park',
            description: 'The National Weather Service has issued a Flash Flood Warning for Zion National Park. Slot canyons are extremely dangerous.',
            location: { name: 'The Narrows & Subway', region: 'Southern Utah', coordinates: { lat: 37.2982, lng: -113.0263 } },
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
            description: 'Multiple sightings of a sow grizzly with cubs near the main trailhead. Carry bear spray and maintain 100-yard distance.',
            location: { name: 'Lamar Valley', region: 'Yellowstone NP', coordinates: { lat: 44.8027, lng: -110.2104 } },
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
            description: 'A lightning-caused wildfire is rapidly spreading. Immediate evacuation required for all campers in Whitewater Creek drainage.',
            location: { name: 'Mogollon Mountains', region: 'Catron County, NM', coordinates: { lat: 33.3687, lng: -108.6789 } },
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
            description: 'Minor delays expected on the Bright Angel Trail due to mule train logistics and water pipeline repairs.',
            location: { name: 'Bright Angel Trail', region: 'Grand Canyon NP', coordinates: { lat: 36.0544, lng: -112.1401 } },
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
            description: 'Gale force winds up to 60mph and heavy rain expected. High risk of falling trees and hazardous beach conditions.',
            location: { name: 'Rialto & Ruby Beach', region: 'Washington Coast', coordinates: { lat: 47.9010, lng: -124.6387 } },
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
            description: 'The suspension bridge over Hazel Creek is undergoing emergency repairs following heavy rains.',
            location: { name: 'Hazel Creek', region: 'Great Smoky Mountains', coordinates: { lat: 35.5951, lng: -83.5085 } },
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
            description: 'Temperatures expected to exceed 105°F. Finish hikes before 10 AM and carry at least 1 gallon of water per person.',
            location: { name: 'Cottonwood Spring', region: 'Joshua Tree NP', coordinates: { lat: 33.7416, lng: -115.8138 } },
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
            description: 'Harmful algal blooms confirmed in several coves. Keep pets and children away from stagnant water.',
            location: { name: 'Lake Shasta', region: 'Shasta-Trinity NF', coordinates: { lat: 40.7198, lng: -122.4194 } },
            affectedAreas: ['Antlers Boat Ramp', 'Sugarloaf Marina'],
            startDate: '2026-02-20T08:00:00Z',
            source: 'California Water Quality Control',
            updatedAt: '2026-03-01T08:30:00Z',
            active: true
        }
    ];

    // Available filter types (derived from data)
    filterTypes = [
        { key: 'all', label: 'All' },
        { key: 'fire', label: '🔥 Fire' },
        { key: 'weather', label: '⛈️ Weather' },
        { key: 'wildlife', label: '🐻 Wildlife' },
        { key: 'closure', label: '🚧 Closure' },
        { key: 'advisory', label: '📋 Advisory' }
    ];

    constructor(
        private mapService: MapService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.applyFilter('all');
    }

    ngAfterViewInit(): void {
        // Wait for the flex layout to stabilize then initialize Leaflet
        setTimeout(() => {
            this.map = this.mapService.initMap('safety-map-container');
            this.renderMarkers();
        }, 300);

        // Use ResizeObserver to call invalidateSize whenever the container's size changes
        const container = document.getElementById('safety-map-container');
        if (container && typeof ResizeObserver !== 'undefined') {
            const ro = new ResizeObserver(() => {
                if (this.map) {
                    this.map.invalidateSize(true);
                }
            });
            ro.observe(container);
        }
    }

    ngOnDestroy(): void {
        // Clean up Leaflet instance to prevent memory leaks
        if (this.map) {
            this.map.remove();
        }
    }

    // ---------------------------------------------------------------------------
    // Filter
    // ---------------------------------------------------------------------------

    applyFilter(type: string): void {
        this.activeFilter = type;
        this.filteredAlerts = type === 'all'
            ? [...this.alerts]
            : this.alerts.filter(a => a.type === type);
    }

    // ---------------------------------------------------------------------------
    // Map interactions
    // ---------------------------------------------------------------------------

    /** Called when a marker on the map is clicked */
    onMarkerClick(alert: SafetyAlert): void {
        this.selectedAlert = alert;
        this.cdr.detectChanges();
        // Scroll the alert card into view
        const el = document.getElementById(`alert-card-${alert.id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /** Called when user clicks "Focus on Map" button in the side panel */
    focusOnMap(alert: SafetyAlert): void {
        this.selectedAlert = alert;
        this.mapService.focusOnAlert(this.map, alert);
    }

    // ---------------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------------

    getRiskLabel(severity: string): string {
        return this.mapService.getRiskLabel(severity);
    }

    getTypeIcon(type: string): string {
        switch (type) {
            case 'fire': return '🔥';
            case 'weather': return '⛈️';
            case 'wildlife': return '🐻';
            case 'flood': return '🌊';
            case 'closure': return '🚧';
            case 'advisory': return '📋';
            default: return '⚠️';
        }
    }

    formatTime(isoDate: string): string {
        const diffMs = Date.now() - new Date(isoDate).getTime();
        const diffMin = Math.floor(diffMs / 60000);
        if (diffMin < 60) return `${diffMin} min ago`;
        const diffHrs = Math.floor(diffMin / 60);
        if (diffHrs < 24) return `${diffHrs} hr${diffHrs > 1 ? 's' : ''} ago`;
        return `${Math.floor(diffHrs / 24)} day(s) ago`;
    }

    private renderMarkers(): void {
        this.mapService.clearMarkers(this.map, this.markers);
        this.markers = this.mapService.addMarkers(
            this.map,
            this.alerts,
            (alert) => this.onMarkerClick(alert)
        );
    }
}
