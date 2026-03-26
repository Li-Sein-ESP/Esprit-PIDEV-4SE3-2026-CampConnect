import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule, MessageSquare, CheckSquare, Receipt, Users, Settings, ArrowLeft, MoreVertical, Compass, Save, Trash2 } from 'lucide-angular';
import { GroupService } from '../services/group';
import { Group, GroupDetail } from '../models/group.model';
import { AuthService } from '../../../core/services/auth.service';
import { GroupChatComponent } from '../group-chat/group-chat.component';
import { GroupPlanningComponent } from '../group-planning/group-planning.component';
import { GroupExpensesComponent } from '../group-expenses/group-expenses.component';

@Component({
    selector: 'app-group-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        LucideAngularModule,
        GroupChatComponent,
        GroupPlanningComponent,
        GroupExpensesComponent
    ],
    templateUrl: './group-dashboard.component.html',
    styleUrl: './group-dashboard.component.css'
})
export class GroupDashboardComponent implements OnInit {
    group: GroupDetail | null = null;
    loading = true;
    currentUserId: string | null = null;

    // Icons
    readonly MessageSquare = MessageSquare;
    readonly CheckSquare = CheckSquare;
    readonly Receipt = Receipt;
    readonly Users = Users;
    readonly Settings = Settings;
    readonly ArrowLeft = ArrowLeft;
    readonly MoreVertical = MoreVertical;
    readonly Compass = Compass;
    readonly Save = Save;
    readonly Trash2 = Trash2;

    activeTab: 'chat' | 'planning' | 'expenses' | 'settings' = 'chat';

    // Form for Settings (PUT)
    groupForm!: FormGroup;
    isUpdating = false;
    updateMessage = '';
    isDeleting = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private groupService: GroupService,
        private authService: AuthService,
        private fb: FormBuilder
    ) {
        this.initForm();
    }

    error: string | null = null;

    ngOnInit(): void {
        this.authService.getCurrentUser().subscribe(user => {
            this.currentUserId = user?.id || null;
        });

        const groupId = this.route.snapshot.paramMap.get('id');
        if (groupId && groupId !== 'mock-id') {
            this.loadGroupDetail(groupId);
        } else {
            this.error = "ID de groupe invalide.";
            this.loading = false;
        }

        // Attempt to parse child route to set active tab visually
        const childRoute = this.router.url.split('/').pop();
        if (childRoute && ['chat', 'planning', 'expenses', 'settings'].includes(childRoute)) {
            this.activeTab = childRoute as any;
        }
    }

    loadGroupDetail(id: string) {
        this.groupService.getGroupDetail(id).subscribe({
            next: (res) => {
                this.group = res;
                this.groupForm.patchValue({
                    name: res.name,
                    status: res.status
                });
                this.loading = false;
            },
            error: (err) => {
                console.error('Group detail not found.', err);
                this.error = "Impossible de charger les détails du groupe.";
                this.loading = false;
            }
        });
    }

    initForm() {
        this.groupForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
            status: ['ACTIVE', Validators.required]
        });
    }

    onUpdateGroup() {
        if (this.groupForm.invalid || !this.group) return;

        this.isUpdating = true;
        this.updateMessage = '';

        const partialGroup: any = {
            name: this.groupForm.value.name,
            status: this.groupForm.value.status,
            tripId: this.group.tripId
        };

        this.groupService.updateGroup(this.group.id, partialGroup).subscribe({
            next: (updatedGroup) => {
                if (this.group) {
                    this.group = {
                        ...this.group,
                        name: updatedGroup.name,
                        status: updatedGroup.status
                    };
                }
                this.updateMessage = 'Groupe mis à jour avec succès !';
                this.isUpdating = false;
                setTimeout(() => this.updateMessage = '', 3000);
            },

            error: (err) => {
                console.error('Error updating group:', err);
                this.updateMessage = 'Erreur lors de la mise à jour.';
                this.isUpdating = false;
            }
        });
    }

    onDeleteGroup() {
        if (!this.group) return;
        if (confirm('Voulez-vous vraiment supprimer ce groupe ? Cette action est irréversible.')) {
            this.isDeleting = true;
            this.groupService.deleteGroup(this.group.id).subscribe({
                next: () => {
                    this.router.navigate(['/groups']);
                },
                error: (err) => {
                    console.error('Error deleting group:', err);
                    this.isDeleting = false;
                }
            });
        }
    }

    onLeaveGroup() {
        if (!this.group || !this.currentUserId) return;
        
        if (confirm('Voulez-vous vraiment quitter ce groupe ?')) {
            this.isDeleting = true; // Use the same loading state for simplicity or add a new one
            this.groupService.leaveGroup(this.group.id, this.currentUserId).subscribe({
                next: () => {
                    this.router.navigate(['/groups']);
                },
                error: (err) => {
                    console.error('Error leaving group:', err);
                    alert('Erreur lors de la tentative de quitter le groupe.');
                    this.isDeleting = false;
                }
            });
        }
    }

    switchTab(tab: 'chat' | 'planning' | 'expenses' | 'settings') {
        this.activeTab = tab;
        // this.router.navigate([tab], { relativeTo: this.route });
    }

    getMemberAvatar(userId: string): string {
        const member = this.group?.members?.find((m: any) => m.id === userId);
        return member?.avatar || `https://ui-avatars.com/api/?name=${member?.name || userId}&background=random&size=48`;
    }
}
