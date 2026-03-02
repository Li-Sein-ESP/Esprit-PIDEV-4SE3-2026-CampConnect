import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

export interface Vehicle {
    id: string;
    type: 'MOTORCYCLE' | 'VAN' | '4X4';
    maxWeight: number;
    maxVolume: number;
    fuelType: string;
    status: 'AVAILABLE' | 'BUSY' | 'MAINTENANCE';
    assignedDeliveries: number;
}

@Component({
    selector: 'app-delivery-vehicles',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './delivery-vehicles.component.html',
    styleUrls: ['./delivery-vehicles.component.scss']
})
export class DeliveryVehiclesComponent implements OnInit {
    // Original mock data formatted to match requested schema exactly
    vehicles: Vehicle[] = [
        { id: 'VEH-001', type: 'MOTORCYCLE', maxWeight: 80, maxVolume: 35, fuelType: 'gasoline', status: 'AVAILABLE', assignedDeliveries: 24 },
        { id: 'VEH-002', type: 'MOTORCYCLE', maxWeight: 100, maxVolume: 45, fuelType: 'gasoline', status: 'AVAILABLE', assignedDeliveries: 18 },
        { id: 'VEH-003', type: 'VAN', maxWeight: 800, maxVolume: 350, fuelType: 'diesel', status: 'BUSY', assignedDeliveries: 42 },
        { id: 'VEH-004', type: '4X4', maxWeight: 650, maxVolume: 280, fuelType: 'diesel', status: 'AVAILABLE', assignedDeliveries: 31 },
        { id: 'VEH-005', type: 'MOTORCYCLE', maxWeight: 75, maxVolume: 30, fuelType: 'electric', status: 'MAINTENANCE', assignedDeliveries: 12 },
        { id: 'VEH-006', type: 'VAN', maxWeight: 750, maxVolume: 320, fuelType: 'diesel', status: 'AVAILABLE', assignedDeliveries: 56 },
        { id: 'VEH-007', type: '4X4', maxWeight: 600, maxVolume: 250, fuelType: 'gasoline', status: 'BUSY', assignedDeliveries: 28 },
        { id: 'VEH-008', type: 'MOTORCYCLE', maxWeight: 90, maxVolume: 40, fuelType: 'gasoline', status: 'AVAILABLE', assignedDeliveries: 37 }
    ];

    isModalOpen = false;
    isEditing = false;
    currentVehicleId: string | null = null;
    vehicleForm: FormGroup;
    isAdmin = false;

    // New vehicles stats tracking
    totalVehiclesAddedThisMonth = 2; // static mock to mimic design

    constructor(private fb: FormBuilder, private authService: AuthService) {
        this.vehicleForm = this.fb.group({
            type: ['', Validators.required],
            maxWeight: ['', [Validators.required, Validators.min(1)]],
            maxVolume: ['', [Validators.required, Validators.min(1)]],
            fuelType: ['', Validators.required],
            isAvailable: [true]
        });
    }

    ngOnInit(): void {
        this.isAdmin = this.authService.hasRole('ROLE_ADMIN');
    }

    // --- STATS ---

    get totalVehicles(): number {
        return this.vehicles.length;
    }

    get availableVehicles(): number {
        return this.vehicles.filter(v => v.status === 'AVAILABLE').length;
    }

    get inUseVehicles(): number {
        return this.vehicles.filter(v => v.status === 'BUSY').length;
    }

    get totalCapacity(): number {
        return this.vehicles.reduce((sum, v) => sum + v.maxWeight, 0);
    }

    // --- ACTIONS ---

    openModal(vehicle?: Vehicle): void {
        if (vehicle) {
            this.isEditing = true;
            this.currentVehicleId = vehicle.id;
            this.vehicleForm.patchValue({
                type: vehicle.type,
                maxWeight: vehicle.maxWeight,
                maxVolume: vehicle.maxVolume,
                fuelType: vehicle.fuelType,
                isAvailable: vehicle.status === 'AVAILABLE'
            });
        } else {
            this.isEditing = false;
            this.currentVehicleId = null;
            this.vehicleForm.reset({ isAvailable: true, type: '', fuelType: '' });
        }
        this.isModalOpen = true;
    }

    closeModal(): void {
        this.isModalOpen = false;
        this.isEditing = false;
        this.currentVehicleId = null;
    }

    toggleAvailability(field?: string): void {
        if (field === 'form') {
            const currentValue = this.vehicleForm.get('isAvailable')?.value;
            this.vehicleForm.patchValue({ isAvailable: !currentValue });
        }
    }

    toggleVehicleAvailability(id: string): void {
        const v = this.vehicles.find(v => v.id === id);
        if (v && v.status !== 'MAINTENANCE') {
            v.status = v.status === 'AVAILABLE' ? 'BUSY' : 'AVAILABLE';
        } else if (v && v.status === 'MAINTENANCE') {
            alert("Cannot switch status directly. Vehicle is in Maintenance.");
        }
    }

    deleteVehicle(id: string): void {
        if (confirm(`Are you sure you want to delete vehicle ${id}?`)) {
            this.vehicles = this.vehicles.filter(v => v.id !== id);
        }
    }

    saveVehicle(): void {
        if (this.vehicleForm.invalid) return;

        const vData = this.vehicleForm.value;
        const newVehicle: Vehicle = {
            id: this.isEditing && this.currentVehicleId ? this.currentVehicleId : `VEH-${String(this.vehicles.length + 1).padStart(3, '0')}`,
            type: vData.type as any,
            maxWeight: Number(vData.maxWeight),
            maxVolume: Number(vData.maxVolume),
            fuelType: vData.fuelType,
            status: vData.isAvailable ? 'AVAILABLE' : 'BUSY',
            assignedDeliveries: this.isEditing ? (this.vehicles.find(v => v.id === this.currentVehicleId)?.assignedDeliveries || 0) : 0
        };

        if (this.isEditing) {
            const idx = this.vehicles.findIndex(v => v.id === this.currentVehicleId);
            if (idx !== -1) {
                this.vehicles[idx] = newVehicle;
            }
        } else {
            this.vehicles.push(newVehicle);
            this.totalVehiclesAddedThisMonth++;
        }

        this.closeModal();
    }

    // --- HELPERS ---

    getTypeLabel(type: string): string {
        const map: any = { 'MOTORCYCLE': 'Motorcycle', 'VAN': 'Van', '4X4': '4x4' };
        return map[type] || 'Motorcycle';
    }

    getFuelTypeLabel(fuel: string): string {
        return fuel.charAt(0).toUpperCase() + fuel.slice(1);
    }
}
