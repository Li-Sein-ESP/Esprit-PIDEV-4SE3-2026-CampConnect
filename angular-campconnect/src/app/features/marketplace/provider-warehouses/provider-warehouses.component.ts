import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MapPickerComponent } from '../../../shared/components/map-picker/map-picker.component';
import { WarehouseApiService, WarehouseRequest, WarehouseResponse } from '../../delivery/services/warehouse-api.service';
import { GearInventoryApiService } from '../../gear/services/inventory-api.service';

@Component({
    selector: 'app-provider-warehouses',
    standalone: true,
    imports: [CommonModule, FormsModule, MapPickerComponent],
    templateUrl: './provider-warehouses.component.html',
    styleUrls: ['./provider-warehouses.component.scss']
})
export class ProviderWarehousesComponent implements OnInit {
    warehouses: WarehouseResponse[] = [];
    inventoryCountByWarehouse: Record<string, number> = {};

    showModal = false;
    editingId?: string;
    form: WarehouseRequest = { name: '', address: '', latitude: 36.8, longitude: 10.18 };

    constructor(
        private warehouseApi: WarehouseApiService,
        private inventoryApi: GearInventoryApiService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.load();
    }

    load(): void {
        this.warehouseApi.getMine().subscribe({
            next: (rows) => {
                this.warehouses = rows;
                this.cdr.detectChanges();
                rows.forEach((w) => {
                    this.inventoryApi.getByWarehouse(w.id).subscribe({
                        next: (inv) => {
                            this.inventoryCountByWarehouse[w.id] = inv.length;
                            this.cdr.detectChanges();
                        },
                        error: () => {
                            this.inventoryCountByWarehouse[w.id] = 0;
                            this.cdr.detectChanges();
                        }
                    });
                });
            },
            error: () => {
                this.cdr.detectChanges();
            }
        });
    }

    openCreate(): void {
        this.editingId = undefined;
        this.form = { name: '', address: '', latitude: 36.8, longitude: 10.18 };
        this.showModal = true;
    }

    openEdit(w: WarehouseResponse): void {
        this.editingId = w.id;
        this.form = {
            name: w.name,
            address: w.address,
            latitude: w.latitude,
            longitude: w.longitude
        };
        this.showModal = true;
    }

    save(): void {
        const call$ = this.editingId
            ? this.warehouseApi.update(this.editingId, this.form)
            : this.warehouseApi.create(this.form);
        call$.subscribe({
            next: () => {
                this.showModal = false;
                this.load();
                this.cdr.detectChanges();
            },
            error: () => {
                this.cdr.detectChanges();
            }
        });
    }

    remove(id: string): void {
        if (!confirm('Delete warehouse?')) {
            return;
        }
        this.warehouseApi.delete(id).subscribe({
            next: () => {
                this.load();
                this.cdr.detectChanges();
            },
            error: () => {
                this.cdr.detectChanges();
            }
        });
    }

    onMapPicked(loc: { lat: number; lng: number } | null): void {
        if (!loc) {
            return;
        }
        this.form.latitude = loc.lat;
        this.form.longitude = loc.lng;
    }
}
