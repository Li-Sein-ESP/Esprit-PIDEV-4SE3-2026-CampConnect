import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-radar-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './radar-chart.html',
  styleUrl: './radar-chart.css'
})
export class RadarChart implements OnChanges {
  // Expected to be an array of 5 numbers between 1 and 10
  @Input() userStats: number[] = [5, 5, 5, 5, 5];
  @Input() matchStats: number[] = [8, 2, 9, 6, 4];

  labels = ['Pace', 'Social', 'Preparedness', 'Nature', 'Gear Share'];

  // SVG Configuration
  viewBoxSize = 300;
  center = 150;
  maxRadius = 100;

  userPoints: string = '';
  matchPoints: string = '';

  ngOnChanges(changes: SimpleChanges) {
    this.calculatePoints();
  }

  // Calculate the (x,y) coordinates for a given value on one of the 5 axes
  getCoordinatesForValue(value: number, axisIndex: number, totalAxes: number): { x: number, y: number } {
    // Math: angle in radians. Start at -pi/2 (straight up/12 o'clock)
    const angle = (Math.PI * 2 * axisIndex) / totalAxes - (Math.PI / 2);
    // Value is 1-10, scale it to the maxRadius
    const radius = (value / 10) * this.maxRadius;

    return {
      x: this.center + radius * Math.cos(angle),
      y: this.center + radius * Math.sin(angle)
    };
  }

  calculatePoints() {
    // Generate polygon string for User
    this.userPoints = this.userStats.map((val, i) => {
      const p = this.getCoordinatesForValue(val, i, 5);
      return String(p.x) + ',' + String(p.y);
    }).join(' ');

    // Generate polygon string for Match
    this.matchPoints = this.matchStats.map((val, i) => {
      const p = this.getCoordinatesForValue(val, i, 5);
      return String(p.x) + ',' + String(p.y);
    }).join(' ');
  }

  // Helper for generating the background grid rings (e.g., ring at 2, 4, 6, 8, 10)
  getGridRingPoints(level: number): string {
    const points = [];
    for (let i = 0; i < 5; i++) {
      const p = this.getCoordinatesForValue(level, i, 5);
      points.push(String(p.x) + ',' + String(p.y));
    }
    return points.join(' ');
  }

  // Helper to place text labels at the outer edge
  getLabelCoordinates(index: number): { x: number, y: number } {
    // Push labels slightly outside the maxRadius (e.g., radius of 120)
    const angle = (Math.PI * 2 * index) / 5 - (Math.PI / 2);
    const radius = this.maxRadius + 25;
    return {
      x: this.center + radius * Math.cos(angle),
      y: this.center + radius * Math.sin(angle)
    };
  }
}
