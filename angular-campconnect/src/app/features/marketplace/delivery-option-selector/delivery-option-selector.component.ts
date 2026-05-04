import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WarehousePickerComponent } from '../../../shared/components/warehouse-picker/warehouse-picker.component';

export type CheckoutDeliveryMethod = 'DELIVERY' | 'PICKUP';
export type CheckoutDeliveryType = 'EXPRESS' | 'NORMAL';

export interface CheckoutRequest {
    deliveryMethod: CheckoutDeliveryMethod;
    deliveryType?: CheckoutDeliveryType;
    deliveryAddress?: string;
    customerLat?: number;
    customerLng?: number;
    pickupWarehouseId?: string;
}

@Component({
    selector: 'app-delivery-option-selector',
    standalone: true,
    imports: [CommonModule, FormsModule, WarehousePickerComponent],
    templateUrl: './delivery-option-selector.component.html',
    styleUrls: ['./delivery-option-selector.component.scss']
})
export class DeliveryOptionSelectorComponent {
    @Input() gearIdForPickup = '';
    @Input() quantityForPickup = 1;
    @Input() customerLat?: number;
    @Input() customerLng?: number;

    @Output() selectionChange = new EventEmitter<CheckoutRequest>();

    method: CheckoutDeliveryMethod = 'DELIVERY';
    type: CheckoutDeliveryType = 'EXPRESS';
    deliveryAddress = '';
    pickupWarehouseId?: string;

    emit(): void {
        const payload: CheckoutRequest = {
            deliveryMethod: this.method,
            deliveryType: this.method === 'DELIVERY' ? this.type : undefined,
            deliveryAddress: this.method === 'DELIVERY' ? this.deliveryAddress : undefined,
            customerLat: this.customerLat,
            customerLng: this.customerLng,
            pickupWarehouseId: this.method === 'PICKUP' ? this.pickupWarehouseId : undefined
        };
        this.selectionChange.emit(payload);
    }

    onWarehouseSelected(id: string): void {
        this.pickupWarehouseId = id;
        this.emit();
    }
}
