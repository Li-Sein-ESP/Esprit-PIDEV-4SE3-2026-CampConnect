import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GearApiService } from '../services/gear-api.service';
import { PagedResponse, GearResponse } from '../models/gear.model';

@Component({
    selector: 'app-my-gear',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './my-gear.component.html',
    styleUrls: ['./my-gear.component.scss']
})
export class MyGearComponent implements OnInit {
    gearPage?: PagedResponse<GearResponse>;
    loading = true;
    error: string | null = null;

    constructor(private gearService: GearApiService) { }

    ngOnInit(): void {
        this.loadMyGear();
    }

    loadMyGear(page: number = 0): void {
        this.loading = true;
        this.error = null;
        this.gearService.getMyGear({ page, size: 20 }).subscribe({
            next: (data) => {
                this.gearPage = data;
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Failed to load your gear. Please try again later.';
                this.loading = false;
                console.error(err);
            }
        });
    }

    deleteGear(id: string): void {
        if (confirm('Are you sure you want to delete this gear listing?')) {
            this.gearService.deleteGear(id).subscribe({
                next: () => {
                    this.loadMyGear(this.gearPage?.page || 0);
                },
                error: (err) => {
                    alert('Failed to delete gear.');
                    console.error(err);
                }
            });
        }
    }
}
