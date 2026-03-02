import { Component, HostListener, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  FormBuilder, FormGroup, Validators,
  ReactiveFormsModule, FormsModule, AbstractControl
} from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CommunityService } from '../../../core/services/community.service';
import { AuthService } from '../../../core/services/auth.service';

export interface MediaPreview {
  id: number;
  url: SafeUrl;
  type: 'image' | 'video';
  file: File;
}

function maxLengthValidator(max: number) {
  return (control: AbstractControl) => {
    const val: string = control.value || '';
    return val.length > max ? { maxLength: { actual: val.length, max } } : null;
  };
}

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.scss']
})
export class CreatePostComponent implements OnInit {

  @ViewChild('fileInputRef') fileInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('contentRef') contentRef!: ElementRef<HTMLTextAreaElement>;

  /* ── Form ─────────────────────────────────── */
  postForm!: FormGroup;
  readonly MAX_CHARS = 1000;

  /* ── Media ───────────────────────────────── */
  uploadedFiles: MediaPreview[] = [];
  isDragging = false;

  /* ── Tags ────────────────────────────────── */
  tags: string[] = [];
  tagInput = '';
  tagsContainerFocused = false;
  suggestedTags = ['hiking', 'campfire', 'sunrise', 'wildlife', 'backpacking', 'nightsky', 'hammocklife', 'mountainview'];

  /* ── Location autocomplete ───────────────── */
  locationSuggestions = [
    { name: 'Yosemite Valley', region: 'California, USA' },
    { name: 'Yellowstone', region: 'Wyoming, USA' },
    { name: 'Grand Canyon', region: 'Arizona, USA' },
    { name: 'Banff National Park', region: 'Alberta, Canada' },
    { name: 'Zion National Park', region: 'Utah, USA' },
    { name: 'Glacier National Park', region: 'Montana, USA' }
  ];
  filteredLocations: typeof this.locationSuggestions = [];
  showLocationSuggestions = false;

  /* ── UI State ────────────────────────────── */
  isPosting = false;
  showSuccess = false;
  toastMessage = '';
  toastIcon = '';
  toastVisible = false;
  private toastTimer: any;

  /* ── Current user ───────────────────── */
  currentUser: any = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private sanitizer: DomSanitizer,
    private communityService: CommunityService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    this.currentUser = {
      id: user?.id,
      name: user?.username || 'Guest Camper',
      handle: user ? `@${user.username}` : '@anonymous',
      avatar: `https://ui-avatars.com/api/?name=${user?.username || 'Guest'}&background=random`
    };

    this.postForm = this.fb.group({
      content: ['', [Validators.required, maxLengthValidator(this.MAX_CHARS)]],
      location: [''],
      visibility: ['public'],
      title: ['', Validators.required] // Added title for backend compatibility
    });

