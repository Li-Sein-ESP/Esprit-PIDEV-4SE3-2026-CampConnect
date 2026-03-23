import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, LoginRequest, LoginResponse, SignupRequest, JwtPayload } from '../models/auth.models';

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly TOKEN_KEY = 'cc_token';
    private readonly USER_KEY = 'cc_user';

    public currentUser$ = new BehaviorSubject<User | null>(null);
    public isAuthenticated$ = new BehaviorSubject<boolean>(false);

    constructor(private http: HttpClient) {
        // Rehydrate session from localStorage on init
        const savedToken = localStorage.getItem(this.TOKEN_KEY);
        const savedUser = localStorage.getItem(this.USER_KEY);
        if (savedToken && savedUser) {
            try {
                const user: User = JSON.parse(savedUser);
                // Ensure ID is set from _id if only _id exists (robust rehydration)
                if (!user.id && user._id) {
                    user.id = user._id;
                }

                // Validate token hasn't expired
                if (!this.isTokenExpired(savedToken)) {
                    user.token = savedToken;
                    this.currentUser$.next(user);
                    this.isAuthenticated$.next(true);
                } else {
                    this.clearSession();
                }
            } catch {
                this.clearSession();
            }
        }
    }

    // ÔöÇÔöÇÔöÇ Observable Streams ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ

    getCurrentUser(): Observable<User | null> {
        return this.currentUser$.asObservable();
    }

    isAuthenticated(): Observable<boolean> {
        return this.isAuthenticated$.asObservable();
    }

    // ÔöÇÔöÇÔöÇ Token Utilities ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ

    getToken(): string | undefined {
        return this.currentUser$.value?.token ?? localStorage.getItem(this.TOKEN_KEY) ?? undefined;
    }

    isLoggedIn(): boolean {
        const token = this.getToken();
        return !!token && !this.isTokenExpired(token);
    }

    getRoles(): string[] {
        return this.currentUser$.value?.roles ?? this.getRolesFromToken();
    }

    hasRole(role: string): boolean {
        const roles = this.getRoles();
        const normalized = role.startsWith('ROLE_') ? role : `ROLE_${role}`;
        return roles.includes(normalized) || roles.includes('ROLE_ADMIN');
    }

    // ÔöÇÔöÇÔöÇ Auth Actions ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ

    login(username: string, password: string): Observable<LoginResponse> {
        const body: LoginRequest = { username, password };
        return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/signin`, body, httpOptions).pipe(
            tap(data => {
                const token = data.token ?? data.accessToken ?? '';
                const user: User = {
                    id: data.id || data._id || '',
                    username: data.username,
                    email: data.email,
                    roles: data.roles,
                    token
                };
                this.setSession(user, token);
            })
        );
    }

    signup(body: SignupRequest): Observable<unknown> {
        return this.http.post(`${environment.apiUrl}/auth/signup`, body, httpOptions);
    }

    logout(): void {
        this.clearSession();
    }

    // ÔöÇÔöÇÔöÇ Private Helpers ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ

    private setSession(user: User, token: string): void {
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.currentUser$.next(user);
        this.isAuthenticated$.next(true);
    }

    private clearSession(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        this.currentUser$.next(null);
        this.isAuthenticated$.next(false);
    }

    private decodeToken(token: string): JwtPayload | null {
        try {
            const payload = token.split('.')[1];
            return JSON.parse(atob(payload)) as JwtPayload;
        } catch {
            return null;
        }
    }

    private isTokenExpired(token: string): boolean {
        const decoded = this.decodeToken(token);
        if (!decoded?.exp) return false;
        return decoded.exp * 1000 < Date.now();
    }

    private getRolesFromToken(): string[] {
        const token = localStorage.getItem(this.TOKEN_KEY);
        if (!token) return [];
        const decoded = this.decodeToken(token);
        return decoded?.roles ?? [];
    }
}
