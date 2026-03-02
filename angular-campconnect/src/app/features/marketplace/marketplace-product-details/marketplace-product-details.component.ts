import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LucideAngularModule, ChevronRight, Mountain, Star, BadgeCheck, ShieldCheck, ShoppingBag, Heart, Truck, RotateCcw, Feather, CloudRain, Wind, Timer, Users, Package } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { GearApiService } from '../../gear/services/gear-api.service';

@Component({
    selector: 'app-marketplace-product-details',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule, FormsModule],
    templateUrl: './marketplace-product-details.component.html',
    styleUrls: ['./marketplace-product-details.component.scss']
})
export class MarketplaceProductDetailsComponent implements OnInit {
    // Icons
    icons = {
        ChevronRight, Mountain, Star, BadgeCheck, ShieldCheck, ShoppingBag, Heart, Truck, RotateCcw,
        Feather, CloudRain, Wind, Timer, Users, Package
    };

    activeTab: string = 'description';
    activeImageIndex: number = 0;

    // Active Product Data
    product: any = null;

    relatedProducts = [
        {
            id: '2',
            name: 'NEMO Disco 15 Sleeping Bag',
            category: 'Sleeping Bags',
            price: 18,
            rating: 4.8,
            image: 'https://images.unsplash.com/photo-1445308394109-4ec2920981b1?w=600&q=80'
        },
        {
            id: '3',
            name: 'Jetboil Flash Cooking System',
            category: 'Camp Kitchen',
            price: 12,
            rating: 4.9,
            image: 'https://images.unsplash.com/photo-1571687949921-1306bfb24b72?w=600&q=80'
        },
        {
            id: '4',
            name: 'Helinox Chair Zero',
            category: 'Furniture',
            price: 8,
            rating: 4.7,
            image: 'https://images.unsplash.com/photo-1517824806704-9040b037703b?w=600&q=80'
        },
        {
            id: '5',
            name: 'Osprey Atmos AG 65',
            category: 'Backpacks',
            price: 24,
            rating: 4.9,
            image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80'
        }
    ];

    constructor(private route: ActivatedRoute, private gearService: GearApiService) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.loadProductDetails(id);
            }
        });
    }

    loadProductDetails(id: string) {
        this.gearService.getGearById(id).subscribe({
            next: (g: any) => {
                const images = (g.images && g.images.length > 0)
                    ? g.images.map((img: any) => img.imageUrl)
                    : (g.imageUrls?.length > 0 ? g.imageUrls : ['https://images.unsplash.com/photo-1525811902-f2342640856e?w=800&q=80']);

                this.product = {
                    id: g.id,
                    name: g.name,
                    brand: g.brand || 'ConnectCamp Provider',
                    pricePerDay: g.price || g.pricePerDay || 0,
                    rating: g.rating || 4.5,
                    reviewCount: g.reviewCount || Math.floor(Math.random() * 50),
                    condition: g.condition,
                    description: g.description,
                    features: [
                        { icon: Feather, text: 'Inspected for quality' },
                        { icon: ShieldCheck, text: 'Renter Protection' }
                    ],
                    specs: [
                        { label: 'Category', value: g.category },
                        { label: 'Listing ID', value: g.id }
                    ],
                    images: images,
                    reviews: [],
                    provider: {
                        name: g.ownerName || 'Unknown Provider',
                        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
                        joined: '2023',
                        responseRate: '100% Response Rate',
                        verified: true,
                        superhost: false
                    }
                };
            },
            error: (err) => {
                console.error('Failed to load product details', err);
            }
        });
    }

    setActiveTab(tab: string) {
        this.activeTab = tab;
    }

    setActiveImage(index: number) {
        this.activeImageIndex = index;
    }
}
