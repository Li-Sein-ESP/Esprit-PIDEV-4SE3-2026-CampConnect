import { Component, HostListener, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { GearApiService } from '../../gear/services/gear-api.service';
import { PaymentApiService } from '../../gear/services/payment-api.service';
import { ToastService } from '../../../shared/services/toast.service';

interface Category {
    id: string;
    name: string;
    image: string;
    count: number;
}

interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    rating: number;
    image: string;
    reviewCount: number;
}

interface Kit {
    id: string;
    name: string;
    description: string;
    items: string;
    price: number;
    originalPrice: number;
    image: string;
    discount: string;
}

@Component({
    selector: 'app-marketplace-landing',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './marketplace-landing.component.html',
    styleUrls: ['./marketplace-landing.component.scss']
})
export class MarketplaceLandingComponent implements OnInit {
    isScrolled = false;

    @ViewChild('mostRentedContainer') mostRentedContainer!: ElementRef<HTMLDivElement>;

    categories: Category[] = [
        { id: "tents", name: "Tents & Shelters", image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80", count: 124 },
        { id: "sleeping", name: "Sleeping Bags & Pads", image: "https://images.unsplash.com/photo-1445308394109-4ec2920981b1?w=600&q=80", count: 89 },
        { id: "cooking", name: "Camp Kitchen", image: "https://images.unsplash.com/photo-1571687949921-1306bfb24b72?w=600&q=80", count: 156 },
        { id: "lighting", name: "Lighting & Power", image: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=600&q=80", count: 78 },
        { id: "furniture", name: "Camp Furniture", image: "https://images.unsplash.com/photo-1517824806704-9040b037703b?w=600&q=80", count: 45 },
        { id: "accessories", name: "Accessories", image: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600&q=80", count: 203 },
    ];

    featuredProducts: Product[] = [];
    mostRented: Product[] = [];

    campingKits: Kit[] = [
        {
            id: "1",
            name: "Weekend Warrior Kit",
            description: "Everything you need for a 2-3 day adventure",
            items: "2-Person Tent + Sleeping Bags + Sleeping Pads + Camp Chair",
            price: 89,
            originalPrice: 129,
            image: "https://images.unsplash.com/photo-1517824806704-9040b037703b?w=800&q=80",
            discount: "31% OFF",
        },
        {
            id: "2",
            name: "Backcountry Essentials",
            description: "Lightweight gear for serious hikers",
            items: "Ultralight Tent + Sleeping Pad + Trekking Poles + Headlamp",
            price: 65,
            originalPrice: 95,
            image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80",
            discount: "32% OFF",
        },
        {
            id: "3",
            name: "Glamping Experience",
            description: "Luxury camping for the discerning outdoor enthusiast",
            items: "4-Person Tent + Air Mattresses + Camp Furniture + Lighting Kit",
            price: 145,
            originalPrice: 210,
            image: "https://images.unsplash.com/photo-1445308394109-4ec2920981b1?w=800&q=80",
            discount: "31% OFF",
        },
    ];

    trustStats = [
        { value: "50,000+", label: "Gear Items" },
        { value: "12,000+", label: "Happy Campers" },
        { value: "500+", label: "Local Hosts" },
        { value: "4.9", label: "Average Rating" },
    ];

    menuItems = ["Explore", "How it Works", "About", "Gift Cards"];
    footerExplore = ["All Gear", "Tents", "Sleeping Bags", "Camp Kitchen", "Lighting"];
    footerCompany = ["About Us", "How It Works", "Become a Host", "Blog", "Careers"];
    footerSupport = ["Help Center", "Safety", "Contact Us", "Privacy Policy", "Terms"];

    constructor(
        private gearService: GearApiService,
        private route: ActivatedRoute,
        private router: Router,
        private paymentApi: PaymentApiService,
        private toastService: ToastService
    ) { }

    ngOnInit(): void {
        this.loadDynamicProducts();

        // Handle payment status from query params (e.g. from cart checkout)
        this.route.queryParamMap.subscribe(qParams => {
            const sessionId = qParams.get('session_id');
            const checkoutStatus = qParams.get('checkout');
            
            if (sessionId) {
                this.router.navigate(['/payment/receipt'], {
                    queryParams: { session_id: sessionId, source: 'marketplace' }
                });
            } else if (checkoutStatus === 'success') {
                this.toastService.success('Order placed successfully!');
                this.router.navigate([], {
                    relativeTo: this.route,
                    queryParams: { checkout: null },
                    queryParamsHandling: 'merge'
                });
            }
        });
    }

    loadDynamicProducts() {
        this.gearService.getGear({ status: 'AVAILABLE', size: 10 }).subscribe({
            next: (page) => {
                const mapped = page.content.map((g: any) => ({
                    id: g.id,
                    name: g.name,
                    category: g.category || 'Gear',
                    price: g.price || g.pricePerDay || 0,
                    rating: g.rating || 4.5,
                    reviewCount: g.reviewCount || Math.floor(Math.random() * 50),
                    image: this.resolveImageUrl(g)
                }));
                // Split dynamic products into featured and most rented
                this.featuredProducts = mapped.slice(0, 4);
                this.mostRented = mapped.slice(4, 10);
            },
        });
    }

    resolveImageUrl(g: any): string {
        let url = '';
        if (g.images && g.images.length > 0) {
            url = g.images[0].imageUrl;
        } else if (g.imageUrls && g.imageUrls.length > 0) {
            url = g.imageUrls[0];
        }
        
        if (!url) return 'https://images.unsplash.com/photo-1525811902-f2342640856e?w=800&q=80';
        if (url.startsWith('http') || url.startsWith('assets') || url.startsWith('data:')) return url;
        
        const baseUrl = 'http://localhost:8090';
        return url.startsWith('/') ? baseUrl + url : baseUrl + '/' + url;
    }

    @HostListener('window:scroll', [])
    onWindowScroll() {
        this.isScrolled = window.scrollY > 50;
    }

    scrollMostRented(direction: 'left' | 'right') {
        if (this.mostRentedContainer) {
            const scrollAmount = 400;
            const container = this.mostRentedContainer.nativeElement;
            if (direction === 'right') {
                container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            } else {
                container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            }
        }
    }
}
