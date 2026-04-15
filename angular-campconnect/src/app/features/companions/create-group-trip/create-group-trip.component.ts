import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, Users, ArrowLeft, Tent } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';
import { GroupService } from '../../groups/services/group';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-create-group-trip-component',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    LucideAngularModule,
    ButtonComponent,
    CardComponent,
    CardContentComponent
  ],
  templateUrl: './create-group-trip.component.html',
  styles: []
})
export class CreateGroupTripComponent implements OnInit {
  groupForm!: FormGroup;
  isSubmitting = false;
  currentUserId: string | null = null;

  readonly Users = Users;
  readonly ArrowLeft = ArrowLeft;
  readonly Tent = Tent;

  constructor(
    private fb: FormBuilder,
    private groupService: GroupService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.groupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['']
    });

    this.authService.getCurrentUser().subscribe(user => {
      this.currentUserId = user?.id || null;
    });
  }

  onSubmit(): void {
    if (this.groupForm.invalid || !this.currentUserId) {
      this.groupForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formVal = this.groupForm.value;

    this.groupService.createGroup({
      name: formVal.name,
      description: formVal.description,
      creatorUserId: this.currentUserId,
      tripId: 'standalone-group-' + Date.now().toString(), // No trip intent linked
      memberUserIds: [this.currentUserId],
      status: 'ACTIVE'
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/companions/groups']);
      },
      error: (err) => {
        console.error('Failed to create group', err);
        this.isSubmitting = false;
        alert('Erreur lors de la création du groupe.');
      }
    });
  }
}
