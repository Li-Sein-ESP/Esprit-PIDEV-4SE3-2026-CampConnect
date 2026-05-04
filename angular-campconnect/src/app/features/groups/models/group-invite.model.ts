export enum InviteStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  DECLINED = "DECLINED",
  CANCELLED = "CANCELLED",
}

export interface GroupInvite {
  id?: string;
  tripIntentId: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  message?: string;
  status: InviteStatus;
  createdAt?: string;
  expiresAt?: string;
  // Additional fields for display
  groupName?: string;
  description?: string;
  invitedAt?: string;
}

export interface GroupInviteDetail extends GroupInvite {
  sender?: any;
  receiver?: any;
  trip?: any;
  type?: "sent" | "received";
}
