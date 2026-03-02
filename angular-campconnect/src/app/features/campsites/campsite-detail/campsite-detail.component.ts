import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule, ChevronLeft, ChevronRight, ImageIcon, MapPin, Star, Share2, Heart, Accessibility, Sun, Info, Calendar, Map as MapIcon, Users, CheckCircle, AlertTriangle, Wifi, Zap, Droplets, Flame, TreePine, Mountain, Waves, ThumbsUp, MessageSquare, Filter } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { BadgeComponent } from '../../../shared/components/badge.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardDescriptionComponent, CardContentComponent } from '../../../shared/components/card.component';
import { MapViewComponent } from '../../../shared/components/map-view/map-view.component';
import { WriteReviewComponent } from '../write-review/write-review.component';

@Component({
    selector: 'app-campsite-detail',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        LucideAngularModule,
        ButtonComponent,
        BadgeComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardDescriptionComponent,
        CardContentComponent,
        MapViewComponent,
        WriteReviewComponent
    ],
    templateUrl: './campsite-detail.component.html',
    styles: [`
    :host {
      display: block;
    }
  `]
})
export class CampsiteDetailComponent implements OnInit {
    siteId: string | null = null;
    currentImageIndex = 0;
    showAllPhotos = false;
    reviewSort: 'recent' | 'helpful' | 'rating' = 'recent';
    showWriteReview = false;

    // Icons
    readonly ChevronLeft = ChevronLeft;
    readonly ChevronRight = ChevronRight;
    readonly ImageIcon = ImageIcon;
    readonly MapPin = MapPin;
    readonly Star = Star;
    readonly Share2 = Share2;
    readonly Heart = Heart;
    readonly Accessibility = Accessibility;
    readonly Sun = Sun;
    readonly Info = Info;
    readonly Calendar = Calendar;
    readonly MapIcon = MapIcon;
    readonly Users = Users;
    readonly CheckCircle = CheckCircle;
    readonly AlertTriangle = AlertTriangle;
    readonly Wifi = Wifi;
    readonly Zap = Zap;
    readonly Droplets = Droplets;
    readonly Flame = Flame;
    readonly TreePine = TreePine;
    readonly Mountain = Mountain;
    readonly Waves = Waves;
    readonly ThumbsUp = ThumbsUp;
    readonly MessageSquare = MessageSquare;

    terrainIcons: Record<string, any> = {
        forest: TreePine,
        desert: Sun,
        mountain: Mountain,
        beach: Waves,
        lakeside: Waves,
    };

    amenityIcons: Record<string, any> = {
        wifi: Wifi,
        power: Zap,
        water: Droplets,
        fire: Flame,
    };

    // Mock Data
    campsite: any = {
        id: 'site-1',
        name: 'Upper Pines Campground',
        location: 'Yosemite National Park, CA',
        coordinates: { lat: 37.7365, lng: -119.5691 },
        terrain: 'forest',
        accessibility: 'easy',
        priceRange: '$',
        basePrice: 35,
        rating: 4.8,
        reviewCount: 1243,
        amenities: ['wifi', 'power', 'water', 'fire'],
        images: [
            'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=80',
            'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1200&q=80',
            'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=1200&q=80',
        ],
        description:
            'Nestled in the heart of Yosemite Valley, Upper Pines Campground offers stunning views of Half Dome and easy access to world-class hiking trails. This family-friendly campground features well-maintained sites, modern facilities, and ranger-led programs.',
        highlights: [
            'Direct views of Half Dome',
            'Close to Yosemite Valley trails',
            'Ranger programs available',
            'Pet-friendly sites',
            'ADA accessible facilities',
        ],
        rules: [
            'Quiet hours: 10:00 PM - 7:00 AM',
            'Maximum 6 people per site',
            'Pets must be on leash at all times',
            'No generators after 8:00 PM',
            'Bear-proof food storage required',
        ],
        seasonal: {
            bestTime: 'May - September',
            winterAccess: 'Limited (snow conditions)',
            peakSeason: 'June - August',
        },
        ratings: {
            overall: 4.8,
            cleanliness: 4.7,
            location: 4.9,
            value: 4.6,
            amenities: 4.8,
        },
    };

