import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User, LoginRequest, LoginResponse, SignupRequest, JwtPayload } from '../models/auth.models';

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly API_URL = 'http://localhost:8080/api'; // Corrected port to match backend (8080)
    private readonly TOKEN_KEY = 'cc_token';
    private readonly USER_KEY = 'cc_user';

    private currentUser$ = new BehaviorSubject<User | null>(null);
    private isAuthenticated$ = new BehaviorSubject<boolean>(false);

    constructor(private http: HttpClient) {
        // Rehydrate session from localStorage on init
        const savedToken = localStorage.getItem(this.TOKEN_KEY);
        const savedUser = localStorage.getItem(this.USER_KEY);
        if (savedToken && savedUser) {
            try {
                const user: User = JSON.parse(savedUser);
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

    // ─── Observable Streams ────────────────────────────────────────

    getCurrentUser(): Observable<User | null> {
        return this.currentUser$.asObservable();
    }

    getUserValue(): User | null {
        return this.currentUser$.value;
    }

    isAuthenticated(): Observable<boolean> {
        return this.isAuthenticated$.asObservable();
    }

    // ─── Token Utilities ───────────────────────────────────────────

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
    
    isAdmin(): boolean {
        if (this.hasRole('ROLE_ADMIN')) return true;
        const email = this.currentUser$.value?.email;
        return !!email && email.toLowerCase().includes('@admin');
    }

    // ─── Auth Actions ──────────────────────────────────────────────

    login(username: string, password: string): Observable<LoginResponse> {
        const body: LoginRequest = { username, password };
        return this.http.post<LoginResponse>(`${this.API_URL}/auth/signin`, body, httpOptions).pipe(
            tap(data => {
                const token = data.token ?? data.accessToken ?? '';
                const user: User = {
                    id: data.id,
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
        return this.http.post(`${this.API_URL}/auth/signup`, body, httpOptions);
    }

    logout(): void {
        this.clearSession();
    }

    // ─── Private Helpers ───────────────────────────────────────────

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
