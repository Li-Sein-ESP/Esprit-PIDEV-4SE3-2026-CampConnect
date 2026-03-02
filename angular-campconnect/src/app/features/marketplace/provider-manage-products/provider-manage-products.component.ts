import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

interface Product {
  id: string | number;
  name: string;
  category: string;
  stock: number;
  pricePerDay: number;
  status: string;
  rating: number;
  rentalsCount: number;
  revenue: number;
  image: string;
  reviewsCount?: number;
}

@Component({
  selector: 'app-provider-manage-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './provider-manage-products.component.html',
  styleUrls: ['./provider-manage-products.component.scss']
})
export class ProviderManageProductsComponent implements OnInit {

  allProducts: Product[] = [
    {
      id: 1,
      name: 'MSR Hubba Hubba NX 2P Tent',
      category: 'Tents & Shelters',
      image: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="88" height="88" viewBox="0 0 88 88"><rect width="88" height="88" fill="#fef3c7"/><path d="M20 60L44 28l24 32z" fill="#f59e0b" opacity="0.4"/><path d="M30 60L44 38l14 22z" fill="#d97706" opacity="0.5"/><circle cx="66" cy="24" r="6" fill="#fbbf24"/></svg>'),
      stock: 4,
      pricePerDay: 45.00,
      status: 'active',
      rating: 4.9,
      reviewsCount: 38,
      rentalsCount: 62,
      revenue: 4960
    },
    {
      id: 2,
      name: 'Osprey Atmos AG 65L Backpack',
      category: 'Backpacks & Bags',
      image: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="88" height="88" viewBox="0 0 88 88"><rect width="88" height="88" fill="#dbeafe"/><rect x="30" y="18" width="28" height="52" rx="8" fill="#3b82f6" opacity="0.3"/><rect x="34" y="24" width="20" height="12" rx="3" fill="#60a5fa" opacity="0.5"/><path d="M36 70h16" stroke="#3b82f6" stroke-width="3" stroke-linecap="round"/></svg>'),
      stock: 6,
      pricePerDay: 35.00,
      status: 'active',
      rating: 4.8,
      reviewsCount: 31,
      rentalsCount: 47,
      revenue: 2340
    },
    {
      id: 3,
      name: 'Therm-a-Rest NeoAir XTherm Pad',
      category: 'Sleeping Bags & Pads',
      image: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="88" height="88" viewBox="0 0 88 88"><rect width="88" height="88" fill="#fce7f3"/><rect x="18" y="34" width="52" height="20" rx="10" fill="#ec4899" opacity="0.3"/><rect x="22" y="38" width="44" height="12" rx="6" fill="#f472b6" opacity="0.4"/></svg>'),
      stock: 0,
      pricePerDay: 22.00,
      status: 'oos',
      rating: 4.6,
      reviewsCount: 22,
      rentalsCount: 28,
      revenue: 1120
    },
    {
      id: 4,
      name: 'Black Diamond Storm 500-R',
      category: 'Lighting & Power',
      image: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="88" height="88" viewBox="0 0 88 88"><rect width="88" height="88" fill="#fef9c3"/><circle cx="44" cy="40" r="16" fill="#eab308" opacity="0.25"/><circle cx="44" cy="40" r="8" fill="#facc15" opacity="0.5"/><rect x="40" y="56" width="8" height="14" rx="3" fill="#ca8a04" opacity="0.3"/></svg>'),
      stock: 12,
      pricePerDay: 8.00,
      status: 'active',
      rating: 4.7,
      reviewsCount: 26,
      rentalsCount: 35,
      revenue: 525
    },
    {
      id: 5,
      name: 'Jetboil Flash Cooking System',
      category: 'Cooking & Kitchen',
      image: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="88" height="88" viewBox="0 0 88 88"><rect width="88" height="88" fill="#fee2e2"/><rect x="32" y="22" width="24" height="44" rx="6" fill="#ef4444" opacity="0.25"/><rect x="36" y="18" width="16" height="6" rx="3" fill="#dc2626" opacity="0.3"/><path d="M40 48c0-4 4-6 4-10s4 6 4 10" stroke="#f87171" stroke-width="2" fill="none"/></svg>'),
      stock: 3,
      pricePerDay: 15.00,
      status: 'draft',
      rating: 4.5,
      reviewsCount: 14,
      rentalsCount: 12,
      revenue: 360
    },
    {
      id: 6,
      name: 'Gregory Baltoro 75L Pack',
      category: 'Backpacks & Bags',
      image: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="88" height="88" viewBox="0 0 88 88"><rect width="88" height="88" fill="#d1fae5"/><rect x="28" y="16" width="32" height="56" rx="10" fill="#10b981" opacity="0.25"/><rect x="32" y="22" width="24" height="14" rx="4" fill="#34d399" opacity="0.4"/><circle cx="44" cy="50" r="4" fill="#059669" opacity="0.3"/></svg>'),
      stock: 2,
      pricePerDay: 40.00,
      status: 'active',
      rating: 4.4,
      reviewsCount: 16,
      rentalsCount: 19,
      revenue: 950
    },
    {
      id: 7,
      name: 'BioLite CampStove 2+',
      category: 'Cooking & Kitchen',
      image: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="88" height="88" viewBox="0 0 88 88"><rect width="88" height="88" fill="#f3e8ff"/><rect x="30" y="30" width="28" height="32" rx="8" fill="#a855f7" opacity="0.2"/><circle cx="44" cy="46" r="6" fill="#c084fc" opacity="0.4"/><path d="M38 30c2-6 4-8 6-8s4 2 6 8" stroke="#9333ea" stroke-width="1.5" fill="none" opacity="0.4"/></svg>'),
      stock: 5,
      pricePerDay: 12.00,
      status: 'draft',
      rating: 4.3,
      reviewsCount: 9,
      rentalsCount: 8,
      revenue: 240
    },
    {
      id: 8,
      name: 'Kelty Linger Side Table',
      category: 'Camp Furniture',
      image: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="88" height="88" viewBox="0 0 88 88"><rect width="88" height="88" fill="#e0f2fe"/><rect x="22" y="38" width="44" height="6" rx="2" fill="#0284c7" opacity="0.25"/><line x1="28" y1="44" x2="28" y2="62" stroke="#0ea5e9" stroke-width="3" opacity="0.3"/><line x1="60" y1="44" x2="60" y2="62" stroke="#0ea5e9" stroke-width="3" opacity="0.3"/></svg>'),
      stock: 8,
      pricePerDay: 10.00,
      status: 'active',
      rating: 4.1,
      reviewsCount: 11,
      rentalsCount: 15,
      revenue: 225
    }
  ];

