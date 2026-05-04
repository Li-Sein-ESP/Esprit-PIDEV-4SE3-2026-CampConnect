import {
    Component, HostListener, OnInit, AfterViewInit,
    OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil, switchMap, of } from 'rxjs';
import { UserApiService } from '../services/user-api.service';
import { UserProfileResponse } from '../models/user.model';
import { GroupInviteService } from '../../groups/services/group-invite.service';
import { AuthService } from '../../../core/services/auth.service';

export type FidelityTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export interface TierConfig {
    label: FidelityTier;
    min: number;
    max: number;
    color: string;         // Tailwind bg class
    textColor: string;     // Tailwind text class
    ring: string;          // Tailwind ring class
}

export interface ActivityItem {
    icon: string;
    label: string;
    sub: string;
    time: string;
}

export interface BadgeItem {
    id: string;
    title: string;
    desc: string;
    date: string;
    icon: string;
    colorClass: string;
}

export interface TripItem {
    id: number;
    title: string;
    campsite: string;
    dateRange: string;
    people: number;
    image: string;
    status: 'Completed' | 'Upcoming' | 'Cancelled';
}

export interface RentalItem {
    id: number;
    title: string;
    image: string;
    dateRange: string;
    cost: string;
    status: 'Active' | 'Returned' | 'Overdue';
}

export interface ReviewItem {
    id: number;
    target: string;
    rating: number;
    text: string;
    date: string;
    type: 'campsite' | 'gear';
}

const TIERS: TierConfig[] = [
    { label: 'Bronze',   min: 0,    max: 200,  color: 'bg-amber-700',  textColor: 'text-amber-700',  ring: 'ring-amber-600' },
    { label: 'Silver',   min: 200,  max: 500,  color: 'bg-slate-400',  textColor: 'text-slate-500',  ring: 'ring-slate-400' },
    { label: 'Gold',     min: 500,  max: 1000, color: 'bg-yellow-500', textColor: 'text-yellow-600', ring: 'ring-yellow-400' },
    { label: 'Platinum', min: 1000, max: 2000, color: 'bg-sky-600',    textColor: 'text-sky-600',    ring: 'ring-sky-500'   },
];

