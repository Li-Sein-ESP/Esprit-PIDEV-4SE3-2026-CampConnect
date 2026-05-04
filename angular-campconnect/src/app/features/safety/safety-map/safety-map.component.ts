import {
    Component,
    OnInit,
    OnDestroy,
    AfterViewInit,
    ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as L from 'leaflet';
import { Subscription } from 'rxjs';
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
    private routeSub?: Subscription;
    private focusCoordinates: { lat: number; lng: number } | null = null;
    private focusTitle = 'Selected incident';
    private routeFocusMarker: L.CircleMarker | null = null;

    selectedAlert: SafetyAlert | null = null;
    activeFilter = 'all';
    filteredAlerts: SafetyAlert[] = [];

    // Full mock alert dataset (includes coordinates for map markers)
    alerts: SafetyAlert[] = [
        {
            id: 'SA-001',
            type: 'weather',
            severity: 'danger',
            title: 'Alerte Inondations - Aïn Draham',
            description: 'Fortes pluies attendues dans les hauteurs de Jendouba. Risque de crues subites dans les oueds environnants.',
            location: { name: 'Aïn Draham', region: 'Jendouba', coordinates: { lat: 36.7788, lng: 8.6877 } },
            affectedAreas: ['Oued El Kebir', 'Forêts de Kroumirie'],
            startDate: '2026-03-01T08:00:00Z',
            source: 'INM (Institut National de la Météorologie)',
            updatedAt: '2026-03-01T10:15:00Z',
            active: true
        },
        {
            id: 'SA-002',
            type: 'wildlife',
            severity: 'warning',
            title: 'Activité Sangliers - Parc Ichkeul',
            description: 'Augmentation des rencontres avec des sangliers près des zones de campement. Gardez vos distances et sécurisez la nourriture.',
            location: { name: 'Parc National de l\'Ichkeul', region: 'Bizerte', coordinates: { lat: 37.1500, lng: 9.6667 } },
            affectedAreas: ['Sentier de la Montagne', 'Zones de Pique-nique'],
            startDate: '2026-02-28T14:00:00Z',
            source: 'Direction Générale des Forêts',
            updatedAt: '2026-03-01T07:30:00Z',
            active: true
        },
        {
            id: 'SA-003',
            type: 'fire',
            severity: 'critical',
            title: 'Risque Incendie Élevé - Zaghouan',
            description: 'Canicule intense et vents forts. Interdiction totale d\'allumer des feux de camp dans toute la zone forestière de Jebel Zaghouan.',
            location: { name: 'Jebel Zaghouan', region: 'Zaghouan', coordinates: { lat: 36.4025, lng: 10.1433 } },
            affectedAreas: ['Temple des Eaux', 'Sidi Medien'],
            startDate: '2026-03-01T11:45:00Z',
            source: 'Protection Civile Tunisienne',
            updatedAt: '2026-03-01T12:00:00Z',
            active: true
        },
        {
            id: 'SA-004',
            type: 'closure',
            severity: 'warning',
            title: 'Sentier Fermé - Boukornine',
            description: 'Maintenance des sentiers suite à des éboulements. Accès interdit au sommet jusqu\'à nouvel ordre.',
            location: { name: 'Parc National de Boukornine', region: 'Ben Arous', coordinates: { lat: 36.7050, lng: 10.3390 } },
            affectedAreas: ['Sommet 576m', 'Sentier des Eucalyptus'],
            startDate: '2026-02-25T08:00:00Z',
            endDate: '2026-03-15T18:00:00Z',
            source: 'Municipalité de Hammam Lif',
            updatedAt: '2026-02-28T12:00:00Z',
            active: true
        },
        {
            id: 'SA-005',
            type: 'weather',
            severity: 'info',
            title: 'Brouillard Dense - Col de Tabarka',
            description: 'Visibilité réduite sur la route vers Tabarka. Prudence conseillée pour les campeurs arrivant de nuit.',
            location: { name: 'Tabarka', region: 'Jendouba', coordinates: { lat: 36.9544, lng: 8.7514 } },
            affectedAreas: ['Route GP7', 'Les Aiguilles'],
            startDate: '2026-03-01T18:00:00Z',
            source: 'Garde Nationale',
            updatedAt: '2026-03-01T09:00:00Z',
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
        private route: ActivatedRoute,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.applyFilter('all');
        this.routeSub = this.route.queryParams.subscribe(params => {
            const lat = Number(params['lat']);
            const lng = Number(params['lng']);

            if (Number.isFinite(lat) && Number.isFinite(lng)) {
                this.focusCoordinates = { lat, lng };
                this.focusTitle = (params['title'] || 'Selected incident').toString();
                this.applyRouteFocus();
            }
        });
    }

    ngAfterViewInit(): void {
        // Wait for the flex layout to stabilize then initialize Leaflet
        setTimeout(() => {
            this.map = this.mapService.initMap('safety-map-container');
            this.renderMarkers();
            this.applyRouteFocus();
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
        this.routeSub?.unsubscribe();
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

    private applyRouteFocus(): void {
        if (!this.map || !this.focusCoordinates) {
            return;
        }

        if (this.routeFocusMarker) {
            this.routeFocusMarker.removeFrom(this.map);
        }

        this.routeFocusMarker = L.circleMarker(
            [this.focusCoordinates.lat, this.focusCoordinates.lng],
            {
                radius: 9,
                color: '#1d4ed8',
                fillColor: '#3b82f6',
                fillOpacity: 0.85,
                weight: 2
            }
        ).addTo(this.map);

        this.routeFocusMarker.bindPopup(this.focusTitle).openPopup();
        this.map.flyTo(
            [this.focusCoordinates.lat, this.focusCoordinates.lng],
            11,
            { animate: true, duration: 0.8 }
        );
    }
}
