import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DeliveryApiService, DeliveryResponse } from '../services/delivery-api.service';
import { VehicleApiService, VehicleResponse } from '../services/vehicle-api.service';
import { WebSocketService } from '../services/websocket.service';
import { ToastService } from '../../../shared/services/toast.service';
import { WarehouseApiService } from '../services/warehouse-api.service';

@Component({
    selector: 'app-delivery-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './delivery-dashboard.component.html',
    styleUrls: ['./delivery-dashboard.component.scss']
})
export class DeliveryDashboardComponent implements OnInit, OnDestroy {
    isSidebarOpen = false;
    loading = true;
    error: string | null = null;
    private destroy$ = new Subject<void>();

    deliveries: DeliveryResponse[] = [];
    vehicles: VehicleResponse[] = [];
    selectedVehicles: { [deliveryId: string]: string } = {};
    warehouseNames: { [id: string]: string } = {};

    get activeDeliveries(): DeliveryResponse[] {
        return this.deliveries.filter(d =>
            d.status === 'ASSIGNED' || d.status === 'PICKED_UP' || d.status === 'IN_TRANSIT'
        );
    }

    get pendingDeliveries(): DeliveryResponse[] {
        return this.deliveries.filter(d => d.status === 'CREATED' || d.status === 'PENDING');
    }

    get completedDeliveries(): DeliveryResponse[] {
        return this.deliveries.filter(d => d.status === 'DELIVERED');
    }

    constructor(
        private deliveryApi: DeliveryApiService,
        private vehicleApi: VehicleApiService,
        private webSocketService: WebSocketService,
        private toastService: ToastService,
        private warehouseApi: WarehouseApiService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadDeliveries();
        this.loadVehicles();

        // Subscribe to real-time WebSocket updates
        this.webSocketService.connect();
        this.webSocketService.deliveryUpdates
            .pipe(takeUntil(this.destroy$))
            .subscribe((updated: DeliveryResponse) => {
                const idx = this.deliveries.findIndex(d => d.id === updated.id);
                if (idx !== -1) {
                    this.deliveries[idx] = updated;
                    if (updated.vehicleId) {
                        this.selectedVehicles[updated.id] = updated.vehicleId;
                    }
                }
                this.cdr.detectChanges();
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.webSocketService.disconnect();
    }

    loadDeliveries(): void {
        this.loading = true;
        this.error = null;
        this.deliveryApi.getMyDeliveries(0, 50).subscribe({
            next: (page) => {
                this.deliveries = page.content;
                this.loading = false;
                this.resolveWarehouseNames();
                // Initialize selection
                this.deliveries.forEach(d => {
                    if (d.vehicleId) {
                        this.selectedVehicles[d.id] = d.vehicleId;
                    }
                });
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.loading = false;
                this.error = 'Failed to load deliveries';
                this.cdr.detectChanges();
            }
        });
    }

    resolveWarehouseNames(): void {
        const ids = Array.from(new Set(this.deliveries.map(d => d.warehouseId).filter((v): v is string => !!v)));
        ids.forEach(id => {
            if (!this.warehouseNames[id]) {
                this.warehouseApi.getById(id).subscribe({
                    next: (w) => { this.warehouseNames[id] = w.name; this.cdr.detectChanges(); },
                    error: () => { this.warehouseNames[id] = id; this.cdr.detectChanges(); }
                });
            }
        });
    }

    loadVehicles(): void {
        this.vehicleApi.getAll('AVAILABLE', 0, 50).subscribe({
            next: (page) => {
                this.vehicles = page.content;
                this.cdr.detectChanges();
            },
            error: () => {}
        });
    }

    updateStatus(id: string, status: 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED'): void {
        const vehicleId = this.selectedVehicles[id];
        if (status === 'ASSIGNED' && !vehicleId) {
            this.toastService.error('Please select a vehicle before assigning.');
            return;
        }

        this.deliveryApi.updateStatus(id, status, status === 'ASSIGNED' ? vehicleId : undefined).subscribe({
            next: (updated) => {
                const idx = this.deliveries.findIndex(d => d.id === id);
                if (idx !== -1) {
                    this.deliveries[idx] = updated;
                    if (updated.vehicleId) {
                        this.selectedVehicles[updated.id] = updated.vehicleId;
                    }
                }
                this.toastService.success('Delivery status updated to ' + status.replace('_', ' '));
                this.cdr.detectChanges();
            },
            error: () => {
                this.toastService.error('Failed to update delivery status.');
                this.cdr.detectChanges();
            }
        });
    }

    toggleSidebar(): void {
        this.isSidebarOpen = !this.isSidebarOpen;
    }
}
