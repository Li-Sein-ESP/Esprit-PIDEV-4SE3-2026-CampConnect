import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, CheckCircle, Calendar, MapPin } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';

@Component({
  selector: 'app-transport-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, ButtonComponent, CardComponent, CardContentComponent],
  templateUrl: './transport-confirmation.component.html'
})
export class TransportConfirmationComponent {
  readonly CheckCircle = CheckCircle;
  readonly Calendar = Calendar;
  readonly MapPin = MapPin;
}
