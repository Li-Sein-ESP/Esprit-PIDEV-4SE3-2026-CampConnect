export interface Group {
    id: string;
    tripId: string; // Matches backend tripId
    name: string;
    description?: string;
    creatorUserId: string; // Add this missing property
    status: 'ACTIVE' | 'INACTIVE'; // Matches backend enum
    createdAt: string;
    startDate?: string;
    endDate?: string;
    members?: GroupMember[];
    memberUserIds?: string[];
}

export interface GroupMember {
    id: string;
    userId: string;
    groupId: string;
    role: 'ADMIN' | 'MEMBER';
    joinedAt: string;
}

export enum TaskStatus {
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    DONE = 'DONE'
}

export interface GroupTask {
    id: string;
    groupId: string;
    title: string;
    description?: string;
    assignedToUserId?: string;
    status: TaskStatus;
    dueDate?: string;
    createdAt: string;
}

export enum DecisionStatus {
    OPEN = 'OPEN',
    CLOSED = 'CLOSED'
}

export interface GroupDecision {
    id: string;
    groupId: string;
    title: string;
    description?: string;
    options: DecisionOption[];
    status: DecisionStatus;
    createdByUserId: string;
    createdAt: string;
}

export interface DecisionOption {
    id: string;
    text: string;
    votesCount: number;
    votedByUserIds: string[];
}

export interface GroupMessage {
    id: string;
    groupId: string;
    senderUserId: string;
    senderName?: string;
    content: string;
    imageUrl?: string;
    createdAt: string;
}

export interface Expense {
    id: string;
    groupId: string;
    paidByUserId: string;
    amount: number;
    description: string;
    createdAt: string;
    participants: string[];
}

export interface Balance {
    userId: string;
    owes: { [toUserId: string]: number }; // Who this user owes and how much
}

export interface User {
    id: string;
    username: string;
    name?: string;
    avatar?: string;
    email?: string;
}

export interface GroupDetail {
    id: string;
    name: string;
    description?: string;
    tripId: string;
    creatorUserId: string;
    status: 'ACTIVE' | 'INACTIVE';
    startDate?: string;
    endDate?: string;
    members: User[];
}


