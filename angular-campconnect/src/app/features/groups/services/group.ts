import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Group } from "../models/group.model";
import { environment } from "../../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class GroupService {
  private apiUrl = `${environment.apiUrl}/groups`;

  constructor(private http: HttpClient) {}

  /**
   * Fetch all groups and filter locally to return only the ones the user belongs to.
   * This handles the lack of a dedicated `/me` endpoint on the backend.
   */
  getMyGroups(userId: string): Observable<Group[]> {
    return this.http
      .get<Group[]>(this.apiUrl)
      .pipe(
        map((groups) =>
          groups.filter(
            (g) => g.memberUserIds && g.memberUserIds.includes(userId),
          ),
        ),
      );
  }

  getGroupByTripId(tripId: string): Observable<Group> {
    return this.http.get<Group>(`${this.apiUrl}/trip/${tripId}`);
  }

  /**
   * Fetch a specific group by ID with resolved members
   */
  getGroupDetail(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/detail`);
  }

  /**
   * Fetch a specific group by ID
   */
  getGroupById(id: string): Observable<Group> {
    return this.http.get<Group>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new group
   */
  createGroup(groupData: Partial<Group>): Observable<Group> {
    return this.http.post<Group>(this.apiUrl, groupData);
  }

  /**
   * Update an existing group
   */
  updateGroup(id: string, groupData: Partial<Group>): Observable<Group> {
    return this.http.put<Group>(`${this.apiUrl}/${id}`, groupData);
  }

  /**
   * Delete a group
   */
  deleteGroup(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Leave a group
   */
  leaveGroup(groupId: string, userId: string): Observable<Group> {
    return this.http.patch<Group>(
      `${this.apiUrl}/${groupId}/leave/${userId}`,
      {},
    );
  }

  /**
   * Get pending group invitations for a user
   */
  getMyInvitations(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/invitations/user/${userId}`);
  }

  /**
   * Accept a group invitation
   */
  acceptInvitation(invitationId: string): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/invitations/${invitationId}/accept`,
      {},
    );
  }

  /**
   * Decline a group invitation
   */
  declineInvitation(invitationId: string): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/invitations/${invitationId}/decline`,
      {},
    );
  }
}
