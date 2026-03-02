import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ChevronLeft, Calendar, Users, MapPin, Star, CheckCircle, Shield, AlertCircle, ChevronRight } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../../shared/components/card.component';

@Component({
  selector: 'app-reservation-create',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ButtonComponent, CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent],
  templateUrl: './reservation-create.component.html'
})
export class ReservationCreateComponent {
  readonly ChevronLeft = ChevronLeft;
  readonly Calendar = Calendar;
  readonly Users = Users;
  readonly MapPin = MapPin;
  readonly Star = Star;
  readonly CheckCircle = CheckCircle;
  readonly Shield = Shield;
  readonly AlertCircle = AlertCircle;
  readonly ChevronRight = ChevronRight;

  basePrice = 315;
  guestInfo = { firstName: '', lastName: '', email: '', phone: '' };
  addOns = { firewood: false, earlyCheckIn: false };
  agreedToTerms = false;

  constructor(private route: ActivatedRoute, private router: Router) { }

  calculateTotal(): number {
    let total = this.basePrice;
    if (this.addOns.firewood) total += 25;
    if (this.addOns.earlyCheckIn) total += 15;
    return total;
  }

  canProceed(): boolean {
    return !!(this.guestInfo.firstName && this.guestInfo.email && this.agreedToTerms);
  }

  continueToPayment() {
    if (this.canProceed()) {
      this.router.navigate(['/booking/payment', this.route.snapshot.paramMap.get('id')]);
    }
  }

  goBack() {
    this.router.navigate(['/discover']);
  }
}
