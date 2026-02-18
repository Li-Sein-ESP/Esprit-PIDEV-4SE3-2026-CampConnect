// Community Module Interfaces
export interface Post {
    id: string;
    author: {
        id: string;
        name: string;
        avatar?: string;
        role: 'user' | 'moderator' | 'admin';
        verified: boolean;
    };
    title: string;
    content: string;
    category: string;
    tags: string[];
    createdAt: string;
    updatedAt?: string;
    likes: number;
    comments: number;
    views: number;
    isLiked: boolean;
    isBookmarked: boolean;
    isPinned: boolean;
    status: 'active' | 'locked' | 'archived';
}

export interface Comment {
    id: string;
    postId: string;
    author: {
        id: string;
        name: string;
        avatar?: string;
        role: 'user' | 'moderator' | 'admin';
        verified: boolean;
    };
    content: string;
    createdAt: string;
    updatedAt?: string;
    likes: number;
    isLiked: boolean;
    isEdited: boolean;
    replies?: Comment[];
    parentId?: string;
}

export interface TripStory {
    id: string;
    author: {
        id: string;
        name: string;
        avatar?: string;
    };
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
    id: string;
    author: {
        id: string;
        name: string;
        avatar?: string;
    };
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
    id: string;
    requestId: string;
    author: {
        id: string;
        name: string;
        avatar?: string;
        expert: boolean;
    };
    content: string;
    helpful: number;
    isAccepted: boolean;
    createdAt: string;
}

export interface ModerationAction {
    id: string;
    type: 'warning' | 'remove' | 'ban' | 'approve';
    targetType: 'post' | 'comment' | 'user';
    targetId: string;
    reason: string;
    moderator: string;
    createdAt: string;
}