@Component({
    selector: 'app-camper-profile',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './camper-profile.component.html',
    styleUrl: './camper-profile.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CamperProfileComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild('avatarInput') avatarInput!: ElementRef<HTMLInputElement>;

    /* ── Core state ── */
    profile: UserProfileResponse | null = null;
    loading = true;
    error: string | null = null;
    private destroy$ = new Subject<void>();

    /* ── Avatar & Cover ── */
    avatarUrl = 'https://images.unsplash.com/photo-1535930749574-1399327ce78f?w=300&h=300&fit=crop&crop=face';
    avatarHover = false;
    avatarPreview: string | null = null;
    coverUrl = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&h=400&fit=crop';
    
    /* ── Mouse Effect ── */
    mouseX = '50%';
    mouseY = '50%';

    /* ── Profile data (filled from API, fallbacks below) ── */
    userName = 'Jordan Mitchell';
    userUsername = '@jordanmitch';
    userBio = 'Nature enthusiast & weekend adventurer. Passionate about sustainable camping, trail cooking, and finding hidden gems off the beaten path. 🌲⛺';
    userRole = 'CAMPER';
    memberSince = 'January 2022';

    /* ── Fidelity / loyalty ── */
    loyaltyPoints = 340;
    tiers = TIERS;

    get currentTier(): TierConfig {
        return TIERS.find(t => this.loyaltyPoints >= t.min && this.loyaltyPoints < t.max) ?? TIERS[TIERS.length - 1];
    }
    get nextTier(): TierConfig | null {
        const idx = TIERS.findIndex(t => t.label === this.currentTier.label);
        return idx < TIERS.length - 1 ? TIERS[idx + 1] : null;
    }
    get progressPercent(): number {
        const t = this.currentTier;
        return Math.min(100, Math.round(((this.loyaltyPoints - t.min) / (t.max - t.min)) * 100));
    }
    get pointsToNext(): number {
        return this.nextTier ? (this.currentTier.max - this.loyaltyPoints) : 0;
    }

    /* ── Stats ── */
    stats = { tripsCompleted: 47, campsitesVisited: 32, reviewsGiven: 28, gearRented: 15 };

    /* ── Animated stat counters ── */
    tripsAnim = 0; campsAnim = 0; reviewsAnim = 0; gearAnim = 0;
    animated = false;

    /* ── Camping preferences ── */
    preferences = [
        { label: 'Mountain', icon: '⛰️', active: true },
        { label: 'Forest',   icon: '🌲', active: true },
        { label: 'Beach',    icon: '🏖️', active: false },
        { label: 'Social',   icon: '👥', active: false },
        { label: 'Quiet',    icon: '🤫', active: true },
        { label: 'Backpacking', icon: '🎒', active: true },
    ];

    /* ── Badges ── */
    badges: BadgeItem[] = [
        { id: 'beginner', title: 'Outdoor Beginner',   desc: 'Completed your first camping trip',      date: 'Jan 2022',  icon: '🌱', colorClass: 'bg-emerald-100 text-emerald-700' },
        { id: 'verified', title: 'Verified Camper',    desc: 'Identity & experience verified',          date: 'Mar 2022',  icon: '✅', colorClass: 'bg-green-100 text-green-700' },
        { id: 'safety',   title: 'Safety Certified',   desc: 'Completed wilderness safety course',      date: 'Jun 2023',  icon: '🛡️', colorClass: 'bg-amber-100 text-amber-700' },
        { id: 'explorer', title: 'Trail Explorer',     desc: 'Visited 25+ unique campsites',            date: 'Aug 2024',  icon: '🧭', colorClass: 'bg-sky-100 text-sky-700' },
        { id: 'fire',     title: 'Campfire Master',    desc: 'Earned 5-star fire safety rating',        date: 'Sep 2024',  icon: '🔥', colorClass: 'bg-orange-100 text-orange-700' },
        { id: 'social',   title: 'Community Builder',  desc: 'Organized 3+ group camping trips',        date: 'Oct 2024',  icon: '🤝', colorClass: 'bg-violet-100 text-violet-700' },
    ];

    /* ── Recent activity ── */
    recentActivity: ActivityItem[] = [
        { icon: '🏕️', label: 'Rental started',   sub: '4-Person Dome Tent',          time: '2h ago' },
        { icon: '⭐', label: 'Review posted',     sub: 'Mount Hood National Forest',  time: '3d ago' },
        { icon: '📅', label: 'Trip booked',       sub: 'Crater Lake Backcountry',     time: '5d ago' },
        { icon: '🎒', label: 'Gear returned',     sub: '65L Hiking Backpack',         time: '1w ago' },
        { icon: '📩', label: 'Group invite sent', sub: 'Olympic Peninsula Trail',     time: '2w ago' },
    ];

    /* ── Trips ── */
    trips: TripItem[] = [
        { id: 1, title: 'Mount Hood National Forest', campsite: 'Lost Lake Campground',   dateRange: 'Oct 12 – 15, 2024', people: 4, image: 'https://images.unsplash.com/photo-1487730116645-74489c95b41b?w=600&q=80', status: 'Completed' },
        { id: 2, title: 'Crater Lake Backcountry',    campsite: 'Mazama Village',          dateRange: 'Nov 1 – 3, 2024',  people: 2, image: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=600&q=80', status: 'Upcoming'  },
        { id: 3, title: 'Olympic Peninsula Trail',    campsite: 'Mora Campground',         dateRange: 'Sep 20 – 23, 2024',people: 6, image: 'https://images.unsplash.com/photo-1532339142463-fd0a8979791a?w=600&q=80', status: 'Completed' },
        { id: 4, title: 'Redwood National Park',      campsite: 'Jedediah Smith CG',       dateRange: 'Jul 4 – 8, 2024',  people: 5, image: 'https://images.unsplash.com/photo-1476041800959-2f6bb412c8ce?w=600&q=80', status: 'Completed' },
    ];

    /* ── Rentals ── */
    rentals: RentalItem[] = [
        { id: 1, title: '4-Person Dome Tent',  image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=200&q=80', dateRange: 'Oct 10 – Oct 16', cost: '$84',  status: 'Active'   },
        { id: 2, title: '65L Hiking Backpack', image: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=200&q=80', dateRange: 'Sep 18 – Sep 24', cost: '$42',  status: 'Returned' },
        { id: 3, title: 'LED Lantern Set',     image: 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=200&q=80', dateRange: 'Sep 18 – Sep 24', cost: '$18',  status: 'Returned' },
        { id: 4, title: 'Inflatable Kayak',    image: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=200&q=80', dateRange: 'Jul 4 – Jul 9',   cost: '$120', status: 'Returned' },
    ];

    /* ── Reviews ── */
    reviews: ReviewItem[] = [
        { id: 1, target: 'Mount Hood National Forest', rating: 5, text: 'Absolutely stunning campsite with incredible views. Waking up to that lake view is priceless.', date: 'October 16, 2024', type: 'campsite' },
        { id: 2, target: 'Olympic Peninsula Trail',    rating: 4, text: 'Great trail with diverse scenery. Bring extra rain gear, even in summer!',                        date: 'September 24, 2024', type: 'campsite' },
        { id: 3, target: '4-Person Dome Tent',         rating: 4, text: 'Easy setup, good waterproofing. Zipper felt a bit flimsy — would still rent again.',               date: 'October 17, 2024', type: 'gear'     },
        { id: 4, target: 'Redwood National Park',      rating: 5, text: 'Walking among the ancient giants is humbling. Clean, quiet, and perfectly shaded campground.',      date: 'July 9, 2024', type: 'campsite' },
    ];

    /* ── Pending invites ── */
    pendingCount$ = this.authService.getCurrentUser().pipe(
        switchMap(user => user ? this.inviteService.getPendingInvitesCount(user.id) : of(0))
    );

    /* ── Tabs ── */
    activeTab = 'trips';
    readonly tabs = [
        { id: 'trips',    label: 'Trip History',  icon: '🗺️' },
        { id: 'rentals',  label: 'Gear Rentals',  icon: '🎒' },
        { id: 'reviews',  label: 'My Reviews',    icon: '⭐' },
    ];

    /* ── Star range helper ── */
    stars = [1, 2, 3, 4, 5];

    constructor(
        private userApi: UserApiService,
        private cdr: ChangeDetectorRef,
        private inviteService: GroupInviteService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.userApi.getProfile()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.profile = data;
                    this.userName = data.name || data.username;
                    this.userUsername = '@' + data.username;
                    this.userRole = data.roles?.[0]?.replace('ROLE_', '') || 'CAMPER';
                    if (data.profileDetails) {
                        this.userBio = (data.profileDetails['bio'] as string) || this.userBio;
                        const pts = data.profileDetails['loyaltyPoints'];
                        if (typeof pts === 'number') this.loyaltyPoints = pts;
                        const av = data.profileDetails['avatarUrl'];
                        if (av) this.avatarUrl = av as string;
                    }
                    if (data.createdAt) {
                        this.memberSince = new Date(data.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
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

        this.userApi.getUserStats()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (s) => {
                    this.stats = {
                        tripsCompleted:   Number(s.tripsCompleted)   || this.stats.tripsCompleted,
                        campsitesVisited: Number(s.campsitesVisited) || this.stats.campsitesVisited,
                        reviewsGiven:     Number(s.reviewsGiven)     || this.stats.reviewsGiven,
                        gearRented:       Number(s.gearRented)       || this.stats.gearRented,
                    };
                    this.cdr.markForCheck();
                },
                error: () => { /* keep fallback */ }
            });
    }

    ngAfterViewInit() {
        setTimeout(() => this.animateNumbers(), 200);
    }

    @HostListener('window:scroll')
    onScroll() { this.animateNumbers(); }

    @HostListener('mousemove', ['$event'])
    onMouseMove(event: MouseEvent) {
        this.mouseX = `${event.clientX}px`;
        this.mouseY = `${event.clientY}px`;
        this.cdr.markForCheck();
    }

    animateNumbers() {
        if (this.animated) return;
        this.animated = true;
        this.animateTo('tripsAnim',   this.stats.tripsCompleted);
        this.animateTo('campsAnim',   this.stats.campsitesVisited);
        this.animateTo('reviewsAnim', this.stats.reviewsGiven);
        this.animateTo('gearAnim',    this.stats.gearRented);
    }

    private animateTo(prop: 'tripsAnim' | 'campsAnim' | 'reviewsAnim' | 'gearAnim', target: number) {
        let cur = 0;
        const step = Math.max(1, Math.floor(target / 45));
        const iv = setInterval(() => {
            cur = Math.min(cur + step, target);
            this[prop] = cur;
            this.cdr.markForCheck();
            if (cur >= target) clearInterval(iv);
        }, 22);
    }

    setActiveTab(tab: string) { this.activeTab = tab; }

    /* ── Avatar upload ── */
    onAvatarClick() { this.avatarInput?.nativeElement.click(); }

    onAvatarFileChange(event: Event) {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            this.avatarPreview = e.target?.result as string;
            this.cdr.markForCheck();
        };
        reader.readAsDataURL(file);
    }

    confirmAvatarUpload() {
        if (this.avatarPreview) {
            this.avatarUrl = this.avatarPreview;
            this.avatarPreview = null;
            this.cdr.markForCheck();
        }
    }

    cancelAvatarUpload() {
        this.avatarPreview = null;
        this.cdr.markForCheck();
    }

    /* ── Status chip helpers ── */
    tripStatusClass(status: TripItem['status']): string {
        return status === 'Completed' ? 'bg-emerald-100 text-emerald-700'
             : status === 'Upcoming'  ? 'bg-amber-100 text-amber-700'
             :                          'bg-red-100 text-red-600';
    }

    rentalStatusClass(status: RentalItem['status']): string {
        return status === 'Active'   ? 'bg-emerald-100 text-emerald-700'
             : status === 'Overdue'  ? 'bg-red-100 text-red-600'
             :                         'bg-stone-100 text-stone-600';
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
