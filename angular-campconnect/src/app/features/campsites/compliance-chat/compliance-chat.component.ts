import { Component, Input, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

@Component({
  selector: 'app-compliance-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
      <!-- Header -->
      <div class="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div class="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div>
          <h4 class="text-white font-semibold text-sm leading-tight">Eco Compliance Assistant</h4>
          <p class="text-emerald-100 text-xs">Powered by AI · Rules-grounded answers only</p>
        </div>
        <div class="ml-auto flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
          <span class="text-emerald-100 text-xs">Online</span>
        </div>
      </div>

      <!-- Message Thread -->
      <div
        #messageContainer
        class="h-80 overflow-y-auto px-4 py-4 space-y-3 bg-gradient-to-b from-emerald-50/40 to-white"
      >
        <div
          *ngFor="let msg of messages; let i = index"
          class="flex"
          [class.justify-end]="msg.role === 'user'"
          [class.justify-start]="msg.role === 'assistant'"
        >
          <!-- Assistant avatar -->
          <div *ngIf="msg.role === 'assistant'" class="flex items-end gap-2 max-w-[85%]">
            <div class="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 mb-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064"/>
              </svg>
            </div>
            <div class="bg-white border border-emerald-100 text-gray-700 text-sm rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm leading-relaxed">
              {{ msg.content }}
            </div>
          </div>

          <!-- User bubble -->
          <div *ngIf="msg.role === 'user'" class="max-w-[80%]">
            <div class="bg-gradient-to-br from-emerald-600 to-teal-600 text-white text-sm rounded-2xl rounded-br-sm px-4 py-2.5 shadow-sm leading-relaxed">
              {{ msg.content }}
            </div>
          </div>
        </div>

        <!-- Loading indicator -->
        <div *ngIf="isLoading" class="flex justify-start">
          <div class="flex items-end gap-2">
            <div class="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945"/>
              </svg>
            </div>
            <div class="bg-white border border-emerald-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div class="flex gap-1.5 items-center">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style="animation-delay: 0ms"></span>
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style="animation-delay: 150ms"></span>
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style="animation-delay: 300ms"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Error message -->
        <div *ngIf="errorMessage" class="flex justify-center">
          <div class="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-3 py-2">
            {{ errorMessage }}
          </div>
        </div>
      </div>

      <!-- Input Row -->
      <div class="px-4 py-3 border-t border-emerald-100 bg-white">
        <form (ngSubmit)="sendMessage()" class="flex items-center gap-2">
          <input
            id="compliance-chat-input"
            [(ngModel)]="inputText"
            name="inputText"
            type="text"
            placeholder="Ask about fires, waste, wildlife..."
            [disabled]="isLoading"
            autocomplete="off"
            class="flex-1 text-sm px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all placeholder-gray-400"
          />
          <button
            id="compliance-chat-send-btn"
            type="submit"
            [disabled]="isLoading || !inputText.trim()"
            class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center flex-shrink-0 hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <svg *ngIf="!isLoading" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
            <svg *ngIf="isLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
          </button>
        </form>
        <p class="text-center text-gray-400 text-xs mt-2">Answers based solely on published environmental rules</p>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class ComplianceChatComponent implements OnInit, AfterViewChecked {
  @Input() campsiteId: string = '';
  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  messages: ChatMessage[] = [];
  inputText = '';
  isLoading = false;
  errorMessage = '';

  private readonly apiUrl = `${environment.apiUrl}/compliance-chat`;
  private readonly MAX_HISTORY_TURNS = 6;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.messages.push({
      role: 'assistant',
      content: "Hi! Ask me anything about the environmental rules for this campsite — fires, waste, wildlife, and more."
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  sendMessage(): void {
    const text = this.inputText.trim();
    if (!text || this.isLoading) return;

    this.errorMessage = '';
    this.messages.push({ role: 'user', content: text });
    this.inputText = '';
    this.isLoading = true;

    // Build conversation history (up to last MAX_HISTORY_TURNS turns, excluding the initial greeting)
    const history = this.messages
      .slice(1)                              // skip the initial greeting
      .slice(-this.MAX_HISTORY_TURNS * 2)   // keep last N turns (each turn = 2 messages)
      .slice(0, -1)                          // exclude the user message we just pushed (it goes as userMessage)
      .map(m => ({ role: m.role, content: m.content }));

    this.http.post<string>(this.apiUrl, {
      campsiteId: this.campsiteId,
      userMessage: text,
      conversationHistory: history
    }, { responseType: 'text' as 'json' }).subscribe({
      next: (reply: string) => {
        this.messages.push({ role: 'assistant', content: reply });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Compliance chat error:', err);
        this.errorMessage = err.status === 401
          ? 'Please log in to use the compliance assistant.'
          : 'Could not reach the assistant. Please try again.';
        this.isLoading = false;
      }
    });
  }

  private scrollToBottom(): void {
    try {
      this.messageContainer.nativeElement.scrollTop =
        this.messageContainer.nativeElement.scrollHeight;
    } catch {}
  }
}
