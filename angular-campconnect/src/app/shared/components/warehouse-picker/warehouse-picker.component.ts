import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GearInventoryApiService, GearInventoryResponse } from '../../../features/gear/services/inventory-api.service';

@Component({
    selector: 'app-warehouse-picker',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './warehouse-picker.component.html',
    styleUrls: ['./warehouse-picker.component.scss']
})
export class WarehousePickerComponent implements OnChanges {
    @Input() gearId = '';
    @Input() quantity = 1;
    @Input() customerLat?: number;
    @Input() customerLng?: number;

    @Output() selectedWarehouseId = new EventEmitter<string>();

    warehouses: GearInventoryResponse[] = [];
    loading = false;
    selectedId?: string;

    constructor(private inventoryApi: GearInventoryApiService) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (
            (changes['gearId'] || changes['quantity'] || changes['customerLat'] || changes['customerLng']) &&
            this.gearId &&
            this.customerLat != null &&
            this.customerLng != null
        ) {
            this.fetch();
        }
    }

    fetch(): void {
        this.loading = true;
        this.inventoryApi.getAvailableWarehouses(this.gearId, this.customerLat!, this.customerLng!, this.quantity).subscribe({
            next: (rows) => {
                this.warehouses = rows;
                this.loading = false;
                if (rows.length > 0 && !this.selectedId) {
                    this.select(rows[0].warehouseId);
                }
            },
            error: () => {
                this.warehouses = [];
                this.loading = false;
            }
        });
    }

    select(id: string): void {
        this.selectedId = id;
        this.selectedWarehouseId.emit(id);
    }
}
