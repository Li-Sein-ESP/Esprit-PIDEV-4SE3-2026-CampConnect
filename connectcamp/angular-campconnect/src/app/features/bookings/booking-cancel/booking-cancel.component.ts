import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, AlertCircle, DollarSign } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card.component';

@Component({
  selector: 'app-booking-cancel',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ButtonComponent, CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent],
  templateUrl: './booking-cancel.component.html'
})
export class BookingCancelComponent {
  readonly AlertCircle = AlertCircle;
  readonly DollarSign = DollarSign;

  refundPercentage = 100;
  refundAmount = 373.19;
  cancelReason = '';
  cancelNotes = '';

  constructor(private router: Router) { }

  confirmCancel() {
    if (confirm('Are you sure you want to cancel this booking?')) {
      alert('Booking cancelled. Refund will be processed in 5-7 business days.');
      this.router.navigate(['/dashboard']);
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
