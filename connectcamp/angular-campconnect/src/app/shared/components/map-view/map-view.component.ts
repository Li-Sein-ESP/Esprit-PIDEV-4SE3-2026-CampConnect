import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, MapPin, ZoomIn, ZoomOut, Maximize2, Navigation } from 'lucide-angular';

export interface MapMarker {
    id: string;
    lat: number;
    lng: number;
    title: string;
    type: 'campsite';
    data?: any;
}

@Component({
    selector: 'app-map-view',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './map-view.component.html',
    styles: [`
    :host {
      display: block;
    }
  `]
})
export class MapViewComponent {
    @Input() markers: MapMarker[] = [];
    @Input() center: { lat: number; lng: number } = { lat: 34.7404, lng: 9.1025 }; // Tunisia center
    @Input() zoom: number = 7;
    @Input() hoveredMarkerId: string | null = null;
    @Input() selectedMarkerId: string | null = null;
    @Input() height: string = '400px';
    @Input() className: string = '';

    @Output() markerClick = new EventEmitter<MapMarker>();

    readonly MapPin = MapPin;
    readonly ZoomIn = ZoomIn;
    readonly ZoomOut = ZoomOut;
    readonly Maximize2 = Maximize2;
    readonly Navigation = Navigation;

    mapZoom: number;
    isFullscreen: boolean = false;

    constructor() {
        this.mapZoom = this.zoom;
    }

    // Convert lat/lng to pixel position (simplified)
    latLngToPixel(lat: number, lng: number): { x: string, y: string } {
        const scale = Math.pow(2, this.mapZoom) * 0.8;
        const x = ((lng - this.center.lng) * scale + 50) * 10 + 50;
        const y = ((this.center.lat - lat) * scale + 50) * 10 + 50;
        return { x: `${x}%`, y: `${y}%` };
    }

    onZoomIn() {
        this.mapZoom = Math.min(this.mapZoom + 1, 12);
    }

    onZoomOut() {
        this.mapZoom = Math.max(this.mapZoom - 1, 4);
    }

    onCenter() {
        // Reset to initial center logic if needed, or just emit
    }
}
