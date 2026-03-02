import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Location } from '@angular/common';

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

  statusOrder = ['confirmed', 'preparing', 'pickedup', 'ontheway', 'delivered'];

  delivery = {
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
      role: 'Pro Driver'
    }
  };

  constructor(
    private route: ActivatedRoute,
    private location: Location
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.deliveryId = params.get('deliveryId') || this.delivery.id;
      // Extract numeric part or use as is
      this.delivery.id = this.deliveryId.replace('DEL-', 'ORD-');
    });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  goBack() {
    this.location.back();
  }

  advanceStatus(targetStatus: string) {
    const currentIndex = this.statusOrder.indexOf(this.delivery.status);
    const targetIndex = this.statusOrder.indexOf(targetStatus);

    if (targetIndex === -1 || targetIndex <= currentIndex) return;

    this.delivery.status = targetStatus;

    // Optional timeline updates
    if (targetStatus === 'delivered') {
      const deliveredStep = this.delivery.timeline.find(t => t.statusId === 'delivered');
      if (deliveredStep) {
        const now = new Date();
        deliveredStep.time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      }
      const onthewayStep = this.delivery.timeline.find(t => t.statusId === 'ontheway');
      if (onthewayStep) onthewayStep.time = '10:45 AM'; // static shift for layout
    }

    this.showToast('Status updated to "' + this.formatStatus(targetStatus) + '"');
  }

  formatStatus(key: string): string {
    const map: any = {
      'confirmed': 'Order Confirmed',
      'preparing': 'Preparing Package',
      'pickedup': 'Picked Up',
      'ontheway': 'In Transit',
      'delivered': 'Delivered'
    };
    return map[key] || key;
  }

  get currentStatusIndex(): number {
    return this.statusOrder.indexOf(this.delivery.status);
  }

  // Button disability states
  get isPickedUpDisabled(): boolean {
    return this.currentStatusIndex >= 2;
  }

  get isOnTheWayDisabled(): boolean {
    return this.currentStatusIndex >= 3;
  }

  get isDeliveredDisabled(): boolean {
    return this.currentStatusIndex >= 4;
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
