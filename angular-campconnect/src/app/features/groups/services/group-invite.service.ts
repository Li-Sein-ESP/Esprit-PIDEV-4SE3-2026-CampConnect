import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, switchMap, of, defaultIfEmpty, catchError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UserService } from '../../../core/services/user.service';
import { TripIntentService } from '../../trip-intents/services/trip-intent.service';
import { TripIntent } from '../../trip-intents/models/trip-intent.model';

import { InviteStatus, GroupInvite, GroupInviteDetail } from '../models/group-invite.model';

@Injectable({
  providedIn: 'root'
})
export class GroupInviteService {
  private apiUrl = `${environment.apiUrl}/group-invites`;

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private tripIntentService: TripIntentService
  ) { }

  getInvitesByFromUser(userId: string): Observable<GroupInvite[]> {
    return this.http.get<GroupInvite[]>(`${this.apiUrl}/from-user/${userId}`);
  }

  getInviteDetailsForUser(userId: string): Observable<GroupInviteDetail[]> {
    return this.http.get<GroupInviteDetail[]>(`${this.apiUrl}/user/${userId}/details`);
  }

  getInviteDetailsFromUser(userId: string): Observable<GroupInviteDetail[]> {
    return this.http.get<GroupInviteDetail[]>(`${this.apiUrl}/from-user/${userId}/details`);
  }

  getInvitesWithDetails(userId: string): Observable<any[]> {
    const received$ = this.getInviteDetailsForUser(userId).pipe(
      map(invites => invites.map(i => ({ invite: i, sender: i.sender, receiver: i.receiver, trip: i.trip, type: 'received' as 'received' })))
    );

    const sent$ = this.getInviteDetailsFromUser(userId).pipe(
      map(invites => invites.map(i => ({ invite: i, sender: i.sender, receiver: i.receiver, trip: i.trip, type: 'sent' as 'sent' })))
    );

    return forkJoin({ received: received$, sent: sent$ }).pipe(
      map(({ received, sent }) => {
        const all = [...received, ...sent];
        return all.map(item => ({
          ...item,
          sender: item.sender || { name: 'Utilisateur inconnu', username: 'inconnu' },
          receiver: item.receiver || { name: 'Utilisateur inconnu', username: 'inconnu' },
          trip: item.trip || { title: 'Projet introuvable' }
        }));
      })
    );
  }

  getPendingInvitesCount(userId: string): Observable<number> {
    return this.getInvitesForUser(userId).pipe(
      map(invites => invites.filter(i => i.status === InviteStatus.PENDING).length)
    );
  }

  // Helper for more complex fetching if needed
  getAllInvitesForUser(userId: string): Observable<any[]> {
      return this.getInvitesWithDetails(userId);
  }

  sendInvite(invite: GroupInvite): Observable<GroupInvite> {
    return this.http.post<GroupInvite>(this.apiUrl, invite);
  }

  getInvitesForUser(userId: string): Observable<GroupInvite[]> {
    return this.http.get<GroupInvite[]>(`${this.apiUrl}/user/${userId}`);
  }

  getInvitesForGroup(groupId: string): Observable<GroupInvite[]> {
    return this.http.get<GroupInvite[]>(`${this.apiUrl}/group/${groupId}`);
  }

  acceptInvite(id: string, reason?: string, helpful?: boolean): Observable<GroupInvite> {
    const params: any = {};
    if (reason) params.reason = reason;
    if (helpful !== undefined) params.helpful = helpful;
    return this.http.patch<GroupInvite>(`${this.apiUrl}/${id}/accept`, {}, { params });
  }

  declineInvite(id: string, reason?: string, helpful?: boolean): Observable<GroupInvite> {
    const params: any = {};
    if (reason) params.reason = reason;
    if (helpful !== undefined) params.helpful = helpful;
    return this.http.patch<GroupInvite>(`${this.apiUrl}/${id}/decline`, {}, { params });
  }

  cancelInvite(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/cancel`, {});
  }
}
