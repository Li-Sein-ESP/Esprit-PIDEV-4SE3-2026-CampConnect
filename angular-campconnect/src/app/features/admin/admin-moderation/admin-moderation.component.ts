import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';

interface ModerationPost {
  id: string;
  title: string;
  content: string;
  authorName?: string;
  category?: string;
}

interface ModerationComment {
  id: string;
  postId: string;
  content: string;
  authorName?: string;
}

@Component({
  selector: 'app-admin-moderation-component',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonComponent,
    CardComponent,
    CardContentComponent
  ],
  templateUrl: './admin-moderation.component.html',
  styles: []
})
export class AdminModerationComponent implements OnInit {
  private readonly baseUrl = `${environment.apiUrl}/admin/community`;

  loading = false;
  error: string | null = null;

  posts: ModerationPost[] = [];
  comments: ModerationComment[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadModerationData();
  }

  loadModerationData(): void {
    this.loading = true;
    this.error = null;

    this.http.get<ModerationPost[]>(`${this.baseUrl}/posts`).subscribe({
      next: (posts) => {
        this.posts = Array.isArray(posts) ? posts : [];
      },
      error: () => {
        this.error = 'Failed to load community posts.';
      }
    });

    this.http.get<ModerationComment[]>(`${this.baseUrl}/comments`).pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: (comments) => {
        this.comments = Array.isArray(comments) ? comments : [];
      },
      error: () => {
        this.error = this.error ?? 'Failed to load comments.';
      }
    });
  }

  flagPost(id: string): void {
    this.http.put(`${this.baseUrl}/posts/${id}/flag`, {}).subscribe({
      next: () => {
        this.posts = this.posts.map(p => p.id === id ? { ...p, title: `[FLAGGED] ${p.title}` } : p);
      }
    });
  }

  deletePost(id: string): void {
    this.http.delete(`${this.baseUrl}/posts/${id}`).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.id !== id);
      }
    });
  }

  deleteComment(id: string): void {
    this.http.delete(`${this.baseUrl}/comments/${id}`).subscribe({
      next: () => {
        this.comments = this.comments.filter(c => c.id !== id);
      }
    });
  }
}
