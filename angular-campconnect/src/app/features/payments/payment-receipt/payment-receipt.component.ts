import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PaymentApiService, PaymentReceiptResponse } from '../../gear/services/payment-api.service';

@Component({
  selector: 'app-payment-receipt',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe, DatePipe],
  templateUrl: './payment-receipt.component.html',
  styleUrl: './payment-receipt.component.scss'
})
export class PaymentReceiptComponent implements OnInit {
  loading = true;
  error: string | null = null;
  sessionId = '';
  source = '';
  receipt: PaymentReceiptResponse | null = null;
  private confirmationTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentApi: PaymentApiService,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.sessionId = this.route.snapshot.queryParamMap.get('session_id') ?? '';
    this.source = this.route.snapshot.queryParamMap.get('source') ?? '';

    if (!this.sessionId) {
      this.loading = false;
      this.error = 'Missing payment session. We could not generate a receipt.';
      return;
    }

    this.confirmReceipt();
  }

  private confirmReceipt(): void {
    this.clearConfirmationTimeout();

    this.paymentApi.confirmPayment(this.sessionId).subscribe({
      next: (res) => {
        this.clearConfirmationTimeout();
        this.receipt = res;
        this.loading = false;
      },
      error: (err) => {
        this.clearConfirmationTimeout();
        this.loading = false;
        this.error = err?.userMessage || err?.error?.message || 'Could not load receipt. Please try again.';
      }
    });

    this.confirmationTimeoutId = setTimeout(() => {
      this.zone.run(() => {
        if (this.loading) {
          this.loading = false;
          this.error = 'Receipt confirmation is taking too long. Please retry.';
        }
      });
    }, 12000);
  }

  printOrSavePdf(): void {
    window.print();
  }

  goBack(): void {
    const target = this.source.includes('marketplace') ? '/marketplace' : '/gear';
    this.router.navigate([target]);
  }

  retry(): void {
    this.loading = true;
    this.error = null;
    this.confirmReceipt();
  }

  private clearConfirmationTimeout(): void {
    if (this.confirmationTimeoutId) {
      clearTimeout(this.confirmationTimeoutId);
      this.confirmationTimeoutId = null;
    }
  }

  get totalAmount(): number {
    if (!this.receipt) return 0;
    if (typeof this.receipt.amountTotal === 'number') return this.receipt.amountTotal;
    return (this.receipt.amountTotalCents ?? 0) / 100;
  }
}
