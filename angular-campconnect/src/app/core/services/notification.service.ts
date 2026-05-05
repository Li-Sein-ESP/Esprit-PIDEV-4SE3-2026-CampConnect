import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppNotification } from '../models/notification.model';
import SockJS from 'sockjs-client';
import { Client, Message } from '@stomp/stompjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  private wsUrl = `http://localhost:8089/ws`;
  
  private stompClient: Client | null = null;
  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  
  public notifications$ = this.notificationsSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) { }

  public init(userId: string) {
    this.fetchNotifications(userId);
    this.connectWebSocket(userId);
  }

  private fetchNotifications(userId: string) {
    this.http.get<AppNotification[]>(`${this.apiUrl}/user/${userId}`).subscribe(
      (notifications) => {
        this.notificationsSubject.next(notifications);
        this.updateUnreadCount(notifications);
      },
      (error) => console.error('Failed to load notifications', error)
    );
  }

  private connectWebSocket(userId: string) {
    if (this.stompClient && this.stompClient.active) {
      this.stompClient.deactivate();
    }

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(this.wsUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.stompClient.onConnect = () => {
      console.log('Connected to Notifications WebSocket');
      this.stompClient?.subscribe(`/topic/notifications/${userId}`, (message: Message) => {
        if (message.body) {
          const newNotification: AppNotification = JSON.parse(message.body);
          
          // Add to start of list
          const currentNotifications = this.notificationsSubject.value;
          const updated = [newNotification, ...currentNotifications];
          
          this.notificationsSubject.next(updated);
          this.updateUnreadCount(updated);
          
          // Optional: You can play a sound or show a toast here
        }
      });
    };

    this.stompClient.activate();
  }

  public markAsRead(notificationId: string) {
    this.http.put<AppNotification>(`${this.apiUrl}/${notificationId}/read`, {}).subscribe(
      (updatedNotification) => {
        const current = this.notificationsSubject.value;
        const index = current.findIndex(n => n.id === notificationId);
        if (index > -1) {
          current[index] = updatedNotification;
          this.notificationsSubject.next([...current]);
          this.updateUnreadCount(current);
        }
      }
    );
  }

  public markAllAsRead(userId: string) {
    this.http.put(`${this.apiUrl}/user/${userId}/read-all`, {}).subscribe(() => {
      const current = this.notificationsSubject.value;
      current.forEach(n => n.read = true);
      this.notificationsSubject.next([...current]);
      this.updateUnreadCount(current);
    });
  }

  private updateUnreadCount(notifications: AppNotification[]) {
    const unread = notifications.filter(n => !n.read).length;
    this.unreadCountSubject.next(unread);
  }

  public disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
    }
  }
}
