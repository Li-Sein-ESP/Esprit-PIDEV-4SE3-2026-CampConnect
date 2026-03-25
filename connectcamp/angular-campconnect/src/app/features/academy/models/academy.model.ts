// Academy Module Interfaces — Aligned with Backend DTOs

// ─── Course (mirrors CourseDTO.java) ───
// Note: Backend uses @JsonProperty("category") on categoryName, so JSON key is "category"
export interface Course {
    id: string;
    title: string;
    description: string;
    category: string;          // JSON key "category" (mapped from categoryName via @JsonProperty)
    difficulty: string;        // DifficultyLevel enum: BEGINNER, INTERMEDIATE, ADVANCED, MODERATE, ALL_LEVELS
    duration: number;
    enrolledCount: number;
    rating: number;
    reviews: number;
    price: number;
    imageUrl: string;
    tags: string[];
    prerequisites: string[];
    passingScore: number;
    creatorId?: string;
    creatorName?: string;
    instructorId?: string;
    instructorName?: string;
}

// ─── Video (mirrors VideoDTO.java) ───
export interface Video {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl: string;
    category: string;
    type: string;              // REEL, EXPERIENCE, TUTORIAL
    views: number;
    helpfulCount: number;
    createdAt: string;         // LocalDateTime → ISO string in JSON
    creator: UserSummary;
    takeaways: string[];
    comments: CommentDTO[];
}

// ─── UserSummary (mirrors UserSummaryDTO.java) ───
export interface UserSummary {
    id: string;
    username: string;
    name: string;
}

// ─── CommentDTO (mirrors CommentDTO.java) ───
export interface CommentDTO {
    id: string;
    content: string;
    authorId: string;
    authorName: string;
    createdAt: string;
}

// ─── Badge (mirrors BadgeDTO.java) ───
export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    categoryName: string;      // Badge uses categoryName directly (no @JsonProperty)
    rarity: string;            // BadgeRarity enum: COMMON, RARE, EPIC, LEGENDARY
    requirements: string[];
    creatorId?: string;
    creatorName?: string;
}

// ─── Certification (mirrors CertificationDTO.java) ───
export interface Certification {
    id: string;
    name: string;
    description: string;
    requirements: string[];
    validityPeriod: number;
    imageUrl: string;
    issuer: string;
    creatorId?: string;
    creatorName?: string;
    requiredCourseIds?: string[];
}

// ─── UserCertification (mirrors UserCertificationDTO.java) ───
export interface UserCertification {
    certificationId: string;
    certificationName: string;
    userId: string;
    username: string;
    earnedDate: string;        // LocalDateTime → ISO string in JSON
    expiryDate: string;
    certificateUrl: string;
    status: string;            // CertificationStatus enum: ACTIVE, EXPIRED, REVOKED
}

// ─── UserProgress (frontend-only, for tracking) ───
export interface UserProgress {
    userId: string;
    courseId: string;
    progress: number;
    completedModules: string[];
    completedLessons: string[];
    quizScores: Record<string, number>;
    lastAccessedAt: string;
    enrolledAt: string;
    completedAt?: string;
}
