import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  LucideAngularModule,
  Clock, Users, ThumbsUp, ChevronLeft, Share2, Bookmark,
  MessageSquare, CheckCircle, Send, Play, Eye, Award, ShieldCheck, GraduationCap, ArrowRight
} from 'lucide-angular';
import { AcademyService } from '../services/academy.service';
import { Video } from '../models/academy.model';

@Component({
  selector: 'app-knowledge-video-component',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LucideAngularModule
  ],
  templateUrl: './knowledge-video.component.html',
  styles: [`
    :host {
      display: block;
      background-color: #F1EDE1;
    }
    .video-hero-title {
      -webkit-text-stroke: 1px rgba(10, 31, 28, 0.05);
      color: transparent;
      line-height: 0.8;
    }
    .card-asymmetric {
      border-radius: 28px 32px 24px 30px;
    }
    .glass-card {
      background: rgba(10, 31, 28, 0.03);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(10, 31, 28, 0.08);
    }
  `]
})
export class KnowledgeVideoComponent implements OnInit {
  // Icons
  readonly Clock = Clock;
  readonly Users = Users;
  readonly ThumbsUp = ThumbsUp;
  readonly ChevronLeft = ChevronLeft;
  readonly Share2 = Share2;
  readonly Bookmark = Bookmark;
  readonly MessageSquare = MessageSquare;
  readonly CheckCircle = CheckCircle;
  readonly Send = Send;
  readonly Play = Play;
  readonly Eye = Eye;
  readonly Award = Award;
  readonly ShieldCheck = ShieldCheck;
  readonly GraduationCap = GraduationCap;
  readonly ArrowRight = ArrowRight;

