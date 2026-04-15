// Admin Module Interfaces
export interface AdminUser {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'moderator' | 'support';
    permissions: Permission[];
    status: 'active' | 'suspended' | 'inactive';
    lastLogin: string;
    createdAt: string;
}

export interface Permission {
    resource: string;
    actions: ('create' | 'read' | 'update' | 'delete')[];
}

export interface UserManagement {
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    suspendedUsers: number;
    users: UserRecord[];
}

export interface UserRecord {
    id: string;
    email: string;
    name: string;
    joinedDate: string;
    lastActive: string;
    tripsCount: number;
    bookingsCount: number;
    status: 'active' | 'suspended' | 'banned';
    verificationStatus: 'verified' | 'pending' | 'unverified';
}

export interface SiteManagement {
    totalSites: number;
    activeSites: number;
    pendingApproval: number;
    sites: CampsiteRecord[];
}

export interface CampsiteRecord {
    id: string;
    name: string;
    location: string;
    owner: string;
    status: 'active' | 'inactive' | 'pending' | 'suspended';
    rating: number;
    bookingsCount: number;
    revenue: number;
    createdAt: string;
}

export interface AnalyticsDashboard {
    overview: {
        totalRevenue: number;
        totalBookings: number;
        activeUsers: number;
        averageRating: number;
    };
    trends: {
        period: string;
        bookings: number[];
        revenue: number[];
        users: number[];
    };
    topCampsites: {
        id: string;
        name: string;
        bookings: number;
        revenue: number;
    }[];
    topUsers: {
        id: string;
        name: string;
        bookings: number;
        spent: number;
    }[];
}

export interface IncidentReport {
    id: string;
    type: 'safety' | 'property' | 'behavior' | 'other';
    severity: 'low' | 'medium' | 'high' | 'critical';
    reportedBy: string;
    location: string;
    description: string;
    status: 'open' | 'investigating' | 'resolved' | 'closed';
    assignedTo?: string;
    createdAt: string;
    resolvedAt?: string;
    actions: IncidentAction[];
}

export interface IncidentAction {
    timestamp: string;
    actor: string;
    action: string;
    notes?: string;
}

export interface ModerationQueue {
    pendingPosts: number;
    pendingComments: number;
    reportedContent: number;
    items: ModerationItem[];
}

export interface ModerationItem {
    id: string;
    type: 'post' | 'comment' | 'user' | 'campsite';
    content: string;
    author: string;
    reportCount: number;
    reasons: string[];
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}
