// Academy Module Interfaces
export interface Course {
    id: string;
    title: string;
    description: string;
    category: 'survival' | 'navigation' | 'first-aid' | 'wildlife' | 'camping-skills';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    duration: number;
    instructor: Instructor;
    modules: CourseModule[];
    enrolledCount: number;
    rating: number;
    reviews: number;
    price: number;
    imageUrl: string;
    tags: string[];
    prerequisites?: string[];
}

export interface Instructor {
    id: string;
    name: string;
    title: string;
    bio: string;
    avatar?: string;
    expertise: string[];
    rating: number;
    studentsCount: number;
    verified: boolean;
}

export interface CourseModule {
    id: string;
    title: string;
    description: string;
    order: number;
    duration: number;
    lessons: Lesson[];
    quiz?: Quiz;
}

export interface Lesson {
    id: string;
    title: string;
    type: 'video' | 'article' | 'interactive' | 'quiz';
    duration: number;
    content: string;
    videoUrl?: string;
    completed: boolean;
    order: number;
}

export interface Quiz {
    id: string;
    title: string;
    questions: QuizQuestion[];
    passingScore: number;
    timeLimit?: number;
}

export interface QuizQuestion {
    id: string;
    question: string;
    type: 'multiple-choice' | 'true-false' | 'short-answer';
    options?: string[];
    correctAnswer: string | number;
    explanation?: string;
}

export interface Certification {
    id: string;
    name: string;
    description: string;
    requirements: string[];
    validityPeriod: number;
    imageUrl: string;
    issuer: string;
}

export interface UserCertification {
    certificationId: string;
    userId: string;
    earnedDate: string;
    expiryDate: string;
    certificateUrl: string;
    status: 'active' | 'expired' | 'revoked';
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    requirements: string[];
}

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
