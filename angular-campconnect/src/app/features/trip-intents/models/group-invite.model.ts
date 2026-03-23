export enum GroupInviteStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    DECLINED = 'DECLINED',
    EXPIRED = 'EXPIRED',
    CANCELLED = 'CANCELLED'
}

export interface GroupInvite {
    id: string;
    tripIntentId: string;
    groupId: string;
    fromUserId: string;
    toUserId: string;
    status: GroupInviteStatus;
    message?: string;
    expiresAt?: string; // ISO date string
    createdAt: string;  // ISO date string
}

export interface CreateGroupInviteRequest {
    tripIntentId: string;
    toUserId: string;
    message?: string;
}
