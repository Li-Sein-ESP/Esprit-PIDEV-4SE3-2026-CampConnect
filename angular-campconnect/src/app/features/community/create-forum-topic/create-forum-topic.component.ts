import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LucideAngularModule, Image, X, Plus, Info, ChevronLeft, Tag as TagIcon, Send } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';
import { CommunityService } from '../../../core/services/community.service';

@Component({
    selector: 'app-create-forum-topic',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
        LucideAngularModule
    ],
    templateUrl: './create-forum-topic.component.html',
    styleUrls: ['./create-forum-topic.component.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class CreateForumTopicComponent implements OnInit {
    // Icons
    readonly ImageIcon = Image;
    readonly XIcon = X;
    readonly PlusIcon = Plus;
    readonly InfoIcon = Info;
    readonly ChevronLeftIcon = ChevronLeft;
    readonly TagIcon = TagIcon;
    readonly SendIcon = Send;

    topicForm!: FormGroup;
    tagInput = '';
    tags: string[] = [];
    selectedFiles: File[] = [];
    previews: string[] = [];

    categories = [
        { id: '1', name: 'Gear & Equipment', icon: '🎒' },
        { id: '2', name: 'Campsites & Locations', icon: '🗺️' },
        { id: '3', name: 'Survival & Safety', icon: '🧭' },
        { id: '4', name: 'Trip Planning', icon: '📋' },
        { id: '5', name: 'Stories & Experiences', icon: '📖' },
        { id: '6', name: "Beginners' Corner", icon: '🌱' }
    ];

    constructor(
        private fb: FormBuilder,
        private router: Router,
        public authService: AuthService,
        private communityService: CommunityService
    ) { }

    ngOnInit(): void {
        this.initForm();
    }

    private initForm(): void {
        this.topicForm = this.fb.group({
            category: ['', Validators.required],
            title: ['', [
                Validators.required,
                Validators.minLength(10),
                Validators.maxLength(120)
            ]],
            content: ['', [
                Validators.required,
                Validators.maxLength(2000)
            ]]
        });
    }

    // Tags Logic
    addTag(event: Event): void {
        event.preventDefault();
        const tag = this.tagInput.trim().toLowerCase();
        if (tag && !this.tags.includes(tag) && this.tags.length < 5) {
            this.tags.push(tag);
            this.tagInput = '';
        }
    }

    removeTag(index: number): void {
        this.tags.splice(index, 1);
    }

    // Media Logic
    onFileSelected(event: any): void {
        const files = event.target.files as FileList;
        if (!files) return;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type.startsWith('image/')) {
                this.selectedFiles.push(file);
                const reader = new FileReader();
                reader.onload = (e: any) => {
                    this.previews.push(e.target.result);
                };
                reader.readAsDataURL(file);
            }
        }
    }

    removeMedia(index: number): void {
        this.selectedFiles.splice(index, 1);
        this.previews.splice(index, 1);
    }

    // Actions
    goBack(): void {
        this.router.navigate(['/community/forum']);
    }

    onSubmit(): void {
        if (this.topicForm.valid) {
            const categoryId = this.topicForm.value.category;
            const categoryName = this.categories.find(c => c.id === categoryId)?.name || 'General';

            const threadDTO = {
                title: this.topicForm.value.title,
                description: this.topicForm.value.content,
                category: categoryName,
                tags: this.tags,
                authorId: this.authService.currentUserValue?.id // Assuming auth service has this
            };

            console.log('Submitting Forum Thread:', threadDTO);

            this.communityService.createPost(threadDTO).subscribe({
                next: () => {
                    alert('Thread created successfully!');
                    this.router.navigate(['/community/forum']);
                },
                error: (err: any) => {
                    console.error('Error creating thread', err);
                    alert('Failed to create thread. Please try again.');
                }
            });
        }
    }
}
