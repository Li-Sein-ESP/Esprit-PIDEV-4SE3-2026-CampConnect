import { Component, OnInit, OnDestroy, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Send, Image, Paperclip, Smile, X, Trash2 } from 'lucide-angular';
import { GroupChatService } from '../services/group-chat';
import { GroupMessage, GroupDetail } from '../models/group.model';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';
 
@Component({
    selector: 'app-group-chat',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    templateUrl: './group-chat.component.html',
    styleUrl: './group-chat.component.css'
})
export class GroupChatComponent implements OnInit, OnDestroy {
    @Input() groupId!: string;
    @Input() group: GroupDetail | null = null;
    @Input() currentUserId: string | null = null;
 
    messages: GroupMessage[] = [];         // messages list
    newMessage: string = '';
    loading = true;
    showEmojiPicker = false;
    selectedImagePreview: string | null = null;
    fullScreenImage: string | null = null;
    messageToDelete: string | null = null;
 
    private messageSubscription: Subscription | null = null;
 
    constructor(
        private chatService: GroupChatService,
        private authService: AuthService,
        private cdr: ChangeDetectorRef
    ) { }
 
    // Merged view for the template
    get allMessages(): GroupMessage[] {
        return [...this.messages].sort((a, b) => {
            const ta = new Date(Array.isArray(a.createdAt as any)
                ? new Date((a.createdAt as any)[0], (a.createdAt as any)[1]-1, (a.createdAt as any)[2], (a.createdAt as any)[3], (a.createdAt as any)[4]).toISOString()
                : a.createdAt).getTime();
            const tb = new Date(Array.isArray(b.createdAt as any)
                ? new Date((b.createdAt as any)[0], (b.createdAt as any)[1]-1, (b.createdAt as any)[2], (b.createdAt as any)[3], (b.createdAt as any)[4]).toISOString()
                : b.createdAt).getTime();
            return ta - tb;
        });
    }
 
    readonly emojiList = [
        '😀','😂','😍','🥰','😎','🤔','😅','🙏',
        '👍','👎','❤️','🔥','🎉','✅','⚡','🌿',
        '🏕️','⛺','🌲','🗺️','🎒','🧭','🌄','🤝',
        '😢','😡','😴','🤩','🥳','💪','🫡','🌟'
    ];
 
    // Icons
    readonly Send = Send;
    readonly Image = Image;
    readonly Paperclip = Paperclip;
    readonly Smile = Smile;
    readonly X = X;
    readonly Trash2 = Trash2;
 
    ngOnInit(): void {
        if (this.groupId) {
            this.loadMessages();
            
            // Subscribe to incoming messages (Connection is handled by Parent Dashboard)
            this.messageSubscription = this.chatService.message$.subscribe((msg: GroupMessage | null) => {
                if (msg && msg.groupId === this.groupId) {
                    // Prevent duplicates
                    const exists = this.messages.some(m => m.id === msg.id || (m.content === msg.content && m.senderUserId === msg.senderUserId));
                    if (!exists) {
                        this.messages.push(msg);
                        this.scrollToBottom();
                        this.cdr.detectChanges();
                    }
                }
            });
        }
    }
 
    ngOnDestroy(): void {
        if (this.messageSubscription) {
            this.messageSubscription.unsubscribe();
        }
        // Disconnect is now handled by the parent GroupDashboardComponent 
        // to maintain the STOMP connection when switching tabs.
    }
 
    loadMessages(showLoader = true) {
        if (showLoader) this.loading = true;
        this.chatService.getMessages(this.groupId).subscribe({
            next: (msgs: GroupMessage[]) => {
                this.messages = msgs;
                if (showLoader) this.loading = false;
                this.scrollToBottom();
                this.cdr.detectChanges();
            },
            error: () => {
                if (this.messages.length === 0) {
                    this.messages = this.chatService.getMockMessages(this.groupId);
                }
                if (showLoader) this.loading = false;
                setTimeout(() => this.scrollToBottom(), 100);
                this.cdr.detectChanges();
            }
        });
    }
 
    sendMessage() {
        const text = this.newMessage;
        const imageUrl = this.selectedImagePreview;
 
        if (!text.trim() && !imageUrl) return;
        
        const senderName = this.getUserName(this.currentUserId!);
 
        this.newMessage = '';
        this.selectedImagePreview = null;
        this.showEmojiPicker = false;
 
        // Send via WebSocket for instant update for everyone
        this.chatService.sendRealTimeMessage(this.groupId, this.currentUserId!, senderName, text, imageUrl);
    }
 
    confirmDelete(msgId: string) {
        this.messageToDelete = msgId;
    }
 
    cancelDelete() {
        this.messageToDelete = null;
    }
 
    deleteMessage() {
        if (!this.messageToDelete) return;
        const msgId = this.messageToDelete;
        this.messageToDelete = null;
 
        this.messages = this.messages.filter(m => m.id !== msgId);
        if (!msgId.startsWith('msg-')) {
            this.chatService.deleteMessage(msgId).subscribe({
                error: (err: any) => console.error('Failed to delete message', err)
            });
        }
    }
 
    toggleEmojiPicker() {
        this.showEmojiPicker = !this.showEmojiPicker;
    }
 
    insertEmoji(emoji: string) {
        this.newMessage += emoji;
        this.showEmojiPicker = false;
    }
 
    onFileSelected(event: Event) {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = () => {
            this.selectedImagePreview = reader.result as string;
        };
        reader.readAsDataURL(file);
        (event.target as HTMLInputElement).value = '';
    }
 
    removeImagePreview() {
        this.selectedImagePreview = null;
    }
 
    openFullScreenImage(url: string) {
        this.fullScreenImage = url;
    }
 
    closeFullScreenImage() {
        this.fullScreenImage = null;
    }
 
    formatTime(createdAt: any): string {
        let date: Date;
        if (Array.isArray(createdAt)) {
            date = new Date(createdAt[0], createdAt[1] - 1, createdAt[2], createdAt[3], createdAt[4], createdAt[5] || 0);
        } else {
            date = new Date(createdAt);
        }
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
 
    getAvatar(userId: string): string {
        const member = this.group?.members?.find((m: any) => m.id === userId);
        if (member?.avatar) return member.avatar;
        const name = member?.name || member?.username || userId;
        return `https://ui-avatars.com/api/?name=${name}&background=random&size=40`;
    }
 
    getMemberName(userId: string): string {
        if (userId === this.currentUserId) return 'You';
        const member = this.group?.members?.find((m: any) => m.id === userId);
        return member?.name || member?.username || userId;
    }
 
    getUserName(userId: string): string {
        return this.getMemberName(userId);
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
