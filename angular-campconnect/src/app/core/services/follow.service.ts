import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FollowService {
  private baseUrl = `${environment.apiUrl}/community/follow`;

  constructor(private http: HttpClient) {}

  follow(userId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${userId}`, {});
  }

  unfollow(userId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${userId}`);
  }

  getFollowStatus(userId: string): Observable<{isFollowing: boolean}> {
    return this.http.get<{isFollowing: boolean}>(`${this.baseUrl}/status/${userId}`);
  }

  getFollowCounts(userId: string): Observable<{followersCount: number, followingCount: number}> {
    return this.http.get<{followersCount: number, followingCount: number}>(`${this.baseUrl}/counts/${userId}`);
  }
}