  filteredProducts: Product[] = [];
  selectedIds: Set<string | number> = new Set();
  currentFilter = 'all';
  searchQuery = '';
  currentSort = 'name';

  openMenuId: string | number | null = null;

  toast = { show: false, msg: '', type: 'success' };
  deleteModal = { open: false, product: null as Product | null };

  // Stats
  get totalProducts() { return this.allProducts.length; }
  get activeProducts() { return this.allProducts.filter(p => p.status === 'active').length; }
  get totalRentals() { return this.allProducts.reduce((sum, p) => sum + p.rentalsCount, 0); }
  get totalRevenue() { return this.allProducts.reduce((sum, p) => sum + p.revenue, 0); }

  // Badges counts
  get filterCounts() {
    return {
      all: this.allProducts.length,
      active: this.allProducts.filter(p => p.status === 'active').length,
      draft: this.allProducts.filter(p => p.status === 'draft').length,
      oos: this.allProducts.filter(p => p.status === 'oos').length,
    };
  }

  constructor(private router: Router) { }

  ngOnInit() {
    this.applyFilters();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    // Close action menu if clicked outside
    // Easiest is to just clear selection
    this.openMenuId = null;
  }

  // === FILTER & SEARCH & SORT ===
  setFilter(status: string) {
    this.currentFilter = status;
    this.applyFilters();
  }

  onSearch() {
    this.applyFilters();
  }

  onSortChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.currentSort = select.value;
    this.applyFilters();
  }

  applyFilters() {
    let base = this.allProducts;
    if (this.currentFilter !== 'all') {
      base = base.filter(p => p.status === this.currentFilter);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      base = base.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }

    switch (this.currentSort) {
      case 'name':
        base.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-asc':
        base.sort((a, b) => a.pricePerDay - b.pricePerDay);
        break;
      case 'price-desc':
        base.sort((a, b) => b.pricePerDay - a.pricePerDay);
        break;
      case 'rating':
        base.sort((a, b) => b.rating - a.rating);
        break;
      case 'rentals':
        base.sort((a, b) => b.rentalsCount - a.rentalsCount);
        break;
      case 'revenue':
        base.sort((a, b) => b.revenue - a.revenue);
        break;
    }

    this.filteredProducts = [...base];
  }

  // === RATING HELPERS ===
  getStarsArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }
  hasHalfStar(rating: number): boolean {
    return rating % 1 >= 0.5;
  }

  // === SELECTION & BULK ACTIONS ===
  toggleSelect(product: Product, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedIds.add(product.id);
    } else {
      this.selectedIds.delete(product.id);
    }
  }

  get allSelected(): boolean {
    return this.filteredProducts.length > 0 && this.filteredProducts.every(p => this.selectedIds.has(p.id));
  }

  toggleSelectAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.filteredProducts.forEach(p => this.selectedIds.add(p.id));
    } else {
      this.selectedIds.clear();
    }
  }

  clearSelection() {
    this.selectedIds.clear();
  }

  bulkAction(action: 'activate' | 'draft' | 'delete') {
    const count = this.selectedIds.size;
    if (action === 'delete') {
      this.allProducts = this.allProducts.filter(p => !this.selectedIds.has(p.id));
      this.showToast(`${count} product(s) deleted`, 'trash');
    } else {
      this.allProducts.forEach(p => {
        if (this.selectedIds.has(p.id)) {
          p.status = action === 'activate' ? 'active' : 'draft';
        }
      });
      this.showToast(`${count} product(s) set to ${action === 'activate' ? 'Active' : 'Draft'}`, action === 'activate' ? 'success' : 'draft');
    }
    this.clearSelection();
    this.applyFilters();
  }

  // === ACTION MENU ===
  toggleActionsMenu(product: Product, event: Event) {
    event.stopPropagation();
    if (this.openMenuId === product.id) {
      this.openMenuId = null;
    } else {
      this.openMenuId = product.id;
    }
  }

  actionEdit(product: Product) {
    this.router.navigate(['/provider/products', product.id, 'edit']);
  }

  actionAnalytics(product: Product) {
    this.router.navigate(['/provider/products', product.id, 'analytics']);
  }

  actionDuplicate(product: Product, event: Event) {
    event.stopPropagation();
    this.openMenuId = null;
    const dup: Product = {
      ...product,
      id: Date.now(),
      name: product.name + ' (Copy)',
      rentalsCount: 0,
      revenue: 0,
      reviewsCount: 0,
      rating: 0
    };
    this.allProducts.unshift(dup);
    this.applyFilters();
    this.showToast(`"${product.name}" duplicated`, 'success');
  }

  openDeleteModal(product: Product, event: Event) {
    event.stopPropagation();
    this.openMenuId = null;
    this.deleteModal = { open: true, product };
  }

  closeDeleteModal() {
    this.deleteModal = { open: false, product: null };
  }

  confirmDelete() {
    if (this.deleteModal.product) {
      const product = this.deleteModal.product;
      this.allProducts = this.allProducts.filter(p => p.id !== product.id);
      this.showToast(`"${product.name}" deleted`, 'trash');
      this.selectedIds.delete(product.id);
      this.closeDeleteModal();
      this.applyFilters();
    }
  }

  // === TOAST ===
  showToast(msg: string, type: 'success' | 'draft' | 'trash' | 'info') {
    this.toast = { show: true, msg, type };
    setTimeout(() => {
      if (this.toast.msg === msg) {
        this.toast.show = false;
      }
    }, 3000);
  }
}
