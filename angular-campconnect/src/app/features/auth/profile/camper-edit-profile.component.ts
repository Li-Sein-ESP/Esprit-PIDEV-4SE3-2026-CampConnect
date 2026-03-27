import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserApiService } from '../services/user-api.service';
import { UpdateProfileRequest } from '../models/user.model';

@Component({
    selector: 'app-camper-edit-profile',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
    templateUrl: './camper-edit-profile.component.html',
    styleUrl: './camper-edit-profile.component.scss'
})
export class CamperEditProfileComponent implements OnInit {
    editForm!: FormGroup;
    profileImagePreview: string = 'https://images.unsplash.com/photo-1535930749574-1399327ce78f?w=300&h=300&fit=crop&crop=face';
    saving = false;

    constructor(
        private fb: FormBuilder,
        private userApi: UserApiService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.editForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            bio: [''],
            location: [''],
            profileImage: ['']
        });

        this.userApi.getProfile().subscribe(profile => {
            if (profile) {
                const parts = (profile.name || '').split(' ');
                this.editForm.patchValue({
                    firstName: parts[0] || '',
                    lastName: parts.slice(1).join(' ') || '',
                    bio: profile.profileDetails?.['bio'] || '',
                    location: profile.profileDetails?.['location'] || '',
                    profileImage: profile.profileDetails?.['profileImage'] || ''
                });
                if (profile.profileDetails?.['profileImage']) {
                    this.profileImagePreview = profile.profileDetails['profileImage'] as string;
                }
            }
        });
    }

    onImageUrlChange(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.value) {
            this.profileImagePreview = input.value;
        }
    }

    onSubmit() {
        if (this.editForm.valid && !this.saving) {
            this.saving = true;
            const val = this.editForm.value;
            const request: UpdateProfileRequest = {
                name: `${val.firstName} ${val.lastName}`.trim(),
                profileDetails: {
                    bio: val.bio,
                    location: val.location,
                    profileImage: val.profileImage
                }
            };
            this.userApi.updateProfile(request).subscribe({
                next: () => {
                    this.saving = false;
                    this.router.navigate(['/profile']);
                },
                error: (err) => {
                    this.saving = false;
                    console.error('Profile update failed:', err);
                    // Optionally show error to user
                }
            });
        } else {
            this.editForm.markAllAsTouched();
        }
    }
}
