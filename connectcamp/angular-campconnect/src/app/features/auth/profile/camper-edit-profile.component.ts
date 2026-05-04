import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

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

    // Mock current user data that isn't saved in the backend yet
    currentUserMockData = {
        bio: 'Nature enthusiast & weekend adventurer. Passionate about sustainable camping, trail cooking, and finding hidden gems off the beaten path. 🌲⛺',
        location: 'Portland, Oregon',
        profileImage: 'https://images.unsplash.com/photo-1535930749574-1399327ce78f?w=300&h=300&fit=crop&crop=face'
    };

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        // Initialize form with mock data
        this.editForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            bio: [this.currentUserMockData.bio],
            location: [this.currentUserMockData.location],
            profileImage: [this.currentUserMockData.profileImage]
        });

        // Populate standard user data if available
        this.authService.getCurrentUser().subscribe(user => {
            if (user) {
                if ((user as any).firstName || (user as any).lastName) {
                    this.editForm.patchValue({
                        firstName: (user as any).firstName || '',
                        lastName: (user as any).lastName || ''
                    });
                } else if (user.username) {
                    const parts = user.username.split(' ');
                    this.editForm.patchValue({
                        firstName: parts[0] || '',
                        lastName: parts.slice(1).join(' ') || ''
                    });
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
        if (this.editForm.valid) {
            console.log('Profile update simulation:', this.editForm.value);
            // Here you would normally call a service to update the user in the backend
            // e.g. this.userService.updateProfile(this.editForm.value).subscribe(...)

            // Simulate success and navigate back
            this.router.navigate(['/profile']);
        } else {
            // Mark all fields as touched to trigger validation errors
            this.editForm.markAllAsTouched();
        }
    }
}