    mockReviews: any[] = [
        {
            id: 'rev-1',
            userId: 'user-1',
            userName: 'Sarah Johnson',
            userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
            rating: 5,
            ratings: {
                cleanliness: 5,
                location: 5,
                value: 4,
                amenities: 5,
            },
            title: 'Absolutely stunning location!',
            content:
                'This campsite exceeded all our expectations. The views of Half Dome were breathtaking, and the facilities were incredibly well-maintained. The hosts were friendly and helpful. Would definitely return!',
            photos: [
                'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80',
                'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600&q=80',
            ],
            createdAt: '2026-01-15T10:30:00',
            verifiedStay: true,
            helpful: 24,
            responses: [
                {
                    id: 'resp-1',
                    from: 'owner',
                    name: 'Park Management',
                    content:
                        'Thank you so much for your wonderful review, Sarah! We\'re thrilled you enjoyed your stay and those Half Dome views. We hope to welcome you back soon!',
                    createdAt: '2026-01-16T14:20:00',
                },
            ],
        },
        {
            id: 'rev-2',
            userId: 'user-2',
            userName: 'Michael Chen',
            userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
            rating: 4,
            ratings: {
                cleanliness: 4,
                location: 5,
                value: 4,
                amenities: 3,
            },
            title: 'Great spot but limited amenities',
            content:
                'Beautiful location with easy access to hiking trails. The site was clean and well-organized. Only downside was limited cell service and no WiFi, but that\'s expected in a natural setting.',
            photos: [],
            createdAt: '2026-01-10T16:45:00',
            verifiedStay: true,
            helpful: 12,
            responses: [],
        },
        {
            id: 'rev-3',
            userId: 'user-3',
            userName: 'Emma Rodriguez',
            userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
            rating: 5,
            ratings: {
                cleanliness: 5,
                location: 5,
                value: 5,
                amenities: 5,
            },
            title: 'Perfect family camping experience',
            content:
                'We brought our two kids and they had the time of their lives! The campground was safe, clean, and had plenty of activities nearby. The ranger program was educational and fun. Highly recommend for families!',
            photos: [
                'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600&q=80',
            ],
            createdAt: '2025-12-28T09:15:00',
            verifiedStay: true,
            helpful: 18,
            responses: [],
        },
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.siteId = params.get('id');
            // In real app, load data here
        });
    }

    navigate(path: string, extras?: any) {
        this.router.navigate([path], extras);
    }

    nextImage() {
        this.currentImageIndex = (this.currentImageIndex + 1) % this.campsite.images.length;
    }

    prevImage() {
        this.currentImageIndex = this.currentImageIndex === 0 ? this.campsite.images.length - 1 : this.currentImageIndex - 1;
    }

    setImage(index: number) {
        this.currentImageIndex = index;
    }

    setReviewSort(sort: string) {
        this.reviewSort = sort as 'recent' | 'helpful' | 'rating';
    }

    get sortedReviews() {
        return [...this.mockReviews].sort((a, b) => {
            if (this.reviewSort === 'recent') {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            if (this.reviewSort === 'helpful') {
                return b.helpful - a.helpful;
            }
            return b.rating - a.rating;
        });
    }

    get mapMarkers() {
        return [
            {
                id: this.campsite.id,
                lat: this.campsite.coordinates.lat,
                lng: this.campsite.coordinates.lng,
                title: this.campsite.name,
                type: 'campsite' as const,
            },
        ];
    }

    getTerrainIcon(terrain: string) {
        return this.terrainIcons[terrain] || this.Sun;
    }

    getAmenityIcon(amenity: string) {
        return this.amenityIcons[amenity];
    }

    getDescendantRatingsArray(): any[] {
        // Helper for Object.entries since it's not direct in template
        return Object.entries(this.campsite.ratings).slice(1).map(([key, value]) => ({ key, value }));
    }

    range(n: number): number[] {
        return Array.from({ length: n }, (_, i) => i);
    }
}
