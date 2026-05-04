import { Component, NgZone, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DeliveryApiService, DeliveryResponse, DeliveryStatus } from '../services/delivery-api.service';
import { WebSocketService } from '../services/websocket.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as L from 'leaflet';

@Component({
    selector: 'app-delivery-tracking',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './delivery-tracking.component.html',
    styleUrls: ['./delivery-tracking.component.scss']
})
export class DeliveryTrackingComponent implements OnInit, OnDestroy {
    orderId: string = '';
    isMapHidden = false;
    private destroy$ = new Subject<void>();

    // ETA countdown
    etaHours = 0;
    etaMinutes = 23;
    etaSeconds = 47;
    etaInterval: any;

    delivery: any = {
        id: '',
        status: 'PENDING',
        estimatedArrival: 'Calculating...',
        distance: 0,
        weight: 0,
        vehicleType: 'System Assigning',
        provider: {
            name: 'Awaiting Driver',
            rating: 5.0
        },
        items: [],
        timeline: []
    };

    isVisible = false;
    loadingError: string | null = null;
    wsConnected = false;

    // Leaflet properties
    private map: L.Map | undefined;
    private routeLayer: L.Polyline | undefined;
    private warehouseLoc: [number, number] = [36.8525, 10.1885]; // Mock Base Warehouse

    constructor(
        private route: ActivatedRoute,
        private deliveryApi: DeliveryApiService,
        private webSocketService: WebSocketService,
        private zone: NgZone,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit() {
        this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
            this.orderId = params.get('orderId') || 'CC-48291';
            this.delivery.id = this.orderId;
            this.loadingError = null;

            // 1. Initial HTTP fetch to seed current state
            this.deliveryApi.getById(this.orderId).subscribe({
                next: (data) => this.applyUpdate(data),
                error: (err) => {
                    console.error('Failed to load delivery:', err);
                    this.loadingError = 'Failed to load delivery information.';
                }
            });
        });

        if (isPlatformBrowser(this.platformId)) {
            // 2. Connect WebSocket for real-time push updates
            this.webSocketService.connect();
            this.wsConnected = true;

            this.webSocketService.deliveryUpdates
                .pipe(takeUntil(this.destroy$))
                .subscribe((update: DeliveryResponse) => {
                    // Only process updates for the delivery we are tracking
                    if (update.id === this.orderId) {
                        this.applyUpdate(update);
                    }
                });

            // 3. Start ETA countdown and entry animations
            this.startCountdown();
            // Use zone.run so isVisible=true triggers change detection immediately
            setTimeout(() => this.zone.run(() => { this.isVisible = true; }), 50);
        }
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();

