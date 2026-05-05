import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule, MessageSquare, CheckSquare, Receipt, Users, Settings, ArrowLeft, MoreVertical, Compass, Save, Trash2, X } from 'lucide-angular';
import { GroupService } from '../services/group';
import { Group, GroupDetail } from '../models/group.model';
import { AuthService } from '../../../core/services/auth.service';
import { GroupChatComponent } from '../group-chat/group-chat.component';
import { GroupPlanningComponent } from '../group-planning/group-planning.component';
import { GroupExpensesComponent } from '../group-expenses/group-expenses.component';
import { FeedbackModalComponent } from '../feedback-modal/feedback-modal.component';
import { TripFeedbackService } from '../services/trip-feedback.service';
import { GroupChatService } from '../services/group-chat';
import { GroupMergeService, GroupMergeProposal } from '../services/group-merge.service';
import { Subscription } from 'rxjs';

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
        GroupExpensesComponent,
        FeedbackModalComponent
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
    readonly X = X;

    activeTab: 'chat' | 'planning' | 'expenses' | 'settings' = 'chat';

    // Form for Settings (PUT)
    groupForm!: FormGroup;
    isUpdating = false;
    updateMessage = '';
    isDeleting = false;
    showMembersModal = false;
    
    showFeedbackModal = false;
    membersToEvaluate: any[] = [];
    mergeProposals: GroupMergeProposal[] = [];

    // Notifications state
    unreadChatCount = 0;
    private chatSubscription: Subscription | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private groupService: GroupService,
        private authService: AuthService,
        private fb: FormBuilder,
        private feedbackService: TripFeedbackService,
        private chatService: GroupChatService,
        private mergeService: GroupMergeService,
        private cdr: ChangeDetectorRef
    ) {
        this.initForm();
    }

    error: string | null = null;

    ngOnInit(): void {
        this.authService.getCurrentUser().subscribe(user => {
            this.currentUserId = user?.id || null;
            this.cdr.detectChanges();
        });

        // Use paramMap subscribe to handle ID changes without component reload
        this.route.paramMap.subscribe(params => {
            const groupId = params.get('id');
            if (groupId && groupId !== 'mock-id') {
                this.unreadChatCount = 0; // Reset count for new group
                this.loadGroupDetail(groupId);
            }
        });

        // Handle tab in query params
        this.route.queryParamMap.subscribe(params => {
            const tab = params.get('tab');
            if (tab && ['chat', 'planning', 'expenses', 'settings'].includes(tab)) {
                this.activeTab = tab as any;
                this.cdr.detectChanges();
            }
        });

        // Listen for new chat messages for the unread badge
        this.chatSubscription = this.chatService.message$.subscribe(msg => {
            if (msg && this.group && msg.groupId === this.group.id) {
                // Increment unread count if we are not on chat tab AND message is from someone else
                if (this.activeTab !== 'chat' && msg.senderUserId !== this.currentUserId) {
                    this.unreadChatCount++;
                    this.cdr.detectChanges();
                }
            }
        });
    }

    ngOnDestroy(): void {
        if (this.chatSubscription) {
            this.chatSubscription.unsubscribe();
        }
        this.chatService.disconnect();
    }

    loadGroupDetail(id: string) {
        this.groupService.getGroupDetail(id).subscribe({
            next: (res) => {
                this.group = res;
                this.groupForm.patchValue({
                    name: res.name,
                    status: res.status
                });
                
                if (this.group?.status === 'INACTIVE' && this.currentUserId) {
                    this.checkPendingFeedbacks();
                }

                this.loading = false;
                
                // Ensure chat connection is active for notifications across all tabs
                this.chatService.connect(res.id);
                this.loadMergeProposals(id);
                
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Group detail not found.', err);
                this.error = "Impossible de charger les détails du groupe.";
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    loadMergeProposals(groupId: string) {
        this.mergeService.getProposalsForGroup(groupId).subscribe({
            next: (proposals) => {
                this.mergeProposals = proposals;
                this.cdr.detectChanges();
            },
            error: (err) => console.error('Error fetching merge proposals', err)
        });
    }

    handleAcceptProposal(proposal: GroupMergeProposal) {
        if (!this.group) return;
        this.mergeService.acceptProposal(proposal.id, this.group.id).subscribe({
            next: (updatedProposal) => {
                if (updatedProposal.status === 'MERGED') {
                    alert('Fusion réussie ! Les membres de l\'autre groupe vous ont rejoints.');
                    this.mergeProposals = this.mergeProposals.filter(p => p.id !== proposal.id);
                    // Reload group to get new members
                    if (this.group) {
                        this.loadGroupDetail(this.group.id);
                    }
                } else {
                    alert('Votre accord a été enregistré. En attente de l\'autre groupe...');
                    // Update the proposal in the list
                    const index = this.mergeProposals.findIndex(p => p.id === proposal.id);
                    if (index !== -1) {
                        this.mergeProposals[index] = updatedProposal;
                    }
                }
                this.cdr.detectChanges();
            },
            error: (err) => console.error('Error accepting proposal', err)
        });
    }

    handleRejectProposal(proposal: GroupMergeProposal) {
        this.mergeService.rejectProposal(proposal.id).subscribe({
            next: () => {
                this.mergeProposals = this.mergeProposals.filter(p => p.id !== proposal.id);
                this.cdr.detectChanges();
            },
            error: (err) => console.error('Error rejecting proposal', err)
        });
    }

    hasAccepted(proposal: GroupMergeProposal): boolean {
        if (!this.group) return false;
        return this.group.id === proposal.sourceGroupId ? proposal.sourceAccepted : proposal.targetAccepted;
    }

    hasOtherAccepted(proposal: GroupMergeProposal): boolean {
        if (!this.group) return false;
        return this.group.id === proposal.sourceGroupId ? proposal.targetAccepted : proposal.sourceAccepted;
    }

    checkPendingFeedbacks() {
        if (!this.group || !this.group.tripId || !this.currentUserId) return;

        this.feedbackService.getMyFeedbacksForTrip(this.group.tripId).subscribe({
            next: (feedbacks) => {
                const evaluatedIds = feedbacks.map(f => f.evaluatedUserId);
                
                // Get members to evaluate: everyone except current user and already evaluated
                if (this.group?.members) {
                    this.membersToEvaluate = this.group.members.filter((m: any) => 
                        m.id !== this.currentUserId && !evaluatedIds.includes(m.id)
                    );
                }
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed to get feedbacks', err);
                this.cdr.detectChanges();
            }
        });
    }

    openFeedbackModal() {
        this.showFeedbackModal = true;
    }

    onFeedbackSubmitted() {
        // Refresh the pending UI list silently in the background
        this.checkPendingFeedbacks(); 
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
            tripId: this.group.tripId,
            memberUserIds: this.group.members ? this.group.members.map((m: any) => m.id) : []
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
        if (this.activeTab === tab) return;
        this.activeTab = tab;
        if (tab === 'chat') {
            this.unreadChatCount = 0;
        }
        setTimeout(() => {
            this.cdr.detectChanges(); // Force re-render in the next tick
        }, 10);
    }

    getMemberAvatar(userId: string): string {
        const member = this.group?.members?.find((m: any) => m.id === userId);
        return member?.avatar || `https://ui-avatars.com/api/?name=${member?.name || userId}&background=random&size=48`;
    }

    toggleMembersModal() {
        this.showMembersModal = !this.showMembersModal;
    }
}
