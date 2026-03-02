import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { GearApiService } from '../../gear/services/gear-api.service';
import { GearResponse } from '../../gear/models/gear.model';
import {
    LucideAngularModule,
    Mountain,
    Tent,
    Flame,
    Backpack,
    Thermometer,
    MapPin,
    Star,
    SlidersHorizontal,
    Heart,
    Search,
    ChevronDown,
    Wind,
    Camera,
    Compass,
    Check
} from 'lucide-angular';

// We'll map GearResponse to Product loosely for the UI
export interface Product {
    id: string;
    name: string;
    brand: string;
    category: string;
    pricePerDay: number;
    originalPrice: number;
    rating: number;
    reviewCount: number;
    condition: string;
    image: string;
    location: string;
    weight?: string;
    capacity?: string;
    isLiked?: boolean;
}

interface FilterState {
    categories: string[];
    priceRange: [number, number];
    conditions: string[];
    minRating: number;
}

@Component({
    selector: 'app-marketplace-category',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
    templateUrl: './marketplace-category.component.html',
    styleUrls: ['./marketplace-category.component.scss']
})
export class MarketplaceCategoryComponent implements OnInit {
    // Icons
    readonly Mountain = Mountain;
    readonly Tent = Tent;
    readonly Flame = Flame;
    readonly Backpack = Backpack;
    readonly Thermometer = Thermometer;
    readonly MapPin = MapPin;
    readonly Star = Star;
    readonly SlidersHorizontal = SlidersHorizontal;
    readonly Heart = Heart;
    readonly Search = Search;
    readonly ChevronDown = ChevronDown;
    readonly Wind = Wind;
    readonly Camera = Camera;
    readonly Compass = Compass;
    readonly Check = Check;

    // Data
    categories = [
        { id: 'tents', name: 'Tents', icon: Tent },
        { id: 'backpacks', name: 'Backpacks', icon: Backpack },
        { id: 'sleeping-bags', name: 'Sleeping Bags', icon: Thermometer },
        { id: 'apparel', name: 'Apparel', icon: Wind },
        { id: 'cooking', name: 'Cooking', icon: Flame },
        { id: 'electronics', name: 'Electronics', icon: Camera },
        { id: 'lighting', name: 'Lighting', icon: Compass },
    ];

    // Match backend exact literal enum states or display values so the equality checks pass
    conditions = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'];

    sortOptions = [
        { value: 'recommended', label: 'Recommended' },
        { value: 'price-low', label: 'Price: Low to High' },
        { value: 'price-high', label: 'Price: High to Low' },
        { value: 'rating', label: 'Highest Rated' },
        { value: 'newest', label: 'Newest First' },
    ];

    filters: FilterState = {
        categories: [],
        priceRange: [0, 500],
        conditions: [],
        minRating: 0,
    };

    selectedCategory = 'all';
    sortBy = 'recommended';
    showMobileFilters = false;

    products: Product[] = []; // Will be loaded dynamically
    isLoading = false;

    constructor(
        private route: ActivatedRoute,
        private gearService: GearApiService
    ) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.selectedCategory = id;
            }
            this.loadProducts();
        });

        this.route.queryParamMap.subscribe(params => {
            // Handle query params if needed
        });
    }

    loadProducts(): void {
        this.isLoading = true;
        // If category is "all", we don't pass a category filter to get everything.
        // If it's a specific slug, we find the real name to query, or query directly if the backend accepts slugs.
        // For simplicity, we just fetch all ACTIVE gear and filter locally to match the UI's instantaneous filtering.
        this.gearService.getGear({ status: 'AVAILABLE' }).subscribe({
            next: (page) => {
                this.products = page.content.map((g: any) => ({
                    id: g.id,
                    name: g.name,
                    brand: g.brand || 'ConnectCamp', // Backend might not have brand yet
                    category: g.category,
                    pricePerDay: g.price || g.pricePerDay || 0,
                    originalPrice: (g.price || g.pricePerDay || 0) * 1.2, // mock value
                    rating: g.rating || 4.5,
                    reviewCount: g.reviewCount || Math.floor(Math.random() * 50),
                    condition: g.condition,
                    image: (g.images && g.images.length > 0) ? g.images[0].imageUrl :
                        (g.imageUrls?.length > 0 ? g.imageUrls[0] : 'https://images.unsplash.com/photo-1525811902-f2342640856e?w=800&q=80'),
                    location: g.location || 'Unknown Location',
                    isLiked: false
                }));
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Failed to load gear', err);
                this.isLoading = false;
            }
        });
    }

    get filteredProducts(): Product[] {
        let result = [...this.products];

        // Category filter
        if (this.selectedCategory !== 'all') {
            result = result.filter(p => {
                const normalized = p.category.toLowerCase();
                const selected = this.selectedCategory.toLowerCase();
                return normalized.includes(selected) ||
                    normalized.replace(/ & /g, '-').replace(/ /g, '-') === selected;
            });
        }

        // Price filter
        result = result.filter(p => p.pricePerDay >= this.filters.priceRange[0] && p.pricePerDay <= this.filters.priceRange[1]);

        // Condition filter
        if (this.filters.conditions.length > 0) {
            result = result.filter(p => this.filters.conditions.includes(p.condition));
        }

        // Rating filter
        if (this.filters.minRating > 0) {
            result = result.filter(p => p.rating >= this.filters.minRating);
        }

        // Sorting
        switch (this.sortBy) {
            case 'price-low':
                result.sort((a, b) => a.pricePerDay - b.pricePerDay);
                break;
            case 'price-high':
                result.sort((a, b) => b.pricePerDay - a.pricePerDay);
                break;
            case 'rating':
                result.sort((a, b) => b.rating - a.rating);
                break;
        }

        return result;
    }

    get activeFiltersCount(): number {
        return this.filters.conditions.length + (this.filters.minRating > 0 ? 1 : 0);
    }

    // Actions
    toggleCondition(condition: string) {
        if (this.filters.conditions.includes(condition)) {
            this.filters.conditions = this.filters.conditions.filter((c: string) => c !== condition);
        } else {
            this.filters.conditions = [...this.filters.conditions, condition];
        }
    }

    toggleLike(event: Event, product: Product) {
        event.stopPropagation();
        product.isLiked = !product.isLiked;
    }

    setCategory(categoryId: string) {
        this.selectedCategory = categoryId;
    }

    setPriceRange(value: any) {
        this.filters.priceRange = [0, Number(value)];
    }

    setMinRating(rating: number) {
        this.filters.minRating = this.filters.minRating === rating ? 0 : rating;
    }

    clearFilters() {
        this.filters = {
            categories: [],
            priceRange: [0, 500],
            conditions: [],
            minRating: 0,
        };
    }

    getProductCountByCondition(condition: string): number {
        return this.products.filter(p => p.condition === condition).length;
    }

    getCategoryName(id: string): string {
        const cat = this.categories.find(c => c.id === id);
        return cat ? cat.name : 'All Camping Gear';
    }

    getSortLabel(value: string): string {
        return this.sortOptions.find(o => o.value === value)?.label || 'Recommended';
    }

    // Helpers for loop
    range(n: number): number[] {
        return Array.from({ length: n }, (_, i) => i);
    }

    Math = Math; // To use Math in template
}
