import { Component, HostListener, OnInit, AfterViewInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil, switchMap, of } from 'rxjs';
import { UserApiService } from '../services/user-api.service';
import { UserProfileResponse } from '../models/user.model';
import { GroupInviteService } from '../../groups/services/group-invite.service';
import { AuthService } from '../../../core/services/auth.service';
import { AcademyService } from '../../academy/services/academy.service';

@Component({
    selector: 'app-camper-profile',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './camper-profile.component.html',
    styleUrl: './camper-profile.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CamperProfileComponent implements OnInit, AfterViewInit, OnDestroy {
    profile: UserProfileResponse | null = null;
    loading = true;
    error: string | null = null;
    private destroy$ = new Subject<void>();
    // Mock User Object
    user = {
        name: 'Jordan Mitchell', // Fallback name
        role: 'CAMPER',
        bio: 'Nature enthusiast & weekend adventurer. Passionate about sustainable camping, trail cooking, and finding hidden gems off the beaten path. 🌲⛺',
        stats: {
            tripsCompleted: 47,
            campsitesVisited: 32,
            reviewsGiven: 28,
            gearRented: 15
        },
        badges: [
            { id: 'beginner', title: 'Outdoor Beginner', desc: 'Completed your first camping trip', date: 'Earned Jan 2022', icon: '🌱' },
            { id: 'verified', title: 'Verified Camper', desc: 'Identity & experience verified', date: 'Earned Mar 2022', icon: '✅' },
            { id: 'safety', title: 'Safety Certified', desc: 'Completed wilderness safety course', date: 'Earned Jun 2023', icon: '🛡️' },
            { id: 'explorer', title: 'Trail Explorer', desc: 'Visited 25+ unique campsites', date: 'Earned Aug 2024', icon: '🧭' },
            { id: 'fire', title: 'Campfire Master', desc: 'Earned 5-star fire safety rating', date: 'Earned Sep 2024', icon: '🔥' }
        ],
        trips: [
            { id: 1, title: 'Mount Hood National Forest', dateRange: 'Oct 12 – 15, 2024', people: 4, image: 'https://images.unsplash.com/photo-1487730116645-74489c95b41b?w=600&q=80', status: 'Completed', isUpcoming: false },
            { id: 2, title: 'Crater Lake Backcountry', dateRange: 'Nov 1 – 3, 2024', people: 2, image: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=600&q=80', status: 'Upcoming', isUpcoming: true },
            { id: 3, title: 'Olympic Peninsula Trail', dateRange: 'Sep 20 – 23, 2024', people: 6, image: 'https://images.unsplash.com/photo-1532339142463-fd0a8979791a?w=600&q=80', status: 'Completed', isUpcoming: false },
            { id: 4, title: 'Redwood National Park', dateRange: 'Jul 4 – 8, 2024', people: 5, image: 'https://images.unsplash.com/photo-1476041800959-2f6bb412c8ce?w=600&q=80', status: 'Completed', isUpcoming: false }
        ],
        rentals: [
            { id: 1, title: '4-Person Dome Tent', dateRange: 'Oct 10 – Oct 16', status: 'Active', icon: '🏕️', isActive: true },
            { id: 2, title: '65L Hiking Backpack', dateRange: 'Sep 18 – Sep 24', status: 'Returned', icon: '🎒', isActive: false },
            { id: 3, title: 'LED Lantern Set', dateRange: 'Sep 18 – Sep 24', status: 'Returned', icon: '🔦', isActive: false },
            { id: 4, title: 'Camping Axe Kit', dateRange: 'Aug 5 – Aug 12', status: 'Returned', icon: '🪓', isActive: false },
            { id: 5, title: 'Inflatable Kayak', dateRange: 'Jul 4 – Jul 9', status: 'Returned', icon: '🛶', isActive: false },
            { id: 6, title: 'Heavy-Duty Cooler', dateRange: 'Jul 4 – Jul 9', status: 'Returned', icon: '🧊', isActive: false }
        ],
        savedItems: [
            { id: 1, title: 'Yosemite Valley Camp', location: 'Yosemite, CA', rating: 4.9, image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&q=80' },
            { id: 2, title: 'Big Sur Coastal Camp', location: 'Big Sur, CA', rating: 4.8, image: 'https://images.unsplash.com/photo-1537905569824-f89f14cceb68?w=400&q=80' },
            { id: 3, title: 'Glacier Backcountry', location: 'Montana', rating: 4.7, image: 'https://images.unsplash.com/photo-1478827536114-da961b7f86d2?w=400&q=80' },
            { id: 4, title: 'Joshua Tree Desert Camp', location: 'California', rating: 4.6, image: 'https://images.unsplash.com/photo-1517824806704-9040b037703b?w=400&q=80' }
        ],
        reviews: [
            { id: 1, target: 'Mount Hood National Forest', rating: 5, text: 'Absolutely stunning campsite with incredible views of the mountain. The trails were well-maintained and we saw some amazing wildlife. Highly recommend the lakeside spots — waking up to that view is priceless.', date: 'October 16, 2024' },
            { id: 2, target: 'Olympic Peninsula Trail', rating: 4, text: 'Great trail system with diverse scenery — from rainforest to coastline in a single day. The campsites are a bit rustic but that\'s part of the charm. Bring extra rain gear, even in summer!', date: 'September 24, 2024' },
            { id: 3, target: 'Redwood National Park', rating: 5, text: 'Walking among the ancient giants is a humbling experience. The campground was quiet, clean, and perfectly shaded. The ranger-led evening programs were a highlight for the whole group.', date: 'July 9, 2024' },
            { id: 4, target: '4-Person Dome Tent (Rental)', rating: 4, text: 'Solid tent for the price point. Easy setup, good waterproofing, and surprisingly spacious inside. Only knock is the zipper quality — felt a bit flimsy. Would rent again for car camping trips.', date: 'October 17, 2024' }
        ]
    };

    activeTab: string = 'overview';

    // Animation state
    tripsCompletedAnimated: number = 0;
    campsitesVisitedAnimated: number = 0;
    reviewsGivenAnimated: number = 0;
    gearRentedAnimated: number = 0;
    animated: boolean = false;
    
    notifications = signal<any[]>([]);

    pendingCount$ = this.authService.getCurrentUser().pipe(
        switchMap(user => user ? this.inviteService.getPendingInvitesCount(user.id) : of(0))
    );

    constructor(
        private userApi: UserApiService,
        private cdr: ChangeDetectorRef,
        private inviteService: GroupInviteService,
        private authService: AuthService,
        private academyService: AcademyService
    ) { }

    ngOnInit(): void {
        this.userApi.getProfile()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.profile = data;
                    this.user.name = data.name || data.username;
                    this.user.role = data.roles?.[0]?.replace('ROLE_', '') || 'CAMPER';
                    if (data.profileDetails) {
                        this.user.bio = (data.profileDetails['bio'] as string) || this.user.bio;
                    }
                    this.loading = false;
                    this.cdr.markForCheck();
                },
                error: () => {
                    this.error = 'Failed to load profile.';
                    this.loading = false;
                    this.cdr.markForCheck();
                }
            });
        
        // Load user stats
        this.userApi.getUserStats()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (stats) => {
                    this.user.stats = {
                        tripsCompleted: stats.tripsCompleted,
                        campsitesVisited: stats.campsitesVisited,
                        reviewsGiven: stats.reviewsGiven,
                        gearRented: stats.gearRented
                    };
                    this.cdr.markForCheck();
                },
                error: (err) => {
                    console.error('Failed to load user stats:', err);
                    // Keep the mock stats if API fails
                }
            });

        this.checkCertifications();
    }

    private checkCertifications() {
        const currentUser = JSON.parse(localStorage.getItem('cc_user') || '{}');
        const userId = currentUser?.id;
        
        if (userId) {
            this.academyService.getUserCertifications(userId).subscribe({
                next: (certs) => {
                    const expiredCerts = certs.filter(c => {
                        // Use backend status or date comparison
                        if (c.status === 'EXPIRED') return true;
                        if (!c.expiryDate) return false;
                        return new Date() > new Date(c.expiryDate);
                    });

                    if (expiredCerts.length > 0) {
                        const newNotifications = [...this.notifications()];
                        expiredCerts.forEach(cert => {
                            newNotifications.push({
                                id: `cert-expired-${cert.id}`,
                                type: 'warning',
                                title: 'Certification Expired',
                                message: `Your "${cert.certificationName || 'Wilderness'}" certification has expired. Renew it now to maintain your expert status.`,
                                icon: '⚠️',
                                action: 'Renew Now',
                                link: '/academy'
                            });
                        });
                        this.notifications.set(newNotifications);
                        this.cdr.markForCheck();
                    }
                }
            });
        }
    }

    setActiveTab(tab: string) {
        this.activeTab = tab;
    }

    @HostListener('window:scroll')
    onScroll() {
        this.animateNumbers();
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.animateNumbers();
        }, 100);
    }

    animateNumbers() {
        if (this.animated) return;
        this.animated = true;

        this.animateValue('tripsCompletedAnimated', this.user.stats.tripsCompleted);
        this.animateValue('campsitesVisitedAnimated', this.user.stats.campsitesVisited);
        this.animateValue('reviewsGivenAnimated', this.user.stats.reviewsGiven);
        this.animateValue('gearRentedAnimated', this.user.stats.gearRented);
    }

    animateValue(propName: 'tripsCompletedAnimated' | 'campsitesVisitedAnimated' | 'reviewsGivenAnimated' | 'gearRentedAnimated', target: number) {
        let current = 0;
        const step = Math.max(1, Math.floor(target / 40));
        const interval = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(interval);
            }
            this[propName] = current;
        }, 25);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
