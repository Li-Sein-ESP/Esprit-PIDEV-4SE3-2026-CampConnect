// ========================================
// CampConnect — Community Post Models
// Route: /community/post/:id
// ========================================

export interface PostUser {
  id: string;
  name: string;
  avatar: string;
  initials: string;
  color: string;
  verified: boolean;
  online?: boolean;
}

export interface PostReply {
  id: string;
  author: PostUser;
  badge: string | null;
  text: string;
  time: string;
  likes: number;
  liked: boolean;
}

export interface PostComment {
  id: string;
  author: PostUser;
  badge: string | null;
  text: string;
  time: string;
  likes: number;
  liked: boolean;
  replies: PostReply[];
  showReplies: boolean;
}

export interface TaggedProduct {
  id: string;
  name: string;
  icon: string;
}

export interface RelatedPost {
  id: string;
  image: string;
  author: PostUser;
  caption: string;
  tag: string;
  likes: number;
  comments: number;
}

export interface Post {
  id: string;
  user: PostUser;
  location: string;
  timestamp: string;
  content: string;
  media: string[];
  likes: number;
  comments: PostComment[];
  taggedProducts: TaggedProduct[];
  hashtags: string[];
  shares: number;
  likedByUsers: PostUser[];
  relatedPosts: RelatedPost[];
}
