import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ButtonComponent } from '../../../shared/components/button.component';
import { CardComponent, CardContentComponent } from '../../../shared/components/card.component';

@Component({
  selector: 'app-budget-estimation-component',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    ButtonComponent,
    CardComponent,
    CardContentComponent
  ],
  templateUrl: './budget-estimation.component.html',
  styles: []
})
export class BudgetEstimationComponent {
  // Component logic will be implemented
}
