import { Component, HostListener, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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

    featuredProducts: Product[] = [
        { id: "1", name: "REI Co-op Base Camp 6", category: "Tents", price: 45, rating: 4.9, reviewCount: 287, image: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&q=80" },
        { id: "2", name: "Therm-a-Rest NeoAir XLite", category: "Sleeping Pads", price: 18, rating: 4.8, reviewCount: 412, image: "https://images.unsplash.com/photo-1445308394109-4ec2920981b1?w=800&q=80" },
        { id: "3", name: "Jetboil Flash Cooking System", category: "Camp Kitchen", price: 12, rating: 4.7, reviewCount: 523, image: "https://images.unsplash.com/photo-1571687949921-1306bfb24b72?w=800&q=80" },
        { id: "4", name: "Big Agnes Copper Spur HV UL2", category: "Tents", price: 52, rating: 4.9, reviewCount: 198, image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80" },
    ];

    mostRented: Product[] = [
        { id: "5", name: "MSR Hubba Hubba NX 2", category: "Tents", price: 38, rating: 4.9, reviewCount: 634, image: "https://images.unsplash.com/photo-1537905569824-f89f14cceb68?w=800&q=80" },
        { id: "6", name: "Black Diamond Spot Headlamp", category: "Lighting", price: 8, rating: 4.8, reviewCount: 891, image: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800&q=80" },
        { id: "7", name: "YETI Tundra 45 Hard Cooler", category: "Coolers", price: 25, rating: 4.9, reviewCount: 445, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80" },
        { id: "8", name: "ENO DoubleNest Hammock", category: "Hammocks", price: 14, rating: 4.7, reviewCount: 712, image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80" },
        { id: "9", name: "Coleman 2-Burner Stove", category: "Camp Kitchen", price: 22, rating: 4.6, reviewCount: 567, image: "https://images.unsplash.com/photo-1571687949921-1306bfb24b72?w=800&q=80" },
        { id: "10", name: "Osprey Atmos AG 65 Pack", category: "Backpacks", price: 28, rating: 4.8, reviewCount: 389, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80" },
    ];

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

    constructor() { }

    ngOnInit(): void {
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
