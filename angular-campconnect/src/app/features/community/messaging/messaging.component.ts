import { Component, ElementRef, ViewChild, AfterViewChecked, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';

export interface User {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  verified?: boolean;
}

export interface Message {
  senderId: string;
  text?: string;
  imageUrl?: string;
  time: string;
  read?: boolean;
}

export interface Conversation {
  id: string;
  user: User;
  lastMessage: string;
  unread: number;
  messages: Message[];
}

@Component({
  selector: 'app-messaging',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './messaging.component.html',
  styleUrl: './messaging.component.scss',
})
export class MessagingComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('chatMessages') private chatContainer!: ElementRef;

  conversations: Conversation[] = [];
  activeConversation: Conversation | null = null;
  newMessageText: string = '';
  isMobileListHidden: boolean = false;
  currentUserId: string = 'me';

  constructor(
    private route: ActivatedRoute,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit() {
    // Hide the global site footer while messaging is open
    this.document.body.classList.add('messaging-page-active');

    this.initMockData();

    // Check if there's an ID in the route to pre-select a conversation
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        const conv = this.conversations.find(c => c.id === id);
        if (conv) {
          this.selectConversation(conv);
        }
      } else if (this.conversations.length > 0) {
        this.selectConversation(this.conversations[0]);
      }
    });
  }

  ngOnDestroy() {
    // Restore the footer when navigating away
    this.document.body.classList.remove('messaging-page-active');
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  selectConversation(conv: Conversation) {
    this.activeConversation = conv;
    conv.unread = 0; // mark as read
    this.isMobileListHidden = true; // hide list on mobile, show chat
    setTimeout(() => this.scrollToBottom(), 50);
  }

  backToList() {
    this.isMobileListHidden = false;
    this.activeConversation = null;
  }

  sendMessage() {
    const text = this.newMessageText.trim();
    if (!text || !this.activeConversation) return;

    const newMsg: Message = {
      senderId: this.currentUserId,
      text: text,
      time: this.getCurrentTime(),
      read: true
    };

    this.activeConversation.messages.push(newMsg);
    this.activeConversation.lastMessage = `You: ${text}`;
    this.newMessageText = '';
  }

  addEmoji(emoji: string) {
    this.newMessageText += emoji;
  }

  private scrollToBottom(): void {
    try {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    } catch (err) { }
  }

  private getCurrentTime(): string {
    const now = new Date();
    let hours = now.getHours();
    let mins = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${mins} ${ampm}`;
  }

  private initMockData() {
    this.conversations = [
      {
        id: 'sarah-c',
        user: {
          id: 'sarah-c',
          name: 'Sarah Chen',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
          online: true,
          verified: true
        },
        lastMessage: 'I think I\'ll go with the Half Dome since it\'s my first serious backpacking tent. Can\'t wait to plan this trip!',
        unread: 0,
        messages: [
          { senderId: 'sarah-c', text: 'Hey! 👋 How was your weekend at Yosemite? I saw your post and the photos looked absolutely stunning!', time: '9:15 AM' },
          { senderId: 'me', text: 'It was incredible! The weather was perfect — clear skies every day. We hiked the Mist Trail and camped near the Merced River.', time: '9:22 AM', read: true },
          { senderId: 'sarah-c', text: 'Oh wow, that\'s absolutely gorgeous! 😍 The colors in that sky are unreal. Did you use a filter or is that natural?', time: '9:28 AM' },
          { senderId: 'me', text: '100% natural! No filters needed when nature does all the work ✨', time: '9:30 AM', read: true },
          { senderId: 'sarah-c', text: 'So about that gear list — should I go with the Half Dome or the Big Agnes? I\'ve heard good things about both for 3-season camping.', time: '10:25 AM' },
          { senderId: 'me', text: 'Honestly, the Half Dome is hard to beat for the price. But if budget isn\'t a concern, the Big Agnes Copper Spur is lighter and packs down smaller. Depends on whether you\'re prioritizing weight or value!', time: '10:31 AM', read: true },
          { senderId: 'sarah-c', text: 'Great advice, thank you! 🙏 I think I\'ll go with the Half Dome since it\'s my first serious backpacking tent. Can\'t wait to plan this trip!', time: '10:34 AM' }
        ]
      },
      {
        id: 'mike-r',
        user: {
          id: 'mike-r',
          name: 'Mike Rivera',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
          online: true
        },
        lastMessage: 'Hey! Did you check out that new trail near...',
        unread: 2,
        messages: [
          { senderId: 'mike-r', text: 'Hey! Did you check out that new trail near Big Sur?', time: '15m ago' },
          { senderId: 'mike-r', text: 'I heard it is open again now.', time: '14m ago' }
        ]
      },
      {
        id: 'emma-w',
        user: {
          id: 'emma-w',
          name: 'Emma Wilson',
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face',
          online: false
        },
        lastMessage: 'The photos from Yosemite are incredible! 📸',
        unread: 1,
        messages: [
          { senderId: 'emma-w', text: 'The photos from Yosemite are incredible! 📸', time: '1h ago' }
        ]
      },
      {
        id: 'jordan-p',
        user: {
          id: 'jordan-p',
          name: 'Jordan Park',
          avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcabd9c?w=100&h=100&fit=crop&crop=face',
          online: false
        },
        lastMessage: 'You: Thanks! I\'ll send you the gear list 👍',
        unread: 0,
        messages: [
          { senderId: 'jordan-p', text: 'Can you show me the gear list you used?', time: '4h ago' },
          { senderId: 'me', text: 'Thanks! I\'ll send you the gear list 👍', time: '3h ago', read: true }
        ]
      }
    ];
  }
}