    /* Live location filtering */
    this.postForm.get('location')!.valueChanges.subscribe(v => {
      this.filterLocations(v || '');
    });
  }

  /* ── Character counter ───────────────────── */
  get charCount(): number {
    return (this.postForm.get('content')?.value || '').length;
  }
  get charClass(): string {
    const pct = this.charCount / this.MAX_CHARS;
    if (pct >= 1) return 'cc-char-counter--danger';
    if (pct >= 0.9) return 'cc-char-counter--warning';
    return '';
  }

  /* ── Submit guard ────────────────────────── */
  get canSubmit(): boolean {
    const hasContent = (this.postForm.get('content')?.value || '').trim().length > 0;
    const hasMedia = this.uploadedFiles.length > 0;
    return (hasContent || hasMedia) && this.charCount <= this.MAX_CHARS;
  }

  /* ── Auto-resize textarea ────────────────── */
  onContentInput(event: Event): void {
    const el = event.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = Math.max(140, el.scrollHeight) + 'px';
  }

  /* ── Toolbar emoji insert ────────────────── */
  insertEmoji(): void {
    const emojis = ['🏕️', '⛺', '🌲', '🔥', '🌄', '⛰️', '🦌', '🌙', '⭐', '🏔️', '🛶', '🎣'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    const ctrl = this.postForm.get('content')!;
    ctrl.setValue((ctrl.value || '') + emoji);
  }

  /* ── Media upload & drag-drop ────────────── */
  openFilePicker(): void {
    this.fileInputRef?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.processFiles(Array.from(input.files));
      input.value = '';
    }
  }

  onDragOver(e: DragEvent): void { e.preventDefault(); this.isDragging = true; }
  onDragLeave(e: DragEvent): void { e.preventDefault(); this.isDragging = false; }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.isDragging = false;
    if (e.dataTransfer?.files) {
      this.processFiles(Array.from(e.dataTransfer.files));
    }
  }

  private processFiles(files: File[]): void {
    const remaining = 10 - this.uploadedFiles.length;
    if (remaining <= 0) { this.showToast('⚠️', 'Maximum 10 files allowed'); return; }

    files.slice(0, remaining).forEach((file, idx) => {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) return;
      const reader = new FileReader();
      reader.onload = (ev: any) => {
        this.uploadedFiles.push({
          id: Date.now() + idx,
          url: this.sanitizer.bypassSecurityTrustUrl(ev.target.result),
          type: file.type.startsWith('video/') ? 'video' : 'image',
          file
        });
      };
      reader.readAsDataURL(file);
    });
  }

  removeMedia(id: number): void {
    this.uploadedFiles = this.uploadedFiles.filter(f => f.id !== id);
  }

  /* ── Tags ────────────────────────────────── */
  onTagKeyDown(e: KeyboardEvent): void {
    if ((e.key === 'Enter' || e.key === ',') && this.tagInput.trim()) {
      e.preventDefault();
      this.addTag(this.tagInput);
    }
    if (e.key === 'Backspace' && !this.tagInput && this.tags.length) {
      this.tags.pop();
    }
  }

  onTagBlur(): void {
    this.tagsContainerFocused = false;
    if (this.tagInput.trim()) this.addTag(this.tagInput);
  }

  addTag(value: string): void {
    const clean = value.replace(/^#/, '').trim().toLowerCase();
    if (clean && !this.tags.includes(clean) && this.tags.length < 10) {
      this.tags.push(clean);
    }
    this.tagInput = '';
  }

  addSuggestedTag(tag: string): void { this.addTag(tag); }

  removeTag(tag: string): void {
    this.tags = this.tags.filter(t => t !== tag);
  }

  /* ── Location autocomplete ───────────────── */
  filterLocations(q: string): void {
    const lq = q.toLowerCase();
    this.filteredLocations = lq
      ? this.locationSuggestions.filter(l =>
        l.name.toLowerCase().includes(lq) || l.region.toLowerCase().includes(lq)
      )
      : this.locationSuggestions;
    this.showLocationSuggestions = this.filteredLocations.length > 0 && !!q;
  }

  onLocationFocus(): void {
    const v = this.postForm.get('location')!.value || '';
    this.filterLocations(v);
    this.showLocationSuggestions = this.filteredLocations.length > 0;
  }

  selectLocation(name: string): void {
    this.postForm.patchValue({ location: name });
    this.showLocationSuggestions = false;
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (!target.closest('.cc-location-wrap')) {
      this.showLocationSuggestions = false;
    }
  }

  /* ── Submit ──────────────────────────────── */
  onSubmit(): void {
    if (!this.canSubmit || this.isPosting) return;

    const payload = {
      title: this.postForm.value.title || (this.postForm.value.content.substring(0, 30) + '...'),
      description: this.postForm.value.content,
      category: 'General',
      tags: this.tags,
      authorId: this.currentUser?.id
    };

    console.log('Sending Post to Backend:', payload);

    this.isPosting = true;
    this.communityService.createPost(payload).subscribe({
      next: () => {
        this.isPosting = false;
        this.showSuccess = true;
        this.showToast('🎉', 'Your adventure has been shared with the community!');
        setTimeout(() => this.router.navigate(['/community']), 2000);
      },
      error: (err) => {
        console.error('Error creating post', err);
        this.isPosting = false;
        this.showToast('❌', 'Failed to share adventure. Please try again.');
      }
    });
  }

  onCancel(): void {
    if (this.canSubmit) {
      if (confirm('You have unsaved changes. Discard this post?')) {
        this.router.navigate(['/community']);
      }
    } else {
      this.router.navigate(['/community']);
    }
  }

  /* ── Toast ───────────────────────────────── */
  showToast(icon: string, msg: string): void {
    this.toastIcon = icon;
    this.toastMessage = msg;
    this.toastVisible = true;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastVisible = false, 3500);
  }
}
