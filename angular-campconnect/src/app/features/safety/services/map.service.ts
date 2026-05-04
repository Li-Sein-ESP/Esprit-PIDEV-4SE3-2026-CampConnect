import { Injectable } from '@angular/core';
import * as L from 'leaflet';
import { SafetyAlert } from '../models/safety.model';

@Injectable({
    providedIn: 'root'
})
export class MapService {

    /** Maps alert severity → Leaflet marker color */
    getRiskColor(severity: string): string {
        switch (severity) {
            case 'info': return '#2e7d32';
            case 'warning': return '#f9a825';
            case 'danger': return '#ef6c00';
            case 'critical': return '#c62828';
            default: return '#546e7a';
        }
    }

    /** Maps severity to display label used in the legend / design */
    getRiskLabel(severity: string): string {
        switch (severity) {
            case 'info': return 'Low';
            case 'warning': return 'Medium';
            case 'danger': return 'High';
            case 'critical': return 'Critical';
            default: return severity;
        }
    }

    /** Initialize a Leaflet map inside the given HTML element id */
    initMap(elementId: string): L.Map {
        const map = L.map(elementId, {
            center: [34.0, 9.0],
            zoom: 6,
            zoomControl: true
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18
        }).addTo(map);

        // Force Leaflet to recalculate the container size, then refresh the view
        setTimeout(() => {
            map.invalidateSize(true);
            map.setView([34.0, 9.0], 6);
        }, 400);

        return map;
    }

    /** Create and add color-coded markers for each alert that has coordinates */
    addMarkers(
        map: L.Map,
        alerts: SafetyAlert[],
        onMarkerClick: (alert: SafetyAlert) => void
    ): L.Marker[] {
        const markers: L.Marker[] = [];

        alerts.forEach(alert => {
            if (!alert.location.coordinates) return;

            const color = this.getRiskColor(alert.severity);
            const icon = this.createColoredIcon(color);

            const marker = L.marker(
                [alert.location.coordinates.lat, alert.location.coordinates.lng],
                { icon }
            )
                .addTo(map)
                .bindTooltip(alert.title, { permanent: false, direction: 'top' });

            marker.on('click', () => onMarkerClick(alert));
            markers.push(marker);
        });

        return markers;
    }

    /** Pan and zoom the map to the given alert's coordinates */
    focusOnAlert(map: L.Map, alert: SafetyAlert): void {
        if (!alert.location.coordinates) return;
        map.flyTo(
            [alert.location.coordinates.lat, alert.location.coordinates.lng],
            9,
            { animate: true, duration: 0.8 }
        );
    }

    /** Remove all provided markers from the map */
    clearMarkers(map: L.Map, markers: L.Marker[]): void {
        markers.forEach(m => m.removeFrom(map));
    }

    // ---------------------------------------------------------------------------
    // Private helpers
    // ---------------------------------------------------------------------------

    private createColoredIcon(color: string): L.DivIcon {
        return L.divIcon({
            className: '',
            html: `
        <div style="
          width: 28px;
          height: 28px;
          background: ${color};
          border: 2.5px solid #fff;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        "></div>
      `,
            iconSize: [28, 28],
            iconAnchor: [14, 28],
            popupAnchor: [0, -30]
        });
    }
}
