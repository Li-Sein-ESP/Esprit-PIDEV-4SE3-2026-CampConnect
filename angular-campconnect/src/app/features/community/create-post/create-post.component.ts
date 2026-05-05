import { Component, HostListener, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  FormBuilder, FormGroup, Validators,
  ReactiveFormsModule, FormsModule, AbstractControl
} from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CommunityService, StoryGenerationResponse } from '../../../core/services/community.service';
import { AuthService } from '../../../core/services/auth.service';
import { firstValueFrom } from 'rxjs';

export interface MediaPreview {
  id: number;
  url: SafeUrl;
  rawUrl: string;
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
    { name: 'Tunis', region: 'Grand Tunis, Tunisie' },
    { name: 'Ariana', region: 'Grand Tunis, Tunisie' },
    { name: 'Ben Arous', region: 'Grand Tunis, Tunisie' },
    { name: 'Manouba', region: 'Grand Tunis, Tunisie' },
    { name: 'Nabeul', region: 'Nord-Est, Tunisie' },
    { name: 'Zaghouan', region: 'Nord-Est, Tunisie' },
    { name: 'Bizerte', region: 'Nord-Est, Tunisie' },
    { name: 'Beja', region: 'Nord-Ouest, Tunisie' },
    { name: 'Jendouba', region: 'Nord-Ouest, Tunisie' },
    { name: 'Kef', region: 'Nord-Ouest, Tunisie' },
    { name: 'Siliana', region: 'Nord-Ouest, Tunisie' },
    { name: 'Sousse', region: 'Centre-Est, Tunisie' },
    { name: 'Monastir', region: 'Centre-Est, Tunisie' },
    { name: 'Mahdia', region: 'Centre-Est, Tunisie' },
    { name: 'Sfax', region: 'Centre-Est, Tunisie' },
    { name: 'Kairouan', region: 'Centre-Ouest, Tunisie' },
    { name: 'Kasserine', region: 'Centre-Ouest, Tunisie' },
    { name: 'Sidi Bouzid', region: 'Centre-Ouest, Tunisie' },
    { name: 'Gabes', region: 'Sud-Est, Tunisie' },
    { name: 'Medenine', region: 'Sud-Est, Tunisie' },
    { name: 'Tataouine', region: 'Sud-Est, Tunisie' },
    { name: 'Gafsa', region: 'Sud-Ouest, Tunisie' },
    { name: 'Tozeur', region: 'Sud-Ouest, Tunisie' },
    { name: 'Kebili', region: 'Sud-Ouest, Tunisie' }
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
  isGeneratingStory = false;
  generatedStory = '';
  generatedStoryMeta: StoryGenerationResponse | null = null;

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
        const rawUrl = String(ev.target.result || '');
        this.uploadedFiles.push({
          id: Date.now() + idx,
          url: this.sanitizer.bypassSecurityTrustUrl(rawUrl),
          rawUrl,
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
  async onSubmit(): Promise<void> {
    if (!this.canSubmit || this.isPosting) return;

    const content = (this.postForm.value.content || '').trim();
    const title = (this.postForm.value.title || content.substring(0, 30) + '...').trim();
    const location = (this.postForm.value.location || '').trim();
    const authorName = this.currentUser?.name || this.authService.currentUserValue?.username || 'Explorer';
    const authorUsername = String(authorName).toLowerCase().replace(/\s+/g, '');
    let imageUrls: string[] = [];

    this.isPosting = true;
    try {
      imageUrls = await this.uploadSelectedImages();
    } catch (err) {
      console.error('Error uploading post images', err);
      this.isPosting = false;
      this.showToast('❌', 'Image upload failed. Please retry.');
      return;
    }

    const payload = {
      title,
      content,
      description: content,
      category: 'General',
      tags: this.tags,
      authorId: this.currentUser?.id,
      authorName,
      authorUsername,
      location,
      imageUrls,
      media: imageUrls,
      images: imageUrls
    };

    console.log('Sending Post to Backend:', payload);

    this.communityService.createPost(payload as any).subscribe({
      next: (savedPost: any) => {
        this.isPosting = false;
        this.showSuccess = true;
        const status = (savedPost?.moderationStatus || '').toUpperCase();
        if (status === 'PENDING_REVIEW') {
          this.showToast(
            '🛡️',
            'Publication envoyée : un administrateur validera ou refusera après analyse IA. Elle n’apparaîtra pas dans le feed tant qu’elle n’est pas approuvée.'
          );
        } else if (status === 'REJECTED') {
          this.showToast('⛔', 'Publication refusée selon la politique de modération.');
        } else {
          this.showToast('🎉', 'Votre publication est visible sur le fil d’actualité.');
        }
        setTimeout(() => this.router.navigate(['/community/feed']), 2000);
      },
      error: (err: any) => {
        console.error('Error creating post', err);
        this.isPosting = false;
        this.showToast('❌', this.resolvePostErrorMessage(err));
      }
    });
  }

  private async uploadSelectedImages(): Promise<string[]> {
    const imageFiles = this.uploadedFiles
      .filter(media => media.type === 'image' && !!media.file)
      .map(media => media.file);

    if (!imageFiles.length) {
      return [];
    }

    const uploadedUrls: string[] = [];
    for (const file of imageFiles) {
      const response = await firstValueFrom(this.communityService.uploadPostImage(file));
      if (response?.url) {
        uploadedUrls.push(response.url);
      }
    }
    return uploadedUrls;
  }

  onGenerateStory(): void {
    const content = (this.postForm.value.content || '').trim();
    if (content.length < 5) {
      this.showToast('⚠️', 'Write at least 5 characters before generating a story.');
      return;
    }

    this.isGeneratingStory = true;
    this.generatedStory = '';
    this.generatedStoryMeta = null;

    this.communityService.generateStory({
      content,
      location: (this.postForm.value.location || '').trim() || undefined,
      tone: 'immersive',
      length: 'medium',
      language: 'fr'
    }).subscribe({
      next: (result) => {
        this.generatedStory = (result.story || '').trim();
        this.generatedStoryMeta = result;
        this.isGeneratingStory = false;
        this.showToast('✨', 'Story generated successfully.');
      },
      error: (err) => {
        console.error('Error generating story', err);
        this.isGeneratingStory = false;
        const isTimeout = err?.name === 'TimeoutError';
        this.showToast('❌', isTimeout
          ? 'Story generation timed out. Check backend/key and retry.'
          : 'Failed to generate story. Please try again.');
      }
    });
  }

  useGeneratedStory(): void {
    if (!this.generatedStory) {
      return;
    }
    this.postForm.patchValue({ content: this.generatedStory });
    this.showToast('✅', 'Generated story applied to your post.');
  }

  discardGeneratedStory(): void {
    this.generatedStory = '';
    this.generatedStoryMeta = null;
  }

  onCancel(): void {
    if (this.canSubmit) {
      if (confirm('You have unsaved changes. Discard this post?')) {
        this.router.navigate(['/community/feed']);
      }
    } else {
      this.router.navigate(['/community/feed']);
    }
  }

  /** Message lisible pour l’utilisateur (intercepteur + backend). */
  private resolvePostErrorMessage(err: any): string {
    const body = err?.error;
    if (body && typeof body === 'object' && !Array.isArray(body)) {
      const detail = body.message;
      if (typeof detail === 'string' && detail.trim()) {
        return detail.trim();
      }
    }

    const fromInterceptor = err?.userMessage as string | undefined;
    if (fromInterceptor) {
      return this.translateBackendUserMessage(fromInterceptor);
    }

    const status = typeof err?.status === 'number' ? err.status : undefined;
    if (status === 401) {
      return 'Session expirée. Reconnectez-vous puis réessayez.';
    }
    if (status === 403) {
      return 'Action non autorisée (droits insuffisants).';
    }
    if (status === 0) {
      return 'Impossible de joindre le serveur. Vérifiez que le backend tourne (ex. port 8089) et environment.apiUrl.';
    }
    const plain = typeof err?.message === 'string' ? err.message : '';
    if (/timed out|timeout/i.test(plain)) {
      return 'Délai dépassé : le serveur met trop longtemps (modération). Réessayez ou publiez sans image.';
    }
    return 'Échec de la publication. Réessayez ou ouvrez la console (F12) pour le détail.';
  }

  private translateBackendUserMessage(msg: string): string {
    const m: Record<string, string> = {
      'Cannot connect to server. Please check your internet connection.':
        'Connexion au serveur impossible. Vérifiez que le backend est démarré et le port (8089).',
      'Session expired. Please login again.': 'Session expirée. Reconnectez-vous.',
      'You do not have permission to access this resource.': 'Vous n’avez pas la permission d’effectuer cette action.',
      'Server error. Please try again later.': 'Erreur serveur. Réessayez plus tard.',
      'Service temporarily unavailable. Please try again later.': 'Service temporairement indisponible.'
    };
    return m[msg] ?? msg;
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
