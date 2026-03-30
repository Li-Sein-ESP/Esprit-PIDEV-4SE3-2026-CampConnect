import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { LucideAngularModule, MapPin, Calendar, Users, MessageSquare, UserPlus, UserMinus, Award, BookOpen, MessageCircle, FileText, ChevronLeft, Share2, MoreHorizontal } from 'lucide-angular';
import { TrustScoreComponent } from '../../../shared/components/trust-score/trust-score.component';
import { CampBadgeComponent } from '../../../shared/components/camp-badge/camp-badge.component';
import { UserProfile, Post, UserRole } from '../models/community.model';
import { UserService } from '../../../core/services/user.service';

@Component({
    selector: 'app-public-profile',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        TrustScoreComponent,
        CampBadgeComponent,
        LucideAngularModule
    ],
    templateUrl: './public-profile.component.html',
    styleUrl: './public-profile.component.scss',
    encapsulation: ViewEncapsulation.Emulated
})
export class PublicProfileComponent implements OnInit {
    // Icons
    readonly MapPinIcon = MapPin;
    readonly CalendarIcon = Calendar;
    readonly UsersIcon = Users;
    readonly MessageSquareIcon = MessageSquare;
    readonly UserPlusIcon = UserPlus;
    readonly UserMinusIcon = UserMinus;
    readonly AwardIcon = Award;
    readonly BookOpenIcon = BookOpen;
    readonly MessageCircleIcon = MessageCircle;
    readonly FileTextIcon = FileText;
    readonly ChevronLeftIcon = ChevronLeft;
    readonly Share2Icon = Share2;
    readonly MoreHorizontalIcon = MoreHorizontal;

    userId: string | null = null;
    activeTab: 'posts' | 'topics' | 'replies' | 'badges' = 'posts';
    userProfile: UserProfile | null = null;
    loading = true;

    // Mock Content
    userPosts: any[] = [];
    userTopics: any[] = [];
    userReplies: any[] = [];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private userService: UserService
    ) { }

    ngOnInit(): void {
        console.log('PublicProfileComponent initialized');
        this.route.paramMap.subscribe(params => {
            const idParam = params.get('id');
            this.userId = idParam || '1';
            this.loadUserProfile();
        });
    }

    loadUserProfile(): void {
        if (!this.userId) return;
        this.loading = true;
        console.log('Loading profile for ID:', this.userId);

        this.userService.getUserById(this.userId).subscribe({
            next: (user) => {
                let userRole = 'Camper';
                const userData: any = user;
                if (Array.isArray(userData.roles)) {
                    if (userData.roles.some((r: any) => r.name === 'ROLE_ADMIN' || r === 'ROLE_ADMIN')) {
                        userRole = 'Admin';
                    }
                }
                
                this.userProfile = {
                    id: user.id || this.userId || '0',
                    username: user.username || 'unknown_camper',
                    name: user.name || user.username || 'Camper Member',
                    avatar: user.avatar || `https://ui-avatars.com/api/?name=${user.username || 'user'}`,
                    banner: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=400&fit=crop',
                    role: userRole as UserRole,
                    trustScore: 85,
                    bio: userData.bio || 'Outdoor enthusiast sharing trail experiences.',
                    location: userData.location || 'Unknown location',
                    joinDate: 'Joined recently',
                    isFollowed: false,
                    stats: {
                        posts: 0,
                        topics: 0,
                        replies: 0,
                        followers: 0,
                        following: 0
                    },
                    badges: []
                };
                this.loadMockContent();
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading user profile, showing fallback', err);
                
                // Keep the page from going completely blank if the user couldn't be fetched
                this.userProfile = {
                    id: this.userId || '0',
                    username: 'anonymous',
                    name: 'Camper Not Found',
                    avatar: `https://ui-avatars.com/api/?name=Guest`,
                    banner: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=400&fit=crop',
                    role: 'Camper' as UserRole,
                    trustScore: 50,
                    bio: 'This profile could not be retrieved from the server.',
                    location: 'Unknown',
                    joinDate: 'Unknown',
                    stats: { posts: 0, topics: 0, replies: 0, followers: 0, following: 0 },
                    badges: []
                };
                this.loading = false;
            }
        });
    }

    loadMockContent(): void {
        this.userPosts = [
            {
                id: '1',
                content: 'Just reached the summit of Mount Hood! The views are absolutely breathtaking today. #Portland #Hiking #Summits',
                timestamp: '2 hours ago',
                likes: 154,
                comments: 12,
                media: 'https://images.unsplash.com/photo-1544198365-f5d60b6d8190?w=600&h=400&fit=crop'
            }
        ];
    }

    setActiveTab(tab: 'posts' | 'topics' | 'replies' | 'badges'): void {
        this.activeTab = tab;
    }

    toggleFollow(): void {
        if (this.userProfile) {
            this.userProfile.isFollowed = !this.userProfile.isFollowed;
            if (this.userProfile.isFollowed) {
                this.userProfile.stats.followers++;
            } else {
                this.userProfile.stats.followers--;
            }
        }
    }

    sendMessage(): void {
        this.router.navigate(['/community/messages']);
    }

    goBack(): void {
        window.history.back();
    }
}