        if (this.wsConnected) {
            this.webSocketService.disconnect();
        }
        if (this.etaInterval) {
            clearInterval(this.etaInterval);
        }
    }

    /** Apply a delivery update to the local view model */
    private applyUpdate(data: DeliveryResponse): void {
        this.delivery.id = data.id;
        this.delivery.status = data.status;
        this.delivery.provider.name = data.driverName || 'Dispatch';
        this.delivery.vehicleType = data.vehicleId ? 'Vehicle ' + data.vehicleId : 'System Assigning';
        this.delivery.items = [
            { name: 'Ordered Gear', detail: 'Refer to your portal for full manifest', category: 'bag' }
        ];

        this.updateTimeline(data);

        // Stop countdown when delivered
        if (data.status === 'DELIVERED') {
            this.etaHours = 0;
            this.etaMinutes = 0;
            this.etaSeconds = 0;
            if (this.etaInterval) clearInterval(this.etaInterval);
        }

        // Trigger map update if coordinates are present
        if (data.customerLat && data.customerLng && isPlatformBrowser(this.platformId)) {
            this.fetchRealRouteEstimate(data.customerLat, data.customerLng);
        }
    }

    private fetchRealRouteEstimate(custLat: number, custLng: number) {
        this.deliveryApi.estimateRoute(
            this.warehouseLoc[0], this.warehouseLoc[1],
            custLat, custLng
        ).subscribe({
            next: (res) => {
                this.delivery.distance = res.distanceKm.toFixed(1);
                
                // Convert durationMinutes to hours and minutes
                const totalMinutes = Math.round(res.durationMinutes);
                this.etaHours = Math.floor(totalMinutes / 60);
                this.etaMinutes = totalMinutes % 60;
                this.etaSeconds = 45; // arbitrary seconds start
                this.delivery.estimatedArrival = `${totalMinutes} minutes`;
                
                // Render the real map
                if (this.map) {
                    this.map.remove(); // Reset map if it existed
                }
                this.initLeafletMap(custLat, custLng, res.geometryRaw);
            },
            error: (err) => console.error("Failed to estimate route", err)
        });
    }

    private initLeafletMap(custLat: number, custLng: number, geojsonCoords: number[][]) {
        setTimeout(() => {
            const container = document.getElementById('tracking-leaflet-map');
            if (!container) return;

            this.map = L.map('tracking-leaflet-map').setView(this.warehouseLoc, 10);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(this.map);

            // Add markers
            const warehouseIcon = L.icon({
                iconUrl: 'assets/images/warehouse-pin.png', 
                iconSize: [32, 32],
                className: 'fallback-icon'
            });
            const custIcon = L.icon({
                iconUrl: 'assets/images/customer-pin.png',
                iconSize: [32, 32],
                className: 'fallback-icon'
            });

            L.marker(this.warehouseLoc).addTo(this.map).bindPopup('Warehouse').openPopup();
            L.marker([custLat, custLng]).addTo(this.map).bindPopup('Your Location');

            if (geojsonCoords && geojsonCoords.length > 0) {
                // GeoJSON coordinates are [lng, lat], Leaflet wants [lat, lng]
                const latLngs: L.LatLngTuple[] = geojsonCoords.map(c => [c[1], c[0]]);
                this.routeLayer = L.polyline(latLngs, { color: '#059669', weight: 4, dashArray: '5, 10' }).addTo(this.map);
                this.map.fitBounds(this.routeLayer.getBounds(), { padding: [50, 50] });
            }
        }, 100);
    }

    updateTimeline(data: DeliveryResponse) {
        const statuses = ['CREATED', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'];
        let currentIndex = statuses.indexOf(data.status);
        if (currentIndex === -1) currentIndex = 0;

        this.delivery.timeline = [
            { label: 'Confirmed', time: 'Done', completed: currentIndex >= 0 },
            { label: 'Assigned', time: currentIndex >= 1 ? 'Done' : 'Pending', completed: currentIndex >= 1 },
            { label: 'Picked Up', time: currentIndex >= 2 ? 'Done' : 'Pending', completed: currentIndex >= 2 },
            { label: 'On the Way', time: currentIndex >= 3 ? 'Now' : 'Upcoming', completed: currentIndex >= 3 },
            { label: 'Delivered', time: data.status === 'DELIVERED' ? 'Complete' : 'Pending', completed: data.status === 'DELIVERED' }
        ];
    }

    startCountdown() {
        // Run the interval OUTSIDE zone to avoid triggering CD on every tick,
        // then re-enter zone only when we update the countdown values.
        this.zone.runOutsideAngular(() => {
            this.etaInterval = setInterval(() => {
                this.zone.run(() => {
                    if (this.etaSeconds > 0) {
                        this.etaSeconds--;
                    } else {
                        this.etaSeconds = 59;
                        if (this.etaMinutes > 0) {
                            this.etaMinutes--;
                        } else {
                            if (this.etaHours > 0) {
                                this.etaHours--;
                                this.etaMinutes = 59;
                            } else {
                                this.etaMinutes = 23;
                            }
                        }
                    }
                });
            }, 1000);
        });
    }

    toggleMap() {
        this.isMapHidden = !this.isMapHidden;
    }

    padZero(num: number): string {
        return num < 10 ? '0' + num : num.toString();
    }

    get progressWidth(): string {
        const totalSteps = this.delivery.timeline.length;
        let completedSteps = 0;
        let activeFound = false;

        for (const step of this.delivery.timeline) {
            if (step.completed) {
                completedSteps++;
            } else if (!activeFound) {
                completedSteps += 0.5;
                activeFound = true;
            }
        }

        return ((completedSteps / (totalSteps - 1)) * 100) + '%';
    }
}

