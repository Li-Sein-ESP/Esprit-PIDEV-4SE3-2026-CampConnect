import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { Location } from '@angular/common';
import { DeliveryApiService, DeliveryResponse, DeliveryStatus } from '../services/delivery-api.service';

@Component({
  selector: 'app-delivery-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './delivery-details.component.html',
  styleUrls: ['./delivery-details.component.scss']
})
export class DeliveryDetailsComponent implements OnInit {
  deliveryId: string = '';
  isMobileMenuOpen = false;
  toast = { show: false, msg: '' };

  statusOrder = ['created', 'assigned', 'pickedup', 'ontheway', 'delivered'];

  delivery: any = {
    id: 'ORD-3921',
    status: 'ontheway',
    urgency: 'Urgent',
    estimatedArrival: '11:15 AM today',
    pickup: {
      locationName: 'Basecamp Gear Hub',
      addressLine1: '1204 Alpine Ave',
      addressLine2: 'Downtown District',
      contactName: 'Sarah',
      time: '10:30 AM'
    },
    dropoff: {
      locationName: 'Pine Lake Campground',
      addressLine1: 'Site 42',
      addressLine2: 'North Loop',
      customerName: 'Mark D.',
      instructions: 'Gate code is #4490. Leave at picnic table if customer is away.'
    },
    items: [
      { name: 'North Face Stormbreak 2', qty: 1, desc: 'Camping Tent' },
      { name: 'Marmot Trestles 30', qty: 2, desc: 'Sleeping Bag' }
    ],
    totalWeight: '12.5 kg',
    vehicleType: 'Van',
    distance: '14.2 km',
    duration: '28 min',
    timeline: [
      { statusId: 'confirmed', title: 'Order Confirmed', time: 'Today, 9:45 AM', desc: '' },
      { statusId: 'preparing', title: 'Preparing Package', time: '10:00 AM', desc: '' },
      { statusId: 'pickedup', title: 'Picked Up', time: '10:30 AM', desc: 'Driver: Alex Walker' },
      { statusId: 'ontheway', title: 'On the Way', time: 'Now', desc: 'Approaching Highway 9' },
      { statusId: 'delivered', title: 'Delivered', time: 'Est. 11:15 AM', desc: '' }
    ],
    driver: {
      initials: 'AW',
      name: 'Alex Walker',
      role: 'Provider'
    }
  };

  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private deliveryApi: DeliveryApiService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.deliveryId = params.get('deliveryId') || '';
      if (this.deliveryId) {
        this.loadDelivery();
      } else {
        this.error = "No Delivery ID provided.";
        this.loading = false;
      }
    });
  }

  loadDelivery(): void {
    this.loading = true;
    this.error = null;
    this.deliveryApi.getById(this.deliveryId).subscribe({
      next: (data: DeliveryResponse) => {
        this.mapApiToUi(data);
        this.loading = false;
      },
      error: (err) => {
        this.error = "Could not load delivery details.";
        this.loading = false;
      }
    });
  }

  mapApiToUi(data: DeliveryResponse): void {
    this.delivery.id = data.id.substring(0, 8); // Display short ID
    this.delivery.status = this.mapStatusToUi(data.status);
    this.delivery.urgency = data.priority;
    this.delivery.pickup.addressLine1 = data.pickupAddress;
    this.delivery.pickup.addressLine2 = '';
    this.delivery.dropoff.addressLine1 = data.deliveryAddress;
    this.delivery.dropoff.addressLine2 = '';

    this.delivery.driver.name = data.driverName || 'Dispatch';
    this.delivery.driver.initials = (data.driverName || 'DP').substring(0, 2).toUpperCase();
    this.delivery.estimatedArrival = data.scheduledDate;

    // Reset static timeline completed times if moving backward (simple reset for now)
    this.syncTimeline();
  }

  mapStatusToUi(apiStatus: DeliveryStatus): string {
    switch (apiStatus) {
      case 'CREATED':
      case 'PENDING': return 'created';
      case 'ASSIGNED': return 'assigned';
      case 'PICKED_UP': return 'pickedup';
      case 'IN_TRANSIT': return 'ontheway';
      case 'DELIVERED': return 'delivered';
      case 'CANCELLED':
      case 'FAILED': return 'created'; // Fallback
    }
    return 'created';
  }

  mapUiToApi(uiStatus: string): DeliveryStatus {
    switch (uiStatus) {
      case 'created': return 'CREATED';
      case 'assigned': return 'ASSIGNED';
      case 'pickedup': return 'PICKED_UP';
      case 'ontheway': return 'IN_TRANSIT';
      case 'delivered': return 'DELIVERED';
    }
    return 'PENDING';
  }

  syncTimeline(): void {
    // Just visually update the statuses based on current index
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  goBack() {
    this.location.back();
  }

  advanceStatus(targetStatus: string) {
    const apiStatus = this.mapUiToApi(targetStatus);

    this.deliveryApi.updateStatus(this.deliveryId, apiStatus).subscribe({
      next: (updated: DeliveryResponse) => {
        this.mapApiToUi(updated);
        this.showToast('Status updated to "' + this.formatStatus(targetStatus) + '"');
      },
      error: (err) => {
        this.showToast('Failed to update status.');
      }
    });
  }

  formatStatus(key: string): string {
    const map: any = {
      'created': 'Awaiting Provider',
      'assigned': 'Assigned',
      'pickedup': 'Picked Up',
      'ontheway': 'In Transit',
      'delivered': 'Delivered'
    };
    return map[key] || key;
  }

  get currentStatusIndex(): number {
    return this.statusOrder.indexOf(this.delivery.status);
  }

  get isPickedUpDisabled(): boolean {
    return this.currentStatusIndex >= 2 || this.currentStatusIndex < 1; // Needs to be assigned first
  }

  get isOnTheWayDisabled(): boolean {
    return this.currentStatusIndex >= 3 || this.currentStatusIndex < 2;
  }

  get isDeliveredDisabled(): boolean {
    return this.currentStatusIndex >= 4 || this.currentStatusIndex < 3;
  }

  showToast(msg: string) {
    this.toast = { show: true, msg };
    setTimeout(() => {
      // Hide if the message is still the same, prevents early hiding on rapid spam
      if (this.toast.msg === msg) {
        this.toast.show = false;
      }
    }, 3000);
  }
}
