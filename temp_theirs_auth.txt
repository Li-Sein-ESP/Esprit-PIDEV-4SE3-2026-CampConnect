import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap, map, catchError } from 'rxjs';

const API_URL = 'http://localhost:8089/api/auth/';

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

export interface User {
    id: string;
    email: string;
    username: string;
    roles: string[];
    token?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUser$ = new BehaviorSubject<User | null>(null);
    private isAuthenticated$ = new BehaviorSubject<boolean>(false);

    constructor(private http: HttpClient) {
        // Check for saved session
        this.restoreSession();
    }

    private restoreSession(): void {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                if (user && user.token && !this.isTokenExpired(user.token)) {
                    this.currentUser$.next(user);
                    this.isAuthenticated$.next(true);
                } else {
                    console.warn('Session expired or invalid, cleaning up.');
                    this.logout();
                }
            } catch (e) {
                console.error('Error parsing saved user', e);
                this.logout();
            }
        }
    }

    getCurrentUser(): Observable<User | null> {
        return this.currentUser$.asObservable();
    }

    isAuthenticated(): Observable<boolean> {
        return this.isAuthenticated$.asObservable().pipe(
            map(isAuth => {
                if (isAuth && this.isTokenExpired(this.getToken())) {
                    this.logout();
                    return false;
                }
                return isAuth;
            })
        );
    }

    getToken(): string | undefined {
        return this.currentUser$.value?.token;
    }

    private isTokenExpired(token: string | undefined): boolean {
        if (!token) return true;
        try {
            const part = token.split('.')[1];
            const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(atob(base64));
            if (!payload.exp) return false;
            const expirationDate = payload.exp * 1000;
            return Date.now() > expirationDate;
        } catch (e) {
            return true;
        }
    }

    getRoles(): string[] {
        return this.currentUser$.value?.roles || [];
    }

    hasRole(role: string): boolean {
        const roles = this.getRoles();
        if (role === 'admin') {
            return roles.includes('ROLE_ADMIN');
        }
        return roles.includes('ROLE_USER') || roles.includes('ROLE_ADMIN');
    }

    login(username: string, password: string): Observable<any> {
        return this.http.post<any>(API_URL + 'signin', {
            username,
            password
        }, httpOptions).pipe(
            tap(data => {
                const user: User = {
                    id: data.id,
                    username: data.username,
                    email: data.email,
                    roles: data.roles,
                    token: data.token
                };
                this.setCurrentUser(user);
            })
        );
    }

    signup(username: string, email: string, password: string, name: string): Observable<any> {
        return this.http.post(API_URL + 'signup', {
            username,
            email,
            password,
            name,
            role: ['user']
        }, httpOptions);
    }

    logout(): void {
        this.currentUser$.next(null);
        this.isAuthenticated$.next(false);
        localStorage.removeItem('currentUser');
    }

    private setCurrentUser(user: User): void {
        this.currentUser$.next(user);
        this.isAuthenticated$.next(true);
        localStorage.setItem('currentUser', JSON.stringify(user));
    }
}

