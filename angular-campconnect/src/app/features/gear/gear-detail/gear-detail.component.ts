import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule, ChevronLeft, Star, Share2, Heart, ShoppingCart, Calendar, MapPin, Package, Shield, Truck, RotateCcw, CheckCircle, ChevronRight, ThumbsUp, MessageSquare } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { BadgeComponent } from '../../../shared/components/badge.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardDescriptionComponent, CardContentComponent } from '../../../shared/components/card.component';
import { MapViewComponent } from '../../../shared/components/map-view/map-view.component';

@Component({
    selector: 'app-gear-detail',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        LucideAngularModule,
        ButtonComponent,
        BadgeComponent,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardDescriptionComponent,
        CardContentComponent,
        MapViewComponent
    ],
    templateUrl: './gear-detail.component.html',
    styles: [`
    :host {
      display: block;
    }
  `]
})
export class GearDetailComponent implements OnInit {
    gearId: string | null = null;
    currentImageIndex = 0;
    selectedOption: 'rent' | 'buy' = 'rent';
    selectedDuration = 3;
    quantity = 1;

    // Icons
    readonly ChevronLeft = ChevronLeft;
    readonly Star = Star;
    readonly Share2 = Share2;
    readonly Heart = Heart;
    readonly ShoppingCart = ShoppingCart;
    readonly Calendar = Calendar;
    readonly MapPin = MapPin;
    readonly Package = Package;
    readonly Shield = Shield;
    readonly Truck = Truck;
    readonly RotateCcw = RotateCcw;
    readonly CheckCircle = CheckCircle;
    readonly ChevronRight = ChevronRight;
    readonly ThumbsUp = ThumbsUp;
    readonly MessageSquare = MessageSquare;

    // Mock Data
    gear: any = {
        id: 'gear-1',
        name: 'Professional 4-Season Tent',
        category: 'Shelter',
        brand: 'Mountain Peak',
        rating: 4.9,
        reviewCount: 342,
        rentalPrice: 45,
        purchasePrice: 599,
        available: true,
        location: 'San Francisco, CA',
        images: [
            'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=80',
            'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1200&q=80',
            'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=1200&q=80',
        ],
        description:
            'Premium 4-season tent designed for extreme weather conditions. Features reinforced poles, waterproof materials, and excellent ventilation. Perfect for serious backpackers and mountaineers.',
        specifications: {
            capacity: '2-3 persons',
            weight: '4.2 lbs',
            dimensions: '7.5 x 5 x 4 ft',
            material: 'Ripstop Nylon',
            waterproof: '3000mm',
            season: '4-Season',
        },
        features: [
            'Double-wall construction',
            'Reinforced aluminum poles',
            'Full rainfly coverage',
            'Multiple ventilation points',
            'Interior storage pockets',
            'Reflective guy lines',
        ],
        rentalTerms: {
            minDays: 1,
            maxDays: 30,
            deposit: 100,
            insurance: 'Optional damage protection available',
        },
    };

    mockReviews: any[] = [
        {
            id: 'rev-1',
            userId: 'user-1',
            userName: 'Alex Thompson',
            userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
            rating: 5,
            title: 'Best tent I\'ve ever used!',
            content:
                'This tent held up perfectly in heavy rain and wind. Setup was easy, and the quality is outstanding. Highly recommend for serious camping.',
            createdAt: '2026-01-20T14:30:00',
            verifiedPurchase: true,
            helpful: 45,
        },
        {
            id: 'rev-2',
            userId: 'user-2',
            userName: 'Maria Garcia',
            userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
            rating: 5,
            title: 'Worth every penny',
            content:
                'Rented this for a week-long trip and it exceeded expectations. Stayed dry through storms and was spacious enough for two people plus gear.',
            createdAt: '2026-01-15T09:15:00',
            verifiedPurchase: false,
            helpful: 32,
        },
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.gearId = params.get('id');
            // In real app, load data here
        });
    }

    navigate(path: string) {
        this.router.navigate([path]);
    }

    nextImage() {
        this.currentImageIndex = (this.currentImageIndex + 1) % this.gear.images.length;
    }

    prevImage() {
        this.currentImageIndex = this.currentImageIndex === 0 ? this.gear.images.length - 1 : this.currentImageIndex - 1;
    }

    get totalPrice(): number {
        if (this.selectedOption === 'rent') {
            return this.gear.rentalPrice * this.selectedDuration * this.quantity;
        }
        return this.gear.purchasePrice * this.quantity;
    }

    get mapMarkers() {
        return [
            {
                id: this.gear.id,
                lat: 37.7749,
                lng: -122.4194,
                title: this.gear.location,
                type: 'campsite' as const,
            },
        ];
    }

    range(n: number): number[] {
        return Array.from({ length: n }, (_, i) => i);
    }
}
