import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, MessageSquare, Shield, Trash2, Pencil, CheckCircle, AlertTriangle } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardContentComponent, CardHeaderComponent, CardTitleComponent } from '../../../shared/components/card.component';
import { CommunityService } from '../../community/services/community.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-moderation-component',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    ButtonComponent,
    CardComponent,
    CardContentComponent,
    CardHeaderComponent,
    CardTitleComponent,
    FormsModule
  ],
  templateUrl: './admin-moderation.component.html',
  styles: []
})
export class AdminModerationComponent implements OnInit {
  MessageSquareIcon = MessageSquare;
  ShieldIcon = Shield;
  TrashIcon = Trash2;
  PencilIcon = Pencil;
  CheckIcon = CheckCircle;
  AlertIcon = AlertTriangle;

  threads = signal<any[]>([]);
  showForm = false;
  editingThread: any | null = null;
  threadForm: any = {
    title: '',
    status: 'OPEN'
  };

  constructor(private communityService: CommunityService) { }

  ngOnInit(): void {
    this.loadThreads();
  }

  loadThreads() {
    this.communityService.getThreads().subscribe(threads => {
      this.threads.set(threads);
    });
  }

  openAddForm() {
    this.editingThread = null;
    this.threadForm = {
      title: '',
      status: 'OPEN'
    };
    this.showForm = true;
  }

  openEditForm(thread: any) {
    this.editingThread = thread;
    this.threadForm = { ...thread };
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingThread = null;
  }

  saveThread() {
    if (this.editingThread) {
      this.communityService.updateThread(this.editingThread.id, this.threadForm).subscribe(() => {
        this.loadThreads();
        this.closeForm();
      });
    } else {
      this.communityService.createThread(this.threadForm).subscribe(() => {
        this.loadThreads();
        this.closeForm();
      });
    }
  }

  deleteThread(id: string) {
    if (confirm('Are you sure you want to delete this thread? This will also delete all posts and comments within it.')) {
      this.communityService.deleteThread(id).subscribe(() => {
        this.loadThreads();
      });
    }
  }

  updateStatus(thread: any, status: string) {
    const updated = { ...thread, status };
    this.communityService.updateThread(thread.id, updated).subscribe(() => {
      this.loadThreads();
    });
  }
}
