import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
    UserProfileResponse,
    UpdateProfileRequest,
    ChangePasswordRequest
} from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserApiService {
    private readonly base = `${environment.apiUrl}/users`;

    constructor(private http: HttpClient) { }

    getProfile(): Observable<UserProfileResponse> {
        return this.http.get<UserProfileResponse>(`${this.base}/me`);
    }

    updateProfile(data: UpdateProfileRequest): Observable<UserProfileResponse> {
        return this.http.put<UserProfileResponse>(`${this.base}/me`, data);
    }

    changePassword(data: ChangePasswordRequest): Observable<any> {
        return this.http.put(`${this.base}/me/password`, data);
    }
}
