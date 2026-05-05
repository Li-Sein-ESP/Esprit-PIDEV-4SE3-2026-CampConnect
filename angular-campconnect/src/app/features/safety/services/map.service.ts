import { Injectable } from '@angular/core';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { map as rxMap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { SafetyAlert } from '../models/safety.model';

@Injectable({
    providedIn: 'root'
})
export class MapService {
    private readonly API_KEY = environment.mapsApiKey;

    constructor(private http: HttpClient) {}

    /** Maps alert severity → Leaflet marker color */
    getRiskColor(severity: string): string {
        switch (severity) {
            case 'info': return 'green';
            case 'warning': return 'orange';
            case 'danger': return 'red';
            case 'critical': return 'darkred';
            default: return 'blue';
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
    initMap(elementId: string, center: [number, number] = [33.8869, 9.5375], zoom: number = 6): L.Map {
        const map = L.map(elementId, {
            center: center,
            zoom: zoom,
            zoomControl: true
        });

        // Fallback to standard OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);

        // Force Leaflet to recalculate the container size
        setTimeout(() => {
            map.invalidateSize();
        }, 200);

        return map;
    }

    /** Geocode a location string to coordinates using Nominatim (OpenStreetMap) */
    geocode(query: string) {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
        return this.http.get<any[]>(url).pipe(
            rxMap(results => {
                if (results && results.length > 0) {
                    return {
                        lat: parseFloat(results[0].lat),
                        lng: parseFloat(results[0].lon),
                        displayName: results[0].display_name
                    };
                }
                return null;
            })
        );
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
