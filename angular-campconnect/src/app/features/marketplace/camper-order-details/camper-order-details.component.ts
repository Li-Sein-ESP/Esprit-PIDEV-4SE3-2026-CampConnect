import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RentalApiService, RentalResponse } from '../../gear/services/rental-api.service';
import { GearApiService } from '../../gear/services/gear-api.service';
import { WebSocketService } from '../../delivery/services/websocket.service';
import { CamperOrderApiService, CamperDelivery } from '../services/camper-order-api.service';
import * as L from 'leaflet';

const STEPS = ['Pending', 'Assigned', 'Picked Up', 'In Transit', 'Delivered'];

@Component({
  selector: 'app-camper-order-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './camper-order-details.component.html',
  styleUrls: ['./camper-order-details.component.scss']
})
export class CamperOrderDetailsComponent implements OnInit, OnDestroy {

  orderId = '';
  orderType: 'rental' | 'purchase' = 'rental';

  loading = true;
  error: string | null = null;
  deliveryNotFound = false;

  rental: RentalResponse | null = null;
  purchase: any = null;
  gearImage: string | null = null;
  delivery: CamperDelivery | null = null;

  readonly steps = STEPS;
  private readonly destroy$ = new Subject<void>();
  
  // Map properties
  private map: L.Map | undefined;
  private markerLoc: [number, number] | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rentalApi: RentalApiService,
    private gearApi: GearApiService,
    private camperOrderApi: CamperOrderApiService,
    private wsService: WebSocketService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('orderId') ?? '';
    const type = this.route.snapshot.queryParamMap.get('type');
    this.orderType = type === 'purchase' ? 'purchase' : 'rental';

    if (!this.orderId) {
      this.error = 'Order ID is missing.';
      this.loading = false;
      return;
    }

    if (this.orderType === 'rental') {
      this.loadRentalOrder();
    } else {
      this.loadPurchaseOrder();
    }

