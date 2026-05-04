import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

export interface Pitch {
  id: string;
  name: string;
  x: number;
  y: number;
  spatialMultiplier: number;
  finalPrice: number;
  status: string;
}

export interface SpatialMap {
  campsiteId: string;
  baseDynamicPrice: number;
  regionType: string;
  waterFeatureName: string;
  lakeX: number;
  lakeY: number;
  toiletX: number;
  toiletY: number;
  entranceX: number;
  entranceY: number;
  pitches: Pitch[];
}

@Component({
  selector: 'app-spatial-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spatial-map.html',
  styleUrls: ['./spatial-map.css']
})
export class SpatialMapComponent implements OnInit, OnChanges {
  @Input() campsiteId!: string;
  
  spatialMap: SpatialMap | null = null;
  loading = false;
  error = '';
  selectedPitch: Pitch | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    if (this.campsiteId) {
      this.loadSpatialMap();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['campsiteId'] && !changes['campsiteId'].firstChange) {
      this.loadSpatialMap();
    }
  }

  loadSpatialMap(): void {
    this.loading = true;
    this.error = '';
    this.selectedPitch = null;
    
    this.http.get<SpatialMap>(`http://localhost:8090/api/pricing/${this.campsiteId}/spatial-map`)
      .subscribe({
        next: (data) => {
          this.spatialMap = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load spatial map', err);
          this.error = 'Impossible de charger la carte interactive.';
          this.loading = false;
        }
      });
  }

  selectPitch(pitch: Pitch): void {
    this.selectedPitch = pitch;
  }
}
