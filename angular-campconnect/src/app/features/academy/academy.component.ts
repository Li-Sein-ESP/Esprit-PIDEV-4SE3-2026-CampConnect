import { Component, OnInit, AfterViewInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, BookOpen, Clock, Users, Award, Search, Star, TrendingUp, Play, ChevronRight, CheckCircle, ShieldCheck, Medal, GraduationCap, Eye, ArrowRight, Compass, Plus, Video as VideoIcon, Upload, File as FileIcon, CheckSquare, AlertCircle, Pencil, Trash2 } from 'lucide-angular';
import { ButtonComponent } from '../../shared/components/button.component';
<<<<<<< HEAD
=======
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
import { AcademyService } from './services/academy.service';
import { Course, Certification, Video } from './models/academy.model';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

<<<<<<< HEAD
=======
gsap.registerPlugin(ScrollTrigger);

>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
@Component({
  selector: 'app-academy',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LucideAngularModule,
    ButtonComponent
  ],
  templateUrl: './academy.component.html',
  styles: [`
    :host {
      display: block;
      background-color: #F1EDE1;
    }
    @keyframes ken-burns {
      0%   { transform: scale(1.05) translate(0%, 0%); }
      25%  { transform: scale(1.12) translate(-1.5%, -1%); }
      50%  { transform: scale(1.08) translate(1%, -0.5%); }
      75%  { transform: scale(1.15) translate(-0.5%, 1%); }
      100% { transform: scale(1.05) translate(0%, 0%); }
    }
    .animate-slow-zoom {
      animation: ken-burns 30s ease-in-out infinite;
    }
    .hero-outline-text {
      -webkit-text-stroke: 1px rgba(10, 31, 28, 0.08);
      color: transparent;
      line-height: 0.8;
      select: none;
      pointer-events: none;
    }
    .mist-layer {
      pointer-events: none;
      background: radial-gradient(circle at 50% 50%, rgba(10, 31, 28, 0.03) 0%, transparent 70%);
      filter: blur(60px);
    }
    .card-asymmetric-1 { border-radius: 28px 32px 24px 30px; }
    .card-asymmetric-2 { border-radius: 32px 24px 30px 28px; }
    .card-asymmetric-3 { border-radius: 24px 30px 28px 32px; }
    .card-asymmetric-4 { border-radius: 30px 28px 32px 24px; }
    
    .medallion-shape {
      border-radius: 24px 24px 8px 8px;
    }
    
    .video-grid-asymmetric {
      display: grid;
      grid-template-columns: 1.5fr 0.75fr 0.75fr;
      gap: 2rem;
    }
    @media (max-width: 1024px) {
      .video-grid-asymmetric {
        grid-template-columns: 1fr;
      }
    }
    .category-grid-asymmetric {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: auto auto;
      gap: 3rem;
    }
    @media (max-width: 1024px) {
      .category-grid-asymmetric {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AcademyComponent implements OnInit, AfterViewInit {
  // Icons
  readonly GraduationCap = GraduationCap;
  readonly ArrowRight = ArrowRight;
  readonly Play = Play;
  readonly Eye = Eye;
  readonly Star = Star;
  readonly TrendingUp = TrendingUp;
  readonly Clock = Clock;
  readonly Medal = Medal;
  readonly CheckCircle = CheckCircle;
  readonly Award = Award;
  readonly ChevronRight = ChevronRight;
  readonly Search = Search;
  readonly Compass = Compass;
  readonly Plus = Plus;
  readonly VideoIcon = VideoIcon;
  readonly BookOpen = BookOpen;
  readonly Users = Users;
  readonly ShieldCheck = ShieldCheck;
  readonly Upload = Upload;
  readonly FileIcon = FileIcon;
  readonly CheckSquare = CheckSquare;
  readonly AlertCircle = AlertCircle;
  readonly Pencil = Pencil;
  readonly Trash2 = Trash2;

  selectedCategory = 'all';
  searchQuery = '';

  get isExpert(): boolean {
    // 1. Admin bypass
    if (this.authService.hasRole('ADMIN')) return true;
    
    // 2. Check current user expert flag if available
    const currentUser = JSON.parse(localStorage.getItem('cc_user') || '{}');
    if (currentUser && currentUser.verifiedExpert) return true;
    
    // 3. Check if any featured video is from this user and marked expert (fallback)
    const userId = currentUser?.id;
    if (userId) {
       return this.featuredVideos().some(v => v.creator?.id === userId && v.creator?.verifiedExpert);
    }

    return false;
  }

  canManage(video: Video): boolean {
    const currentUser = JSON.parse(localStorage.getItem('cc_user') || '{}');
    if (!currentUser || !currentUser.id) return false;
    
    // Admin can manage everything
    if (this.authService.hasRole('ADMIN')) return true;
    
    // Creator can manage their own content
    return video.creator?.id === currentUser.id;
  }

  stats = [
    { label: 'Video Lessons', value: 0, target: 0, icon: BookOpen, shadow: 'rgba(34, 197, 94, 0.15)', class: 'card-asymmetric-1' },
    { label: 'Verified Experts', value: 18, target: 18, icon: ShieldCheck, shadow: 'rgba(59, 130, 246, 0.15)', class: 'card-asymmetric-2' },
    { label: 'Active Learners', value: 8.4, target: 8.4, suffix: 'K', icon: Users, shadow: 'rgba(232, 93, 4, 0.15)', class: 'card-asymmetric-3' },
    { label: 'Certifications', value: 0, target: 0, icon: Medal, shadow: 'rgba(212, 165, 116, 0.15)', class: 'card-asymmetric-4' },
  ];

  // Toast notification state
  toast: { message: string; type: 'success' | 'error' } | null = null;
  private toastTimeout: any;

  // Video Creation/Edit Modal
  showVideoModal = false;
  isEditingVideo = false;
  editingVideoId: string | null = null;
  isSubmittingVideo = false;
  selectedFile: File | null = null;
  selectedFilePreview: string | null = null;

  featuredVideos = signal<Video[]>([]);
  courses = signal<Course[]>([]);
  certifications = signal<Certification[]>([]);

  videoForm = {
    title: '',
    videoUrl: '',
    thumbnailUrl: '',
    category: 'Experience',
    type: 'REEL',
    description: ''
  };

  constructor(
    private router: Router,
    private academyService: AcademyService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.initMistAnimation();
    this.loadAcademyData();
  }

  private loadAcademyData() {
    this.academyService.getCourses().subscribe({
      next: (courses) => {
        this.courses.set(courses);
        this.stats[0].value = courses.length;
        this.stats[0].target = courses.length;
      },
      error: (err) => console.error('Failed to load courses:', err)
    });
    this.academyService.getCertifications().subscribe({
      next: (certs) => {
        this.certifications.set(certs);
        this.stats[3].value = certs.length;
        this.stats[3].target = certs.length;
      },
      error: (err) => console.error('Failed to load certifications:', err)
    });
    this.academyService.getVideos().subscribe({
      next: (videos) => this.featuredVideos.set(videos),
      error: (err) => console.error('Failed to load videos:', err)
    });
  }

  showToast(message: string, type: 'success' | 'error') {
    clearTimeout(this.toastTimeout);
    this.toast = { message, type };
    this.toastTimeout = setTimeout(() => this.toast = null, 3500);
  }

  uploadReel() {
    this.isEditingVideo = false;
    this.editingVideoId = null;
    this.videoForm = {
      title: '',
      videoUrl: '',
      thumbnailUrl: '',
      category: 'Experience',
      type: 'REEL',
      description: ''
    };
    this.selectedFile = null;
    this.selectedFilePreview = null;
    this.showVideoModal = true;
  }

  editVideo(video: Video, event: Event) {
    event.stopPropagation();
    this.isEditingVideo = true;
    this.editingVideoId = video.id || null;
    this.videoForm = {
      title: video.title,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      category: video.category,
      type: video.type,
      description: video.description
    };
    this.selectedFile = null;
    this.selectedFilePreview = null;
    this.showVideoModal = true;
  }

  deleteVideo(id: string, event: Event) {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this content?')) {
      this.academyService.deleteVideo(id).subscribe({
        next: () => {
          this.showToast('Content deleted successfully.', 'success');
          this.loadAcademyData();
        },
        error: (err) => {
          console.error('Delete failed:', err);
<<<<<<< HEAD
          this.showToast('Error deleting content.', 'error');
=======
          this.showToast('Error during deletion.', 'error');
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
        }
      });
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Cleanup previous preview if it was an object URL
      if (this.selectedFilePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(this.selectedFilePreview);
      }

      this.selectedFile = file;
      
      // Create preview using object URL (more reliable for large files/videos)
      if (file.type.startsWith('image/')) {
        this.selectedFilePreview = URL.createObjectURL(file);
      } else {
        this.selectedFilePreview = null; // Don't try to preview videos as images
      }
      
      this.cdr.detectChanges();
    }
  }

  removeSelectedFile() {
    if (this.selectedFilePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(this.selectedFilePreview);
    }
    this.selectedFile = null;
    this.selectedFilePreview = null;
    this.cdr.detectChanges();
  }

  closeVideoModal() {
    this.showVideoModal = false;
  }

  submitVideo() {
    if (!this.videoForm.title) {
      this.showToast('Please enter a title.', 'error');
      return;
    }

    this.isSubmittingVideo = true;

    const createVideoEntry = (mediaUrl: string) => {
      const currentUser = this.authService.getToken() ? JSON.parse(localStorage.getItem('cc_user') || '{}') : null;

      const newVideo: Partial<Video> = {
        title: this.videoForm.title.trim(),
        videoUrl: mediaUrl.trim(),
        thumbnailUrl: this.videoForm.thumbnailUrl || (mediaUrl.match(/\.(jpeg|jpg|gif|png|webp|avif|svg)(\?.*)?$/i) != null ? mediaUrl : 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80'),
        category: this.videoForm.category,
        description: this.videoForm.description,
        type: 'REEL',
        takeaways: [],
        creator: currentUser 
          ? { 
              id: currentUser.id, 
              username: currentUser.username, 
              name: currentUser.name || currentUser.username,
              verifiedExpert: currentUser.verifiedExpert || false
            }
          : { id: 'admin', username: 'admin', name: 'Explorer', verifiedExpert: true }
      };

      if (this.isEditingVideo && this.editingVideoId) {
        this.academyService.updateVideo(this.editingVideoId, newVideo).subscribe({
          next: () => {
            this.isSubmittingVideo = false;
            this.showVideoModal = false;
<<<<<<< HEAD
            this.showToast('Content updated!', 'success');
=======
            this.showToast('Content updated! 🛠️', 'success');
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
            this.loadAcademyData();
          },
          error: (err) => {
            this.isSubmittingVideo = false;
            console.error('Failed to update video:', err);
<<<<<<< HEAD
            this.showToast('Error updating content.', 'error');
=======
            this.showToast('Error during update.', 'error');
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
          }
        });
      } else {
        this.academyService.createVideo(newVideo).subscribe({
          next: () => {
            this.isSubmittingVideo = false;
            this.showVideoModal = false;
<<<<<<< HEAD
            this.showToast('Content added successfully!', 'success');
=======
            this.showToast('Content added successfully! 🎉', 'success');
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
            this.loadAcademyData();
          },
          error: (err) => {
            this.isSubmittingVideo = false;
            console.error('Failed to create video:', err);
<<<<<<< HEAD
            this.showToast('Error adding content.', 'error');
=======
            this.showToast('Error during content addition.', 'error');
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
          }
        });
      }
    };

    if (this.selectedFile) {
      this.academyService.uploadFile(this.selectedFile).subscribe({
        next: (resp) => createVideoEntry(resp.url),
        error: (err) => {
          this.isSubmittingVideo = false;
          console.error('File upload failed:', err);
          this.showToast('File upload failed.', 'error');
        }
      });
    } else if (this.videoForm.videoUrl) {
      createVideoEntry(this.videoForm.videoUrl);
    } else {
      this.isSubmittingVideo = false;
<<<<<<< HEAD
      this.showToast('Please select a file or enter a URL.', 'error');
=======
      this.showToast('Please choose a file or a URL.', 'error');
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
    }
  }

  ngAfterViewInit() {
    this.initScrollReveal();
  }

  initMistAnimation() {
<<<<<<< HEAD
    // Animation initialization placeholder - GSAP can be added if needed
  }

  initScrollReveal() {
    // Scroll reveal initialization placeholder - GSAP can be added if needed
=======
    gsap.to('.mist-layer', {
      x: '20%',
      y: '10%',
      duration: 20,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }

  initScrollReveal() {
    gsap.from('.stagger-card', {
      scrollTrigger: {
        trigger: '.certification-section',
        start: 'top 80%'
      },
      y: 100,
      opacity: 0,
      duration: 1,
      stagger: 0.1,
      ease: 'back.out(1.7)'
    });
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
  }

  getIcon(iconName: string) {
    const icons: Record<string, any> = {
      'book-open': BookOpen,
      'trending-up': TrendingUp,
      'clock': Clock,
      'star': Star
    };
    return icons[iconName] || Award;
  }

  viewVideo(id: string) {
    this.router.navigate(['/academy/video', id]);
  }

  startLearning() {
    const el = document.getElementById('featured-videos');
    el?.scrollIntoView({ behavior: 'smooth' });
  }

  viewCertifications() {
    this.router.navigate(['/academy/certifications']);
  }

  viewMyProgress() {
    this.router.navigate(['/academy/my-progress']);
  }

  viewCourse(id: string) {
    this.router.navigate(['/academy', id]);
  }

  viewLibrary() {
    this.router.navigate(['/academy']);
  }
}
