import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  CamperOrderApiService,
  CamperOrderSummary,
  PagedOrderResponse
} from '../services/camper-order-api.service';

type FilterType = 'all' | 'active' | 'delivered' | 'cancelled';

@Component({
  selector: 'app-camper-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './camper-orders.component.html',
  styleUrls: ['./camper-orders.component.scss']
})
export class CamperOrdersComponent implements OnInit {

  currentFilter: FilterType = 'all';
  loading = true;
  error: string | null = null;

  orders: CamperOrderSummary[] = [];
  filteredOrders: CamperOrderSummary[] = [];

  constructor(
    private camperOrderApi: CamperOrderApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.camperOrderApi.getMyOrders(0, 50).subscribe({
      next: (page: PagedOrderResponse) => {
        this.orders = page.content;
        this.applyFilter(this.currentFilter);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load orders. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilter(filter: FilterType): void {
    this.currentFilter = filter;
    if (filter === 'all') {
      this.filteredOrders = this.orders;
    } else if (filter === 'active') {
      this.filteredOrders = this.orders.filter(o => this.isActive(o.deliveryStatus));
    } else if (filter === 'delivered') {
      this.filteredOrders = this.orders.filter(o => o.deliveryStatus === 'Delivered');
    } else {
      this.filteredOrders = this.orders.filter(o => o.deliveryStatus === 'Cancelled');
    }
  }

  isActive(deliveryStatus: string | null): boolean {
    return deliveryStatus === 'Pending' || deliveryStatus === 'Assigned' ||
           deliveryStatus === 'Picked Up' || deliveryStatus === 'In Transit';
  }

  get stats() {
    return {
      total: this.orders.length,
      active: this.orders.filter(o => this.isActive(o.deliveryStatus)).length,
      delivered: this.orders.filter(o => o.deliveryStatus === 'Delivered').length,
      cancelled: this.orders.filter(o => o.deliveryStatus === 'Cancelled').length
    };
  }

  /** Returns the route for "View Details" link */
  getDetailRoute(order: CamperOrderSummary): string[] {
    return ['/profile/orders', order.orderId];
  }

  getDetailQueryParams(order: CamperOrderSummary): { type: string } {
    return { type: order.orderType === 'RENTAL' ? 'rental' : 'purchase' };
  }

  /** Maps delivery status → badge class */
  getBadgeClass(order: CamperOrderSummary): string {
    const s = order.deliveryStatus;
    if (!s) return order.orderType === 'RENTAL' ? 'badge-rental' : 'badge-purchase';
    if (s === 'Delivered') return 'badge-delivered';
    if (s === 'Cancelled') return 'badge-cancelled';
    return 'badge-active';
  }

  /** Maps delivery status → progress percentage for mini progress bar */
  getProgress(deliveryStatus: string | null): number {
    switch (deliveryStatus) {
      case 'Pending':   return 10;
      case 'Assigned':  return 30;
      case 'Picked Up': return 55;
      case 'In Transit':return 80;
      case 'Delivered': return 100;
      default:          return 0;
    }
  }

  /** Step index (0-4) for the mini stepper */
  getStepIndex(deliveryStatus: string | null): number {
    const steps = ['Pending', 'Assigned', 'Picked Up', 'In Transit', 'Delivered'];
    const idx = steps.indexOf(deliveryStatus ?? '');
    return idx >= 0 ? idx : -1;
  }

  formatDate(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
