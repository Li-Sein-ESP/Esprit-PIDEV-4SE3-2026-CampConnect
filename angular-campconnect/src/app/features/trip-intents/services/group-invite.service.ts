import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GroupInvite, CreateGroupInviteRequest } from '../models/group-invite.model';
import { TripIntent } from '../models/trip-intent.model';

@Injectable({
    providedIn: 'root'
})
export class GroupInviteService {
    private apiUrl = 'http://localhost:8080/api/group-invites';

    constructor(private http: HttpClient) { }

    /**
     * Envoyer une invitation à rejoindre un TripIntent
     */
    sendInvite(data: CreateGroupInviteRequest): Observable<GroupInvite> {
        return this.http.post<GroupInvite>(this.apiUrl, data);
    }

    /**
     * Récupérer toutes les invitations reçues ou envoyées par un utilisateur
     * (Ajustez l'URL selon l'implémentation exacte de votre backend)
     */
    getUserInvites(userId: string): Observable<GroupInvite[]> {
        return this.http.get<GroupInvite[]>(`${this.apiUrl}/user/${userId}`);
    }

    /**
     * Accepter une invitation
     */
    acceptInvite(id: string): Observable<GroupInvite> {
        return this.http.put<GroupInvite>(`${this.apiUrl}/${id}/accept`, {});
    }

    /**
     * Refuser une invitation
     */
    declineInvite(id: string): Observable<GroupInvite> {
        return this.http.put<GroupInvite>(`${this.apiUrl}/${id}/decline`, {});
    }

    /**
     * Annuler une invitation envoyée
     */
    cancelInvite(id: string): Observable<GroupInvite> {
        return this.http.put<GroupInvite>(`${this.apiUrl}/${id}/cancel`, {});
    }

    /**
     * Méthode utilitaire temporaire (mock) pour enrichir les invites
     * avec les infos du Trip Intent (si le backend ne le fait pas).
     * En production, idéalement le endpoint renvoie un DTO riche.
     */
    getMockInvitesWithDetails(): Observable<any[]> {
        return new Observable(observer => {
            setTimeout(() => {
                observer.next([
                    {
                        invite: {
                            id: 'inv-1',
                            tripIntentId: 'mock-trip-1',
                            groupId: 'grp-1',
                            fromUserId: 'u2',
                            toUserId: 'me',
                            status: 'PENDING',
                            message: 'Salut ! Ton profil correspond parfaitement à ce que je cherche pour Akchour.',
                            createdAt: new Date(Date.now() - 3600000).toISOString()
                        },
                        trip: {
                            title: 'Aventure à Akchour',
                            dateFrom: '2026-07-10',
                            campingStyle: 'BACKPACKING'
                        },
                        sender: {
                            name: 'Karim',
                            avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200'
                        },
                        type: 'received'
                    },
                    {
                        invite: {
                            id: 'inv-2',
                            tripIntentId: 'user-trip-1',
                            groupId: 'grp-1',
                            fromUserId: 'me',
                            toUserId: 'u3',
                            status: 'ACCEPTED',
                            message: 'Viens camper avec nous !',
                            createdAt: new Date(Date.now() - 86400000).toISOString()
                        },
                        trip: {
                            title: 'Mon Projet Akchour',
                            dateFrom: '2026-06-10',
                            campingStyle: 'TRADITIONAL'
                        },
                        receiver: {
                            name: 'Sara',
                            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'
                        },
                        type: 'sent'
                    }
                ]);
                observer.complete();
            }, 500);
        });
    }
}
