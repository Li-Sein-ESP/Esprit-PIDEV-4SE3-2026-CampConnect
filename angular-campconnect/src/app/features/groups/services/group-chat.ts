import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { GroupMessage } from '../models/group.model';

@Injectable({
  providedIn: 'root'
})
export class GroupChatService {
  private apiUrl = 'http://localhost:8080/api/groups';
  private TIME_OUT = 3000;

  constructor(private http: HttpClient) { }

  /**
   * Fetch historical messages for a group
   */
  getMessages(groupId: string): Observable<GroupMessage[]> {
    return this.http.get<GroupMessage[]>(`${this.apiUrl}/${groupId}/messages`).pipe(
      timeout(this.TIME_OUT)
    );
  }

  /**
   * Send a new message to the group
   */
  sendMessage(groupId: string, content: string): Observable<GroupMessage> {
    const payload = { content };
    return this.http.post<GroupMessage>(`${this.apiUrl}/${groupId}/messages`, payload).pipe(
      timeout(this.TIME_OUT)
    );
  }

  // --- MOCK DATA --- 
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
      },
      {
        id: 'msg-3',
        groupId: groupId,
        senderUserId: 'u3',
        content: 'Moi je m\'occupe de la nourriture. On fait les courses quand ?',
        createdAt: new Date(Date.now() - 2400000).toISOString()
      }
    ];
  }
}
