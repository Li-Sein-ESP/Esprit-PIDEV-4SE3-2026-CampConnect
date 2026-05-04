import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { VehicleApiService, VehicleResponse, VehicleRequest, VehicleStatus } from '../services/vehicle-api.service';
import { ToastService } from '../../../shared/services/toast.service';

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
    canManageVehicles = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private vehicleApi: VehicleApiService,
        private toastService: ToastService,
        private cdr: ChangeDetectorRef
    ) {
        this.vehicleForm = this.fb.group({
            plateNumber: ['', [Validators.required, Validators.minLength(3)]],
            capacity: ['', [Validators.required, Validators.min(1)]],
            maxCapacityKg: ['', [Validators.required, Validators.min(1)]],
            vehicleType: ['VAN', Validators.required],
            status: ['AVAILABLE'],
            driverId: [''],
            coverageZones: [''],
            latitude: [''],
            longitude: ['']
        });
    }

    ngOnInit(): void {
        this.canManageVehicles = this.authService.hasRole('ROLE_ADMIN') || this.authService.hasRole('ROLE_DELIVERY_PROVIDER');
        this.loadVehicles();
    }

    loadVehicles(): void {
        this.loading = true;
        this.error = null;
        this.vehicleApi.getAll(undefined, 0, 50).subscribe({
            next: (page) => {
                this.vehicles = page.content;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.loading = false;
                this.cdr.detectChanges();
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
                maxCapacityKg: vehicle.maxCapacityKg ?? vehicle.capacity,
                vehicleType: vehicle.vehicleType ?? 'VAN',
                status: vehicle.status,
                driverId: vehicle.driverId ?? '',
                coverageZones: vehicle.coverageZones?.join(', ') ?? '',
                latitude: vehicle.latitude ?? '',
                longitude: vehicle.longitude ?? ''
            });
        } else {
            this.isEditing = false;
            this.currentVehicleId = null;
            this.vehicleForm.reset({ status: 'AVAILABLE', vehicleType: 'VAN', coverageZones: '' });
        }
        this.isModalOpen = true;
    }

    closeModal(): void {
        this.isModalOpen = false;
        this.isEditing = false;
        this.currentVehicleId = null;
    }

    saveVehicle(): void {
        if (this.vehicleForm.invalid) {
            this.vehicleForm.markAllAsTouched();
            return;
        }

        this.isSaving = true;
        const fv = this.vehicleForm.value;

        // Parse coverage zones from comma-separated string
        const rawZones: string = fv.coverageZones ?? '';
        const zones = rawZones.split(',').map((z: string) => z.trim()).filter((z: string) => z.length > 0);

        const request: VehicleRequest = {
            plateNumber: fv.plateNumber,
            capacity: Number(fv.capacity),
            maxCapacityKg: Number(fv.maxCapacityKg),
            vehicleType: fv.vehicleType || 'VAN',
            status: fv.status as VehicleStatus,
            driverId: fv.driverId || undefined,
            coverageZones: zones.length > 0 ? zones : ['TUNIS'],
            latitude: fv.latitude !== '' ? Number(fv.latitude) : undefined,
            longitude: fv.longitude !== '' ? Number(fv.longitude) : undefined
        };

        const call$ = this.isEditing && this.currentVehicleId
            ? this.vehicleApi.update(this.currentVehicleId, request)
            : this.vehicleApi.create(request);

        call$.subscribe({
            next: () => {
                this.isSaving = false;
                this.toastService.success('Vehicle saved successfully!');
                this.closeModal();
                this.loadVehicles();
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.isSaving = false;
                const msg = err?.error?.message || err?.error?.errors?.[0] || 'Failed to save vehicle. Please check your inputs.';
                this.toastService.error(msg);
                this.cdr.detectChanges();
            }
        });
    }

    deleteVehicle(id: string): void {
        if (!confirm('Are you sure you want to delete this vehicle?')) return;
        this.vehicleApi.delete(id).subscribe({
            next: () => {
                this.toastService.success('Vehicle deleted successfully');
                this.loadVehicles();
                this.cdr.detectChanges();
            },
            error: () => {
                this.cdr.detectChanges();
            }
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
