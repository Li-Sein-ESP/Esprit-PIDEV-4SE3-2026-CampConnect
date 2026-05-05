import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, timeout } from 'rxjs';
import { GroupMessage } from '../models/group.model';
import { environment } from '../../../../environments/environment';
import SockJS from 'sockjs-client';
import { Client, Message } from '@stomp/stompjs';
 
@Injectable({
  providedIn: 'root'
})
export class GroupChatService {
  private apiUrl = `${environment.apiUrl}/groups`;
  private wsUrl = `http://localhost:8089/ws`; // Base URL for WebSocket
  private TIME_OUT = 8000;
  
  private stompClient: Client | null = null;
  private messageSubject = new BehaviorSubject<GroupMessage | null>(null);
  public message$ = this.messageSubject.asObservable();
 
  constructor(private http: HttpClient) { }
 
  /**
   * Initialize WebSocket connection for a specific group
   */
  connect(groupId: string) {
    if (this.stompClient && this.stompClient.active) {
        this.stompClient.deactivate();
    }
 
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(this.wsUrl),
      debug: (msg) => console.log('STOMP Debug:', msg),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });
 
    this.stompClient.onConnect = (frame) => {
      console.log('Connected to WebSocket');
      this.stompClient?.subscribe(`/topic/group/${groupId}`, (message: Message) => {
        if (message.body) {
          const chatMsg = JSON.parse(message.body);
          console.log('Received message from WebSocket:', chatMsg);
          
          // Map backend ChatMessage to frontend GroupMessage
          const groupMsg: GroupMessage = {
            id: chatMsg.id || Date.now().toString(),
            groupId: chatMsg.groupId || groupId,
            senderUserId: chatMsg.senderId,
            senderName: chatMsg.senderName,
            content: chatMsg.content,
            imageUrl: chatMsg.imageUrl,
            createdAt: chatMsg.timestamp || new Date().toISOString()
          };
          this.messageSubject.next(groupMsg);
        }
      });
    };
 
    this.stompClient.onStompError = (frame) => {
      console.error('STOMP Error:', frame.headers['message']);
    };
 
    this.stompClient.activate();
  }
 
  /**
   * Disconnect WebSocket
   */
  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
    }
  }
 
  /**
   * Send a real-time message via WebSocket
   */
  sendRealTimeMessage(groupId: string, senderId: string, senderName: string, content: string, imageUrl: string | null = null) {
    if (this.stompClient && this.stompClient.active) {
      const chatMessage = {
        senderId,
        senderName,
        content,
        imageUrl,
        groupId,
        type: 'CHAT'
      };
      this.stompClient.publish({
        destination: `/app/chat.sendMessage/${groupId}`,
        body: JSON.stringify(chatMessage)
      });
    } else {
        console.error('STOMP client not connected');
    }
  }
 
  /**
   * Fetch historical messages for a group
   */
  getMessages(groupId: string): Observable<GroupMessage[]> {
    return this.http.get<GroupMessage[]>(`${this.apiUrl}/${groupId}/messages`).pipe(
      timeout(this.TIME_OUT)
    );
  }
 
  /**
   * Delete a message by ID
   */
  deleteMessage(messageId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${messageId}`).pipe(
      timeout(this.TIME_OUT)
    );
  }
 
  /**
   * Mock messages for dev
   */
  getMockMessages(groupId: string): GroupMessage[] {
    return [
      {
        id: 'msg-1',
        groupId: groupId,
        senderUserId: 'me',
        content: 'Salut le groupe ! Prêts pour l\'Atlas ?',
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'msg-2',
        groupId: groupId,
        senderUserId: 'u2',
        content: 'Totalement prêts ! J\'ai préparé la tente 3 places.',
        createdAt: new Date(Date.now() - 3000000).toISOString()
      }
    ];
  }
}
