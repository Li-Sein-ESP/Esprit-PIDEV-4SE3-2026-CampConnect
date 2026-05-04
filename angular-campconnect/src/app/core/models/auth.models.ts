/**
 * Auth-related models shared across the application.
 */

export interface User {
    id: string;
    username: string;
    email: string;
    roles: string[];
    token?: string;
    fidelityTier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
    totalSpent?: number;
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
    fidelityTier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
    totalSpent?: number;
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
