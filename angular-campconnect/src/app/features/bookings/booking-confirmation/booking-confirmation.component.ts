import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LucideAngularModule, CheckCircle, Calendar, MapPin, Download, Mail } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';
import { BadgeComponent } from '../../../shared/components/badge.component';
import { ReservationTimeline } from '../../../shared/components/reservation-timeline/reservation-timeline';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, ButtonComponent, CardComponent, CardContentComponent, BadgeComponent, ReservationTimeline],
  templateUrl: './booking-confirmation.component.html'
})
export class BookingConfirmationComponent {
  readonly CheckCircle = CheckCircle;
  readonly Calendar = Calendar;
  readonly MapPin = MapPin;
  readonly Download = Download;
  readonly Mail = Mail;

  bookingId: string;

  constructor(private route: ActivatedRoute) {
    this.bookingId = this.route.snapshot.paramMap.get('bookingId') || 'BK123456';
  }
}
