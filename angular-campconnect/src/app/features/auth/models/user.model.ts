export interface UserProfileResponse {
    id: string;
    username: string;
    email: string;
    name: string;
    roles: string[];
    profileDetails: Record<string, any> | null;
    createdAt: string;
}

export interface UpdateProfileRequest {
    name?: string;
    email?: string;
    profileDetails?: Record<string, any>;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}
