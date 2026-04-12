import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { GearApiService } from '../../gear/services/gear-api.service';
import { GearResponse } from '../../gear/models/gear.model';

interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  pricePerDay: number;
  status: 'active' | 'oos' | 'draft';
  image: string;
  rating: number;
  reviewsCount: number;
  rentalsCount: number;
  revenue: number;
}

function toProduct(g: GearResponse): Product {
  let status: 'active' | 'oos' | 'draft';
  if (g.status === 'AVAILABLE' || g.status === 'RENTED') {
    status = 'active';
  } else if (g.status === 'MAINTENANCE') {
    status = 'oos';
  } else {
    status = 'draft'; // RETIRED
  }
  return {
    id: g.id,
    name: g.name,
    category: g.category,
    stock: g.quantity,
    pricePerDay: g.price,
    status,
    image: g.images?.[0]?.imageUrl || '',
    rating: 0,
    reviewsCount: 0,
    rentalsCount: 0,
    revenue: 0
  };
}

@Component({
  selector: 'app-provider-manage-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './provider-manage-products.component.html',
  styleUrls: ['./provider-manage-products.component.scss']
})
export class ProviderManageProductsComponent implements OnInit {

  allProducts: Product[] = [];
  loading = true;
  error: string | null = null;

  filteredProducts: Product[] = [];
  selectedIds: Set<string> = new Set();
  currentFilter = 'all';
  searchQuery = '';
  currentSort = 'name';

  openMenuId: string | null = null;

  toast = { show: false, msg: '', type: 'success' };
  deleteModal = { open: false, product: null as Product | null };

  // Stats
  get totalProducts() { return this.allProducts.length; }
  get activeProducts() { return this.allProducts.filter(p => p.status === 'active').length; }
  get totalRentals() { return 0; }
  get totalRevenue() { return 0; }

  get filterCounts() {
    return {
      all: this.allProducts.length,
      active: this.allProducts.filter(p => p.status === 'active').length,
      draft: this.allProducts.filter(p => p.status === 'draft').length,
      oos: this.allProducts.filter(p => p.status === 'oos').length,
    };
  }

  constructor(private router: Router, private gearApi: GearApiService) { }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;
    this.gearApi.getMyGear({ page: 0, size: 100 }).subscribe({
      next: (page) => {
        this.allProducts = page.content.map(toProduct);
        this.loading = false;
        this.applyFilters();
      },
      error: (err) => {
        this.error = err?.status === 403
          ? 'Access denied. Equipment Provider role required.'
          : 'Failed to load products. Please try again.';
        this.loading = false;
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
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
    let base = [...this.allProducts];
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
    }

    this.filteredProducts = base;
  }

  // === RATING HELPERS (kept for template compatibility) ===
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
    if (action === 'delete') {
      const ids = Array.from(this.selectedIds);
      let done = 0;
      let failed = 0;
      ids.forEach(id => {
        this.gearApi.deleteGear(id).subscribe({
          next: () => {
            done++;
            if (done + failed === ids.length) {
              this.showToast(`${done} product(s) deleted`, 'trash');
              this.clearSelection();
              this.loadProducts();
            }
          },
          error: () => {
            failed++;
            if (done + failed === ids.length) {
              this.showToast(`${done} deleted, ${failed} failed`, 'info');
              this.clearSelection();
              this.loadProducts();
            }
          }
        });
      });
    } else {
      this.showToast('Bulk status update not yet supported via API', 'info');
    }
  }

  // === ACTION MENU ===
  toggleActionsMenu(product: Product, event: Event) {
    event.stopPropagation();
    this.openMenuId = this.openMenuId === product.id ? null : product.id;
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
    this.showToast('Duplicate is not yet supported', 'info');
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
    if (!this.deleteModal.product) return;
    const product = this.deleteModal.product;
    this.gearApi.deleteGear(product.id).subscribe({
      next: () => {
        this.showToast(`"${product.name}" deleted`, 'trash');
        this.selectedIds.delete(product.id);
        this.closeDeleteModal();
        this.loadProducts();
      },
      error: (err) => {
        this.showToast(err?.error?.message || 'Failed to delete product', 'info');
        this.closeDeleteModal();
      }
    });
  }

  // === TOAST ===
  showToast(msg: string, type: 'success' | 'draft' | 'trash' | 'info') {
    this.toast = { show: true, msg, type };
    setTimeout(() => {
      if (this.toast.msg === msg) { this.toast.show = false; }
    }, 3000);
  }
}