  videoId: string = '';
  video: Video | null = null;
  isLoading = true;
  isPlaying = false;
  newComment: string = '';
  commentError: string = '';
  isHelpful: boolean = false;
  isSaved: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private academyService: AcademyService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.videoId = params['videoId'];
      if (this.videoId) {
        this.loadVideo(this.videoId);
      }
    });

    // Safety recovery
    setTimeout(() => {
      if (this.isLoading) {
        this.isLoading = false;
      }
    }, 10000);
  }

  loadVideo(id: string) {
    this.isLoading = true;
    this.isPlaying = false;
    this.academyService.getVideoById(id).subscribe({
      next: (video) => {
        this.video = video;
        this.isLoading = false;
      },
      error: (err) => {
        this.academyService.getVideos().subscribe({
          next: (videos) => {
            this.video = videos.length > 0 ? videos[0] : null;
            this.isLoading = false;
          },
          error: (err2) => {
            this.video = null;
            this.isLoading = false;
          }
        });
      }
    });
  }

  playVideo() {
    this.isPlaying = true;
  }

  getSafeVideoUrl(): SafeResourceUrl {
    if (!this.video || !this.video.videoUrl) return '';

    let url = this.video.videoUrl.trim();
    
    // Ensure absolute protocol for external URLs
    if (this.isExternalVideo() && !url.startsWith('http') && !url.startsWith('//')) {
      url = 'https://' + url;
    } else if (url.startsWith('//')) {
      url = 'https:' + url;
    }

    let transformedUrl = url;

    // YouTube Detection & Extraction
    const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/live\/)([^"&?\/\s]{11})/;
    const ytMatch = url.match(ytRegex);
    
    if (ytMatch && ytMatch[1]) {
      transformedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
    } else if (url.includes('vimeo.com/')) {
      // Vimeo Detection & Extraction
      const vimeoRegex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/;
      const vimeoMatch = url.match(vimeoRegex);
      if (vimeoMatch && vimeoMatch[1]) {
        transformedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
      }
    }

    // Add necessary parameters
    const separator = transformedUrl.includes('?') ? '&' : '?';
    transformedUrl = `${transformedUrl}${separator}autoplay=1&rel=0`;
    
    // Only add origin if it's an external embed
    if (transformedUrl.includes('youtube.com') || transformedUrl.includes('vimeo.com')) {
      transformedUrl += `&origin=${window.location.origin}`;
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(transformedUrl);
  }

  isExternalVideo(): boolean {
    if (!this.video || !this.video.videoUrl) return false;
    const url = this.video.videoUrl.toLowerCase().trim();
    
    // Check for known external providers
    const isExternalProvider = url.includes('youtube.com') || 
                               url.includes('youtu.be') || 
                               url.includes('vimeo.com') || 
                               url.includes('player.vimeo.com') ||
                               url.includes('www.youtube') ||
                               url.includes('m.youtube');
    
    if (isExternalProvider) return true;

    // Fallback: If it's a remote URL (starts with http, but NOT localhost or your current origin)
    // and doesn't have a direct video extension, treat as external
    const isRemote = (url.startsWith('http') && !url.includes(window.location.hostname)) || url.startsWith('www.');
    const hasDirectExtension = url.match(/\.(mp4|webm|ogg|mov|m4v)$/i);
    
    if (isRemote && !hasDirectExtension) {
      return true;
    }

    return false;
  }

  isImage(): boolean {
    if (!this.video || !this.video.videoUrl) return false;
    const url = this.video.videoUrl.toLowerCase().trim();
    
    // Check for common image extensions, even with query params
    const hasImageExtension = url.match(/\.(jpeg|jpg|gif|png|webp|avif|svg)(\?.*)?$/i) != null;
    const isUploadImage = url.includes('/uploads/') && !url.match(/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i);
    
    return hasImageExtension || isUploadImage;
  }

  goBack() {
    this.router.navigate(['/academy']);
  }

  toggleHelpful() {
    this.isHelpful = !this.isHelpful;
    if (this.video) {
      this.video.helpfulCount += this.isHelpful ? 1 : -1;
      // Persist the helpful count update to the server
      this.academyService.toggleVideoHelpful(this.video.id).subscribe({
        error: (err) => {
          console.error('Failed to update helpful count', err);
          // Revert on error
          this.isHelpful = !this.isHelpful;
          if (this.video) {
             this.video.helpfulCount -= this.isHelpful ? 1 : -1;
          }
        }
      });
    }
  }

  toggleSave() {
    this.isSaved = !this.isSaved;
  }

  postComment() {
    this.commentError = '';
    
    if (!this.newComment.trim() || !this.video) return;
    
    // Controle de Saisie (Bad Words Filter)
    const badWords = ['merde', 'putain', 'salope', 'fuck', 'shit', 'bitch', 'connard', 'con', 'stupid', 'idiot'];
    const commentLower = this.newComment.toLowerCase();
    
    for (let word of badWords) {
      if (commentLower.includes(word)) {
        this.commentError = 'Your comment contains inappropriate language.';
        return;
      }
    }

    if (!this.video.comments) {
      this.video.comments = [];
    }
    
    // Add comment locally for instant UI update
    const tempComment = {
      id: String(Date.now()),
      content: this.newComment.trim(),
      authorId: 'current-user',
      authorName: 'You',
      createdAt: new Date().toISOString()
    };
    this.video.comments.unshift(tempComment);
    
    // Persist to backend
    this.academyService.addVideoComment(this.video.id, tempComment.content).subscribe({
      next: (savedComment) => {
        // Replace with the real saved comment id
        if (this.video && this.video.comments) {
          const idx = this.video.comments.findIndex(c => c.id === tempComment.id);
          if (idx !== -1) {
             this.video.comments[idx] = savedComment;
          }
        }
      },
      error: (err) => {
        console.error('Failed to save comment', err);
        // Rollback local change if failed
        if (this.video && this.video.comments) {
          const idx = this.video.comments.findIndex(c => c.id === tempComment.id);
          if (idx !== -1) this.video.comments.splice(idx, 1);
        }
      }
    });

    this.newComment = '';
  }

  shareVideo() {
    if (this.video) {
      if (navigator.share) {
        navigator.share({
          title: this.video.title,
          text: `Watching "${this.video.title}" on Wilderness Academy!`,
          url: window.location.href
        }).catch(() => {
          navigator.clipboard.writeText(window.location.href);
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
      }
    }
  }

  navigateToVideo(videoId: string) {
    this.router.navigate(['/academy/video', videoId]);
  }

  navigateToExpert(expertId: string) {
    this.router.navigate(['/academy/expert', expertId]);
  }
}
