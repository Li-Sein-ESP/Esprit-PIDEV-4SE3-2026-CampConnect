import { Component, AfterViewInit, Output, EventEmitter, Input, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

// Fix for Leaflet's default icon missing issue in webpack
const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-map-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-picker-container rounded-xl overflow-hidden border border-stone-200">
      <div #mapElement class="w-full h-[400px]"></div>
      <div class="bg-stone-50 p-3 flex justify-between items-center text-sm">
        <span class="text-stone-600">
          <ng-container *ngIf="selectedLat && selectedLng">
            Selected: {{ selectedLat.toFixed(4) }}, {{ selectedLng.toFixed(4) }}
          </ng-container>
          <ng-container *ngIf="!selectedLat">
            Click on the map to set a location
          </ng-container>
        </span>
        <button *ngIf="selectedLat" (click)="clearSelection()" class="text-red-500 hover:text-red-700 text-xs font-medium">
          Clear
        </button>
      </div>
    </div>
  `,
  styles: [`
    .map-picker-container { position: relative; z-index: 10; }
  `]
})
export class MapPickerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapElement', { static: true }) mapElement!: ElementRef;
  
  @Input() initialLat?: number;
  @Input() initialLng?: number;
  @Input() readonly = false;
  
  @Output() locationSelected = new EventEmitter<{lat: number, lng: number} | null>();

  private map!: L.Map;
  private marker: L.Marker | null = null;
  
  selectedLat?: number;
  selectedLng?: number;

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    // Default center to Tunisia
    const centerLat = this.initialLat || 33.8869;
    const centerLng = this.initialLng || 9.5375;
    const zoom = this.initialLat ? 12 : 6;

    this.map = L.map(this.mapElement.nativeElement).setView([centerLat, centerLng], zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Initial marker if provided
    if (this.initialLat && this.initialLng) {
      this.setMarker(this.initialLat, this.initialLng);
    }

    if (!this.readonly) {
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        this.setMarker(e.latlng.lat, e.latlng.lng);
        this.locationSelected.emit({ lat: e.latlng.lat, lng: e.latlng.lng });
      });
    }

    // Fix map rendering issues when placed in tabs or hidden containers
    setTimeout(() => {
      this.map.invalidateSize();
    }, 200);
  }

  private setMarker(lat: number, lng: number): void {
    this.selectedLat = lat;
    this.selectedLng = lng;
    
    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      this.marker = L.marker([lat, lng]).addTo(this.map);
    }
  }

  clearSelection(): void {
    if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = null;
    }
    this.selectedLat = undefined;
    this.selectedLng = undefined;
    this.locationSelected.emit(null);
  }
}
