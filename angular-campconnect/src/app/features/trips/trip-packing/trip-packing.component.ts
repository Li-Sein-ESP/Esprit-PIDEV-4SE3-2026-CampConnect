import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, ChevronLeft, Search, Plus, MoreHorizontal, Check, Edit2, Trash2, CloudRain, Sun, Moon, Wind } from 'lucide-angular';
import { TripService } from '../services/trip.service';

interface FilterChip {
  id: string;
  label: string;
}

interface PackingItem {
  id: number;
  name: string;
  note?: string;
  quantity: number;
  essential: boolean;
  packed: boolean;
}

interface PackingCategory {
  id: string;
  icon: string;
  name: string;
  items: PackingItem[];
}

@Component({
  selector: 'app-trip-packing',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './trip-packing.component.html'
})
export class TripPackingComponent implements OnInit {
  tripId: string | null = null;
  activeFilter = signal<string>('all');

  // Icons
  readonly ChevronLeft = ChevronLeft;
  readonly Search = Search;
  readonly Plus = Plus;
  readonly MoreHorizontal = MoreHorizontal;
  readonly Check = Check;
  readonly Edit2 = Edit2;
  readonly Trash2 = Trash2;
  readonly CloudRain = CloudRain;
  readonly Sun = Sun;
  readonly Moon = Moon;
  readonly Wind = Wind;

  filters: FilterChip[] = [
    { id: "all", label: "All Items" },
    { id: "to-pack", label: "To Pack" },
    { id: "packed", label: "Packed" },
    { id: "essential", label: "Essential" },
  ];

  categories = signal<PackingCategory[]>([
    {
      id: "shelter",
      icon: "⛺",
      name: "Shelter & Sleep",
      items: [
        { id: 1, name: "Tent (4-person)", quantity: 1, essential: true, packed: true },
        { id: 2, name: "Sleeping bag", quantity: 4, essential: true, packed: true },
        { id: 3, name: "Sleeping pad", quantity: 4, essential: true, packed: false },
        { id: 4, name: "Pillows", quantity: 4, essential: false, packed: true },
        { id: 5, name: "Ground tarp", quantity: 1, essential: true, packed: false },
        { id: 6, name: "Tent stakes & guy lines", quantity: 1, essential: true, packed: true },
      ],
    },
    {
      id: "cooking",
      icon: "🍽️",
      name: "Cooking & Food",
      items: [
        { id: 7, name: "Camp stove", quantity: 1, essential: true, packed: true },
        { id: 8, name: "Fuel canisters", quantity: 3, essential: true, packed: true },
        { id: 9, name: "Cookware set", quantity: 1, essential: true, packed: false },
        { id: 10, name: "Utensils", quantity: 4, essential: true, packed: false },
        { id: 11, name: "Plates & bowls", quantity: 4, essential: true, packed: false },
        { id: 12, name: "Cooler", quantity: 1, essential: true, packed: false },
        { id: 13, name: "Water containers", quantity: 2, essential: true, packed: true },
        { id: 14, name: "Coffee maker", quantity: 1, essential: false, packed: false },
        { id: 15, name: "Cutting board & knife", quantity: 1, essential: true, packed: true },
        { id: 16, name: "Dish soap & sponge", quantity: 1, essential: true, packed: false },
      ],
    },
    {
      id: "clothing",
      icon: "🧥",
      name: "Clothing & Footwear",
      items: [
        { id: 17, name: "Hiking boots", quantity: 4, essential: true, packed: false },
        { id: 18, name: "Rain jackets", quantity: 4, essential: true, packed: false },
        { id: 19, name: "Warm layers", quantity: 4, essential: true, packed: false },
        { id: 20, name: "Hats & sunglasses", quantity: 4, essential: true, packed: false },
        { id: 21, name: "Extra socks", quantity: 8, essential: true, packed: true },
        { id: 22, name: "Camp shoes", quantity: 4, essential: false, packed: false },
      ],
    },
    {
      id: "safety",
      icon: "❤️",
      name: "Safety & Navigation",
      items: [
        { id: 23, name: "First aid kit", quantity: 1, essential: true, packed: true },
        { id: 24, name: "Emergency whistle", quantity: 4, essential: true, packed: true },
        { id: 25, name: "Headlamps", quantity: 4, essential: true, packed: true },
        { id: 26, name: "Extra batteries", quantity: 8, essential: true, packed: false },
        { id: 27, name: "Maps", quantity: 2, essential: true, packed: false },
        { id: 28, name: "Compass", quantity: 1, essential: true, packed: false },
        { id: 29, name: "Bear spray", quantity: 1, essential: true, packed: false },
        { id: 30, name: "Sunscreen", quantity: 2, essential: true, packed: false },
        { id: 31, name: "Bug spray", quantity: 2, essential: true, packed: false },
      ],
    },
    {
      id: "gear",
      icon: "🎒",
      name: "Gear & Equipment",
      items: [
        { id: 32, name: "Backpacks", quantity: 4, essential: true, packed: true },
        { id: 33, name: "Trekking poles", quantity: 4, essential: false, packed: false },
        { id: 34, name: "Camera equipment", quantity: 1, essential: false, packed: true },
        { id: 35, name: "Binoculars", quantity: 2, essential: false, packed: true },
        { id: 36, name: "Portable chargers", quantity: 2, essential: true, packed: false },
        { id: 37, name: "Multi-tool", quantity: 2, essential: true, packed: true },
        { id: 38, name: "Rope/Paracord", quantity: 1, essential: true, packed: false },
      ],
    },
    {
      id: "misc",
      icon: "📦",
      name: "Miscellaneous",
      items: [
        { id: 39, name: "Trash bags", quantity: 5, essential: true, packed: true },
        { id: 40, name: "Toilet paper", quantity: 2, essential: true, packed: false },
        { id: 41, name: "Hand sanitizer", quantity: 2, essential: true, packed: false },
        { id: 42, name: "Camp chairs", quantity: 4, essential: false, packed: false },
        { id: 43, name: "Games/Cards", quantity: 1, essential: false, packed: false },
        { id: 44, name: "Books", quantity: 4, essential: false, packed: false },
      ],
    }
  ]);

