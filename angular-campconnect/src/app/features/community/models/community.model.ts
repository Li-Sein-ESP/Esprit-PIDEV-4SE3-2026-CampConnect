// Community Module Interfaces

export type UserRole = 'Camper' | 'Verified Camper' | 'Moderator' | 'Admin';

export interface AuthorPreview {
    id: number;
    username: string;
    name: string;
    avatar: string;
    role: UserRole;
    trustScore: number;
    badges?: {
        title: string;
        description: string;
        icon: string;
        unlocked: boolean;
        theme?: string;
    }[];
}

export interface Post {
    id: number;
    author: AuthorPreview;
    title: string;
    content: string;
    category: string;
    tags: string[];
    createdAt: string;
    updatedAt?: string;
    likes: number;
    comments: number | any[]; // Support both count and array
    views: number;
    isLiked: boolean;
    isBookmarked: boolean;
    isPinned: boolean;
    status: 'active' | 'locked' | 'archived';
    location?: string;
    timestamp?: string; // For display
    media?: string[];
    videoLength?: string;
    products?: { icon: string; name: string }[];
    saved?: boolean; // For display/UI state
}

export interface Comment {
    id: number;
    postId: number;
    author: AuthorPreview;
    content: string;
    createdAt: string;
    updatedAt?: string;
    likes: number;
    isLiked: boolean;
    isEdited: boolean;
    replies?: Comment[];
    parentId?: number;
}

export interface TripStory {
    id: number;
    author: AuthorPreview;
    title: string;
    summary: string;
    content: string;
    destination: string;
    tripDate: string;
    duration: number;
    images: string[];
    tags: string[];
    likes: number;
    comments: number;
    views: number;
    createdAt: string;
    featured: boolean;
}

export interface HelpRequest {
    id: number;
    author: AuthorPreview;
    title: string;
    description: string;
    category: 'gear' | 'planning' | 'safety' | 'location' | 'other';
    urgency: 'low' | 'medium' | 'high';
    status: 'open' | 'answered' | 'resolved' | 'closed';
    responses: HelpResponse[];
    createdAt: string;
    resolvedAt?: string;
}

export interface HelpResponse {
    id: number;
    requestId: number;
    author: AuthorPreview & { expert: boolean };
    content: string;
    helpful: number;
    isAccepted: boolean;
    createdAt: string;
}

export interface ModerationAction {
    id: number;
    type: 'warning' | 'remove' | 'ban' | 'approve';
    targetType: 'post' | 'comment' | 'user';
    targetId: number;
    reason: string;
    moderator: string;
    createdAt: string;
}

export interface UserProfile {
    id: number;
    username: string;
    name: string;
    avatar: string;
    banner?: string;
    role: UserRole;
    trustScore: number;
    bio: string;
    location: string;
    joinDate: string;
    isFollowed?: boolean;
    stats: {
        posts: number;
        topics: number;
        replies: number;
        followers: number;
        following: number;
    };
    badges: {
        id: number;
        title: string;
        description: string;
        icon: string;
        theme: string;
        unlockedAt: string;
    }[];
}

export interface ForumTopic {
    id: number;
    categoryId: number;
    categoryName: string;
    title: string;
    content: string[];
    tags: string[];
    author: AuthorPreview;
    date: string;
    dateIso: string;
    media: { url: string; alt: string }[];
    likes: number;
    isLiked: boolean;
    views: string;
    replyCount: number;
    bulletPoints?: { label: string; value: string }[];
}

export interface ForumReply {
    id: number;
    parentReplyId: number | null;
    author: AuthorPreview;
    date: string;
    content: string;
    likes: number;
    isLiked: boolean;
    isOP: boolean;
}
export interface CategoryMeta {
    id: string;
    name: string;
    description: string;
    icon: string;
    topicsCount: number;
    membersCount: string;
    lastActive: string;
    lastUser?: string;
}

export interface CategoryTopic {
    id: string;
    title: string;
    author: string;
    avatar: string;
    trustScore: number;
    replies: number;
    views: number;
    lastActivity: string;
    lastUser: string;
    pinned: boolean;
    locked: boolean;
    hot: boolean;
}
