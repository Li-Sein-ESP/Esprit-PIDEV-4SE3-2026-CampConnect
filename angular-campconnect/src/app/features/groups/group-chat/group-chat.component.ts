import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Send, Image, Paperclip, Smile } from 'lucide-angular';
import { GroupChatService } from '../services/group-chat';
import { GroupMessage } from '../models/group.model';

@Component({
    selector: 'app-group-chat',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    templateUrl: './group-chat.component.html',
    styleUrl: './group-chat.component.css'
})
export class GroupChatComponent implements OnInit, OnDestroy {
    @Input() groupId!: string;

    messages: GroupMessage[] = [];
    newMessage: string = '';
    loading = true;
    currentUserId = 'me'; // Simulation

    // Icons
    readonly Send = Send;
    readonly Image = Image;
    readonly Paperclip = Paperclip;
    readonly Smile = Smile;

    private pollInterval: any;

    constructor(private chatService: GroupChatService) { }

    ngOnInit(): void {
        if (this.groupId) {
            this.loadMessages();
            // Simulate live polling
            this.pollInterval = setInterval(() => this.loadMessages(false), 5000);
        }
    }

    ngOnDestroy(): void {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
        }
    }

    loadMessages(showLoader = true) {
        if (showLoader) this.loading = true;
        this.chatService.getMessages(this.groupId).subscribe({
            next: (msgs) => {
                this.messages = msgs;
                if (showLoader) this.loading = false;
                this.scrollToBottom();
            },
            error: () => {
                // Fallback
                if (this.messages.length === 0) {
                    this.messages = this.chatService.getMockMessages(this.groupId);
                }
                if (showLoader) this.loading = false;
                setTimeout(() => this.scrollToBottom(), 100);
            }
        });
    }

    sendMessage() {
        if (!this.newMessage.trim()) return;

        const content = this.newMessage;
        this.newMessage = ''; // UI Instant clear

        this.chatService.sendMessage(this.groupId, content).subscribe({
            next: (msg) => {
                this.messages.push(msg);
                this.scrollToBottom();
            },
            error: () => {
                // Mock pushing message
                const mockMsg: GroupMessage = {
                    id: 'msg-' + Date.now(),
                    groupId: this.groupId,
                    senderUserId: this.currentUserId,
                    content: content,
                    createdAt: new Date().toISOString()
                };
                this.messages.push(mockMsg);
                setTimeout(() => this.scrollToBottom(), 100);
            }
        });
    }

    formatTime(isoString: string): string {
        return new Date(isoString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }

    getAvatar(userId: string): string {
        return `https://ui-avatars.com/api/?name=${userId}&background=random&size=40`;
    }

    private scrollToBottom() {
        setTimeout(() => {
            const container = document.getElementById('chat-scroll-container');
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        }, 100);
    }
}
