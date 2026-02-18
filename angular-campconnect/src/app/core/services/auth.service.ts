import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap, map, catchError } from 'rxjs';

const API_URL = 'http://localhost:8080/api/auth/';

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
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                this.currentUser$.next(user);
                this.isAuthenticated$.next(true);
            } catch (e) {
                console.error('Error parsing saved user', e);
                localStorage.removeItem('currentUser');
            }
        }
    }

    getCurrentUser(): Observable<User | null> {
        return this.currentUser$.asObservable();
    }

    isAuthenticated(): Observable<boolean> {
        return this.isAuthenticated$.asObservable();
    }

    getToken(): string | undefined {
        return this.currentUser$.value?.token;
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

