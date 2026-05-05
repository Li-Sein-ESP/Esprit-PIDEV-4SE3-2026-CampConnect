import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ChevronLeft, CreditCard, Lock, Shield, Wallet, CheckCircle } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card.component';

@Component({
  selector: 'app-payment-flow',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ButtonComponent, CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent],
  templateUrl: './payment-flow.component.html'
})
export class PaymentFlowComponent {
  readonly ChevronLeft = ChevronLeft;
  readonly CreditCard = CreditCard;
  readonly Lock = Lock;
  readonly Shield = Shield;
  readonly Wallet = Wallet;
  readonly CheckCircle = CheckCircle;

  paymentMethod = signal<'card' | 'wallet' | null>(null);
  isProcessing = signal(false);
  cardNumber = '';
  cardName = '';
  cardExpiry = '';
  cardCvv = '';

  constructor(private router: Router) { }

  processPayment() {
    this.isProcessing.set(true);
    setTimeout(() => {
      const bookingId = 'BK' + Math.random().toString(36).substr(2, 9).toUpperCase();
      this.router.navigate(['/booking/confirmation', bookingId]);
    }, 2000);
  }

  goBack() {
    this.router.navigate(['/booking/reserve']);
  }
}
