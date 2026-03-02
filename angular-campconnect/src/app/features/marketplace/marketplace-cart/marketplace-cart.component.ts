import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ChevronLeft, Calendar, Trash2, Edit2, ShieldCheck, Star, ArrowRight, ShoppingBag } from 'lucide-angular';

interface CartItem {
    id: number;
    name: string;
    image: string;
    condition: string;
    conditionColor: string;
    startDate: string;
    endDate: string;
    pricePerDay: number;
    deposit: number;
    category: string;
}

@Component({
    selector: 'app-marketplace-cart',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
    templateUrl: './marketplace-cart.component.html',
    styleUrls: ['./marketplace-cart.component.scss']
})
export class MarketplaceCartComponent {
    icons = {
        ChevronLeft, Calendar, Trash2, Edit2, ShieldCheck, Star, ArrowRight, ShoppingBag
    };

    cartItems: CartItem[] = [
        {
            id: 1,
            name: "REI Co-op Base Camp 6 Tent",
            image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=300&fit=crop",
            condition: "Like New",
            conditionColor: "bg-green-100 text-green-700",
            startDate: "2024-06-15",
            endDate: "2024-06-20",
            pricePerDay: 45,
            deposit: 200,
            category: "Shelter"
        },
        {
            id: 2,
            name: "Thermarest sleeping bag (-20°F)",
            image: "https://images.unsplash.com/photo-1445308394109-4ec2920981b1?w=400&h=300&fit=crop",
            condition: "Excellent",
            conditionColor: "bg-blue-100 text-blue-700",
            startDate: "2024-06-15",
            endDate: "2024-06-20",
            pricePerDay: 18,
            deposit: 80,
            category: "Sleeping"
        },
        {
            id: 3,
            name: "Jetboil Flash Cooking System",
            image: "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=400&h=300&fit=crop",
            condition: "Good",
            conditionColor: "bg-amber-100 text-amber-700",
            startDate: "2024-06-15",
            endDate: "2024-06-20",
            pricePerDay: 12,
            deposit: 50,
            category: "Kitchen"
        },
        {
            id: 4,
            name: "Black Diamond Headlamp 750",
            image: "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=400&h=300&fit=crop",
            condition: "Like New",
            conditionColor: "bg-green-100 text-green-700",
            startDate: "2024-06-15",
            endDate: "2024-06-20",
            pricePerDay: 8,
            deposit: 40,
            category: "Lighting"
        }
    ];

    constructor(private router: Router) { }

    get subtotal(): number {
        return this.cartItems.reduce((sum, item) => sum + this.calculateItemTotal(item), 0);
    }

    get totalDeposit(): number {
        return this.cartItems.reduce((sum, item) => sum + item.deposit, 0);
    }

    get deliveryCost(): number {
        return this.subtotal > 100 ? 0 : 25;
    }

    get taxes(): number {
        return Math.round((this.subtotal + this.deliveryCost) * 0.08);
    }

    get grandTotal(): number {
        return this.subtotal + this.deliveryCost + this.taxes;
    }

    calculateDuration(startDate: string, endDate: string): number {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays || 1;
    }

    calculateItemTotal(item: CartItem): number {
        const days = this.calculateDuration(item.startDate, item.endDate);
        return item.pricePerDay * days;
    }

    removeItem(itemId: number) {
        if (confirm('Remove this item from your cart?')) {
            this.cartItems = this.cartItems.filter(i => i.id !== itemId);
        }
    }

    updateDate(item: CartItem) {
        // In a real app, validation logic would go here
        // Force angular change detection updates if needed, but [(ngModel)] handles it
    }

    proceedToCheckout() {
        this.router.navigate(['/checkout']);
    }
}