  filteredCategories = computed(() => {
    const filter = this.activeFilter();
    const cats = this.categories();

    return cats.map(cat => ({
      ...cat,
      items: cat.items.filter(item => {
        if (filter === 'all') return true;
        if (filter === 'to-pack') return !item.packed;
        if (filter === 'packed') return item.packed;
        if (filter === 'essential') return item.essential;
        return true;
      })
    })).filter(cat => cat.items.length > 0);
  });

  totalItems = computed(() => {
    return this.categories().reduce((sum, cat) => sum + cat.items.length, 0);
  });

  totalPacked = computed(() => {
    return this.categories().reduce((sum, cat) =>
      sum + cat.items.filter(i => i.packed).length, 0
    );
  });

  overallProgress = computed(() => {
    if (this.totalItems() === 0) return 0;
    return Math.round((this.totalPacked() / this.totalItems()) * 100);
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tripService: TripService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.tripId = params.get('tripId');
    });
  }

  setFilter(id: string) {
    this.activeFilter.set(id);
  }

  toggleItem(categoryId: string, itemId: number) {
    this.categories.update(cats => cats.map(cat => {
      if (cat.id !== categoryId) return cat;
      return {
        ...cat,
        items: cat.items.map(item =>
          item.id === itemId ? { ...item, packed: !item.packed } : item
        )
      };
    }));
  }

  getCategoryProgress(category: PackingCategory): number {
    if (category.items.length === 0) return 0;
    const packed = this.getPackedCount(category);
    return Math.round((packed / category.items.length) * 100);
  }

  getPackedCount(category: PackingCategory): number {
    return category.items.filter(i => i.packed).length;
  }

  navigateBack() {
    const tripId = this.tripId || this.route.snapshot.paramMap.get('tripId') || '1';
    this.router.navigate(['/trips', tripId]);
  }
}
