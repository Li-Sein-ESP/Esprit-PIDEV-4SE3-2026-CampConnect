/**
 * Auth-related models shared across the application.
 */

export interface User {
    id: string;
    username: string;
    email: string;
    roles: string[];
    token?: string;
    profileDetails?: any;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    id: string;
    username: string;
    email: string;
    roles: string[];
    token?: string;
    accessToken?: string;
    /** État modération (BANNED, etc.) — renvoyé par le backend au signin */
    profileDetails?: Record<string, unknown>;
}

export interface SignupRequest {
    username: string;
    email: string;
    password: string;
    name: string;
    role: string[];             // backend RegisterRequest.role is Set<String>
    profileDetails?: Record<string, unknown>;
}

/** Decoded JWT payload structure from the Spring Boot backend. */
export interface JwtPayload {
    sub: string;       // username
    roles?: string[];
    iat?: number;
    exp?: number;
}
