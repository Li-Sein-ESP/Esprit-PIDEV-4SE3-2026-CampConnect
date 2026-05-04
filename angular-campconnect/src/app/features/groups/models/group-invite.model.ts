export enum InviteStatus {
<<<<<<< HEAD
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  CANCELLED = 'CANCELLED'
=======
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  DECLINED = "DECLINED",
  CANCELLED = "CANCELLED",
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
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
<<<<<<< HEAD
=======
  // Additional fields for display
  groupName?: string;
  description?: string;
  invitedAt?: string;
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
}

export interface GroupInviteDetail extends GroupInvite {
  sender?: any;
  receiver?: any;
  trip?: any;
<<<<<<< HEAD
  type?: 'sent' | 'received';
=======
  type?: "sent" | "received";
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
}