    // Real-time delivery updates via WebSocket
    this.wsService.connect();
    this.wsService.deliveryUpdates
      .pipe(takeUntil(this.destroy$))
      .subscribe(update => {
        if (this.delivery && update.id === this.delivery.id) {
          this.zone.run(() => {
            if (this.delivery) {
              const current = this.delivery as CamperDelivery;
              this.delivery = {
                ...current,
                status: update.status,
                camperStatus: this.toCamperStatus(update.status),
                driverName: update.driverName ?? current.driverName ?? null
              };
              this.cdr.detectChanges();
            }
          });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.wsService.disconnect();
    if (this.map) {
      this.map.remove();
    }
  }

  private loadRentalOrder(): void {
    this.rentalApi.getById(this.orderId).subscribe({
      next: rental => {
        this.rental = rental;
        if (rental.gearId) this.loadGearImage(rental.gearId);
        this.loadDelivery(this.orderId, undefined);
      },
      error: err => {
        this.error = err?.error?.message ?? 'Could not load order details.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadPurchaseOrder(): void {
    this.camperOrderApi.getPurchaseById(this.orderId).subscribe({
      next: purchase => {
        this.purchase = purchase;
        if (purchase.gearId) this.loadGearImage(purchase.gearId);
        this.loadDelivery(undefined, this.orderId);
      },
      error: err => {
        this.error = err?.error?.message ?? 'Could not load purchase details.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadGearImage(gearId: string): void {
    this.gearApi.getGearById(gearId).subscribe({
      next: (gear: any) => {
        this.gearImage = (gear as any).images?.[0]?.imageUrl ?? null;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  private loadDelivery(rentalId?: string, purchaseId?: string): void {
    this.camperOrderApi.getMyDelivery(rentalId, purchaseId).subscribe({
      next: delivery => {
        this.delivery = delivery;
        this.loading = false;
        this.deliveryNotFound = false;
        this.cdr.detectChanges();
        
        // Initialize map if we have customer coords
        if (delivery.customerLat && delivery.customerLng) {
            this.initMap(delivery.customerLat, delivery.customerLng);
        } else {
            // Default to a central location if not provided
            this.initMap(36.8065, 10.1815);
        }
      },
      error: err => {
        this.loading = false;
        if (err.status === 404) {
          this.deliveryNotFound = true;
        }
        this.cdr.detectChanges();
      }
    });
  }
  
  private initMap(lat: number, lng: number) {
      setTimeout(() => {
          const container = document.getElementById('live-tracking-map');
          if (!container) return;
          
          if (this.map) {
              this.map.remove();
          }
          
          this.map = L.map('live-tracking-map', { zoomControl: false }).setView([lat, lng], 13);
          
          // Premium dark mode map tiles
          L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
              attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
          }).addTo(this.map);
          
          // Pulsing marker for live location
          const pulsingIcon = L.divIcon({
              className: 'live-pulse-marker',
              html: '<div class="ring-container"><div class="circle"></div><div class="ringring"></div></div>',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
          });
          
          L.marker([lat, lng], { icon: pulsingIcon }).addTo(this.map).bindPopup('Delivery Destination').openPopup();
      }, 300);
  }

  get currentStep(): number {
    if (!this.delivery || this.deliveryNotFound) return 0;
    const idx = STEPS.indexOf(this.delivery.camperStatus);
    return idx >= 0 ? idx : 0;
  }

  get isCancelled(): boolean {
    return this.delivery?.camperStatus === 'Cancelled';
  }

  get isDelivered(): boolean {
    return this.delivery?.camperStatus === 'Delivered';
  }

  toCamperStatus(rawStatus: string): string {
    const map: Record<string, string> = {
      CREATED: 'Pending', PENDING: 'Pending',
      ASSIGNED: 'Assigned', DISPATCHED: 'Assigned',
      PICKED_UP: 'Picked Up',
      IN_TRANSIT: 'In Transit',
      DELIVERED: 'Delivered',
      FAILED: 'Cancelled', CANCELLED: 'Cancelled'
    };
    return map[rawStatus] ?? rawStatus;
  }

  formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  goBack(): void {
    this.router.navigate(['/profile/orders']);
  }

  downloadReceipt(): void {
    const orderData = this.orderType === 'rental' ? this.rental : this.purchase;
    if (!orderData) return;

    const receiptContent = `
      <html>
        <head>
          <title>Receipt - Order #${this.orderId}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            .header { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
            h1 { color: #2d6a4f; margin: 0; }
            .order-meta { display: flex; justify-content: space-between; margin-bottom: 40px; color: #666; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .table th, .table td { padding: 12px; border-bottom: 1px solid #eee; text-align: left; }
            .table th { background: #f9f9f9; color: #555; text-transform: uppercase; font-size: 12px; }
            .total-row { font-size: 18px; font-weight: bold; }
            .footer { text-align: center; color: #888; font-size: 12px; margin-top: 50px; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CampConnect Receipt</h1>
            <p>Official Transaction Record</p>
          </div>
          <div class="order-meta">
            <div>
              <strong>Order ID:</strong> #${this.orderId}<br>
              <strong>Date:</strong> ${this.formatDate(orderData.createdAt || new Date().toISOString())}<br>
              <strong>Type:</strong> ${this.orderType.toUpperCase()}
            </div>
            <div style="text-align: right;">
              <strong>Billed To:</strong><br>
              CampConnect User<br>
              Paid via Stripe
            </div>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th>Quantity / Duration</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>${orderData.gearName || 'Camp Equipment'}</strong>
                </td>
                <td>
                  ${this.orderType === 'rental' ? (orderData.rentalDays + ' Days') : ('Qty: ' + orderData.quantity)}
                </td>
                <td>
                  ${(orderData.totalPrice || 0).toFixed(2)} TND
                </td>
              </tr>
              ${this.orderType === 'rental' && orderData.discountApplied > 0 ? `
              <tr>
                <td colspan="2" style="text-align: right;">Loyalty Discount</td>
                <td style="color: #10b981;">-${orderData.discountApplied.toFixed(2)} TND</td>
              </tr>` : ''}
              <tr class="total-row">
                <td colspan="2" style="text-align: right;">Total Paid</td>
                <td>${(orderData.totalPrice || 0).toFixed(2)} TND</td>
              </tr>
            </tbody>
          </table>
          <div class="footer">
            Thank you for using CampConnect! For support, contact us at support@campconnect.com.
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(receiptContent);
      printWindow.document.close();
    }
  }
}
