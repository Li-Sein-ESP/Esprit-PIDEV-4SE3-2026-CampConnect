import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface GroupMergeProposal {
  id: string;
  sourceGroupId: string;
  targetGroupId: string;
  targetTripTitle: string;
  status: string;
  message: string;
  matchScore: number;
  sourceAccepted: boolean;
  targetAccepted: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class GroupMergeService {
  private apiUrl = `${environment.apiUrl}/mergers`;

  constructor(private http: HttpClient) { }

  getProposalsForGroup(groupId: string): Observable<GroupMergeProposal[]> {
    return this.http.get<GroupMergeProposal[]>(`${this.apiUrl}/group/${groupId}`);
  }

  acceptProposal(id: string, groupId: string): Observable<GroupMergeProposal> {
    return this.http.post<GroupMergeProposal>(`${this.apiUrl}/${id}/accept?groupId=${groupId}`, {});
  }

  rejectProposal(id: string): Observable<GroupMergeProposal> {
    return this.http.post<GroupMergeProposal>(`${this.apiUrl}/${id}/reject`, {});
  }
}
