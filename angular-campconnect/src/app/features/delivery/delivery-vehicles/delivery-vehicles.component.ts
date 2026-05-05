import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { VehicleApiService, VehicleResponse, VehicleRequest, VehicleStatus } from '../services/vehicle-api.service';

@Component({
    selector: 'app-delivery-vehicles',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './delivery-vehicles.component.html',
    styleUrls: ['./delivery-vehicles.component.scss']
})
export class DeliveryVehiclesComponent implements OnInit {
    vehicles: VehicleResponse[] = [];
    loading = true;
    error: string | null = null;

    isModalOpen = false;
    isEditing = false;
    currentVehicleId: string | null = null;
    vehicleForm: FormGroup;
    isSaving = false;
    isAdmin = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private vehicleApi: VehicleApiService
    ) {
        this.vehicleForm = this.fb.group({
            plateNumber: ['', [Validators.required, Validators.minLength(3)]],
            capacity: ['', [Validators.required, Validators.min(1)]],
            status: ['AVAILABLE'],
            driverId: ['']
        });
    }

    ngOnInit(): void {
        this.isAdmin = this.authService.hasRole('ROLE_ADMIN');
        this.loadVehicles();
    }

    loadVehicles(): void {
        this.loading = true;
        this.error = null;
        this.vehicleApi.getAll(undefined, 0, 50).subscribe({
            next: (page) => {
                this.vehicles = page.content;
                this.loading = false;
            },
            error: (err) => {
                this.error = err?.status === 403
                    ? 'Access denied. Admin or Delivery Provider role required.'
                    : 'Failed to load vehicles.';
                this.loading = false;
            }
        });
    }

    // ─── Stats ────────────────────────────────────────────────────────────────

    get totalVehicles(): number { return this.vehicles.length; }

    get availableVehicles(): number {
        return this.vehicles.filter(v => v.status === 'AVAILABLE').length;
    }

    get inUseVehicles(): number {
        return this.vehicles.filter(v => v.status === 'IN_USE').length;
    }

    get totalCapacity(): number {
        return this.vehicles.reduce((sum, v) => sum + v.capacity, 0);
    }

    // ─── Modal ─────────────────────────────────────────────────────────────────

    openModal(vehicle?: VehicleResponse): void {
        if (vehicle) {
            this.isEditing = true;
            this.currentVehicleId = vehicle.id;
            this.vehicleForm.patchValue({
                plateNumber: vehicle.plateNumber,
                capacity: vehicle.capacity,
                status: vehicle.status,
                driverId: vehicle.driverId ?? ''
            });
        } else {
            this.isEditing = false;
            this.currentVehicleId = null;
            this.vehicleForm.reset({ status: 'AVAILABLE' });
        }
        this.isModalOpen = true;
    }

    closeModal(): void {
        this.isModalOpen = false;
        this.isEditing = false;
        this.currentVehicleId = null;
    }

    saveVehicle(): void {
        if (this.vehicleForm.invalid) return;

        this.isSaving = true;
        const formValue = this.vehicleForm.value;
        const request: VehicleRequest = {
            plateNumber: formValue.plateNumber,
            capacity: Number(formValue.capacity),
            status: formValue.status as VehicleStatus,
            driverId: formValue.driverId || undefined
        };

        const call$ = this.isEditing && this.currentVehicleId
            ? this.vehicleApi.update(this.currentVehicleId, request)
            : this.vehicleApi.create(request);

        call$.subscribe({
            next: () => {
                this.isSaving = false;
                this.closeModal();
                this.loadVehicles();
            },
            error: (err) => {
                this.isSaving = false;
                alert(err?.error?.message || 'Failed to save vehicle.');
            }
        });
    }

    deleteVehicle(id: string): void {
        if (!confirm('Are you sure you want to delete this vehicle?')) return;
        this.vehicleApi.delete(id).subscribe({
            next: () => this.loadVehicles(),
            error: () => alert('Failed to delete vehicle.')
        });
    }

    statusLabel(status: VehicleStatus): string {
        const map: Record<VehicleStatus, string> = {
            AVAILABLE: 'Available',
            IN_USE: 'In Use',
            MAINTENANCE: 'Maintenance',
            RETIRED: 'Retired'
        };
        return map[status] ?? status;
    }
}
